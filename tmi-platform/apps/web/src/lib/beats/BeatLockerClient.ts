/**
 * BeatLockerClient — thin client for performer/admin Beat Locker paths.
 * Keeps Submission Vault / Marketplace / Competition Vault separated (Rule 19).
 */

export const BEAT_GENRES = [
  "Trap",
  "Hip-Hop",
  "R&B",
  "EDM",
  "Dance",
  "Afrobeat",
  "Latin",
  "Rock",
  "Pop",
  "House",
  "Drill",
  "Reggaeton",
  "Other",
] as const;

export type BeatLockerGenre = (typeof BEAT_GENRES)[number];

/** Competition destinations that already have assign/route support. */
export type BeatCompetitionTarget =
  | "battle"
  | "gauntlet"
  | "cypher"
  | "challenge"
  | "tournament"
  | "game-show"
  | "monthly-idol";

export type BeatLockerRecord = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key?: string | null;
  tags?: string[];
  producerId?: string;
  producerName?: string | null;
  status?: string;
  moderationStatus?: string;
  adminSubmitted?: boolean;
  basicPrice?: number;
  premiumPrice?: number;
  exclusivePrice?: number | null;
  previewUrl?: string;
  createdAt?: string;
};

export type BeatSubmitPayload = {
  title: string;
  genre: string;
  bpm: number;
  key?: string;
  tags?: string;
  producerName?: string;
  previewUrl?: string;
  basicPrice?: number;
  premiumPrice?: number;
  exclusivePrice?: number | null;
  /** platform-only catalog vs personal producer stash */
  stashScope?: "platform" | "personal";
};

export async function listBeats(params?: {
  mine?: boolean;
  status?: string;
}): Promise<{ ok: boolean; beats: BeatLockerRecord[]; total: number; error?: string }> {
  const qs = new URLSearchParams();
  if (params?.mine) qs.set("mine", "1");
  if (params?.status) qs.set("status", params.status);
  const url = `/api/beats/list${qs.toString() ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { credentials: "include" });
    const data = (await res.json()) as {
      ok?: boolean;
      beats?: BeatLockerRecord[];
      total?: number;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, beats: [], total: 0, error: data.error ?? "Failed to load beats" };
    }
    return {
      ok: true,
      beats: Array.isArray(data.beats) ? data.beats : [],
      total: typeof data.total === "number" ? data.total : (data.beats?.length ?? 0),
    };
  } catch {
    return { ok: false, beats: [], total: 0, error: "Unable to reach Beat Locker" };
  }
}

export async function submitBeat(
  payload: BeatSubmitPayload,
  opts?: { admin?: boolean; file?: File | null },
): Promise<{ ok: boolean; beat?: BeatLockerRecord; error?: string }> {
  const endpoint = opts?.admin ? "/api/beats/admin-submit" : "/api/beats/submit";

  try {
    if (opts?.file && !opts.admin) {
      const fd = new FormData();
      fd.set("title", payload.title);
      fd.set("genre", payload.genre);
      fd.set("bpm", String(payload.bpm));
      if (payload.key) fd.set("key", payload.key);
      if (payload.tags) fd.set("tags", payload.tags);
      if (payload.producerName) fd.set("producerName", payload.producerName);
      if (payload.previewUrl) fd.set("previewUrl", payload.previewUrl);
      if (payload.basicPrice != null) fd.set("basicPrice", String(payload.basicPrice));
      if (payload.premiumPrice != null) fd.set("premiumPrice", String(payload.premiumPrice));
      if (payload.exclusivePrice != null) fd.set("exclusivePrice", String(payload.exclusivePrice));
      if (payload.stashScope) fd.set("stashScope", payload.stashScope);
      fd.set("file", opts.file);
      const res = await fetch(endpoint, { method: "POST", body: fd, credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; beat?: BeatLockerRecord; error?: string };
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error ?? "Submit failed" };
      }
      return { ok: true, beat: data.beat };
    }

    const body: Record<string, unknown> = {
      title: payload.title,
      genre: payload.genre,
      bpm: payload.bpm,
      key: payload.key,
      tags: opts?.admin
        ? (payload.tags ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : payload.tags,
      producerName: payload.producerName,
      previewUrl: payload.previewUrl,
      basicPrice: payload.basicPrice,
      premiumPrice: payload.premiumPrice,
      exclusivePrice: payload.exclusivePrice,
      stashScope: payload.stashScope,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok?: boolean; beat?: BeatLockerRecord; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Submit failed" };
    }
    return { ok: true, beat: data.beat };
  } catch {
    return { ok: false, error: "Unable to submit beat" };
  }
}

/** Route a Beat Locker entry toward a competition vault target (not marketplace). */
export async function assignBeatToCompetition(
  beatId: string,
  targetType: BeatCompetitionTarget,
  targetId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/beats/${encodeURIComponent(beatId)}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType, targetId }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Assign failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to assign beat" };
  }
}

export function creatorCreditLabel(beat: {
  producerName?: string | null;
  producerId?: string;
  title?: string;
}): string {
  const name = beat.producerName?.trim() || beat.producerId?.trim();
  if (!name) return "Creator credit unavailable";
  return `Beat by ${name}`;
}
