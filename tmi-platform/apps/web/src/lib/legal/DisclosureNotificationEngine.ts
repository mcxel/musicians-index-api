/**
 * DisclosureNotificationEngine — records notification intents for case lifecycle.
 * Does not send email yet; appends honest notification ledger entries.
 */

export type DisclosureNotification = {
  notificationId: string;
  caseId: string;
  channel: "IN_APP" | "EMAIL_QUEUE" | "AUDIT_ONLY";
  template: string;
  recipientHint: string;
  createdAt: string;
  body: string;
};

type NotifStore = { items: DisclosureNotification[] };

function store(): NotifStore {
  const g = globalThis as typeof globalThis & { __tmiLegalNotifStore?: NotifStore };
  if (!g.__tmiLegalNotifStore) g.__tmiLegalNotifStore = { items: [] };
  return g.__tmiLegalNotifStore;
}

export function enqueueDisclosureNotification(input: {
  caseId: string;
  channel: DisclosureNotification["channel"];
  template: string;
  recipientHint: string;
  body: string;
}): DisclosureNotification {
  const item: DisclosureNotification = {
    notificationId: `LN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    caseId: input.caseId,
    channel: input.channel,
    template: input.template,
    recipientHint: input.recipientHint,
    createdAt: new Date().toISOString(),
    body: input.body,
  };
  store().items.push(item);
  return { ...item };
}

export function listNotificationsForCase(caseId: string): DisclosureNotification[] {
  return store()
    .items.filter((n) => n.caseId === caseId)
    .map((n) => ({ ...n }));
}

export function __resetDisclosureNotifications(): void {
  store().items.length = 0;
}
