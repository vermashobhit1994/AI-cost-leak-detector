# TESTS.md

## Audit engine tests

| File | Covers | Run |
|------|--------|-----|
| `tests/audit/engine.test.ts` | Plan fit, same-vendor downgrades, alternatives, duplicate stack, Credex credits, seat optimization, savings tiers, totals | `npm test` |

### Test cases (11 total)

1. Claude Team flagged when &lt; 5 seats
2. Enterprise tier flagged for small teams (Cursor)
3. Copilot Enterprise → Business downgrade
4. Gemini Ultra → Pro downgrade
5. Cursor → Copilot alternative for coding
6. Multiple IDE duplicate detection
7. Credex credits for high retail spend
8. Unused seat optimization
9. Already-optimal stack (`savingsTier: optimal`)
10. High savings tier (≥ $500/mo)
11. Aggregate spend/savings computation

## How to run

```bash
npm test          # run once
npm run test:watch  # watch mode
```

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs `npm run lint`, `npm test`, and `npm run build` on every push to `main`.

## Not yet covered (app layer)

- API route integration tests (audit POST, leads honeypot)
- E2E with Playwright

These can be added in week 2; assignment minimum is 5+ audit engine tests (currently 11).
