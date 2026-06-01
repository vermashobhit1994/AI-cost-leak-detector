import { getAuditStore } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const audit = await getAuditStore().getAudit(id);

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: audit.id,
    result: audit.result,
    aiSummary: audit.aiSummary,
    createdAt: audit.createdAt,
  });
}
