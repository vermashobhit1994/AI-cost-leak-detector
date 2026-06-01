"use client";

import {
  TOOL_FORM_OPTIONS,
  USE_CASES,
  createEmptyToolRow,
  type FormToolRow,
  type PersistedFormState,
} from "@/lib/form-config";
import { usePersistedFormState } from "@/lib/form-storage";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ToolRowEditor({
  row,
  onChange,
  onRemove,
  canRemove,
}: {
  row: FormToolRow;
  onChange: (row: FormToolRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const toolMeta = TOOL_FORM_OPTIONS.find((t) => t.toolId === row.toolId)!;

  return (
    <div className="card grid gap-4 p-4 md:grid-cols-12 md:items-end">
      <label className="md:col-span-3">
        <span className="mb-1.5 block text-sm text-muted">Tool</span>
        <select
          className="input"
          value={row.toolId}
          onChange={(e) => {
            const toolId = e.target.value as FormToolRow["toolId"];
            const plans = TOOL_FORM_OPTIONS.find((t) => t.toolId === toolId)!.plans;
            onChange({ ...row, toolId, plan: plans[0]?.id ?? "" });
          }}
        >
          {TOOL_FORM_OPTIONS.map((t) => (
            <option key={t.toolId} value={t.toolId}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm text-muted">Plan</span>
        <select
          className="input"
          value={row.plan}
          onChange={(e) => onChange({ ...row, plan: e.target.value })}
        >
          {toolMeta.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm text-muted">Monthly spend ($)</span>
        <input
          className="input"
          type="number"
          min="0"
          step="1"
          placeholder="200"
          value={row.monthlySpend}
          onChange={(e) => onChange({ ...row, monthlySpend: e.target.value })}
          required
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-1.5 block text-sm text-muted">Seats</span>
        <input
          className="input"
          type="number"
          min="1"
          step="1"
          value={row.seats}
          onChange={(e) => onChange({ ...row, seats: e.target.value })}
          required
        />
      </label>

      <div className="md:col-span-3 flex justify-end">
        {canRemove && (
          <button
            type="button"
            className="btn-secondary text-sm text-muted"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export function AuditForm() {
  const router = useRouter();
  const { form, setForm, hydrated } = usePersistedFormState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTool = (id: string, row: FormToolRow) => {
    setForm((prev: PersistedFormState) => ({
      ...prev,
      tools: prev.tools.map((t) => (t.id === id ? row : t)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamSize: Number(form.teamSize),
          useCase: form.useCase,
          tools: form.tools.map((t) => ({
            toolId: t.toolId,
            plan: t.plan,
            monthlySpend: Number(t.monthlySpend),
            seats: Number(t.seats),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Audit failed");

      router.push(`/audit?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="card p-8 text-center text-muted">Loading saved form…</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-sm text-muted">Team size</span>
          <input
            className="input"
            type="number"
            min="1"
            required
            value={form.teamSize}
            onChange={(e) => setForm({ teamSize: e.target.value })}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm text-muted">Primary use case</span>
          <select
            className="input"
            value={form.useCase}
            onChange={(e) =>
              setForm({ useCase: e.target.value as PersistedFormState["useCase"] })
            }
          >
            {USE_CASES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI tools you pay for</h2>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                tools: [...prev.tools, createEmptyToolRow()],
              }))
            }
          >
            + Add tool
          </button>
        </div>

        {form.tools.map((row) => (
          <ToolRowEditor
            key={row.id}
            row={row}
            canRemove={form.tools.length > 1}
            onChange={(updated) => updateTool(row.id, updated)}
            onRemove={() =>
              setForm((prev) => ({
                ...prev,
                tools: prev.tools.filter((t) => t.id !== row.id),
              }))
            }
          />
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full md:w-auto" disabled={loading}>
        {loading ? "Running audit…" : "Run free audit →"}
      </button>

      <p className="text-xs text-muted">
        Form data saves locally in your browser. No login required.
      </p>
    </form>
  );
}
