// lib/mail/PayoutMailer.ts — Payout lifecycle email wrappers

import { trigger } from "./MailTriggerEngine";

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function mailPayoutScheduled(params: {
  userId: string;
  email: string;
  userName: string;
  amountCents: number;
  payoutId: string;
  payoutDate: Date;
}): Promise<void> {
  await trigger("PAYOUT_SCHEDULED", {
    userId: params.userId,
    email: params.email,
    vars: {
      userName: params.userName,
      amount: formatDollars(params.amountCents),
      payoutId: params.payoutId,
      date: params.payoutDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      ctaUrl: "https://themusiciansindex.com/hub/performer",
    },
    dedupKey: `payout_scheduled_${params.payoutId}`,
  });
}

export async function mailPayoutSent(params: {
  userId: string;
  email: string;
  userName: string;
  amountCents: number;
  payoutId: string;
}): Promise<void> {
  await trigger("PAYOUT_SENT", {
    userId: params.userId,
    email: params.email,
    vars: {
      userName: params.userName,
      amount: formatDollars(params.amountCents),
      payoutId: params.payoutId,
      ctaUrl: "https://themusiciansindex.com/hub/performer",
    },
    dedupKey: `payout_sent_${params.payoutId}`,
  });
}

export async function mailPayoutFailed(params: {
  userId: string;
  email: string;
  userName: string;
  amountCents: number;
  payoutId: string;
  reason: string;
}): Promise<void> {
  const { sendMail } = await import("./TMIMailEngine");

  await sendMail({
    to: params.email,
    subject: `Payout failed — ${formatDollars(params.amountCents)} needs attention`,
    html: `<!DOCTYPE html><html><body style="background:#0a0a0f;font-family:Arial,sans-serif;padding:32px;">
      <div style="max-width:500px;margin:0 auto;background:#12121a;border-radius:12px;padding:32px;border:1px solid #ff4444;">
        <h2 style="color:#ff4444;margin:0 0 16px;">Payout Failed</h2>
        <p style="color:#e0e0e0;">Hi ${params.userName} — your payout of <strong style="color:#ffd700;">${formatDollars(params.amountCents)}</strong> could not be processed.</p>
        <p style="color:#e0e0e0;"><strong>Reason:</strong> ${params.reason}</p>
        <p style="color:#e0e0e0;">Please verify your Stripe Connect account and payout settings.</p>
        <p style="text-align:center;margin-top:24px;">
          <a href="https://themusiciansindex.com/settings/billing" style="background:#ff4444;color:#fff;padding:12px 28px;border-radius:6px;font-weight:900;text-decoration:none;">FIX PAYOUT SETTINGS</a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:16px;">Payout ID: ${params.payoutId}</p>
      </div>
    </body></html>`,
    text: `Payout of ${formatDollars(params.amountCents)} failed. Reason: ${params.reason}. Fix at: https://themusiciansindex.com/settings/billing`,
  });
}

export async function mailTipReceived(params: {
  userId: string;
  email: string;
  userName: string;
  amountCents: number;
  tipperName?: string;
}): Promise<void> {
  await trigger("TIP_RECEIVED", {
    userId: params.userId,
    email: params.email,
    vars: {
      userName: params.userName,
      amount: formatDollars(params.amountCents),
      ctaUrl: "https://themusiciansindex.com/hub/performer",
    },
    dedupKey: `tip_${params.userId}_${Math.floor(Date.now() / (30 * 60 * 1000))}`,
  });
}
