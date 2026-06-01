import type { AuditFinding, ToolSpendInput } from "../../types/index";
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

/** Minimum monthly retail spend before Credex credits recommendation */
const CREDEX_MIN_SPEND = 50;

/**
 * Retail vs discounted credits — Credex sources discounted AI infrastructure
 * credits from companies with surplus allocations.
 */
export function evaluateCredexCredits(
  input: ToolSpendInput
): AuditFinding[] {
  const tool = getToolPricing(input.toolId);
  const plan = getPlanDefinition(input.toolId, input.plan);
  if (!tool || !plan || !tool.credexEligible) return [];

  const seats = Math.max(input.seats, 1);

  // Skip free tiers and API-only with low spend
  if (plan.isFree || input.monthlySpend < CREDEX_MIN_SPEND) return [];

  const listPrice = listPriceForPlan(input.toolId, input.plan, seats);
  const baseline = listPrice ?? input.monthlySpend;
  const discountRate = tool.credexDiscountRate;
  const discounted = Math.round(baseline * (1 - discountRate) * 100) / 100;
  const savings = Math.round((input.monthlySpend - discounted) * 100) / 100;

  if (savings < 10) return [];

  const pct = Math.round(discountRate * 100);

  return [
    finding({
      category: "credex-credits",
      action: "credex-credits",
      title: `Credex credits could cut ${tool.name} spend ~${pct}%`,
      reason: `You're paying retail (~$${input.monthlySpend}/mo) for ${plan.label}. Credex resells unused enterprise credits for ${tool.name} at roughly ${pct}% below list — estimated $${discounted}/mo for the same seats without changing tools or plans.`,
      currentMonthlySpend: input.monthlySpend,
      recommendedMonthlySpend: discounted,
      monthlySavings: savings,
      recommendedPlan: plan.id,
      confidence: input.monthlySpend >= 200 ? "high" : "medium",
    }),
  ];
}

/** Seat optimization — paying for unused seats */
export function evaluateSeatOptimization(
  input: ToolSpendInput,
  teamSize: number
): AuditFinding[] {
  const plan = getPlanDefinition(input.toolId, input.plan);
  if (!plan || plan.pricePerSeat == null) return [];

  const seats = Math.max(input.seats, 1);
  if (seats <= teamSize) return [];

  const unused = seats - teamSize;
  const savings = unused * plan.pricePerSeat;
  if (savings < 5) return [];

  const tool = getToolPricing(input.toolId);
  const recommended = plan.pricePerSeat * teamSize;

  return [
    finding({
      category: "seat-optimization",
      action: "downgrade",
      title: `${unused} unused seat(s) detected`,
      reason: `You pay for ${seats} ${tool?.name ?? input.toolId} seats but reported ${teamSize} team members. Removing ${unused} unused seat(s) at $${plan.pricePerSeat}/seat saves $${savings}/mo without changing plan tier.`,
      currentMonthlySpend: input.monthlySpend,
      recommendedMonthlySpend: Math.min(input.monthlySpend, recommended),
      monthlySavings: Math.min(savings, input.monthlySpend - recommended),
      recommendedPlan: plan.id,
      confidence: "high",
    }),
  ];
}
