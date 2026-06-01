/** Primary ways a team uses AI tooling — drives alternative recommendations. */
export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type CursorPlan =
  | "hobby"
  | "pro"
  | "pro+"
  | "ultra"
  | "business"
  | "enterprise";
export type CopilotPlan = "individual" | "business" | "enterprise";
export type ClaudePlan =
  | "free"
  | "pro"
  | "max"
  | "team"
  | "enterprise"
  | "api-direct";
export type ChatGptPlan = "plus" | "team" | "enterprise" | "api-direct";
export type GeminiPlan = "pro" | "ultra" | "api";

export type ToolPlan =
  | CursorPlan
  | CopilotPlan
  | ClaudePlan
  | ChatGptPlan
  | GeminiPlan
  | "pro"
  | "max"
  | "teams"
  | "enterprise"
  | "api-direct";

export interface ToolSpendInput {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolSpendInput[];
  teamSize: number;
  useCase: UseCase;
}

export type RecommendationAction =
  | "keep"
  | "downgrade"
  | "upgrade"
  | "switch-plan"
  | "switch-tool"
  | "consolidate"
  | "credex-credits"
  | "remove-duplicate";

export type FindingCategory =
  | "plan-fit"
  | "same-vendor-downgrade"
  | "alternative-tool"
  | "credex-credits"
  | "duplicate-stack"
  | "seat-optimization";

export interface AuditFinding {
  category: FindingCategory;
  action: RecommendationAction;
  title: string;
  reason: string;
  currentMonthlySpend: number;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  recommendedPlan?: string;
  recommendedTool?: ToolId;
  confidence: "high" | "medium" | "low";
}

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  plan: string;
  seats: number;
  currentMonthlySpend: number;
  findings: AuditFinding[];
  primaryAction: RecommendationAction;
  primaryReason: string;
  monthlySavings: number;
  annualSavings: number;
  recommendedPlan?: string;
  recommendedTool?: ToolId;
}

export interface AuditResult {
  input: AuditInput;
  toolResults: ToolAuditResult[];
  findings: AuditFinding[];
  totalCurrentMonthlySpend: number;
  totalRecommendedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: "high" | "moderate" | "low" | "optimal";
  isAlreadyOptimal: boolean;
  summaryBullets: string[];
  auditedAt: string;
}

export interface PlanDefinition {
  id: string;
  label: string;
  pricePerSeat: number | null;
  minSeats?: number;
  maxSeatsBeforeEnterprise?: number;
  isTeamPlan?: boolean;
  isEnterprise?: boolean;
  isFree?: boolean;
  /** Monthly list price for flat-rate plans (API, etc.) */
  flatMonthlyPrice?: number;
  /** Typical monthly spend threshold above which a higher tier makes sense */
  usageTier?: "light" | "standard" | "heavy";
  sourceUrl: string;
  verifiedDate: string;
}

export interface ToolPricing {
  toolId: ToolId;
  name: string;
  plans: PlanDefinition[];
  category: "ide" | "chat" | "api";
  credexEligible: boolean;
  /** Estimated Credex discount on retail (0–1) */
  credexDiscountRate: number;
}
