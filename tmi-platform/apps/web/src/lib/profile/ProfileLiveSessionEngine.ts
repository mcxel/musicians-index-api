export type ProfileLiveSession = {
  slug: string;
  roomId: string;
  venueId?: string;
  seatId?: string;
  startedAt: number;
  status: "active" | "paused" | "ended";
};

const sessions = new Map<string, ProfileLiveSession>();

function key(slug: string): string {
  return slug.trim().toLowerCase();
}

export function startProfileLiveSession(input: {
  slug: string;
  roomId: string;
  venueId?: string;
  seatId?: string;
}): ProfileLiveSession {
  const session: ProfileLiveSession = {
    slug: key(input.slug),
    roomId: input.roomId,
    venueId: input.venueId,
    seatId: input.seatId,
    startedAt: Date.now(),
    status: "active",
  };
  sessions.set(session.slug, session);
  return session;
}

export function getProfileLiveSession(slug: string): ProfileLiveSession | null {
  return sessions.get(key(slug)) ?? null;
}

export function updateProfileLiveSessionStatus(slug: string, status: ProfileLiveSession["status"]): ProfileLiveSession | null {
  const k = key(slug);
  const existing = sessions.get(k);
  if (!existing) return null;
  const next = { ...existing, status };
  sessions.set(k, next);
  return next;
}
