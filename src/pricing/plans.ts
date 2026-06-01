import type { PlanDefinition, ToolPricing } from "../types/index";

const VERIFIED = "2026-05-31";

/** Official vendor pricing — every number traces to PRICING_DATA.md */
export const TOOL_PRICING: Record<string, ToolPricing> = {
  cursor: {
    toolId: "cursor",
    name: "Cursor",
    category: "ide",
    credexEligible: true,
    credexDiscountRate: 0.25,
    plans: [
      {
        id: "hobby",
        label: "Hobby",
        pricePerSeat: 0,
        isFree: true,
        usageTier: "light",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 20,
        usageTier: "standard",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "pro+",
        label: "Pro+",
        pricePerSeat: 60,
        usageTier: "heavy",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "ultra",
        label: "Ultra",
        pricePerSeat: 200,
        usageTier: "heavy",
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "business",
        label: "Business (Teams)",
        pricePerSeat: 40,
        isTeamPlan: true,
        minSeats: 2,
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: null,
        isTeamPlan: true,
        isEnterprise: true,
        minSeats: 25,
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  "github-copilot": {
    toolId: "github-copilot",
    name: "GitHub Copilot",
    category: "ide",
    credexEligible: true,
    credexDiscountRate: 0.2,
    plans: [
      {
        id: "individual",
        label: "Individual (Pro)",
        pricePerSeat: 10,
        usageTier: "standard",
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: VERIFIED,
      },
      {
        id: "business",
        label: "Business",
        pricePerSeat: 19,
        isTeamPlan: true,
        minSeats: 2,
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: VERIFIED,
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 39,
        isTeamPlan: true,
        isEnterprise: true,
        minSeats: 10,
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: VERIFIED,
      },
    ],
  },
  claude: {
    toolId: "claude",
    name: "Claude",
    category: "chat",
    credexEligible: true,
    credexDiscountRate: 0.2,
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeat: 0,
        isFree: true,
        usageTier: "light",
        sourceUrl: "https://claude.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 20,
        usageTier: "standard",
        sourceUrl: "https://claude.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "max",
        label: "Max (5x)",
        pricePerSeat: 100,
        usageTier: "heavy",
        sourceUrl: "https://claude.com/pricing/max",
        verifiedDate: VERIFIED,
      },
      {
        id: "team",
        label: "Team Standard",
        pricePerSeat: 25,
        isTeamPlan: true,
        minSeats: 5,
        sourceUrl: "https://claude.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 20,
        isTeamPlan: true,
        isEnterprise: true,
        minSeats: 150,
        sourceUrl: "https://claude.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "api-direct",
        label: "API Direct",
        pricePerSeat: null,
        flatMonthlyPrice: 0,
        usageTier: "standard",
        sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  chatgpt: {
    toolId: "chatgpt",
    name: "ChatGPT",
    category: "chat",
    credexEligible: true,
    credexDiscountRate: 0.2,
    plans: [
      {
        id: "plus",
        label: "Plus",
        pricePerSeat: 20,
        usageTier: "standard",
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "team",
        label: "Business (Team)",
        pricePerSeat: 25,
        isTeamPlan: true,
        minSeats: 2,
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: null,
        isTeamPlan: true,
        isEnterprise: true,
        minSeats: 150,
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "api-direct",
        label: "API Direct",
        pricePerSeat: null,
        flatMonthlyPrice: 0,
        usageTier: "standard",
        sourceUrl: "https://developers.openai.com/api/docs/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  "anthropic-api": {
    toolId: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    credexEligible: true,
    credexDiscountRate: 0.3,
    plans: [
      {
        id: "api-direct",
        label: "Pay-as-you-go",
        pricePerSeat: null,
        flatMonthlyPrice: 0,
        usageTier: "standard",
        sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  "openai-api": {
    toolId: "openai-api",
    name: "OpenAI API",
    category: "api",
    credexEligible: true,
    credexDiscountRate: 0.3,
    plans: [
      {
        id: "api-direct",
        label: "Pay-as-you-go",
        pricePerSeat: null,
        flatMonthlyPrice: 0,
        usageTier: "standard",
        sourceUrl: "https://developers.openai.com/api/docs/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  gemini: {
    toolId: "gemini",
    name: "Gemini",
    category: "chat",
    credexEligible: true,
    credexDiscountRate: 0.25,
    plans: [
      {
        id: "pro",
        label: "Google AI Pro",
        pricePerSeat: 19.99,
        usageTier: "standard",
        sourceUrl: "https://one.google.com/about/google-ai-plans/",
        verifiedDate: VERIFIED,
      },
      {
        id: "ultra",
        label: "Google AI Ultra",
        pricePerSeat: 249.99,
        usageTier: "heavy",
        sourceUrl: "https://one.google.com/about/google-ai-plans/",
        verifiedDate: VERIFIED,
      },
      {
        id: "api",
        label: "Gemini API",
        pricePerSeat: null,
        flatMonthlyPrice: 0,
        usageTier: "standard",
        sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
  windsurf: {
    toolId: "windsurf",
    name: "Windsurf",
    category: "ide",
    credexEligible: true,
    credexDiscountRate: 0.25,
    plans: [
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 20,
        usageTier: "standard",
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "max",
        label: "Max",
        pricePerSeat: 200,
        usageTier: "heavy",
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "teams",
        label: "Teams",
        pricePerSeat: 40,
        isTeamPlan: true,
        minSeats: 2,
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: VERIFIED,
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: null,
        isTeamPlan: true,
        isEnterprise: true,
        minSeats: 25,
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: VERIFIED,
      },
    ],
  },
};

export function getToolPricing(toolId: string): ToolPricing | undefined {
  return TOOL_PRICING[toolId];
}

export function getPlanDefinition(
  toolId: string,
  planId: string
): PlanDefinition | undefined {
  const tool = getToolPricing(toolId);
  if (!tool) return undefined;
  const normalized = planId.toLowerCase().replace(/\s+/g, "-");
  return (
    tool.plans.find((p) => p.id === normalized) ??
    tool.plans.find((p) => p.label.toLowerCase().includes(normalized))
  );
}

export function listPriceForPlan(
  toolId: string,
  planId: string,
  seats: number
): number | null {
  const plan = getPlanDefinition(toolId, planId);
  if (!plan) return null;
  if (plan.isFree) return 0;
  if (plan.pricePerSeat != null) return plan.pricePerSeat * Math.max(seats, 1);
  return null;
}
