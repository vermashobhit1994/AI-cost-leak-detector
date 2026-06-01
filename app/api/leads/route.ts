import { getAuditStore, saveLeadToStore } from "@/lib/db";
import { sendLeadConfirmationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  auditId: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().int().min(1).optional(),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`leads:${ip}`);
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = leadSchema.parse(body);

    if (parsed.website) {
      return NextResponse.json({ ok: true });
    }

    const store = getAuditStore();
    const audit = await store.getAudit(parsed.auditId);
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const highSavings = audit.result.totalMonthlySavings >= 500;
    const leadId = nanoid();

    await saveLeadToStore({
      id: leadId,
      auditId: parsed.auditId,
      email: parsed.email,
      companyName: parsed.companyName,
      role: parsed.role,
      teamSize: parsed.teamSize,
      highSavings,
      createdAt: new Date().toISOString(),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendLeadConfirmationEmail({
      to: parsed.email,
      auditId: parsed.auditId,
      monthlySavings: audit.result.totalMonthlySavings,
      highSavings,
      shareUrl: `${appUrl}/r/${parsed.auditId}`,
    });

    return NextResponse.json({ ok: true, leadId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
