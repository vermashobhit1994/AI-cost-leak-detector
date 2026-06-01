# PRICING_DATA.md

All pricing verified **2026-05-31** from official vendor pages. Numbers in `src/pricing/plans.ts` must match this file.

## Cursor

- Hobby: $0 — https://cursor.com/pricing — verified 2026-05-31
- Pro: $20/user/month — https://cursor.com/pricing — verified 2026-05-31
- Pro+: $60/user/month — https://cursor.com/pricing — verified 2026-05-31
- Ultra: $200/user/month — https://cursor.com/pricing — verified 2026-05-31
- Business (Teams): $40/user/month — https://cursor.com/pricing — verified 2026-05-31
- Enterprise: Custom — https://cursor.com/pricing — verified 2026-05-31

_Note: Assignment lists "Business"; Cursor's current naming is "Teams" at $40/user. Mapped as `business` in the engine._

## GitHub Copilot

- Individual (Pro): $10/user/month — https://github.com/features/copilot/plans — verified 2026-05-31
- Pro+: $39/user/month — https://github.com/features/copilot/plans — verified 2026-05-31
- Business: $19/user/month — https://github.com/features/copilot/plans — verified 2026-05-31
- Enterprise: $39/user/month — https://github.com/features/copilot/plans — verified 2026-05-31

_Usage-based billing effective June 1, 2026; seat prices unchanged per GitHub blog._

## Claude (Anthropic)

- Free: $0 — https://claude.com/pricing — verified 2026-05-31
- Pro: $20/user/month ($17 annual) — https://claude.com/pricing — verified 2026-05-31
- Max 5x: $100/user/month — https://claude.com/pricing/max — verified 2026-05-31
- Max 20x: $200/user/month — https://claude.com/pricing/max — verified 2026-05-31
- Team Standard: $25/seat/month ($20 annual), 5-seat minimum — https://claude.com/pricing — verified 2026-05-31
- Team Premium: $125/seat/month ($100 annual) — https://claude.com/pricing — verified 2026-05-31
- Enterprise: $20/seat + API usage — https://claude.com/pricing — verified 2026-05-31

## Anthropic API

- Pay-as-you-go (no minimum):
    - Haiku 4.5: $1.00 input / $5.00 output per 1M tokens — https://docs.anthropic.com/en/docs/about-claude/pricing — verified 2026-05-31
    - Sonnet 4.6: $3.00 input / $15.00 output per 1M tokens — same source
    - Opus 4.7: $5.00 input / $25.00 output per 1M tokens — same source

## ChatGPT (OpenAI)

- Plus: $20/user/month — https://openai.com/chatgpt/pricing — verified 2026-05-31
- Business (formerly Team): $25/user/month ($20 annual), 2-seat minimum — https://openai.com/chatgpt/pricing — verified 2026-05-31
- Pro: $100–200/user/month — https://openai.com/chatgpt/pricing — verified 2026-05-31
- Enterprise: Custom — https://openai.com/chatgpt/pricing — verified 2026-05-31

## OpenAI API

- GPT-5.5: $2.50 input / $15.00 output per 1M tokens (batch tier) — https://developers.openai.com/api/docs/pricing — verified 2026-05-31
- GPT-5.4: $1.25 input / $7.50 output per 1M tokens — same source
- GPT-5.4-mini: $0.375 input / $2.25 output per 1M tokens — same source

## Gemini

- Google AI Pro: $19.99/user/month — https://one.google.com/about/google-ai-plans/ — verified 2026-05-31
- Google AI Ultra: $249.99/user/month — https://one.google.com/about/google-ai-plans/ — verified 2026-05-31
- Gemini API (3.1 Pro): $2.00 input / $12.00 output per 1M tokens (≤200K context) — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-31
- Gemini 2.5 Flash-Lite: $0.10 input / $0.40 output per 1M tokens — same source

## Windsurf

- Free: $0 — https://windsurf.com/pricing — verified 2026-05-31
- Pro: $20/user/month — https://windsurf.com/pricing — verified 2026-05-31
- Max: $200/user/month — https://windsurf.com/pricing — verified 2026-05-31
- Teams: $40/user/month — https://windsurf.com/pricing — verified 2026-05-31
- Enterprise: Custom — https://windsurf.com/pricing — verified 2026-05-31

## Credex discount assumptions

Credex credit discounts are **estimated** (not vendor list prices):

| Tool category                                | Estimated Credex discount |
| -------------------------------------------- | ------------------------- |
| IDE tools (Cursor, Copilot, Windsurf)        | 20–25%                    |
| Chat subscriptions (Claude, ChatGPT, Gemini) | 20%                       |
| API direct (Anthropic, OpenAI)               | 30%                       |

Documented in `src/pricing/plans.ts` as `credexDiscountRate` per tool.
