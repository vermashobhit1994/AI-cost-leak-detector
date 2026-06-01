import { describe, it, expect } from "vitest";
import { runAudit } from "../../src/audit/engine";
import type { AuditInput } from "../../src/types/index";

describe("runAudit — plan fit", () => {
  it("flags Claude Team when fewer than 5 seats", () => {
    const input: AuditInput = {
      teamSize: 3,
      useCase: "writing",
      tools: [
        {
          toolId: "claude",
          plan: "team",
          monthlySpend: 75,
          seats: 3,
        },
      ],
    };

    const result = runAudit(input);
    const claude = result.toolResults[0];

    expect(claude.monthlySavings).toBeGreaterThan(0);
    expect(claude.findings.some((f) => f.category === "plan-fit")).toBe(true);
    expect(claude.recommendedPlan).toBe("pro");
  });

  it("flags enterprise tier for small teams", () => {
    const input: AuditInput = {
      teamSize: 8,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "enterprise",
          monthlySpend: 800,
          seats: 8,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.toolResults[0].monthlySavings).toBeGreaterThan(0);
    expect(
      result.toolResults[0].findings.some(
        (f) => f.action === "downgrade" && f.recommendedPlan === "business"
      )
    ).toBe(true);
  });
});

describe("runAudit — same-vendor downgrade", () => {
  it("recommends Cursor Pro when on Pro+ with Pro-level spend", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "pro+",
          monthlySpend: 60,
          seats: 1,
        },
      ],
    });

    const proDowngrade = result.toolResults[0].findings.find(
      (f) =>
        f.category === "same-vendor-downgrade" && f.recommendedPlan === "pro"
    );
    expect(proDowngrade).toBeDefined();
    expect(proDowngrade!.monthlySavings).toBe(40);
  });

  it("recommends Copilot Business over Enterprise for small teams", () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: "coding",
      tools: [
        {
          toolId: "github-copilot",
          plan: "enterprise",
          monthlySpend: 390,
          seats: 10,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.toolResults[0].monthlySavings).toBe(200);
    expect(result.toolResults[0].recommendedPlan).toBe("business");
  });

  it("suggests downgrade from Gemini Ultra when spend is low", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "research",
      tools: [
        {
          toolId: "gemini",
          plan: "ultra",
          monthlySpend: 249.99,
          seats: 1,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.toolResults[0].monthlySavings).toBeGreaterThan(200);
    expect(result.toolResults[0].recommendedPlan).toBe("pro");
  });
});

describe("runAudit — alternative tools", () => {
  it("suggests GitHub Copilot as cheaper alternative to Cursor for coding", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 200,
          seats: 5,
        },
      ],
    };

    const result = runAudit(input);
    const alt = result.toolResults[0].findings.find(
      (f) => f.category === "alternative-tool"
    );
    expect(alt).toBeDefined();
    expect(alt?.recommendedTool).toBe("github-copilot");
    expect(alt?.monthlySavings).toBe(150);
  });
});

describe("runAudit — duplicate stack", () => {
  it("detects overlapping IDE subscriptions", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 100,
          seats: 5,
        },
        {
          toolId: "github-copilot",
          plan: "business",
          monthlySpend: 95,
          seats: 5,
        },
        {
          toolId: "windsurf",
          plan: "pro",
          monthlySpend: 100,
          seats: 5,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(150);
    expect(
      result.findings.some((f) => f.category === "duplicate-stack")
    ).toBe(true);
  });
});

describe("runAudit — Credex credits", () => {
  it("surfaces Credex savings for high retail spend", () => {
    const input: AuditInput = {
      teamSize: 20,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "business",
          monthlySpend: 800,
          seats: 20,
        },
      ],
    };

    const result = runAudit(input);
    const credex = result.findings.find(
      (f) => f.category === "credex-credits"
    );
    expect(credex).toBeDefined();
    expect(credex!.monthlySavings).toBeGreaterThanOrEqual(10);
  });
});

describe("runAudit — seat optimization", () => {
  it("flags unused seats", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "business",
          monthlySpend: 400,
          seats: 10,
        },
      ],
    };

    const result = runAudit(input);
    const seatFinding = result.toolResults[0].findings.find(
      (f) => f.category === "seat-optimization"
    );
    expect(seatFinding).toBeDefined();
    expect(seatFinding!.monthlySavings).toBe(200);
  });
});

describe("runAudit — savings tiers", () => {
  it("marks already-optimal stacks correctly", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "github-copilot",
          plan: "individual",
          monthlySpend: 10,
          seats: 1,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.savingsTier).toBe("optimal");
    expect(result.isAlreadyOptimal).toBe(true);
    expect(result.totalMonthlySavings).toBeLessThan(5);
  });

  it("classifies high savings tier above $500/mo", () => {
    const input: AuditInput = {
      teamSize: 25,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "enterprise",
          monthlySpend: 2500,
          seats: 25,
        },
        {
          toolId: "github-copilot",
          plan: "enterprise",
          monthlySpend: 975,
          seats: 25,
        },
        {
          toolId: "claude",
          plan: "team",
          monthlySpend: 625,
          seats: 25,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(500);
    expect(result.savingsTier).toBe("high");
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});

describe("runAudit — summaryBullets", () => {
  it("returns reassurance bullets when stack is optimal", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "github-copilot",
          plan: "individual",
          monthlySpend: 10,
          seats: 1,
        },
      ],
    });

    expect(result.summaryBullets).toHaveLength(2);
    expect(result.summaryBullets[0]).toMatch(/well-optimized/i);
  });

  it("includes top tool findings and Credex note for high savings", () => {
    const result = runAudit({
      teamSize: 25,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          plan: "enterprise",
          monthlySpend: 2500,
          seats: 25,
        },
      ],
    });

    expect(result.summaryBullets.length).toBeGreaterThanOrEqual(2);
    expect(result.summaryBullets.some((b) => b.includes("Cursor"))).toBe(true);
    expect(result.summaryBullets.some((b) => b.includes("Credex"))).toBe(true);
  });
});

describe("runAudit — totals", () => {
  it("computes aggregate spend and savings", () => {
    const input: AuditInput = {
      teamSize: 3,
      useCase: "mixed",
      tools: [
        {
          toolId: "chatgpt",
          plan: "team",
          monthlySpend: 75,
          seats: 3,
        },
      ],
    };

    const result = runAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(75);
    expect(result.totalRecommendedMonthlySpend).toBeLessThanOrEqual(75);
    expect(result.summaryBullets.length).toBeGreaterThan(0);
    expect(result.auditedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
