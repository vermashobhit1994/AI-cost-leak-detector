# PROMPTS.md

## Personalized audit summary (Anthropic)

**Model:** `claude-sonnet-4-20250514`  
**Location:** `lib/summary.ts`

### Full prompt

```
You are a friendly finance advisor for startup engineering teams. Write a single paragraph (~100 words) summarizing this AI tool spend audit. Be specific with dollar amounts. Tone: direct, helpful, not salesy. If savings are low, say they're spending well.

Audit data:
{{AUDIT_JSON}}

Respond with only the paragraph, no bullet points.
```

### Why this structure

- **Role + audience** anchors tone for founders/EMs, not generic consumers.
- **~100 words** matches assignment spec and fits the results card without scrolling.
- **Dollar amounts in JSON payload** keep the model grounded in our rule-engine math rather than inventing savings.
- **"Not salesy"** prevents Credex-heavy copy before the dedicated CTA block.
- **Single paragraph constraint** avoids markdown bullets that break the UI layout.

### Fallback template

When `ANTHROPIC_API_KEY` is missing or the API returns an error, `buildFallbackSummary()` generates a deterministic paragraph from:

- Team size, use case, total spend
- Top savings opportunity (highest `monthlySavings` tool)
- Optimal-stack messaging when `isAlreadyOptimal`

This ensures the feature always works in dev/CI without API keys.

### What didn't work (early attempts)

- Asking the model to *compute* savings — numbers drifted from the rule engine. **Fix:** hardcoded audit math, LLM only for prose.
- Bullet-point summaries — looked like a generic ChatGPT response, not a product UI. **Fix:** single paragraph only.
- Long system prompts with pricing tables — expensive tokens, stale pricing risk. **Fix:** pass compact JSON from `AuditResult`.
