"use client";

import { useState } from "react";

export function LeadCaptureForm({
  auditId,
  highSavings,
  defaultTeamSize,
}: {
  auditId: string;
  highSavings: boolean;
  defaultTeamSize?: number;
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState(
    defaultTeamSize ? String(defaultTeamSize) : ""
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          teamSize: teamSize ? Number(teamSize) : undefined,
          website: "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setStatus("done");
      setMessage(
        highSavings
          ? "Report sent! Credex may reach out about high-savings opportunities."
          : "Report saved! We'll notify you when new optimizations apply."
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "done") {
    return (
      <section className="card border-success/30 bg-success/5 p-6">
        <p className="font-medium text-success">{message}</p>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <h2 className="text-xl font-semibold">Save your audit report</h2>
      <p className="mt-1 text-sm text-muted">
        Get a copy by email. No spam — value first, always.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Honeypot — hidden from users, bots fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden
        />

        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Email *</span>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Company (optional)</span>
            <input
              className="input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Role (optional)</span>
            <input
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Engineering Manager"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Team size (optional)</span>
          <input
            className="input"
            type="number"
            min="1"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
          />
        </label>

        {message && status === "error" && (
          <p className="text-sm text-danger">{message}</p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving…" : "Email me this report"}
        </button>
      </form>
    </section>
  );
}

export function ShareLink({ auditId }: { auditId: string }) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${base}/r/${auditId}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">Share this audit</h2>
      <p className="mt-1 text-sm text-muted">
        Public link — no email or company name included.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <code className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm break-all">
          {url || `/r/${auditId}`}
        </code>
        <button type="button" className="btn-secondary" onClick={copy}>
          Copy
        </button>
      </div>
    </section>
  );
}
