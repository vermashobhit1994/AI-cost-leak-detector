import type { AuditInput, AuditResult } from "@audit/types/index";

/** Public share payload — no email or company name */
export interface PublicAuditRecord {
  id: string;
  createdAt: string;
  useCase: AuditInput["useCase"];
  teamSize: number;
  toolCount: number;
  toolsSummary: {
    toolName: string;
    plan: string;
    monthlySpend: number;
    monthlySavings: number;
    primaryReason: string;
  }[];
  totalCurrentMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: AuditResult["savingsTier"];
  isAlreadyOptimal: boolean;
  summaryBullets: string[];
  aiSummary?: string;
}

export interface LeadRecord {
  id: string;
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  createdAt: string;
  highSavings: boolean;
}

export interface StoredAudit {
  id: string;
  createdAt: string;
  input: AuditInput;
  result: AuditResult;
  aiSummary?: string;
  leads: LeadRecord[];
}

export interface AuditStore {
  saveAudit(audit: StoredAudit): Promise<void>;
  getAudit(id: string): Promise<StoredAudit | null>;
}
