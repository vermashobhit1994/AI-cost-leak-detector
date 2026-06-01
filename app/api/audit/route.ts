import { runAudit } from "@audit/audit/engine";
import type { AuditInput, ToolId, UseCase } from "@audit/types/index";
import { getAuditStore } from "@/lib/db";
import type { StoredAudit } from "@/lib/db/types";
import { generateAiSummary } from "@/lib/summary";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

const toolSchema = z.object({
  toolId: z.string(),
  plan: z.string().min(1),
  monthlySpend: z.number().min(0),
  seats: z.number().int().min(1),
});

const auditSchema = z.object({
  teamSize: z.number().int().min(1),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
  tools: z.array(toolSchema).min(1),
});

export async function POST(request: Request) {
  console.log(request);
  const ip = getClientIp(request);
  const rate = checkRateLimit(`audit:${ip}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter ?? 60) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = auditSchema.parse(body);

    
    const input: AuditInput = {
      teamSize: parsed.teamSize,
      useCase: parsed.useCase as UseCase,
      tools: parsed.tools.map((t) => ({
        toolId: t.toolId as ToolId,
        plan: t.plan,
        monthlySpend: t.monthlySpend,
        seats: t.seats,
      })),
    };
    console.log(input);

    const result = runAudit(input);
    const id = nanoid(12);
    const aiSummary = await generateAiSummary(result);

    const stored: StoredAudit = {
      id,
      createdAt: new Date().toISOString(),
      input,
      result,
      aiSummary,
      leads: [],
    };

    await getAuditStore().saveAudit(stored);

    return NextResponse.json({ id, result, aiSummary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.flatten() },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
