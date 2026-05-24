// lib/mail/TMIMailEngine.ts — Provider-agnostic mail send interface

export type MailProvider = "resend" | "sendgrid" | "console";

export interface MailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface MailResult {
  success: boolean;
  messageId?: string;
  provider: MailProvider;
  error?: string;
  sentAt: number;
}

const DEFAULT_FROM = process.env.MAIL_FROM ?? "TMI Platform <noreply@themusiciansindex.com>";
const PROVIDER = (process.env.MAIL_PROVIDER ?? "console") as MailProvider;

// In-memory sent log for console provider + audit
const sentLog: Array<MailMessage & { sentAt: number; messageId: string }> = [];

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function sendViaResend(msg: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const body = {
    from: msg.from ?? DEFAULT_FROM,
    to: Array.isArray(msg.to) ? msg.to : [msg.to],
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    reply_to: msg.replyTo,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, provider: "resend", error: err, sentAt: Date.now() };
  }

  const data = await res.json() as { id: string };
  return { success: true, messageId: data.id, provider: "resend", sentAt: Date.now() };
}

async function sendViaSendGrid(msg: MailMessage): Promise<MailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error("SENDGRID_API_KEY not set");

  const body = {
    personalizations: [{ to: Array.isArray(msg.to) ? msg.to.map(e => ({ email: e })) : [{ email: msg.to }] }],
    from: { email: (msg.from ?? DEFAULT_FROM).replace(/.*<(.+)>/, "$1") },
    subject: msg.subject,
    content: [
      { type: "text/html", value: msg.html },
      ...(msg.text ? [{ type: "text/plain", value: msg.text }] : []),
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, provider: "sendgrid", error: err, sentAt: Date.now() };
  }

  const messageId = res.headers.get("X-Message-Id") ?? generateId();
  return { success: true, messageId, provider: "sendgrid", sentAt: Date.now() };
}

function sendViaConsole(msg: MailMessage): MailResult {
  const id = generateId();
  const entry = { ...msg, sentAt: Date.now(), messageId: id };
  sentLog.push(entry);
  console.log(`[TMIMailEngine] TO: ${msg.to} | SUBJECT: ${msg.subject}`);
  return { success: true, messageId: id, provider: "console", sentAt: entry.sentAt };
}

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const withFrom: MailMessage = { from: DEFAULT_FROM, ...msg };
  try {
    if (PROVIDER === "resend") return await sendViaResend(withFrom);
    if (PROVIDER === "sendgrid") return await sendViaSendGrid(withFrom);
    return sendViaConsole(withFrom);
  } catch (e) {
    return {
      success: false,
      provider: PROVIDER,
      error: e instanceof Error ? e.message : String(e),
      sentAt: Date.now(),
    };
  }
}

export function getSentLog(limit = 100) {
  return sentLog.slice(-limit);
}

export function getSentCount(): number {
  return sentLog.length;
}
