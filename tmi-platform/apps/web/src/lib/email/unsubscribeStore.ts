/**
 * unsubscribeStore.ts
 * Manages email opt-out preferences.
 * In production: replace Map with prisma.unsubscribe.upsert()
 */

export type EmailCategory = 'marketing' | 'newsletter' | 'transactional' | 'all';

interface UnsubRecord {
  email: string;
  categories: Set<EmailCategory>;
  unsubscribedAt: number;
}

const store = new Map<string, UnsubRecord>();

export function unsubscribe(email: string, category: EmailCategory = 'all'): void {
  const normalized = email.toLowerCase().trim();
  const existing = store.get(normalized);
  if (existing) {
    if (category === 'all') {
      existing.categories.add('marketing');
      existing.categories.add('newsletter');
      existing.categories.add('transactional');
      existing.categories.add('all');
    } else {
      existing.categories.add(category);
    }
  } else {
    const categories = new Set<EmailCategory>(
      category === 'all' ? ['marketing', 'newsletter', 'transactional', 'all'] : [category]
    );
    store.set(normalized, { email: normalized, categories, unsubscribedAt: Date.now() });
  }
}

export function resubscribe(email: string, category: EmailCategory = 'all'): void {
  const normalized = email.toLowerCase().trim();
  const existing = store.get(normalized);
  if (!existing) return;
  if (category === 'all') {
    store.delete(normalized);
  } else {
    existing.categories.delete(category);
    if (existing.categories.size === 0) store.delete(normalized);
  }
}

export function isUnsubscribed(email: string, category: EmailCategory = 'marketing'): boolean {
  const normalized = email.toLowerCase().trim();
  const rec = store.get(normalized);
  if (!rec) return false;
  return rec.categories.has('all') || rec.categories.has(category);
}

export function getUnsubscribeRecord(email: string): UnsubRecord | undefined {
  return store.get(email.toLowerCase().trim());
}

export function generateUnsubToken(email: string): string {
  const buf = Buffer.from(`${email}:${process.env.TICKET_SECRET_SALT ?? 'tmi-salt'}:unsub`);
  return buf.toString('base64url').slice(0, 32);
}

export function verifyUnsubToken(token: string, email: string): boolean {
  return generateUnsubToken(email) === token;
}
