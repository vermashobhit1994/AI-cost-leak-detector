import { getAuditStore } from "@/lib/db";
import { generateAiSummary } from "@/lib/summary";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  auditId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { auditId } = schema.parse(await request.json());
    const store = getAuditStore();
    const audit = await store.getAudit(auditId);

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.aiSummary) {
      return NextResponse.json({ summary: audit.aiSummary });
    }

    const summary = await generateAiSummary(audit.result);
    audit.aiSummary = summary;
    await store.saveAudit(audit);

    return NextResponse.json({ summary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Summary failed" }, { status: 500 });
  }
}
