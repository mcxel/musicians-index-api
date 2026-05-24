// lib/finance/PayoutNotificationEngine.ts — Payout lifecycle notification dispatcher

export type PayoutNotificationEvent =
  | "payment_received"
  | "revenue_split_completed"
  | "payout_scheduled"
  | "payout_tomorrow"
  | "payout_in_2h"
  | "payout_sent"
  | "payout_failed"
  | "refund_hold_applied"
  | "admin_payout_scheduled"
  | "admin_payout_sent";

export type NotificationPayload = {
  event: PayoutNotificationEvent;
  recipientId: string;
  recipientEmail?: string;
  amountCents: number;
  payoutDate?: number;
  payoutId?: string;
  reason?: string;
  metadata?: Record<string, string>;
};

export type NotificationRecord = NotificationPayload & {
  id: string;
  sentAt: number;
  channel: "email" | "dashboard" | "push";
};

const log: NotificationRecord[] = [];
let counter = 1;

const COPY: Record<PayoutNotificationEvent, { subject: string; body: string }> = {
  payment_received: {
    subject: "Payment received on TMI",
    body: "A payment has been confirmed. Your earnings have been logged and your payout is being scheduled.",
  },
  revenue_split_completed: {
    subject: "Your revenue split is ready",
    body: "The revenue from your recent sales has been split. Your creator share is queued for payout.",
  },
  payout_scheduled: {
    subject: "Your payout is scheduled",
    body: "Your next payout is scheduled for {date}. Estimated amount: {amount}.",
  },
  payout_tomorrow: {
    subject: "Your payout is tomorrow",
    body: "Your payout of {amount} arrives tomorrow. Make sure your Stripe Connect account is active.",
  },
  payout_in_2h: {
    subject: "Your payout is in 2 hours",
    body: "Your payout of {amount} is processing now and will arrive in approximately 2 hours.",
  },
  payout_sent: {
    subject: "Your payout was sent",
    body: "Your payout of {amount} has been sent to your connected account. Funds typically arrive within 1–2 business days.",
  },
  payout_failed: {
    subject: "Payout failed — action needed",
    body: "Your payout of {amount} failed. Reason: {reason}. Please check your Stripe Connect account and try again.",
  },
  refund_hold_applied: {
    subject: "Refund hold applied to your earnings",
    body: "A hold has been applied to {amount} of your earnings due to a refund or chargeback. Funds will be released after review.",
  },
  admin_payout_scheduled: {
    subject: "Admin payout scheduled for Friday",
    body: "Your admin share of {amount} is scheduled for Friday's payout cycle.",
  },
  admin_payout_sent: {
    subject: "Your admin payout was sent",
    body: "Your admin payout of {amount} has been sent. Check your connected account for the transfer.",
  },
};

export function dispatchNotification(
  payload: NotificationPayload,
  channels: Array<"email" | "dashboard" | "push"> = ["email", "dashboard"]
): NotificationRecord[] {
  const records: NotificationRecord[] = [];
  for (const channel of channels) {
    const record: NotificationRecord = {
      ...payload,
      id: `NOTIF-${Date.now()}-${String(counter++).padStart(6, "0")}`,
      sentAt: Date.now(),
      channel,
    };
    log.push(record);
    records.push(record);
    // In production: call MailTriggerEngine.fire(payload.event, payload)
    // or push to notification service
  }
  return records;
}

export function getNotificationCopy(event: PayoutNotificationEvent): { subject: string; body: string } {
  return COPY[event];
}

export function formatNotificationBody(
  event: PayoutNotificationEvent,
  amountCents: number,
  payoutDate?: number,
  reason?: string
): string {
  const copy = COPY[event];
  return copy.body
    .replace("{amount}", `$${(amountCents / 100).toFixed(2)}`)
    .replace("{date}", payoutDate ? new Date(payoutDate).toLocaleDateString() : "soon")
    .replace("{reason}", reason ?? "unknown");
}

export function getNotificationLog(recipientId?: string, limit = 100): NotificationRecord[] {
  const filtered = recipientId ? log.filter(n => n.recipientId === recipientId) : log;
  return [...filtered].sort((a, b) => b.sentAt - a.sentAt).slice(0, limit);
}
