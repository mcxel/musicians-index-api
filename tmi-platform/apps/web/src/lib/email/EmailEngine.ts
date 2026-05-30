/**
 * TMI Platform — Email Engine
 * Supports: Resend (primary), SMTP nodemailer (fallback), console (dev)
 * Set RESEND_API_KEY for production. Set EMAIL_SMTP_* for SMTP fallback.
 */

export type EmailRole =
  | "FAN" | "ARTIST" | "PERFORMER" | "SPONSOR"
  | "ADVERTISER" | "VENUE" | "PROMOTER" | "ADMIN";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  provider: "resend" | "smtp" | "console";
}

const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "TMI Platform <noreply@themusiciansindex.com>";

const RESEND_KEY   = process.env.RESEND_API_KEY;
const SMTP_HOST    = process.env.EMAIL_SMTP_HOST;
const SMTP_PORT    = parseInt(process.env.EMAIL_SMTP_PORT ?? "587");
const SMTP_USER    = process.env.EMAIL_SMTP_USER;
const SMTP_PASS    = process.env.EMAIL_SMTP_PASS;

// ─── Resend provider ────────────────────────────────────────────────────────
async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:     payload.from ?? FROM_DEFAULT,
      to:       Array.isArray(payload.to) ? payload.to : [payload.to],
      subject:  payload.subject,
      html:     payload.html,
      text:     payload.text,
      reply_to: payload.replyTo,
      tags:     payload.tags ? Object.entries(payload.tags).map(([n, v]) => ({ name: n, value: v })) : undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Resend error ${res.status}: ${err}`, provider: "resend" };
  }

  const data = (await res.json()) as { id?: string };
  return { success: true, id: data.id, provider: "resend" };
}

// ─── SMTP provider (via nodemailer-compatible API) ───────────────────────────
async function sendViaSMTP(payload: EmailPayload): Promise<EmailResult> {
  try {
    // Dynamic import to avoid bundling nodemailer on edge
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const info = await transporter.sendMail({
      from:    payload.from ?? FROM_DEFAULT,
      to:      Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
      subject: payload.subject,
      html:    payload.html,
      text:    payload.text,
    });
    return { success: true, id: info.messageId as string, provider: "smtp" };
  } catch (e: unknown) {
    return { success: false, error: String(e), provider: "smtp" };
  }
}

// ─── Console provider (dev / fallback) ──────────────────────────────────────
function sendToConsole(payload: EmailPayload): EmailResult {
  console.log("\n📧 [EmailEngine] ─────────────────────────────────────");
  console.log(`  To:      ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  From:    ${payload.from ?? FROM_DEFAULT}`);
  console.log("──────────────────────────────────────────────────────\n");
  return { success: true, id: `console-${Date.now()}`, provider: "console" };
}

// ─── Main send function ──────────────────────────────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (RESEND_KEY) return sendViaResend(payload);
  if (SMTP_HOST && SMTP_USER) return sendViaSMTP(payload);
  return sendToConsole(payload);
}

// ─── Batch send ──────────────────────────────────────────────────────────────
export async function sendEmailBatch(payloads: EmailPayload[]): Promise<EmailResult[]> {
  return Promise.all(payloads.map(sendEmail));
}

// ─── Convenience wrappers ────────────────────────────────────────────────────
export const EmailEngine = {
  send:      sendEmail,
  sendBatch: sendEmailBatch,

  /** Send a welcome email for any role */
  async welcome(to: string, name: string, role: EmailRole, loginUrl = "https://themusiciansindex.com/login") {
    const { welcomeEmailHtml, welcomeEmailText } = await import("./templates/WelcomeEmail");
    return sendEmail({
      to,
      subject: `Welcome to The Musician's Index, ${name}!`,
      html:    welcomeEmailHtml(name, role, loginUrl),
      text:    welcomeEmailText(name, role, loginUrl),
      tags:    { role, type: "welcome" },
    });
  },

  /** Email verification */
  async verifyEmail(to: string, name: string, verifyUrl: string) {
    const { verifyEmailHtml } = await import("./templates/VerifyEmail");
    return sendEmail({
      to,
      subject: "Verify your TMI email address",
      html:    verifyEmailHtml(name, verifyUrl),
      tags:    { type: "verify" },
    });
  },

  /** Password reset */
  async passwordReset(to: string, name: string, resetUrl: string) {
    const { passwordResetHtml } = await import("./templates/PasswordResetEmail");
    return sendEmail({
      to,
      subject: "Reset your TMI password",
      html:    passwordResetHtml(name, resetUrl),
      tags:    { type: "password_reset" },
    });
  },

  /** Booking confirmation */
  async bookingConfirmed(to: string, name: string, details: BookingEmailDetails) {
    const { bookingConfirmedHtml } = await import("./templates/BookingEmail");
    return sendEmail({
      to,
      subject: `Booking Confirmed — ${details.showTitle}`,
      html:    bookingConfirmedHtml(name, details),
      tags:    { type: "booking_confirmed" },
    });
  },

  /** Tip receipt */
  async tipReceipt(to: string, fromName: string, toArtist: string, amountCents: number) {
    const { tipReceiptHtml } = await import("./templates/TipReceiptEmail");
    return sendEmail({
      to,
      subject: `Tip sent to ${toArtist} — Thank you!`,
      html:    tipReceiptHtml(fromName, toArtist, amountCents),
      tags:    { type: "tip_receipt" },
    });
  },

  /** Subscription activated */
  async subscriptionActivated(to: string, name: string, plan: string, nextBillDate: string) {
    const { subscriptionActivatedHtml } = await import("./templates/SubscriptionEmail");
    return sendEmail({
      to,
      subject: `Your TMI ${plan} subscription is active`,
      html:    subscriptionActivatedHtml(name, plan, nextBillDate),
      tags:    { type: "subscription_activated", plan },
    });
  },

  /** Payment failed */
  async paymentFailed(to: string, name: string, updateUrl: string) {
    const { paymentFailedHtml } = await import("./templates/PaymentFailedEmail");
    return sendEmail({
      to,
      subject: "Action required — TMI payment failed",
      html:    paymentFailedHtml(name, updateUrl),
      tags:    { type: "payment_failed" },
    });
  },

  /** Live show reminder */
  async showReminder(to: string, fanName: string, artistName: string, showTime: string, showUrl: string) {
    const { showReminderHtml } = await import("./templates/ShowReminderEmail");
    return sendEmail({
      to,
      subject: `${artistName} goes live in 15 minutes!`,
      html:    showReminderHtml(fanName, artistName, showTime, showUrl),
      tags:    { type: "show_reminder" },
    });
  },

  /** Ticket delivery */
  async ticketDelivery(to: string, name: string, tickets: import("./templates/TicketDeliveryEmail").TicketEmailDetails[]) {
    const { ticketDeliveryHtml } = await import("./templates/TicketDeliveryEmail");
    return sendEmail({
      to,
      subject: `Your TMI tickets are ready`,
      html:    ticketDeliveryHtml(name, tickets),
      tags:    { type: "ticket_delivery" },
    });
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface BookingEmailDetails {
  showTitle:   string;
  venueName:   string;
  showDate:    string;
  showTime:    string;
  artistName:  string;
  ticketUrl?:  string;
  fee?:        string;
}

// Re-export from template to avoid type drift
export type { TicketEmailDetails } from "./templates/TicketDeliveryEmail";
