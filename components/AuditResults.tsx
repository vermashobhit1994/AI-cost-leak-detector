"use client";

import type { AuditResult } from "@audit/types/index";
import { formatMoney, savingsTierLabel } from "@/lib/audit-utils";

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    keep: "Keep",
    downgrade: "Downgrade",
    upgrade: "Upgrade",
    "switch-plan": "Switch plan",
    "switch-tool": "Switch tool",
    consolidate: "Consolidate",
    "credex-credits": "Credex credits",
    "remove-duplicate": "Remove duplicate",
  };
  return map[action] ?? action;
}

export function AuditSummaryBullets({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) return null;

  return (
    <section className="card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Key takeaways
      </h2>
      <ul className="mt-3 space-y-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {bullet}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AuditResultsHero({ result }: { result: AuditResult }) {
  const tier = result.savingsTier;

  return (
    <section className="card overflow-hidden p-8 text-center">
      {result.isAlreadyOptimal ? (
        <>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-success">
            {savingsTierLabel(tier)}
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">You&apos;re spending well</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Current spend: {formatMoney(result.totalCurrentMonthlySpend)}/mo across{" "}
            {result.input.tools.length} tool(s). No major leaks detected.
          </p>
        </>
      ) : (
        <>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-success">
            {savingsTierLabel(tier)}
          </p>
          <p className="text-sm text-muted">Potential savings</p>
          <h1 className="mt-1 text-5xl font-bold tracking-tight text-success md:text-6xl">
            {formatMoney(result.totalMonthlySavings)}
            <span className="text-2xl font-normal text-muted">/mo</span>
          </h1>
          <p className="mt-2 text-xl text-muted">
            {formatMoney(result.totalAnnualSavings)}/year
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            From {formatMoney(result.totalCurrentMonthlySpend)}/mo current spend →{" "}
            {formatMoney(result.totalRecommendedMonthlySpend)}/mo optimized
          </p>
        </>
      )}
    </section>
  );
}

export function AuditToolBreakdown({ result }: { result: AuditResult }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Per-tool breakdown</h2>
      {result.toolResults.map((tool) => (
        <article key={tool.toolId} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{tool.toolName}</h3>
              <p className="text-sm text-muted capitalize">
                {tool.plan} · {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg">
                {formatMoney(tool.currentMonthlySpend)}
                <span className="text-sm text-muted">/mo</span>
              </p>
              {tool.monthlySavings > 0 && (
                <p className="text-sm font-medium text-success">
                  Save {formatMoney(tool.monthlySavings)}/mo
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-accent-soft/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {actionLabel(tool.primaryAction)}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{tool.primaryReason}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export function CredexCTA({ monthlySavings }: { monthlySavings: number }) {
  const bookUrl =
    process.env.NEXT_PUBLIC_CREDEX_BOOK_URL ?? "https://credex.rocks/contact";

  if (monthlySavings >= 500) {
    return (
      <section className="card border-accent/40 bg-accent-soft/20 p-6">
        <h2 className="text-xl font-bold">Capture more with Credex</h2>
        <p className="mt-2 text-muted">
          You have {formatMoney(monthlySavings)}/mo in identified savings. Credex
          sources discounted AI credits (Cursor, Claude, OpenAI, and more) from
          companies with surplus — often 20–30% below retail on top of plan
          optimizations.
        </p>
        <a
          href={bookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 inline-flex"
        >
          Book a Credex consultation →
        </a>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">Stay in the loop</h2>
      <p className="mt-2 text-sm text-muted">
        {monthlySavings < 100
          ? "Your stack looks efficient. Save your report below and we'll notify you when new optimizations apply."
          : "Some savings found — save your report to get updates when pricing changes."}
      </p>
    </section>
  );
}
