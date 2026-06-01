export async function sendLeadConfirmationEmail(params: {
  to: string;
  auditId: string;
  monthlySavings: number;
  highSavings: boolean;
  shareUrl: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info("[email] Skipped — RESEND_API_KEY or RESEND_FROM_EMAIL not set");
    return false;
  }

  const subject =
    params.monthlySavings >= 500
      ? `Your AI audit found $${params.monthlySavings}/mo in savings`
      : "Your AI spend audit report";

  const credexNote =
    params.highSavings
      ? "Given the savings we found, someone from Credex may reach out about discounted AI credits."
      : "We'll email you when new optimizations apply to your stack.";

  const html = `
    <h2>Your AI spend audit is ready</h2>
    <p>We estimated <strong>$${params.monthlySavings}/month</strong> in potential savings.</p>
    <p><a href="${params.shareUrl}">View your shareable report</a></p>
    <p>${credexNote}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend error:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err);
    return false;
  }
}
