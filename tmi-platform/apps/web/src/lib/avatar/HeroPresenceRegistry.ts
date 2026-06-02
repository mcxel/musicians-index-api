/**
 * HeroPresenceRegistry — Tracks which hero characters are "present" in each venue
 *
 * Heroes have a home venue and can be present in any room.
 * Presence is determined by:
 *   1. Their home venue (always present there by default)
 *   2. Active event type (Julius is always in Battle Arena when live)
 *   3. User-linked heroes (if a user is linked to Bebo, Bebo spawns when they enter)
 *   4. Admin override (manually place heroes for special events)
 *
 * P11A: In-memory registry. P12: persistent DB + real-time socket.
 */

import { HERO_REGISTRY, type HeroCharacter } from "./HeroRegistry";

export type HeroPosition =
  | "front_row_center" // Directly in front of stage (venuePriority=1)
  | "front_row_left"
  | "front_row_right"
  | "vip_booth"        // Side VIP area
  | "stage"            // On stage (performer heroes)
  | "judge_panel"      // Dirty Dozens / game show
  | "dj_booth"         // Dance/DJ events
  | "audience_mid"     // Mid-section audience
  | "entrance";        // Near lobby entrance

export interface HeroPresence {
  heroId:       string;
  venueSlug:    string;
  position:     HeroPosition;
  isActive:     boolean;
  spawnedAt:    string;
  linkedUserId?: string; // if spawned because a user linked this hero
  animState:   "idle" | "wave" | "celebrate" | "dance" | "signature_move";
  priority:    number; // lower = more prominent (1=front center)
}

// ── Default presence rules per venue ─────────────────────────────────────────
const DEFAULT_PRESENCE: Omit<HeroPresence, "spawnedAt">[] = [
  // Bebo — World Concert, always front center
  { heroId: "bebo",               venueSlug: "world-concert",     position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  // Julius — Battle Arena, front row center (he MC's every battle)
  { heroId: "julius",             venueSlug: "battle-arena",      position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  { heroId: "julius",             venueSlug: "battles",           position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  // Tiana TG — Cypher Arena, front row
  { heroId: "tiana-tg",           venueSlug: "cypher",            position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  { heroId: "tiana-tg",           venueSlug: "cypher-theater",    position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  // Record Ralph — Monday Night Stage, DJ booth
  { heroId: "record-ralph",       venueSlug: "monday-stage",      position: "dj_booth",         isActive: true, animState: "idle",    priority: 2 },
  // Redbeard & Specs — Dirty Dozens, judge panel
  { heroId: "redbeard-and-specs", venueSlug: "dirty-dozens",      position: "judge_panel",      isActive: true, animState: "idle",    priority: 1 },
  // Luxe Trio — World Concert, VIP booth
  { heroId: "luxe-trio",          venueSlug: "world-concert",     position: "vip_booth",        isActive: true, animState: "idle",    priority: 2 },
  // Challenge Arena — Julius hosts, Tiana in VIP
  { heroId: "julius",             venueSlug: "challenge-arena",   position: "front_row_center", isActive: true, animState: "idle",    priority: 1 },
  { heroId: "tiana-tg",           venueSlug: "challenge-arena",   position: "front_row_left",   isActive: true, animState: "idle",    priority: 2 },
  // World Dance Party — Bebo dances, Luxe Trio on floor
  { heroId: "bebo",               venueSlug: "world-dance-party", position: "stage",            isActive: true, animState: "dance",   priority: 1 },
  { heroId: "luxe-trio",          venueSlug: "world-dance-party", position: "dj_booth",         isActive: true, animState: "dance",   priority: 2 },
];

// ── In-memory registry ────────────────────────────────────────────────────────
const PRESENCE_STORE = new Map<string, HeroPresence[]>();

function venueKey(venueSlug: string): string { return venueSlug.toLowerCase(); }

function initVenue(venueSlug: string): void {
  if (PRESENCE_STORE.has(venueKey(venueSlug))) return;
  const defaults = DEFAULT_PRESENCE
    .filter(p => p.venueSlug === venueSlug)
    .map(p => ({ ...p, spawnedAt: new Date().toISOString() }));
  PRESENCE_STORE.set(venueKey(venueSlug), defaults);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getPresenceForVenue(venueSlug: string): HeroPresence[] {
  initVenue(venueSlug);
  return (PRESENCE_STORE.get(venueKey(venueSlug)) ?? []).filter(p => p.isActive);
}

export function getHeroesForVenue(venueSlug: string): (HeroCharacter & { position: HeroPosition; animState: HeroPresence["animState"] })[] {
  const presences = getPresenceForVenue(venueSlug);
  return presences
    .sort((a, b) => a.priority - b.priority)
    .map(p => {
      const hero = HERO_REGISTRY.find(h => h.id === p.heroId);
      if (!hero) return null;
      return { ...hero, position: p.position, animState: p.animState };
    })
    .filter((h): h is NonNullable<typeof h> => h !== null);
}

export function setHeroAnimState(venueSlug: string, heroId: string, state: HeroPresence["animState"]): void {
  initVenue(venueSlug);
  const presences = PRESENCE_STORE.get(venueKey(venueSlug)) ?? [];
  PRESENCE_STORE.set(venueKey(venueSlug), presences.map(p =>
    p.heroId === heroId ? { ...p, animState: state } : p
  ));
}

export function spawnHeroForUser(venueSlug: string, heroId: string, userId: string): void {
  initVenue(venueSlug);
  const presences = PRESENCE_STORE.get(venueKey(venueSlug)) ?? [];
  const existing = presences.find(p => p.heroId === heroId && p.linkedUserId === userId);
  if (!existing) {
    presences.push({
      heroId, venueSlug, position: "audience_mid",
      isActive: true, linkedUserId: userId,
      animState: "idle", priority: 5,
      spawnedAt: new Date().toISOString(),
    });
    PRESENCE_STORE.set(venueKey(venueSlug), presences);
  }
}

export function despawnHeroForUser(venueSlug: string, heroId: string, userId: string): void {
  initVenue(venueSlug);
  const presences = PRESENCE_STORE.get(venueKey(venueSlug)) ?? [];
  PRESENCE_STORE.set(venueKey(venueSlug),
    presences.filter(p => !(p.heroId === heroId && p.linkedUserId === userId))
  );
}

// Celebrate all heroes in a venue (e.g., after a battle win)
export function triggerVenueCelebration(venueSlug: string): void {
  initVenue(venueSlug);
  const presences = PRESENCE_STORE.get(venueKey(venueSlug)) ?? [];
  PRESENCE_STORE.set(venueKey(venueSlug), presences.map(p => ({ ...p, animState: "celebrate" as const })));
  // Reset to idle after 3s
  setTimeout(() => {
    const current = PRESENCE_STORE.get(venueKey(venueSlug)) ?? [];
    PRESENCE_STORE.set(venueKey(venueSlug), current.map(p => ({ ...p, animState: "idle" as const })));
  }, 3000);
}
