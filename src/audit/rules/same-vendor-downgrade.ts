import type { AuditFinding, ToolSpendInput } from "../../types/index";
import {
  getPlanDefinition,
  getToolPricing,
} from "../../pricing/plans";

function finding(
  partial: Omit<AuditFinding, "annualSavings"> & { monthlySavings: number }
): AuditFinding {
  return {
    ...partial,
    annualSavings: Math.round(partial.monthlySavings * 12 * 100) / 100,
  };
}

function normalizePlan(plan: string): string {
  return plan.toLowerCase().trim().replace(/\s+/g, "-");
}

/** Cheaper plans from the same vendor that fit usage patterns */
export function evaluateSameVendorDowngrade(
  input: ToolSpendInput
): AuditFinding[] {
  const tool = getToolPricing(input.toolId);
  const current = getPlanDefinition(input.toolId, input.plan);
  if (!tool || !current) return [];

  const planId = normalizePlan(input.plan);
  const seats = Math.max(input.seats, 1);
  const findings: AuditFinding[] = [];

  const heavyPlans = new Set([
    "max",
    "ultra",
    "pro+",
    "enterprise",
    "pro-200",
  ]);

  // Heavy tier with spend near standard tier list price
  if (heavyPlans.has(planId) || current.usageTier === "heavy") {
    const standard = tool.plans.find(
      (p) =>
        p.usageTier === "standard" &&
        !p.isTeamPlan &&
        p.pricePerSeat != null &&
        p.pricePerSeat > 0
    );
    if (standard?.pricePerSeat != null) {
      const standardCost = standard.pricePerSeat * seats;
      const threshold = standardCost * 1.15;
      if (input.monthlySpend <= threshold && input.monthlySpend > standardCost) {
        const savings = input.monthlySpend - standardCost;
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "downgrade",
            title: `Downgrade from ${current.label} to ${standard.label}`,
            reason: `Your $${input.monthlySpend}/mo spend aligns with ${standard.label} list pricing ($${standardCost}/mo for ${seats} seat(s)). ${current.label} targets 5–20× usage limits — without hitting those caps, you're paying for headroom you don't use.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: standardCost,
            monthlySavings: savings,
            recommendedPlan: standard.id,
            confidence: "high",
          })
        );
      }
    }
  }

  // Cursor Ultra → Pro+ or Pro when spend doesn't justify top tier
  if (input.toolId === "cursor" && planId === "ultra") {
    const proPlus = tool.plans.find((p) => p.id === "pro+");
    const pro = tool.plans.find((p) => p.id === "pro");
    if (proPlus?.pricePerSeat != null && pro?.pricePerSeat != null) {
      const proPlusCost = proPlus.pricePerSeat * seats;
      const proCost = pro.pricePerSeat * seats;
      if (input.monthlySpend <= proPlusCost * 1.15) {
        const savings = input.monthlySpend - proPlusCost;
        if (savings > 0) {
          findings.push(
            finding({
              category: "same-vendor-downgrade",
              action: "downgrade",
              title: "Cursor Pro+ may fit instead of Ultra",
              reason: `Ultra ($${current.pricePerSeat}/seat) includes ~20× Pro usage credits. At $${input.monthlySpend}/mo, Pro+ ($${proPlusCost}/mo) likely covers your agent workload without Ultra's $${(current.pricePerSeat ?? 200) - proPlus.pricePerSeat}/seat premium.`,
              currentMonthlySpend: input.monthlySpend,
              recommendedMonthlySpend: proPlusCost,
              monthlySavings: savings,
              recommendedPlan: "pro+",
              confidence: "high",
            })
          );
        }
      } else if (input.monthlySpend <= proCost * 1.25) {
        const savings = input.monthlySpend - proCost;
        if (savings > 0) {
          findings.push(
            finding({
              category: "same-vendor-downgrade",
              action: "downgrade",
              title: "Cursor Pro fits your current spend",
              reason: `You're on Ultra but paying near Pro list pricing ($${proCost}/mo for ${seats} seat(s)). Pro includes $20/mo in frontier model credits — upgrade to Ultra only if you consistently exhaust Pro+ limits.`,
              currentMonthlySpend: input.monthlySpend,
              recommendedMonthlySpend: proCost,
              monthlySavings: savings,
              recommendedPlan: "pro",
              confidence: "medium",
            })
          );
        }
      }
    }
  }

  // Cursor Pro+ → Pro when paying list without overages (not using 3× headroom)
  if (input.toolId === "cursor" && planId === "pro+") {
    const pro = tool.plans.find((p) => p.id === "pro");
    if (pro?.pricePerSeat != null && current.pricePerSeat != null) {
      const proCost = pro.pricePerSeat * seats;
      const proPlusCost = current.pricePerSeat * seats;
      if (
        input.monthlySpend <= proPlusCost * 1.1 &&
        input.monthlySpend > proCost
      ) {
        const savings = input.monthlySpend - proCost;
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "downgrade",
            title: "Cursor Pro instead of Pro+",
            reason: `Pro+ ($${proPlusCost}/mo) provides 3× usage on frontier models. At $${input.monthlySpend}/mo with no overages, Pro ($${proCost}/mo) is worth trying first — upgrade to Pro+ only if you hit Pro limits regularly.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: proCost,
            monthlySavings: savings,
            recommendedPlan: "pro",
            confidence: "high",
          })
        );
      }
    }
  }

  // Cursor/Windsurf: Business/Teams when Pro would suffice for small teams
  if (
    (planId === "business" || planId === "teams") &&
    current.pricePerSeat != null
  ) {
    const pro = tool.plans.find((p) => p.id === "pro" && p.pricePerSeat != null);
    if (pro?.pricePerSeat != null && seats <= 5) {
      const proCost = pro.pricePerSeat * seats;
      const savings = input.monthlySpend - proCost;
      if (savings >= seats * 15) {
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "downgrade",
            title: `Pro tier may suffice vs ${current.label}`,
            reason: `At ${seats} developer(s), ${pro.label} ($${proCost}/mo) delivers the same AI coding features. ${current.label} adds SSO, admin dashboards, and org-wide rules — worth it when you need compliance controls, not for a handful of devs.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: proCost,
            monthlySavings: savings,
            recommendedPlan: pro.id,
            confidence: seats <= 3 ? "high" : "medium",
          })
        );
      }
    }
  }

  // Claude Team when Pro/Max individual would be cheaper for small groups
  if (input.toolId === "claude" && planId === "team" && seats < 5) {
    const pro = tool.plans.find((p) => p.id === "pro");
    if (pro?.pricePerSeat != null) {
      const proCost = pro.pricePerSeat * seats;
      const savings = input.monthlySpend - proCost;
      if (savings > 0) {
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "switch-plan",
            title: "Claude Team requires 5 seats minimum",
            reason: `Claude Team Standard starts at 5 seats ($125/mo minimum). With ${seats} user(s), individual Pro accounts ($${proCost}/mo total) avoid the 5-seat floor and unused seat cost.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: proCost,
            monthlySavings: savings,
            recommendedPlan: "pro",
            confidence: "high",
          })
        );
      }
    }
  }

  // ChatGPT Team for solo users
  if (input.toolId === "chatgpt" && planId === "team" && seats === 1) {
    const plus = tool.plans.find((p) => p.id === "plus");
    if (plus?.pricePerSeat != null) {
      findings.push(
        finding({
          category: "same-vendor-downgrade",
          action: "downgrade",
          title: "ChatGPT Plus instead of Business for solo use",
          reason: `Business/Team ($${input.monthlySpend}/mo) requires 2+ seats and adds workspace admin. Solo Plus at $${plus.pricePerSeat}/mo includes the same GPT-5.5 access for individual work.`,
          currentMonthlySpend: input.monthlySpend,
          recommendedMonthlySpend: plus.pricePerSeat,
          monthlySavings: input.monthlySpend - plus.pricePerSeat,
          recommendedPlan: "plus",
          confidence: "high",
        })
      );
    }
  }

  // Gemini Ultra rarely justified unless spend proves heavy usage
  if (input.toolId === "gemini" && planId === "ultra") {
    const pro = tool.plans.find((p) => p.id === "pro");
    if (pro?.pricePerSeat != null) {
      const proCost = pro.pricePerSeat * seats;
      if (input.monthlySpend <= proCost * 2) {
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "downgrade",
            title: "Gemini Ultra is 12× Pro price",
            reason: `Ultra ($${current.pricePerSeat}/mo) targets deep research and Veo video generation. At $${input.monthlySpend}/mo effective spend, Google AI Pro ($${proCost}/mo) covers standard chat and coding unless you're maxing video/research quotas daily.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: proCost,
            monthlySavings: input.monthlySpend - proCost,
            recommendedPlan: "pro",
            confidence: "medium",
          })
        );
      }
    }
  }

  // Copilot Enterprise vs Business for teams without knowledge-base needs
  if (input.toolId === "github-copilot" && planId === "enterprise" && seats < 25) {
    const business = tool.plans.find((p) => p.id === "business");
    if (business?.pricePerSeat != null) {
      const bizCost = business.pricePerSeat * seats;
      const savings = input.monthlySpend - bizCost;
      if (savings > 0) {
        findings.push(
          finding({
            category: "same-vendor-downgrade",
            action: "downgrade",
            title: "Copilot Business unless you need knowledge bases",
            reason: `Enterprise ($39/seat) adds codebase indexing and GitHub.com chat. For ${seats} devs without custom model fine-tuning, Business ($19/seat = $${bizCost}/mo) delivers IDE completions and agent mode at half the cost.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: bizCost,
            monthlySavings: savings,
            recommendedPlan: "business",
            confidence: "high",
          })
        );
      }
    }
  }

  return findings;
}
