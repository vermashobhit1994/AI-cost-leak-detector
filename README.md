# Cost Leak Detector

Free AI spend audit for startup founders and engineering managers — monitor spend across Cursor, Copilot, Claude, ChatGPT, and more, then get instant savings recommendations. No login required.

## Live link 
[AI Cost Leak detector](https://ai-cost-leak-detector.netlify.app/)

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Works on Vercel, Netlify, or Cloudflare Pages. Set env vars from `.env.example`. Without Supabase, audits persist to `.data/audits.json` locally.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm test` | Audit engine tests (14) |
| `npm run build:lib` | Standalone audit package to `dist/` |

## MVP features

1. **Spend input form** — 8 tools, localStorage persistence
2. **Audit engine** — rule-based savings in `src/audit/`
3. **Results page** — hero savings, per-tool breakdown, Credex CTA
4. **AI summary** — Anthropic API with template fallback
5. **Lead capture** — email + optional fields, honeypot, rate limit
6. **Shareable URL** — `/r/[id]` with Open Graph tags

## Decisions

1. **Next.js App Router** — SSR for share pages + OG metadata; API routes for audit/leads.
2. **Rule engine, not LLM, for math** — defensible savings numbers with cited pricing.
3. **File store fallback** — local dev works without Supabase; production uses `supabase/schema.sql`.
4. **Honeypot over hCaptcha** — zero friction for a free tool; rate limiting on IP for abuse.
5. **Email after value** — lead form only on results page, never gated upfront.

## Docs

- [PRICING_DATA.md](./PRICING_DATA.md) — vendor pricing sources
- [PROMPTS.md](./PROMPTS.md) — LLM prompts
- [TESTS.md](./TESTS.md) — test coverage
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
