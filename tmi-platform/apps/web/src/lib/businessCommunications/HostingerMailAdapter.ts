/**
 * Hostinger mailbox adapter — server-side IMAP poll + SMTP send only.
 *
 * Hostinger defaults (verify in hPanel if delivery fails):
 *   IMAP: imap.hostinger.com:993 (TLS)
 *   SMTP: smtp.hostinger.com:465 (SSL) or 587 (STARTTLS)
 *
 * Authenticate with the paid inbox (admin@); support@ is a send-as alias into that inbox.
 */

import type { BusinessMailboxIdentity } from "./types";

export type BusinessMailFromIdentity = "admin" | "support";

export type HostingerMailConfigStatus = {
  imapReady: boolean;
  smtpReady: boolean;
  imapDetail: string;
  smtpDetail: string;
};

export type PolledInboxMessage = {
  uid: number;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  receivedAt: number;
  mailboxIdentity: string;
};

export type SanitizedInboxMessage = {
  uid: number;
  from: string;
  subject: string;
  bodyPreview: string;
  receivedAt: number;
  mailboxIdentity: string;
};

export type HostingerPollResult =
  | { ok: true; messages: PolledInboxMessage[]; polledAt: number }
  | { ok: false; error: string; configured: boolean };

export type HostingerSendResult =
  | { ok: true; messageId: string; provider: "smtp" | "resend"; from: string }
  | { ok: false; error: string; configured: boolean };

function domainFromEnv(): string {
  return (
    process.env.BUSINESS_MAIL_DOMAIN ??
    process.env.EMAIL_FROM_ADDRESS?.split("@")[1] ??
    "themusiciansindex.com"
  );
}

export function getAdminMailboxAddress(): string {
  const override = process.env.BUSINESS_MAIL_ADMIN;
  if (override?.includes("@")) return override.trim().toLowerCase();
  return `admin@${domainFromEnv()}`;
}

export function getSupportMailboxAddress(): string {
  const override = process.env.BUSINESS_MAIL_SUPPORT ?? process.env.TEAM_EMAIL;
  if (override?.includes("@")) return override.trim().toLowerCase();
  return `support@${domainFromEnv()}`;
}

export function getBusinessMailboxIdentities(): BusinessMailboxIdentity[] {
  const admin = getAdminMailboxAddress();
  const support = getSupportMailboxAddress();
  return [
    {
      key: "admin",
      address: admin,
      visibility: "private",
    },
    {
      key: "support",
      address: support,
      visibility: "public_alias",
      deliversTo: admin,
    },
  ];
}

function imapCredentials(): { host: string; port: number; user: string; pass: string } | null {
  const host = process.env.BUSINESS_MAIL_IMAP_HOST;
  const user = process.env.BUSINESS_MAIL_IMAP_USER ?? getAdminMailboxAddress();
  const pass =
    process.env.BUSINESS_MAIL_IMAP_PASS ??
    process.env.EMAIL_SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = parseInt(process.env.BUSINESS_MAIL_IMAP_PORT ?? "993", 10);
  return { host, port, user: user.trim(), pass };
}

function smtpCredentials(): {
  host: string;
  port: number;
  user: string;
  pass: string;
} | null {
  const host = process.env.EMAIL_SMTP_HOST;
  const user = process.env.EMAIL_SMTP_USER ?? getAdminMailboxAddress();
  const pass = process.env.EMAIL_SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = parseInt(process.env.EMAIL_SMTP_PORT ?? "465", 10);
  return { host, port, user: user.trim(), pass };
}

export function getHostingerMailConfigStatus(): HostingerMailConfigStatus {
  const imap = imapCredentials();
  const smtp = smtpCredentials();
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  return {
    imapReady: Boolean(imap),
    smtpReady: Boolean(smtp) || hasResend,
    imapDetail: imap
      ? `IMAP ${imap.host}:${imap.port} as ${imap.user}`
      : "Set BUSINESS_MAIL_IMAP_HOST, BUSINESS_MAIL_IMAP_USER, BUSINESS_MAIL_IMAP_PASS (or EMAIL_SMTP_PASS).",
    smtpDetail: smtp
      ? `SMTP ${smtp.host}:${smtp.port} as ${smtp.user}`
      : hasResend
        ? "Resend API configured (Hostinger SMTP optional)."
        : "Set EMAIL_SMTP_* for Hostinger SMTP or RESEND_API_KEY.",
  };
}

function fromAddressForIdentity(identity: BusinessMailFromIdentity): string {
  return identity === "support" ? getSupportMailboxAddress() : getAdminMailboxAddress();
}

export function sanitizeInboxMessages(messages: PolledInboxMessage[]): SanitizedInboxMessage[] {
  return messages.map((m) => ({
    uid: m.uid,
    from: m.from,
    subject: m.subject,
    bodyPreview: m.body.trim().slice(0, 240),
    receivedAt: m.receivedAt,
    mailboxIdentity: m.mailboxIdentity,
  }));
}

/** Poll INBOX via Hostinger IMAP — returns honest error when credentials missing. */
export async function pollHostingerInbox(options?: {
  limit?: number;
}): Promise<HostingerPollResult> {
  const creds = imapCredentials();
  if (!creds) {
    return {
      ok: false,
      configured: false,
      error: "IMAP not configured — set BUSINESS_MAIL_IMAP_* and mailbox password in server env only.",
    };
  }

  const limit = Math.min(Math.max(options?.limit ?? 15, 1), 50);
  const mailboxIdentity = getAdminMailboxAddress();

  try {
    const { ImapFlow } = await import("imapflow");
    const client = new ImapFlow({
      host: creds.host,
      port: creds.port,
      secure: creds.port === 993,
      auth: { user: creds.user, pass: creds.pass },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    const messages: PolledInboxMessage[] = [];

    try {
      const total = client.mailbox && "exists" in client.mailbox ? client.mailbox.exists : 0;
      if (total === 0) {
        return { ok: true, messages: [], polledAt: Date.now() };
      }

      const startSeq = Math.max(1, total - limit + 1);
      for await (const msg of client.fetch(`${startSeq}:*`, {
        uid: true,
        envelope: true,
        source: true,
        internalDate: true,
      })) {
        const env = msg.envelope;
        const fromAddr = env?.from?.[0]?.address;
        const from = fromAddr ? String(fromAddr).trim().toLowerCase() : "unknown";
        const subject = env?.subject ?? "(no subject)";
        const to =
          env?.to?.map((t) => (t.address ? String(t.address).toLowerCase() : "")).filter(Boolean) ??
          [];

        let body = "";
        if (msg.source) {
          const raw = msg.source.toString("utf8");
          const parts = raw.split(/\r?\n\r?\n/);
          body = (parts.slice(1).join("\n\n") || raw).slice(0, 8000);
        }

        const receivedAtRaw = msg.internalDate;
        const receivedAt =
          receivedAtRaw instanceof Date
            ? receivedAtRaw.getTime()
            : typeof receivedAtRaw === "string"
              ? Date.parse(receivedAtRaw) || Date.now()
              : Date.now();

        messages.push({
          uid: msg.uid ?? 0,
          messageId: env?.messageId ?? `uid-${msg.uid ?? 0}`,
          from: from || "unknown",
          to,
          subject,
          body,
          receivedAt,
          mailboxIdentity,
        });
      }
    } finally {
      lock.release();
    }

    await client.logout();
    messages.sort((a, b) => b.receivedAt - a.receivedAt);
    return { ok: true, messages: messages.slice(0, limit), polledAt: Date.now() };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      error: String(err),
    };
  }
}

async function sendViaSmtp(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
  replyTo?: string;
}): Promise<HostingerSendResult> {
  const creds = smtpCredentials();
  if (!creds) {
    return {
      ok: false,
      configured: false,
      error: "SMTP not configured — set EMAIL_SMTP_HOST, EMAIL_SMTP_USER, EMAIL_SMTP_PASS.",
    };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: creds.host,
      port: creds.port,
      secure: creds.port === 465,
      auth: { user: creds.user, pass: creds.pass },
    });

    const fromName = process.env.EMAIL_FROM_NAME ?? "The Musician's Index";
    const info = await transporter.sendMail({
      from: `${fromName} <${input.from}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? input.html.replace(/<[^>]+>/g, " ").slice(0, 4000),
      replyTo: input.replyTo,
    });

    return {
      ok: true,
      messageId: String(info.messageId ?? `smtp-${Date.now()}`),
      provider: "smtp",
      from: input.from,
    };
  } catch (err) {
    return { ok: false, configured: true, error: String(err) };
  }
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
  replyTo?: string;
}): Promise<HostingerSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, configured: false, error: "RESEND_API_KEY not set." };
  }

  const fromName = process.env.EMAIL_FROM_NAME ?? "The Musician's Index";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${input.from}>`,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        error: data.message ?? `Resend HTTP ${response.status}`,
      };
    }
    return {
      ok: true,
      messageId: data.id ?? `resend-${Date.now()}`,
      provider: "resend",
      from: input.from,
    };
  } catch (err) {
    return { ok: false, configured: true, error: String(err) };
  }
}

/** Outbound business mail — prefers Hostinger SMTP; Resend fallback when SMTP unset. */
export async function sendHostingerMail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromIdentity?: BusinessMailFromIdentity;
  replyTo?: string;
}): Promise<HostingerSendResult> {
  const from = fromAddressForIdentity(input.fromIdentity ?? "support");
  const smtp = smtpCredentials();
  if (smtp) {
    return sendViaSmtp({ ...input, from });
  }
  return sendViaResend({ ...input, from });
}
