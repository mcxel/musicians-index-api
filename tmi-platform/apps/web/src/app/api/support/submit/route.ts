import { NextResponse } from "next/server";
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, description, email, urgency, sessionContext } = body as {
      category?: string; description?: string; email?: string; urgency?: string;
      sessionContext?: Record<string, unknown>;
    };

    if (!category || !description || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticketId = "TMI-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const responseTime = urgency === "urgent" ? "4 hours" : "24–48 hours";

    const ctxHtml = sessionContext
      ? `<details style="margin-top:16px;font-size:11px;color:#888"><summary>Session Context</summary><pre style="background:#111;padding:8px;border-radius:4px;overflow:auto">${JSON.stringify(sessionContext, null, 2)}</pre></details>`
      : '';

    // Send confirmation to user
    await EmailProviderEngine.sendAsync({
      to: email,
      subject: `Support Ticket ${ticketId} Received`,
      html: `<p>Hi,</p><p>We received your <strong>${category}</strong> support request (Ticket ID: <strong>${ticketId}</strong>).</p><p>We'll respond within <strong>${responseTime}</strong>.</p><p style="color:#888">The TMI Support Team</p>`,
      text: `Support ticket ${ticketId} received. We'll respond within ${responseTime}.`,
    }).catch(() => null);

    // Internal log with full session context
    console.log("[Support Ticket]", {
      ticketId, category, email, urgency,
      description: description.slice(0, 200),
      sessionContext,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Ticket ${ticketId} created. Response will be sent to ${email} within ${responseTime}.`,
      _ctxHtml: ctxHtml,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
  }
}

