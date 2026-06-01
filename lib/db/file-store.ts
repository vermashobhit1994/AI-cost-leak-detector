import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AuditStore, StoredAudit } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const AUDITS_FILE = path.join(DATA_DIR, "audits.json");

async function ensureDataFile(): Promise<Record<string, StoredAudit>> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(AUDITS_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, StoredAudit>;
  } catch {
    return {};
  }
}

async function writeData(data: Record<string, StoredAudit>): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(AUDITS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export class FileAuditStore implements AuditStore {
  async saveAudit(audit: StoredAudit): Promise<void> {
    const data = await ensureDataFile();
    data[audit.id] = audit;
    await writeData(data);
  }

  async getAudit(id: string): Promise<StoredAudit | null> {
    const data = await ensureDataFile();
    const audit = data[id];
    if (!audit) return null;
    return { ...audit, leads: audit.leads ?? [] };
  }
}

export const fileAuditStore = new FileAuditStore();
