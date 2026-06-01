import type {
  AuditFinding,
  ToolId,
  ToolSpendInput,
  UseCase,
} from "../../types/index";
import { getToolPricing } from "../../pricing/plans";

function finding(
  partial: Omit<AuditFinding, "annualSavings"> & { monthlySavings: number }
): AuditFinding {
  return {
    ...partial,
    annualSavings: Math.round(partial.monthlySavings * 12 * 100) / 100,
  };
}

interface AlternativeSpec {
  targetTool: ToolId;
  targetPlan: string;
  targetPricePerSeat: number;
  reason: string;
  useCases: UseCase[];
  /** Only suggest if current spend per seat exceeds this */
  minSpendPerSeat?: number;
}

const CODING_ALTERNATIVES: Partial<Record<ToolId, AlternativeSpec[]>> = {
  cursor: [
    {
      targetTool: "github-copilot",
      targetPlan: "individual",
      targetPricePerSeat: 10,
      reason:
        "GitHub Copilot Pro ($10/mo) covers inline completions and agent mode in VS Code/JetBrains. If you're not using Cursor's multi-file Agent daily, you halve per-dev cost while keeping native GitHub integration.",
      useCases: ["coding", "mixed"],
      minSpendPerSeat: 18,
    },
    {
      targetTool: "windsurf",
      targetPlan: "pro",
      targetPricePerSeat: 20,
      reason:
        "Windsurf Pro matches Cursor Pro at $20/mo with Cascade agent workflows. Worth evaluating if your spend is driven by Cursor overages — Windsurf's quota system may predict costs better.",
      useCases: ["coding"],
      minSpendPerSeat: 35,
    },
  ],
  windsurf: [
    {
      targetTool: "github-copilot",
      targetPlan: "individual",
      targetPricePerSeat: 10,
      reason:
        "Copilot Pro at $10/mo is half of Windsurf Pro for teams that primarily need completions, not full agentic IDE refactors.",
      useCases: ["coding", "mixed"],
      minSpendPerSeat: 18,
    },
    {
      targetTool: "cursor",
      targetPlan: "pro",
      targetPricePerSeat: 20,
      reason:
        "Cursor Pro matches Windsurf Pro pricing with stronger MCP ecosystem. Switch only if you're not relying on Windsurf-specific Cascade features.",
      useCases: ["coding"],
      minSpendPerSeat: 45,
    },
  ],
  "github-copilot": [
    {
      targetTool: "cursor",
      targetPlan: "pro",
      targetPricePerSeat: 20,
      reason:
        "If your team outgrew Copilot's 300 premium requests and buys overages, Cursor Pro ($20/mo with $20 usage credits) often delivers more agent capacity per dollar for multi-file edits.",
      useCases: ["coding"],
      minSpendPerSeat: 25,
    },
  ],
};

const CHAT_ALTERNATIVES: Partial<Record<ToolId, AlternativeSpec[]>> = {
  chatgpt: [
    {
      targetTool: "claude",
      targetPlan: "pro",
      targetPricePerSeat: 20,
      reason:
        "Claude Pro matches ChatGPT Plus at $20/mo with stronger long-document analysis and coding via Claude Code — a fit for research-heavy and writing workflows.",
      useCases: ["writing", "research", "mixed"],
      minSpendPerSeat: 20,
    },
  ],
  claude: [
    {
      targetTool: "chatgpt",
      targetPlan: "plus",
      targetPricePerSeat: 20,
      reason:
        "ChatGPT Plus at $20/mo excels at image generation, Codex, and plugin ecosystem. Consider if your team uses Claude mainly for chat but needs DALL·E or deep Microsoft integration.",
      useCases: ["writing", "mixed"],
      minSpendPerSeat: 25,
    },
  ],
  gemini: [
    {
      targetTool: "claude",
      targetPlan: "pro",
      targetPricePerSeat: 20,
      reason:
        "Google AI Ultra at $250/mo is rarely justified for startups. Claude Pro ($20/mo) covers comparable reasoning for writing/research without the Ultra premium.",
      useCases: ["writing", "research", "data"],
      minSpendPerSeat: 50,
    },
  ],
};

/** Substantially cheaper alternatives for the user's use case */
export function evaluateAlternatives(
  input: ToolSpendInput,
  useCase: UseCase,
  existingTools: ToolId[]
): AuditFinding[] {
  const tool = getToolPricing(input.toolId);
  if (!tool) return [];

  const seats = Math.max(input.seats, 1);
  const spendPerSeat = input.monthlySpend / seats;
  const pool =
    tool.category === "ide"
      ? CODING_ALTERNATIVES
      : tool.category === "chat"
        ? CHAT_ALTERNATIVES
        : {};

  const specs = pool[input.toolId] ?? [];
  const findings: AuditFinding[] = [];

  for (const alt of specs) {
    if (!alt.useCases.includes(useCase) && useCase !== "mixed") continue;
    if (existingTools.includes(alt.targetTool)) continue;
    if (alt.minSpendPerSeat && spendPerSeat < alt.minSpendPerSeat) continue;

    const recommended = alt.targetPricePerSeat * seats;
    const savings = input.monthlySpend - recommended;
    if (savings < 5) continue;

    const targetName = getToolPricing(alt.targetTool)?.name ?? alt.targetTool;

    findings.push(
      finding({
        category: "alternative-tool",
        action: "switch-tool",
        title: `Consider ${targetName} ${alt.targetPlan}`,
        reason: alt.reason,
        currentMonthlySpend: input.monthlySpend,
        recommendedMonthlySpend: recommended,
        monthlySavings: savings,
        recommendedTool: alt.targetTool,
        recommendedPlan: alt.targetPlan,
        confidence: savings >= seats * 15 ? "high" : "medium",
      })
    );
  }

  return findings;
}

/** Detect overlapping IDE + chat subscriptions that duplicate capability */
export function evaluateDuplicateStack(
  tools: ToolSpendInput[],
  useCase: UseCase
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const toolIds = tools.map((t) => t.toolId);

  const ides = toolIds.filter((id) =>
    ["cursor", "github-copilot", "windsurf"].includes(id)
  );
  if (ides.length > 1 && (useCase === "coding" || useCase === "mixed")) {
    const ideSpends = tools.filter((t) => ides.includes(t.toolId));
    const cheapest = [...ideSpends].sort(
      (a, b) => a.monthlySpend - b.monthlySpend
    )[0];
    const totalSpend = ideSpends.reduce((s, t) => s + t.monthlySpend, 0);
    const savings = totalSpend - cheapest.monthlySpend;

    if (savings >= 10) {
      const names = ideSpends
        .map((t) => getToolPricing(t.toolId)?.name ?? t.toolId)
        .join(", ");
      findings.push(
        finding({
          category: "duplicate-stack",
          action: "consolidate",
          title: "Multiple AI IDEs — pick one primary",
          reason: `You're paying for ${names} ($${totalSpend}/mo combined). Each includes AI completions and agent features. Standardize on ${getToolPricing(cheapest.toolId)?.name} ($${cheapest.monthlySpend}/mo) and cancel the others unless a subset needs a specific integration.`,
          currentMonthlySpend: totalSpend,
          recommendedMonthlySpend: cheapest.monthlySpend,
          monthlySavings: savings,
          recommendedTool: cheapest.toolId,
          confidence: "high",
        })
      );
    }
  }

  const chats = toolIds.filter((id) =>
    ["claude", "chatgpt", "gemini"].includes(id)
  );
  if (chats.length > 1 && useCase !== "coding") {
    const chatSpends = tools.filter((t) => chats.includes(t.toolId));
    const cheapest = [...chatSpends].sort(
      (a, b) => a.monthlySpend - b.monthlySpend
    )[0];
    const totalSpend = chatSpends.reduce((s, t) => s + t.monthlySpend, 0);
    const savings = totalSpend - cheapest.monthlySpend;

    if (savings >= 15) {
      findings.push(
        finding({
          category: "duplicate-stack",
          action: "consolidate",
          title: "Overlapping chat subscriptions",
          reason: `Claude, ChatGPT, and Gemini overlap for writing/research. At $${totalSpend}/mo across ${chats.length} tools, consolidating to one primary ($${cheapest.monthlySpend}/mo) and using free tiers for secondary checks saves meaningful budget.`,
          currentMonthlySpend: totalSpend,
          recommendedMonthlySpend: cheapest.monthlySpend,
          monthlySavings: savings,
          recommendedTool: cheapest.toolId,
          confidence: "medium",
        })
      );
    }
  }

  // Chat subscription + API from same vendor
  if (toolIds.includes("claude") && toolIds.includes("anthropic-api")) {
    const chat = tools.find((t) => t.toolId === "claude")!;
    const api = tools.find((t) => t.toolId === "anthropic-api")!;
    const combined = chat.monthlySpend + api.monthlySpend;
    if (combined > 150) {
      findings.push(
        finding({
          category: "duplicate-stack",
          action: "consolidate",
          title: "Claude subscription + Anthropic API overlap",
          reason: `You're spending $${combined}/mo on both Claude chat ($${chat.monthlySpend}) and Anthropic API ($${api.monthlySpend}). Dev teams often need one or the other — route product UI through API and drop Pro seats, or use Pro/Team for chat and cap API to production-only workloads.`,
          currentMonthlySpend: combined,
          recommendedMonthlySpend: Math.max(chat.monthlySpend, api.monthlySpend),
          monthlySavings: Math.min(chat.monthlySpend, api.monthlySpend),
          confidence: "medium",
        })
      );
    }
  }

  if (toolIds.includes("chatgpt") && toolIds.includes("openai-api")) {
    const chat = tools.find((t) => t.toolId === "chatgpt")!;
    const api = tools.find((t) => t.toolId === "openai-api")!;
    const combined = chat.monthlySpend + api.monthlySpend;
    if (combined > 150) {
      findings.push(
        finding({
          category: "duplicate-stack",
          action: "consolidate",
          title: "ChatGPT subscription + OpenAI API overlap",
          reason: `Combined $${combined}/mo on ChatGPT ($${chat.monthlySpend}) and OpenAI API ($${api.monthlySpend}). Plus/Team seats include Codex — if API spend mirrors chat experimentation, consolidate to API with shared org keys and fewer Plus seats.`,
          currentMonthlySpend: combined,
          recommendedMonthlySpend: Math.max(chat.monthlySpend, api.monthlySpend),
          monthlySavings: Math.min(chat.monthlySpend, api.monthlySpend),
          confidence: "medium",
        })
      );
    }
  }

  return findings;
}
