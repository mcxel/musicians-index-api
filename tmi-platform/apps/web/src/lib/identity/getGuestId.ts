/**
 * Stable per-browser anonymous identity — not fabricated data, just an
 * opaque token so an unauthenticated visitor resolves to the same id across
 * every component on a page (and across visits), instead of every anonymous
 * visitor colliding into one shared literal string like "guest-user". That
 * literal-default bug was found via the Phase 3C browser certification pass
 * (2026-06-20): UniversalVenueRenderer and TmiAudiencePerspectiveShell used
 * two different hardcoded guest fallbacks ("guest-user" vs "fan-guest") on
 * the same room page, producing two audience entries for one real visitor.
 */
export function getGuestId(): string {
  try {
    const KEY = "tmi_guest_id";
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = `guest-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "guest-anon";
  }
}
