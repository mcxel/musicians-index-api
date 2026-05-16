export type ProfileAuditEventType =
  | "profile_edit"
  | "tier_change"
  | "media_change"
  | "live_session"
  | "article_publish";

export type ProfileAuditEvent = {
  eventId: string;
  slug: string;
  type: ProfileAuditEventType;
  actor: string;
  summary: string;
  at: number;
  metadata?: Record<string, string | number | boolean>;
};

const eventsBySlug = new Map<string, ProfileAuditEvent[]>();

function key(slug: string): string {
  return slug.trim().toLowerCase();
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function appendProfileAuditEvent(input: Omit<ProfileAuditEvent, "eventId" | "at">): ProfileAuditEvent {
  const slug = key(input.slug);
  const event: ProfileAuditEvent = {
    ...input,
    slug,
    eventId: id("pae"),
    at: Date.now(),
  };
  const list = eventsBySlug.get(slug) ?? [];
  list.unshift(event);
  eventsBySlug.set(slug, list.slice(0, 200));
  return event;
}

export function listProfileAuditEvents(slug: string): ProfileAuditEvent[] {
  return [...(eventsBySlug.get(key(slug)) ?? [])];
}
