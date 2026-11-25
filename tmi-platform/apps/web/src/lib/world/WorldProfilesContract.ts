/**
 * WorldProfilesContract — graphics quality tiers, certified LOD/fallback ladder, Mini-Me style and
 * personality, body-archetype animation compatibility, holiday/anniversary calendar
 * (owner final sprint 2026-11-19). Budgets are TARGETS, not certified numbers — Copilot measures them
 * on real devices. Rig contract is the existing AvatarRig/1.0 (TmiAvatarRuntimeContract).
 */

// ─── Graphics quality tiers ─────────────────────────────────────────────────

export type QualityTier = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";
export type QualityProfile = {
  tier: QualityTier;
  targetFps: number;
  maxFullAvatars: number; // LOD0/LOD1 bodies drawn at once
  maxVideoPanelsHd: number; // panels receiving a high-res layer; others get low-res / thumbnails
  avatarLod0MaxTris: number;
  shadows: "NONE" | "BLOB" | "SOFT";
  maxParticles: number;
  postFx: boolean;
};
export const QUALITY_PROFILES: Readonly<Record<QualityTier, QualityProfile>> = {
  LOW: { tier: "LOW", targetFps: 30, maxFullAvatars: 12, maxVideoPanelsHd: 2, avatarLod0MaxTris: 8_000, shadows: "NONE", maxParticles: 150, postFx: false },
  MEDIUM: { tier: "MEDIUM", targetFps: 30, maxFullAvatars: 30, maxVideoPanelsHd: 4, avatarLod0MaxTris: 15_000, shadows: "BLOB", maxParticles: 500, postFx: false },
  HIGH: { tier: "HIGH", targetFps: 60, maxFullAvatars: 60, maxVideoPanelsHd: 6, avatarLod0MaxTris: 30_000, shadows: "SOFT", maxParticles: 1_500, postFx: true },
  ULTRA: { tier: "ULTRA", targetFps: 60, maxFullAvatars: 120, maxVideoPanelsHd: 9, avatarLod0MaxTris: 30_000, shadows: "SOFT", maxParticles: 3_000, postFx: true },
};

export type DeviceSignals = { isMobile: boolean; isVr: boolean; deviceMemoryGb: number | null; gpuTier: 0 | 1 | 2 | 3 | null; saveData: boolean; userOverride?: QualityTier };
/** User choice wins (never above what they picked); otherwise a conservative auto pick. */
export function pickQualityTier(d: DeviceSignals): QualityTier {
  if (d.userOverride) return d.userOverride;
  if (d.saveData) return "LOW";
  if (d.isVr) return "MEDIUM"; // VR needs frame rate over detail
  if (d.isMobile) return (d.gpuTier ?? 0) >= 2 && (d.deviceMemoryGb ?? 0) >= 6 ? "MEDIUM" : "LOW";
  if ((d.gpuTier ?? 1) >= 3) return "HIGH";
  return (d.gpuTier ?? 1) >= 2 ? "MEDIUM" : "LOW";
}
/** Sustained frame-time misses step DOWN one tier; never up automatically (no oscillation). */
export function adaptTier(current: QualityTier, measuredFps: number, sustainedMs: number): QualityTier {
  const order: QualityTier[] = ["LOW", "MEDIUM", "HIGH", "ULTRA"];
  const i = order.indexOf(current);
  if (sustainedMs >= 5_000 && measuredFps < QUALITY_PROFILES[current].targetFps * 0.8 && i > 0) return order[i - 1]!;
  return current;
}

// ─── LOD / fallback ladder (never fake attendees) ─────────────────────────────

export type AvatarLodLevel = "LOD0" | "LOD1" | "LOD2" | "IMPOSTOR" | "NAMEPLATE";
/**
 * Assign a detail level to every REAL present person. The output has exactly one entry per input
 * person — fallback lowers detail, it never adds or removes attendees. Closest people get detail first.
 */
export function assignAvatarLods(people: ReadonlyArray<{ id: string; distanceM: number; certifiedLods: readonly AvatarLodLevel[] }>, profile: QualityProfile): Map<string, AvatarLodLevel> {
  const sorted = [...people].sort((a, b) => a.distanceM - b.distanceM || (a.id < b.id ? -1 : 1));
  const out = new Map<string, AvatarLodLevel>();
  sorted.forEach((p, rank) => {
    let want: AvatarLodLevel = rank >= profile.maxFullAvatars ? "IMPOSTOR" : p.distanceM < 6 ? "LOD0" : p.distanceM < 15 ? "LOD1" : p.distanceM < 30 ? "LOD2" : "IMPOSTOR";
    const ladder: AvatarLodLevel[] = ["LOD0", "LOD1", "LOD2", "IMPOSTOR", "NAMEPLATE"];
    // Missing certified level → next lower certified one; NAMEPLATE (name only) always exists.
    for (let i = ladder.indexOf(want); i < ladder.length; i++) {
      const l = ladder[i]!;
      if (l === "NAMEPLATE" || p.certifiedLods.includes(l)) { want = l; break; }
    }
    out.set(p.id, want);
  });
  return out;
}

// ─── Mini-Me style + personality ─────────────────────────────────────────────

export type MiniMeStyle = {
  /** 0 = true proportions (1.0×) … 1 = max bobblehead (2.5×). Default 1.85× (DEFAULT_HEAD_EXAGGERATION). */
  headExaggeration: number;
  /** Social Reaction Profile — user preferences, used by SeatPassageAuthority + VariationDirector. */
  personality: { energy: number; humor: number; expressiveness: number; politeness: number };
  idleStyle: "CALM" | "BOUNCY" | "COOL" | "ANIMATED";
  danceStyle: "SMOOTH" | "HYPE" | "CLASSIC" | "MINIMAL";
};
/** Owner decision 2026-11-19: head enlargement 1.0–2.5×, default 1.85× (applied to the person's own head). */
export const MIN_HEAD_SCALE = 1.0;
export const MAX_HEAD_SCALE = 2.5;
export const DEFAULT_HEAD_SCALE = 1.85;
export const DEFAULT_HEAD_EXAGGERATION = (DEFAULT_HEAD_SCALE - MIN_HEAD_SCALE) / (MAX_HEAD_SCALE - MIN_HEAD_SCALE);
export const headScaleFor = (style: MiniMeStyle) => MIN_HEAD_SCALE + Math.min(1, Math.max(0, style.headExaggeration)) * (MAX_HEAD_SCALE - MIN_HEAD_SCALE);

/**
 * Style edits may change presentation sliders only. Identity data (face-scan coefficients / likeness)
 * is a separate record that style can NEVER touch — any style payload carrying identity keys is refused.
 */
const IDENTITY_KEYS = ["faceCoefficients", "identityId", "likeness", "faceMesh", "blendshapeIdentity"];
export function validateMiniMeStyle(payload: Record<string, unknown>): { ok: true; style: MiniMeStyle } | { ok: false; reason: string } {
  if (IDENTITY_KEYS.some((k) => k in payload)) return { ok: false, reason: "STYLE_CANNOT_ALTER_IDENTITY" };
  const p = payload as Partial<MiniMeStyle>;
  const unit = (n: unknown) => typeof n === "number" && n >= 0 && n <= 1;
  if (!unit(p.headExaggeration)) return { ok: false, reason: "INVALID_HEAD_EXAGGERATION" };
  const per = p.personality;
  if (!per || ![per.energy, per.humor, per.expressiveness, per.politeness].every(unit)) return { ok: false, reason: "INVALID_PERSONALITY" };
  if (!["CALM", "BOUNCY", "COOL", "ANIMATED"].includes(p.idleStyle as string)) return { ok: false, reason: "INVALID_IDLE_STYLE" };
  if (!["SMOOTH", "HYPE", "CLASSIC", "MINIMAL"].includes(p.danceStyle as string)) return { ok: false, reason: "INVALID_DANCE_STYLE" };
  return { ok: true, style: p as MiniMeStyle };
}

// ─── Body archetypes + animation compatibility ────────────────────────────────

/** Rule 18: shared TMI Base Body — 5 male + 5 female builds, one humanoid rig. */
export const BODY_ARCHETYPES = ["M1_SLIM", "M2_AVERAGE", "M3_ATHLETIC", "M4_BROAD", "M5_HEAVY", "F1_SLIM", "F2_AVERAGE", "F3_ATHLETIC", "F4_CURVY", "F5_HEAVY"] as const;
export type BodyArchetype = (typeof BODY_ARCHETYPES)[number];

/** Bones every AvatarRig/1.0 body must carry for shared clips to retarget without per-body re-authoring. */
export const AVATAR_RIG_1_0_REQUIRED_BONES = ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand", "RightShoulder", "RightArm", "RightForeArm", "RightHand", "LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot"] as const;

/** A clip is compatible with an archetype body when the rig matches and every bone it animates exists. */
export function clipCompatible(clip: { rig: string; animatedBones: readonly string[] }, body: { rig: string; bones: ReadonlySet<string> }): { ok: boolean; missing: string[] } {
  if (clip.rig !== body.rig) return { ok: false, missing: [`rig:${clip.rig}≠${body.rig}`] };
  const missing = clip.animatedBones.filter((b) => !body.bones.has(b));
  return { ok: missing.length === 0, missing };
}

/** Animation fallback when a body lacks a certified clip: the nearest-safe certified clip, else idle — never a T-pose. */
export const CLIP_FALLBACK: Readonly<Record<string, string>> = {
  Run: "Walk", Sprint: "Run", Jump: "Idle", Dance_Hype: "Dance_Basic", Dance_Basic: "Idle",
  SitDown: "Idle", SeatedIdle: "Idle", StandUp: "Idle", MakeRoom_LegsAside: "SeatedIdle", MakeRoom_LeanBack: "SeatedIdle", Wave: "Idle",
};
export function resolveClip(wanted: string, certified: ReadonlySet<string>): string {
  const seen = new Set<string>();
  for (let c: string | undefined = wanted; c && !seen.has(c); c = CLIP_FALLBACK[c]) {
    seen.add(c);
    if (certified.has(c)) return c;
  }
  return "Idle";
}

// ─── Holiday / anniversary calendar ──────────────────────────────────────────

export type CalendarRule =
  | { kind: "FIXED"; month: number; day: number }
  | { kind: "NTH_WEEKDAY"; month: number; weekday: number; nth: number } // nth: 1..5, -1 = last
  | { kind: "USER_ANNIVERSARY" };
export type CalendarEvent = {
  eventId: string; label: string; rule: CalendarRule; windowDays: number;
  /** Seasonal tags matched against CosmeticVariantPolicy availability tags. */
  tags: readonly string[];
  /** Regions where it applies; empty = global. Never assume one country's calendar is universal (Rule 34). */
  regions: readonly string[];
};
/** Ids match CosmeticVariantPolicy.holidayOrEventId vocabulary. TMI's own platform anniversary is
 *  omitted until the owner confirms the launch date (never guessed). */
export const CALENDAR: readonly CalendarEvent[] = [
  { eventId: "new_years", label: "New Year", rule: { kind: "FIXED", month: 1, day: 1 }, windowDays: 3, tags: ["seasonal:new_years"], regions: [] },
  { eventId: "valentines", label: "Valentine's Day", rule: { kind: "FIXED", month: 2, day: 14 }, windowDays: 3, tags: ["seasonal:valentines"], regions: [] },
  { eventId: "pride", label: "Pride Month", rule: { kind: "FIXED", month: 6, day: 1 }, windowDays: 30, tags: ["seasonal:pride"], regions: [] },
  { eventId: "juneteenth", label: "Juneteenth", rule: { kind: "FIXED", month: 6, day: 19 }, windowDays: 2, tags: ["seasonal:juneteenth"], regions: ["US"] },
  { eventId: "halloween", label: "Halloween", rule: { kind: "FIXED", month: 10, day: 31 }, windowDays: 7, tags: ["seasonal:halloween"], regions: [] },
  { eventId: "thanksgiving_us", label: "Thanksgiving (US)", rule: { kind: "NTH_WEEKDAY", month: 11, weekday: 4, nth: 4 }, windowDays: 2, tags: ["seasonal:thanksgiving"], regions: ["US"] },
  { eventId: "christmas", label: "Winter Holidays", rule: { kind: "FIXED", month: 12, day: 25 }, windowDays: 10, tags: ["seasonal:christmas"], regions: [] },
  { eventId: "member_anniversary", label: "Your TMI Anniversary", rule: { kind: "USER_ANNIVERSARY" }, windowDays: 1, tags: ["personal:anniversary"], regions: [] },
];

function occurrence(rule: CalendarRule, year: number, joinedAt: Date | null): Date | null {
  if (rule.kind === "FIXED") return new Date(Date.UTC(year, rule.month - 1, rule.day));
  if (rule.kind === "USER_ANNIVERSARY") return joinedAt ? new Date(Date.UTC(year, joinedAt.getUTCMonth(), joinedAt.getUTCDate())) : null;
  if (rule.nth === -1) {
    const last = new Date(Date.UTC(year, rule.month, 0));
    return new Date(Date.UTC(year, rule.month - 1, last.getUTCDate() - ((last.getUTCDay() - rule.weekday + 7) % 7)));
  }
  const first = new Date(Date.UTC(year, rule.month - 1, 1));
  return new Date(Date.UTC(year, rule.month - 1, 1 + ((rule.weekday - first.getUTCDay() + 7) % 7) + (rule.nth - 1) * 7));
}

/** Active calendar events for a date (UTC), viewer region and (optional) join date. */
export function activeCalendarEvents(at: Date, region: string | null, joinedAt: Date | null = null): CalendarEvent[] {
  const day = 86_400_000;
  return CALENDAR.filter((e) => {
    if (e.regions.length && (!region || !e.regions.includes(region))) return false;
    for (const y of [at.getUTCFullYear() - 1, at.getUTCFullYear()]) {
      const o = occurrence(e.rule, y, joinedAt);
      if (!o) continue;
      if (e.rule.kind === "USER_ANNIVERSARY" && joinedAt && o.getUTCFullYear() <= joinedAt.getUTCFullYear()) continue;
      const diff = at.getTime() - o.getTime();
      if (diff >= 0 && diff < e.windowDays * day) return true;
    }
    return false;
  });
}

/** The calendar window for a holiday in a given year (ISO, UTC) — null for unknown or personal events. */
export function calendarWindow(eventId: string, year: number): { availabilityStart: string; availabilityEnd: string } | null {
  const e = CALENDAR.find((x) => x.eventId === eventId);
  if (!e || e.rule.kind === "USER_ANNIVERSARY") return null;
  const o = occurrence(e.rule, year, null)!;
  return { availabilityStart: o.toISOString(), availabilityEnd: new Date(o.getTime() + e.windowDays * 86_400_000).toISOString() };
}

/**
 * Seasonal cosmetics get their store window from the ONE calendar when they name a holiday but carry
 * no explicit window. Explicit windows always win. Region limits from the calendar apply too.
 */
export function withCalendarWindow<T extends { holidayOrEventId?: string; availabilityStart?: string; availabilityEnd?: string; regionEligibility?: string[] }>(a: T, year: number): T {
  if (!a.holidayOrEventId || a.availabilityStart || a.availabilityEnd) return a;
  const w = calendarWindow(a.holidayOrEventId, year);
  if (!w) return a;
  const regions = CALENDAR.find((x) => x.eventId === a.holidayOrEventId)!.regions;
  return { ...a, ...w, ...(regions.length && !a.regionEligibility?.length ? { regionEligibility: [...regions] } : {}) };
}
