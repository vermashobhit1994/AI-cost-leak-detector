import type { AuditResult } from "@audit/types/index";

const SUMMARY_PROMPT = `You are a friendly finance advisor for startup engineering teams. Write a single paragraph (~100 words) summarizing this AI tool spend audit. Be specific with dollar amounts. Tone: direct, helpful, not salesy. If savings are low, say they're spending well.

Audit data:
{{AUDIT_JSON}}

Respond with only the paragraph, no bullet points.`;

export function buildSummaryPrompt(result: AuditResult): string {
  const payload = {
    teamSize: result.input.teamSize,
    useCase: result.input.useCase,
    totalCurrentMonthlySpend: result.totalCurrentMonthlySpend,
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    savingsTier: result.savingsTier,
    tools: result.toolResults.map((t) => ({
      name: t.toolName,
      plan: t.plan,
      spend: t.currentMonthlySpend,
      savings: t.monthlySavings,
      recommendation: t.primaryReason,
    })),
  };
  return SUMMARY_PROMPT.replace("{{AUDIT_JSON}}", JSON.stringify(payload, null, 2));
}

export function buildFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, totalCurrentMonthlySpend } =
    result;

  if (result.isAlreadyOptimal) {
    return `Your team of ${result.input.teamSize} is spending about $${totalCurrentMonthlySpend}/month across ${result.input.tools.length} AI tool(s) — and the audit didn't find meaningful waste for your ${result.input.useCase} workflow. That's uncommon. We'll notify you when vendor pricing shifts or new tools could change the math.`;
  }

  const top = [...result.toolResults]
    .filter((t) => t.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const lead = top
    ? `The biggest opportunity is ${top.toolName}: ${top.primaryReason.split(".")[0]}.`
    : "Several line items have room to optimize.";

  return `You're spending $${totalCurrentMonthlySpend}/month on AI tools for a ${result.input.teamSize}-person team focused on ${result.input.useCase}. We estimate $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) in recoverable spend. ${lead} Most fixes are plan downgrades or consolidating overlapping subscriptions — not switching vendors entirely.`;
}

export async function generateAiSummary(result: AuditResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return buildFallbackSummary(result);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        messages: [
          {
            role: "user",
            content: buildSummaryPrompt(result),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, await response.text());
      return buildFallbackSummary(result);
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return text && text.length > 40 ? text : buildFallbackSummary(result);
  } catch (err) {
    console.error("Summary generation failed:", err);
    return buildFallbackSummary(result);
  }
}
