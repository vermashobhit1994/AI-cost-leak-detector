import type { AuditResult } from "@audit/types/index";
import type { PublicAuditRecord, StoredAudit } from "@/lib/db/types";

export function toPublicAudit(
  stored: Pick<StoredAudit, "id" | "createdAt" | "result" | "aiSummary">
): PublicAuditRecord {
  const { result } = stored;
  return {
    id: stored.id,
    createdAt: stored.createdAt,
    useCase: result.input.useCase,
    teamSize: result.input.teamSize,
    toolCount: result.input.tools.length,
    toolsSummary: result.toolResults.map((t) => ({
      toolName: t.toolName,
      plan: t.plan,
      monthlySpend: t.currentMonthlySpend,
      monthlySavings: t.monthlySavings,
      primaryReason: t.primaryReason,
    })),
    totalCurrentMonthlySpend: result.totalCurrentMonthlySpend,
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    savingsTier: result.savingsTier,
    isAlreadyOptimal: result.isAlreadyOptimal,
    summaryBullets: result.summaryBullets,
    aiSummary: stored.aiSummary,
  };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function savingsTierLabel(tier: AuditResult["savingsTier"]): string {
  switch (tier) {
    case "high":
      return "Major savings opportunity";
    case "moderate":
      return "Moderate savings available";
    case "low":
      return "Some optimizations found";
    case "optimal":
      return "Well optimized";
  }
}
