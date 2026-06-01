import type {
  AuditFinding,
  ToolSpendInput,
} from "../../types/index";
import {
  getPlanDefinition,
  getToolPricing,
  listPriceForPlan,
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

/** Team plans with minimum seat requirements that user may not meet */
export function evaluatePlanFit(
  input: ToolSpendInput,
  teamSize: number
): AuditFinding[] {
  const tool = getToolPricing(input.toolId);
  const plan = getPlanDefinition(input.toolId, input.plan);
  if (!tool || !plan) return [];

  const findings: AuditFinding[] = [];
  const planId = normalizePlan(input.plan);
  const seats = Math.max(input.seats, 1);

  // Team plan below minimum seats — paying for seats you don't have
  if (plan.isTeamPlan && plan.minSeats && seats < plan.minSeats) {
    const individualPlan = tool.plans.find(
      (p) => !p.isTeamPlan && !p.isFree && p.pricePerSeat != null
    );
    if (individualPlan?.pricePerSeat != null) {
      const recommended = individualPlan.pricePerSeat * seats;
      const savings = Math.max(0, input.monthlySpend - recommended);
      if (savings > 0) {
        findings.push(
          finding({
            category: "plan-fit",
            action: "switch-plan",
            title: `${plan.label} requires ${plan.minSeats}+ seats`,
            reason: `You're on ${plan.label} with ${seats} seat(s), but this tier targets ${plan.minSeats}+ users. ${individualPlan.label} at $${individualPlan.pricePerSeat}/user fits a team of ${seats} without admin overhead you may not need.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: recommended,
            monthlySavings: savings,
            recommendedPlan: individualPlan.id,
            confidence: "high",
          })
        );
      }
    }
  }

  // Small team on enterprise when business/team tier suffices
  if (plan.isEnterprise && teamSize < (plan.minSeats ?? 50)) {
    const teamPlan = tool.plans.find(
      (p) => p.isTeamPlan && !p.isEnterprise && p.pricePerSeat != null
    );
    if (teamPlan?.pricePerSeat != null) {
      const recommended = teamPlan.pricePerSeat * seats;
      const savings = Math.max(0, input.monthlySpend - recommended);
      if (savings > 5) {
        findings.push(
          finding({
            category: "plan-fit",
            action: "downgrade",
            title: `Enterprise is overkill for ${teamSize} people`,
            reason: `At ${teamSize} team members, ${teamPlan.label} ($${teamPlan.pricePerSeat}/seat) covers centralized billing and SSO needs without custom contracts. Enterprise adds SCIM, audit logs, and pooled usage that rarely pay off below ~${plan.minSeats ?? 50} seats.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: recommended,
            monthlySavings: savings,
            recommendedPlan: teamPlan.id,
            confidence: teamSize < 20 ? "high" : "medium",
          })
        );
      }
    }
  }

  // Solo/small team on team plan when individual is cheaper
  if (
    plan.isTeamPlan &&
    !plan.isEnterprise &&
    teamSize <= 2 &&
    planId !== "business" &&
    planId !== "team" &&
    planId !== "teams"
  ) {
    const individual = tool.plans.find(
      (p) => !p.isTeamPlan && !p.isFree && p.pricePerSeat != null
    );
    if (individual?.pricePerSeat != null && plan.pricePerSeat != null) {
      const recommended = individual.pricePerSeat * seats;
      if (recommended < input.monthlySpend - 5) {
        findings.push(
          finding({
            category: "plan-fit",
            action: "downgrade",
            title: "Team plan for 1–2 users adds cost without benefit",
            reason: `With ${teamSize} team member(s), ${individual.label} saves admin fees. Team tiers make sense at 3+ seats when you need centralized billing or policy controls.`,
            currentMonthlySpend: input.monthlySpend,
            recommendedMonthlySpend: recommended,
            monthlySavings: input.monthlySpend - recommended,
            recommendedPlan: individual.id,
            confidence: "high",
          })
        );
      }
    }
  }

  // Paying significantly above list price (possible over-provisioning)
  const listPrice = listPriceForPlan(input.toolId, input.plan, seats);
  if (listPrice != null && input.monthlySpend > listPrice * 1.35) {
    findings.push(
      finding({
        category: "plan-fit",
        action: "downgrade",
        title: "Spend exceeds list price — check usage overages",
        reason: `List price for ${plan.label} × ${seats} seat(s) is ~$${listPrice}/mo, but you're paying $${input.monthlySpend}/mo. The gap likely comes from on-demand usage or unused seats — audit active users and set spend caps.`,
        currentMonthlySpend: input.monthlySpend,
        recommendedMonthlySpend: listPrice,
        monthlySavings: Math.round((input.monthlySpend - listPrice) * 100) / 100,
        recommendedPlan: plan.id,
        confidence: "medium",
      })
    );
  }

  return findings;
}
