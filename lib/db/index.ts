import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditStore, StoredAudit } from "./types";
import { fileAuditStore } from "./file-store";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

class SupabaseAuditStore implements AuditStore {
  constructor(private client: SupabaseClient) {}

  async saveAudit(audit: StoredAudit): Promise<void> {
    const { error } = await this.client.from("audits").upsert({
      id: audit.id,
      created_at: audit.createdAt,
      input: audit.input,
      result: audit.result,
      ai_summary: audit.aiSummary ?? null,
    });
    if (error) throw new Error(error.message);
  }

  async getAudit(id: string): Promise<StoredAudit | null> {
    const { data, error } = await this.client
      .from("audits")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const { data: leads } = await this.client
      .from("leads")
      .select("*")
      .eq("audit_id", id);

    return {
      id: data.id,
      createdAt: data.created_at,
      input: data.input,
      result: data.result,
      aiSummary: data.ai_summary ?? undefined,
      leads: (leads ?? []).map((l) => ({
        id: l.id,
        auditId: l.audit_id,
        email: l.email,
        companyName: l.company_name ?? undefined,
        role: l.role ?? undefined,
        teamSize: l.team_size ?? undefined,
        createdAt: l.created_at,
        highSavings: l.high_savings,
      })),
    };
  }

  async saveLead(lead: {
    id: string;
    auditId: string;
    email: string;
    companyName?: string;
    role?: string;
    teamSize?: number;
    highSavings: boolean;
    createdAt: string;
  }): Promise<void> {
    const { error } = await this.client.from("leads").insert({
      id: lead.id,
      audit_id: lead.auditId,
      email: lead.email,
      company_name: lead.companyName ?? null,
      role: lead.role ?? null,
      team_size: lead.teamSize ?? null,
      high_savings: lead.highSavings,
      created_at: lead.createdAt,
    });
    if (error) throw new Error(error.message);
  }
}

export function getAuditStore(): AuditStore {
  const supabase = getSupabase();
  return supabase ? new SupabaseAuditStore(supabase) : fileAuditStore;
}

export async function saveLeadToStore(lead: {
  id: string;
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  highSavings: boolean;
  createdAt: string;
}): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await new SupabaseAuditStore(supabase).saveLead(lead);
    return;
  }

  const audit = await fileAuditStore.getAudit(lead.auditId);
  if (!audit) throw new Error("Audit not found");
  audit.leads.push({
    id: lead.id,
    auditId: lead.auditId,
    email: lead.email,
    companyName: lead.companyName,
    role: lead.role,
    teamSize: lead.teamSize,
    createdAt: lead.createdAt,
    highSavings: lead.highSavings,
  });
  await fileAuditStore.saveAudit(audit);
}
