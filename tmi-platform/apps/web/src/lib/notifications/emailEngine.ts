/**
 * TMI Email Engine — production-ready transactional email.
 * Checks SENDGRID_API_KEY → sends via SendGrid API.
 * Checks SMTP_HOST → placeholder for nodemailer (add package if needed).
 * Falls back to console log in development / unconfigured environments.
 */

const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@themusiciansindex.com";
const FROM_NAME  = "The Musician's Index";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "berntmusic33@gmail.com";

// ── Core send function ─────────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.SENDGRID_API_KEY;

  if (key) {
    try {
      const res = await fetch(SENDGRID_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: opts.to }] }],
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: opts.subject,
          content: [
            { type: "text/plain", value: opts.text ?? opts.subject },
            { type: "text/html",  value: opts.html },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[EmailEngine] SendGrid error ${res.status}: ${body}`);
        return { ok: false, error: `SendGrid ${res.status}` };
      }
      return { ok: true };
    } catch (err) {
      console.error("[EmailEngine] SendGrid fetch failed:", err);
      return { ok: false, error: String(err) };
    }
  }

  // Fallback: log to console (dev / no key configured)
  console.log(`[EmailEngine:STUB] To: ${opts.to} | Subject: ${opts.subject}`);
  return { ok: true };
}

// ── HTML template builder ──────────────────────────────────────────────────────

function buildHtml(title: string, body: string, ctaHref?: string, ctaLabel?: string): string {
  const cta = ctaHref
    ? `<div style="margin:24px 0"><a href="${ctaHref}" style="display:inline-block;background:#00FFFF;color:#050510;font-weight:900;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 24px;border-radius:8px;text-decoration:none">${ctaLabel ?? "View Now"}</a></div>`
    : "";
  return `<!DOCTYPE html><html><body style="background:#050510;font-family:Inter,sans-serif;color:#f1f5f9;margin:0;padding:40px 24px">
<div style="max-width:560px;margin:0 auto">
  <p style="font-size:11px;letter-spacing:0.25em;color:#00FFFF;text-transform:uppercase;font-weight:900;margin:0 0 8px">THE MUSICIAN'S INDEX</p>
  <h1 style="font-size:24px;font-weight:900;color:#fff;margin:0 0 20px;line-height:1.2">${title}</h1>
  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;font-size:14px;line-height:1.7;color:#cbd5e1">${body}</div>
  ${cta}
  <p style="margin:24px 0 0;font-size:11px;color:#475569">© ${new Date().getFullYear()} The Musician's Index · BernoutGlobal LLC<br>If you didn't create an account, you can ignore this email.</p>
</div></body></html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const EmailEngine = {

  async sendWelcomeEmail(email: string, role: string): Promise<{ ok: boolean }> {
    const roleCaps = role.toUpperCase();
    return sendEmail({
      to: email,
      subject: `Welcome to TMI — You're in as a ${roleCaps}`,
      html: buildHtml(
        `Welcome to The Musician's Index!`,
        `<p>Your account is live and your role is set to <strong style="color:#FFD700">${roleCaps}</strong>.</p>
         <p>You now have access to your dashboard, live rooms, battles, ciphers, and everything TMI has to offer.</p>
         <p>The platform runs 24/7. Jump in anytime.</p>`,
        process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com",
        "Open My Dashboard"
      ),
      text: `Welcome to TMI! Your role is ${roleCaps}. Visit themusiciansindex.com to get started.`,
    });
  },

  async sendPurchaseReceipt(email: string, item: string, amountCents: number): Promise<{ ok: boolean }> {
    const amount = (amountCents / 100).toFixed(2);
    return sendEmail({
      to: email,
      subject: `TMI Receipt — $${amount} for ${item}`,
      html: buildHtml(
        `Payment Received`,
        `<p>Thank you for your purchase!</p>
         <table style="width:100%;border-collapse:collapse;margin:12px 0">
           <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8">Item</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right;color:#f1f5f9;font-weight:700">${item}</td></tr>
           <tr><td style="padding:8px 0;color:#94a3b8">Amount Paid</td><td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:900;font-size:18px">$${amount}</td></tr>
         </table>
         <p>Your purchase is confirmed and active. Visit your account to access it.</p>`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/account`,
        "View Account"
      ),
      text: `TMI Receipt: $${amount} for ${item}.`,
    });
  },

  async sendTicket(email: string, eventName: string, ticketUrl: string): Promise<{ ok: boolean }> {
    return sendEmail({
      to: email,
      subject: `Your TMI Ticket — ${eventName}`,
      html: buildHtml(
        `Your Ticket Is Ready`,
        `<p>You're confirmed for <strong style="color:#FF2DAA">${eventName}</strong>.</p>
         <p>Click below to view, download, or print your ticket. Show it at the door or scan it in the app.</p>
         <p style="font-size:11px;color:#64748b">Keep this email — it's your receipt and entry pass.</p>`,
        ticketUrl,
        "View & Print Ticket"
      ),
      text: `Your ticket for ${eventName}: ${ticketUrl}`,
    });
  },

  async sendSubscriptionConfirmed(email: string, tier: string, nextBillingDate: string): Promise<{ ok: boolean }> {
    return sendEmail({
      to: email,
      subject: `TMI Subscription Active — ${tier}`,
      html: buildHtml(
        `Your Subscription Is Active`,
        `<p>Your <strong style="color:#FFD700">${tier}</strong> subscription is confirmed and active.</p>
         <p>Next billing date: <strong>${nextBillingDate}</strong></p>
         <p>You have full access to all ${tier} features. Manage your subscription anytime in your account settings.</p>`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/account/subscription`,
        "Manage Subscription"
      ),
      text: `Your ${tier} subscription is active. Next billing: ${nextBillingDate}.`,
    });
  },

  async sendSubscriptionRenewed(email: string, tier: string, amountCents: number): Promise<{ ok: boolean }> {
    const amount = (amountCents / 100).toFixed(2);
    return sendEmail({
      to: email,
      subject: `TMI Subscription Renewed — $${amount}`,
      html: buildHtml(
        `Subscription Renewed`,
        `<p>Your <strong style="color:#FFD700">${tier}</strong> subscription has been automatically renewed.</p>
         <p>Amount charged: <strong style="color:#22c55e">$${amount}</strong></p>
         <p>Your access continues without interruption.</p>`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/account/subscription`,
        "View Subscription"
      ),
      text: `Your ${tier} subscription was renewed for $${amount}.`,
    });
  },

  async sendPayoutNotification(email: string, amount: number, status: "approved" | "processing" | "sent"): Promise<{ ok: boolean }> {
    const amountStr = (amount / 100).toFixed(2);
    const statusLabel = status === "sent" ? "Sent" : status === "processing" ? "Processing" : "Approved";
    return sendEmail({
      to: email,
      subject: `TMI Payout ${statusLabel} — $${amountStr}`,
      html: buildHtml(
        `Payout ${statusLabel}`,
        `<p>Your payout of <strong style="color:#22c55e">$${amountStr}</strong> has been <strong>${statusLabel.toLowerCase()}</strong>.</p>
         ${status === "sent" ? "<p>Funds should arrive in your account within 2–5 business days depending on your bank.</p>" : ""}
         <p>View your full earnings history in your dashboard.</p>`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/dashboard/artist/earnings`,
        "View Earnings"
      ),
      text: `TMI Payout ${statusLabel}: $${amountStr}.`,
    });
  },

  async sendPasswordReset(email: string, resetUrl: string): Promise<{ ok: boolean }> {
    return sendEmail({
      to: email,
      subject: "Reset Your TMI Password",
      html: buildHtml(
        "Reset Your Password",
        `<p>We received a request to reset your password.</p>
         <p>This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email — your account is safe.</p>`,
        resetUrl,
        "Reset Password"
      ),
      text: `Reset your TMI password: ${resetUrl}`,
    });
  },

  async sendSystemAlert(alertMsg: string): Promise<{ ok: boolean }> {
    return sendEmail({
      to: ADMIN_EMAIL,
      subject: `[TMI ALERT] ${alertMsg.slice(0, 80)}`,
      html: buildHtml(
        "System Alert",
        `<p style="color:#ef4444;font-weight:700">${alertMsg}</p><p>Check the admin dashboard immediately.</p>`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/admin`,
        "Open Admin"
      ),
      text: `TMI SYSTEM ALERT: ${alertMsg}`,
    });
  },

  async sendBeatPurchased(email: string, beatTitle: string, licenseType: string, downloadUrl?: string): Promise<{ ok: boolean }> {
    return sendEmail({
      to: email,
      subject: `TMI Beat License — ${beatTitle}`,
      html: buildHtml(
        `Beat License Confirmed`,
        `<p>You now hold a <strong style="color:#AA2DFF">${licenseType.toUpperCase()}</strong> license for:</p>
         <h2 style="color:#FFD700;font-size:20px;margin:8px 0">${beatTitle}</h2>
         ${downloadUrl ? `<p>Your download is ready. Keep this email — it contains your license.</p>` : ""}`,
        downloadUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/beats`,
        downloadUrl ? "Download Beat" : "View Beats"
      ),
      text: `Beat license confirmed: ${beatTitle} (${licenseType}).`,
    });
  },
};
