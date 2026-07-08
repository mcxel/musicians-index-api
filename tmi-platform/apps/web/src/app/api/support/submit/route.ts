import { NextResponse } from "next/server";
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";
import { checkRateLimit, validateSignupEmail } from "@/lib/security/TMISecurityEngine";

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "hidden";
  if (local.length <= 2) return `**@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, description, email, urgency, sessionContext } = body as {
      category?: string; description?: string; email?: string; urgency?: string;
      sessionContext?: Record<string, unknown>;
    };

    const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-client-ip") ?? "unknown";
    const clientIp = forwardedFor.split(",")[0]?.trim() ?? "unknown";

    const rateLimit = checkRateLimit(`support:submit:${clientIp}`, 8, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many support submissions. Please wait and try again." }, { status: 429 });
    }

    if (!category || !description || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanCategory = sanitizeInput(category).slice(0, 80);
    const cleanDescription = sanitizeInput(description).slice(0, 4000);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanCategory || !cleanDescription) {
      return NextResponse.json({ error: "Invalid support request fields" }, { status: 400 });
    }

    const emailValidation = validateSignupEmail(cleanEmail);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error ?? "Invalid email address" }, { status: 400 });
    }

    const ticketId = "TMI-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const responseTime = urgency === "urgent" ? "4 hours" : "24–48 hours";

    const ctxHtml = sessionContext
      ? `<details style="margin-top:16px;font-size:11px;color:#888"><summary>Session Context</summary><pre style="background:#111;padding:8px;border-radius:4px;overflow:auto">${JSON.stringify(sessionContext, null, 2)}</pre></details>`
      : '';

    // Send confirmation to user
    await EmailProviderEngine.sendAsync({
      to: cleanEmail,
      subject: `Support Ticket ${ticketId} Received`,
      html: `<p>Hi,</p><p>We received your <strong>${cleanCategory}</strong> support request (Ticket ID: <strong>${ticketId}</strong>).</p><p>We'll respond within <strong>${responseTime}</strong>.</p><p style="color:#888">The TMI Support Team</p>`,
      text: `Support ticket ${ticketId} received. We'll respond within ${responseTime}.`,
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Ticket ${ticketId} created. Response will be sent to ${cleanEmail} within ${responseTime}.`,
      _ctxHtml: ctxHtml,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
  }
}

