import {
  formatMoney,
  savingsTierLabel,
  toPublicAudit,
} from "@/lib/audit-utils";
import { AuditSummaryBullets } from "@/components/AuditResults";
import { getAuditStore } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const store = getAuditStore();
  const audit = await store.getAudit(id);

  if (!audit) {
    return { title: "Audit not found" };
  }

  const pub = toPublicAudit(audit);
  const title =
    pub.totalMonthlySavings > 0
      ? `$${pub.totalMonthlySavings}/mo AI savings found`
      : "AI spend audit — well optimized";

  const description = pub.isAlreadyOptimal
    ? `Team of ${pub.teamSize} spending $${pub.totalCurrentMonthlySpend}/mo on AI tools — audit shows efficient spend.`
    : `Potential savings: $${pub.totalMonthlySavings}/mo ($${pub.totalAnnualSavings}/yr) across ${pub.toolCount} AI tools.`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Cost Leak Detector`,
      description,
      url: `${appUrl}/r/${id}`,
      type: "article",
      siteName: "Cost Leak Detector",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicAuditPage({ params }: PageProps) {
  const { id } = await params;
  const store = getAuditStore();
  const audit = await store.getAudit(id);

  if (!audit) notFound();

  const pub = toPublicAudit(audit);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8 text-center">
        <p className="text-sm text-muted">Shared AI spend audit</p>
        <h1 className="mt-2 text-3xl font-bold">
          {pub.isAlreadyOptimal
            ? "Efficient AI spend"
            : `${formatMoney(pub.totalMonthlySavings)}/mo savings found`}
        </h1>
        <p className="mt-2 text-muted">{savingsTierLabel(pub.savingsTier)}</p>
      </header>

      <section className="card mb-6 p-6 text-center">
        <p className="text-sm text-muted">Current spend</p>
        <p className="text-3xl font-bold">
          {formatMoney(pub.totalCurrentMonthlySpend)}
          <span className="text-lg text-muted">/mo</span>
        </p>
        {!pub.isAlreadyOptimal && (
          <p className="mt-2 text-success">
            → {formatMoney(pub.totalAnnualSavings)}/year potential savings
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          {pub.teamSize}-person team · {pub.useCase} · {pub.toolCount} tool(s)
        </p>
      </section>

      <AuditSummaryBullets bullets={pub.summaryBullets} />

      {pub.aiSummary && (
        <section className="card mb-6 p-6">
          <p className="leading-relaxed">{pub.aiSummary}</p>
        </section>
      )}

      <section className="space-y-4">
        {pub.toolsSummary.map((tool) => (
          <article key={tool.toolName} className="card p-5">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-semibold">{tool.toolName}</h2>
                <p className="text-sm capitalize text-muted">{tool.plan}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">{formatMoney(tool.monthlySpend)}/mo</p>
                {tool.monthlySavings > 0 && (
                  <p className="text-sm text-success">
                    −{formatMoney(tool.monthlySavings)}/mo
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{tool.primaryReason}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="btn-primary">
          Audit your stack →
        </Link>
      </div>
    </main>
  );
}
