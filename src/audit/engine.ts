import type {
  AuditFinding,
  AuditInput,
  AuditResult,
  ToolAuditResult,
  ToolSpendInput,
} from "../types/index";
import { getToolPricing } from "../pricing/plans";
import { evaluatePlanFit } from "./rules/plan-fit";
import { evaluateSameVendorDowngrade } from "./rules/same-vendor-downgrade";
import {
  evaluateAlternatives,
  evaluateDuplicateStack,
} from "./rules/alternatives";
import {
  evaluateCredexCredits,
  evaluateSeatOptimization,
} from "./rules/credex-credits";

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Pick the highest-savings non-keep finding per tool */
function pickPrimaryFinding(findings: AuditFinding[]): AuditFinding | null {
  if (findings.length === 0) return null;
  return [...findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
}

function buildKeepFinding(input: ToolSpendInput): AuditFinding {
  const tool = getToolPricing(input.toolId);
  return {
    category: "plan-fit",
    action: "keep",
    title: "Plan looks appropriate",
    reason: `${tool?.name ?? input.toolId} ${input.plan} at $${input.monthlySpend}/mo aligns with your team size and usage tier — no clear downgrade or switch.`,
    currentMonthlySpend: input.monthlySpend,
    recommendedMonthlySpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    confidence: "medium",
  };
}

function auditSingleTool(
  input: ToolSpendInput,
  context: AuditInput,
  stackFindings: AuditFinding[]
): ToolAuditResult {
  const tool = getToolPricing(input.toolId);
  const toolName = tool?.name ?? input.toolId;

  const perToolFindings: AuditFinding[] = [
    ...evaluatePlanFit(input, context.teamSize),
    ...evaluateSameVendorDowngrade(input),
    ...evaluateAlternatives(
      input,
      context.useCase,
      context.tools.map((t) => t.toolId)
    ),
    ...evaluateCredexCredits(input),
    ...evaluateSeatOptimization(input, context.teamSize),
  ];

  // Attach stack-level duplicate findings to each relevant tool (for display)
  const relevantStack = stackFindings.filter(
    (f) =>
      f.category === "duplicate-stack" &&
      (f.recommendedTool === input.toolId ||
        f.reason.toLowerCase().includes(toolName.toLowerCase()))
  );

  const allFindings = [...perToolFindings, ...relevantStack];
  const primary = pickPrimaryFinding(
    allFindings.filter((f) => f.monthlySavings > 0)
  );

  const keep = primary ?? buildKeepFinding(input);
  const displayFindings =
    allFindings.length > 0 ? allFindings : [buildKeepFinding(input)];

  const monthlySavings = roundMoney(
    primary?.monthlySavings ?? 0
  );

  return {
    toolId: input.toolId,
    toolName,
    plan: input.plan,
    seats: input.seats,
    currentMonthlySpend: input.monthlySpend,
    findings: displayFindings,
    primaryAction: keep.action,
    primaryReason: keep.reason,
    monthlySavings,
    annualSavings: roundMoney(monthlySavings * 12),
    recommendedPlan: primary?.recommendedPlan,
    recommendedTool: primary?.recommendedTool,
  };
}

function dedupeStackSavings(
  toolResults: ToolAuditResult[],
  stackFindings: AuditFinding[]
): number {
  const duplicateFinding = stackFindings.find(
    (f) => f.category === "duplicate-stack"
  );
  if (!duplicateFinding) {
    return toolResults.reduce((s, t) => s + t.monthlySavings, 0);
  }

  const perTool = toolResults.reduce((s, t) => s + t.monthlySavings, 0);
  const stackIncluded = toolResults
    .filter((t) => duplicateFinding.reason.includes(t.toolName))
    .reduce((s, t) => s + t.monthlySavings, 0);

  return roundMoney(
    perTool - stackIncluded + duplicateFinding.monthlySavings
  );
}

function classifySavingsTier(
  monthlySavings: number,
  currentSpend: number
): AuditResult["savingsTier"] {
  if (monthlySavings < 5 || monthlySavings / Math.max(currentSpend, 1) < 0.02) {
    return "optimal";
  }
  if (monthlySavings >= 500) return "high";
  if (monthlySavings >= 100) return "moderate";
  return "low";
}

function buildSummaryBullets(
  toolResults: ToolAuditResult[],
  totalSavings: number,
  tier: AuditResult["savingsTier"]
): string[] {
  const bullets: string[] = [];

  if (tier === "optimal") {
    bullets.push(
      "Your AI stack is well-optimized for your team size and use case."
    );
    bullets.push(
      "We'll notify you when new pricing changes or tools could save you money."
    );
    return bullets;
  }

  const top = [...toolResults]
    .filter((t) => t.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3);

  for (const t of top) {
    bullets.push(
      `${t.toolName}: ${t.primaryReason.split(".")[0]}.`
    );
  }

  if (totalSavings >= 500) {
    bullets.push(
      `Total opportunity: $${totalSavings}/mo ($${roundMoney(totalSavings * 12)}/yr) — Credex can help capture credits on top of these plan changes.`
    );
  }

  return bullets;
}

/**
 * Main audit engine — evaluates plan fit, same-vendor downgrades,
 * alternative tools, duplicate stack overlap, seat waste, and Credex credits.
 */
export function runAudit(input: AuditInput): AuditResult {
  if (input.tools.length === 0) {
    return {
      input,
      toolResults: [],
      findings: [],
      totalCurrentMonthlySpend: 0,
      totalRecommendedMonthlySpend: 0,
      totalMonthlySavings: 0,
      totalAnnualSavings: 0,
      savingsTier: "optimal",
      isAlreadyOptimal: true,
      summaryBullets: ["Add at least one AI tool to generate an audit."],
      auditedAt: new Date().toISOString(),
    };
  }
  

  const stackFindings = evaluateDuplicateStack(input.tools, input.useCase);

  const toolResults = input.tools.map((tool) =>
    auditSingleTool(tool, input, stackFindings)
  );

  const totalCurrent = roundMoney(
    input.tools.reduce((s, t) => s + t.monthlySpend, 0)
  );

  const totalMonthlySavings = dedupeStackSavings(toolResults, stackFindings);
  const totalRecommended = roundMoney(
    Math.max(0, totalCurrent - totalMonthlySavings)
  );
  const tier = classifySavingsTier(totalMonthlySavings, totalCurrent);

  const allFindings: AuditFinding[] = [
    ...toolResults.flatMap((t) => t.findings),
    ...stackFindings.filter(
      (sf) =>
        !toolResults.some((tr) =>
          tr.findings.some(
            (f) =>
              f.category === sf.category && f.title === sf.title
          )
        )
    ),
  ];

  return {
    input,
    toolResults,
    findings: allFindings,
    totalCurrentMonthlySpend: totalCurrent,
    totalRecommendedMonthlySpend: totalRecommended,
    totalMonthlySavings: totalMonthlySavings,
    totalAnnualSavings: roundMoney(totalMonthlySavings * 12),
    savingsTier: tier,
    isAlreadyOptimal: tier === "optimal",
    summaryBullets: buildSummaryBullets(toolResults, totalMonthlySavings, tier),
    auditedAt: new Date().toISOString(),
  };
}

export type { AuditInput, AuditResult, ToolSpendInput };
