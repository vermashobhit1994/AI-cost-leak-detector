"use client";

import {
  AuditResultsHero,
  AuditSummaryBullets,
  AuditToolBreakdown,
  CredexCTA,
} from "@/components/AuditResults";
import { LeadCaptureForm, ShareLink } from "@/components/LeadCaptureForm";
import type { AuditResult } from "@audit/types/index";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AuditPageContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Missing audit ID");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/audit/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Not found");
        setResult(data.result);
        setAiSummary(data.aiSummary ?? null);

        if (!data.aiSummary) {
          fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ auditId: id }),
          })
            .then((r) => r.json())
            .then((d) => d.summary && setAiSummary(d.summary))
            .catch(() => undefined);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="card p-12 text-center text-muted">Loading your audit…</div>
    );
  }

  if (error || !result || !id) {
    return (
      <div className="card p-8 text-center">
        <p className="text-danger">{error ?? "Audit not found"}</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">
          Start new audit
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-left">
        <Link href="/" className="btn-secondary">
          ← Run another audit
        </Link>
      </div>
      <AuditResultsHero result={result} />
      <AuditSummaryBullets bullets={result.summaryBullets} />

      {aiSummary && (
        <section className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Personalized summary
          </h2>
          <p className="mt-3 leading-relaxed">{aiSummary}</p>
        </section>
      )}

      <AuditToolBreakdown result={result} />
      <CredexCTA monthlySavings={result.totalMonthlySavings} />
      <LeadCaptureForm
        auditId={id}
        highSavings={result.totalMonthlySavings >= 500}
        defaultTeamSize={result.input.teamSize}
      />
      <ShareLink auditId={id} />

      
    </div>
  );
}

export default function AuditPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Suspense
        fallback={
          <div className="card p-12 text-center text-muted">Loading…</div>
        }
      >
        <AuditPageContent />
      </Suspense>
    </main>
  );
}
