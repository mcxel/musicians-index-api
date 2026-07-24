/**
 * HostAssignmentRegistry
 *
 * Separates WHERE hosts work from WHO they are (Rule 8 — Registry First).
 * HostIdentityRegistry defines identity/portrait/persona/voice.
 * HostAssignmentRegistry defines show ownership, priority, and backups.
 *
 * To change who hosts a show, edit only this file — not the identity record.
 * To change a host's portrait or persona, edit only HostIdentityRegistry.
 *
 * Rule 21: Official (World) events are bot-created only — assignments here
 * govern which host entity runs each one. Mini events don't get a host
 * assignment by design; they are user-run.
 */

export interface HostAssignment {
  /** Show/event type ID — matches GlobalLiveSessionRegistry category or EventOrchestrator showId */
  showId: string;
  /** Human-readable label */
  showLabel: string;
  /** Event authority: world = platform-scheduled bot event, mini = user-created */
  authority: "world" | "mini" | "both";
  /** Primary host (hostId from HostIdentityRegistry) */
  primaryHostId: string;
  /** Backup host(s) if primary is unavailable */
  backupHostIds?: string[];
  /** Co-host(s) for events that warrant two presenters */
  coHostIds?: string[];
  /** PA Announcer override — defaults to 'aura-pa' */
  paAnnouncerId?: string;
  /** Automated Announcer covers when no host is available (Mini events) */
  automatedAnnouncer?: boolean;
  /** Priority for dashboard UI ordering */
  priority: number;
}

/**
 * Canonical host assignment table.
 * Source of truth: who hosts what. One entry per distinct show/event type.
 */
export const HOST_ASSIGNMENT_REGISTRY: HostAssignment[] = [
  // ── FLAGSHIP / WORLD EVENTS ──────────────────────────────────────────────
  {
    showId: "world-concert",
    showLabel: "World Concert",
    authority: "world",
    primaryHostId: "gregory-marcel",
    backupHostIds: ["bobby-stanley"],
    paAnnouncerId: "aura-pa",
    priority: 1,
  },
  {
    showId: "world-release-party",
    showLabel: "World Release Party",
    authority: "world",
    primaryHostId: "gregory-marcel",
    backupHostIds: ["bobby-stanley"],
    paAnnouncerId: "aura-pa",
    priority: 2,
  },
  {
    showId: "monday-night-stage",
    showLabel: "Monday Night Stage",
    authority: "world",
    primaryHostId: "gregory-marcel",
    backupHostIds: ["bobby-stanley", "tiana"],
    coHostIds: ["kira"],
    paAnnouncerId: "aura-pa",
    priority: 3,
  },
  {
    showId: "monthly-idol",
    showLabel: "Monthly Idol",
    authority: "world",
    primaryHostId: "gregory-marcel",
    backupHostIds: ["tiana"],
    coHostIds: ["mindy-jean-long"],
    paAnnouncerId: "aura-pa",
    priority: 4,
  },
  {
    showId: "open-mic-showcase",
    showLabel: "Open Mic Showcase",
    authority: "world",
    primaryHostId: "gregory-marcel",
    backupHostIds: ["bobby-stanley"],
    paAnnouncerId: "aura-pa",
    priority: 5,
  },
  {
    showId: "opening-ceremony",
    showLabel: "Opening Ceremony",
    authority: "world",
    primaryHostId: "gregory-marcel",
    paAnnouncerId: "aura-pa",
    priority: 6,
  },

  // ── BATTLE EVENTS ────────────────────────────────────────────────────────
  {
    showId: "battle-of-the-bands",
    showLabel: "Battle of the Bands",
    authority: "world",
    primaryHostId: "jack-obrien",
    backupHostIds: ["nova-mc"],
    paAnnouncerId: "aura-pa",
    priority: 10,
  },
  {
    showId: "official-battles",
    showLabel: "Official Battles",
    authority: "world",
    primaryHostId: "jack-obrien",
    backupHostIds: ["nova-mc"],
    paAnnouncerId: "aura-pa",
    priority: 11,
  },
  {
    showId: "championship-battles",
    showLabel: "Championship Battles",
    authority: "world",
    primaryHostId: "jack-obrien",
    backupHostIds: ["hector-lvanos"],
    coHostIds: ["hector-lvanos"], // championship events can co-host
    paAnnouncerId: "aura-pa",
    priority: 12,
  },
  {
    showId: "tournament-rounds",
    showLabel: "Tournament Rounds",
    authority: "world",
    primaryHostId: "jack-obrien",
    backupHostIds: ["nova-mc"],
    paAnnouncerId: "aura-pa",
    priority: 13,
  },
  {
    showId: "mini-battle",
    showLabel: "Mini Battle",
    authority: "mini",
    primaryHostId: "nova-mc",     // ref covers mini battles
    automatedAnnouncer: true,     // Automated Announcer as fallback
    paAnnouncerId: "aura-pa",
    priority: 14,
  },

  // ── CYPHER EVENTS ────────────────────────────────────────────────────────
  {
    showId: "cypher-arena",
    showLabel: "Cypher Arena",
    authority: "world",
    primaryHostId: "hector-lvanos",
    backupHostIds: ["jack-obrien"],
    paAnnouncerId: "aura-pa",
    priority: 20,
  },
  {
    showId: "official-cyphers",
    showLabel: "Official Cyphers",
    authority: "world",
    primaryHostId: "hector-lvanos",
    backupHostIds: ["jack-obrien"],
    paAnnouncerId: "aura-pa",
    priority: 21,
  },
  {
    showId: "cypher-championships",
    showLabel: "Cypher Championships",
    authority: "world",
    primaryHostId: "hector-lvanos",
    coHostIds: ["jack-obrien"],
    paAnnouncerId: "aura-pa",
    priority: 22,
  },
  {
    showId: "freestyle-events",
    showLabel: "Freestyle Events",
    authority: "world",
    primaryHostId: "hector-lvanos",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 23,
  },
  {
    showId: "mini-cypher",
    showLabel: "Mini Cypher",
    authority: "mini",
    primaryHostId: "hector-lvanos",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 24,
  },

  // ── DANCE / DJ EVENTS ────────────────────────────────────────────────────
  {
    showId: "world-dance-party",
    showLabel: "World Dance Party",
    authority: "world",
    primaryHostId: "record-ralph",
    paAnnouncerId: "aura-pa",
    priority: 30,
  },
  {
    showId: "mini-dance-party",
    showLabel: "Mini Dance Party",
    authority: "mini",
    primaryHostId: "record-ralph",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 31,
  },

  // ── GAME SHOWS (bot-only, platform-scheduled) ────────────────────────────
  {
    showId: "deal-or-feud",
    showLabel: "Deal vs. Feud 1000",
    authority: "world",
    primaryHostId: "bobby-stanley",
    backupHostIds: ["gregory-marcel"],
    paAnnouncerId: "aura-pa",
    priority: 40,
  },
  {
    showId: "yearly-contest",
    showLabel: "Yearly Championships",
    authority: "world",
    primaryHostId: "jack-obrien",
    coHostIds: ["hector-lvanos", "gregory-marcel"],
    paAnnouncerId: "aura-pa",
    priority: 41,
  },
  {
    showId: "dirty-dozens",
    showLabel: "Dirty Dozens Championship",
    authority: "world",
    primaryHostId: "jack-obrien",
    backupHostIds: ["hector-lvanos"],
    paAnnouncerId: "aura-pa",
    priority: 42,
  },

  // ── MINI CREATOR EVENTS (user-created, automated announcer) ─────────────
  {
    showId: "mini-concert",
    showLabel: "Mini Concert",
    authority: "mini",
    primaryHostId: "gregory-marcel",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 50,
  },
  {
    showId: "mini-release-party",
    showLabel: "Mini Release Party",
    authority: "mini",
    primaryHostId: "gregory-marcel",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 51,
  },
  {
    showId: "mini-challenge",
    showLabel: "Mini Challenge",
    authority: "mini",
    primaryHostId: "nova-mc",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 52,
  },
  {
    showId: "mini-lounge",
    showLabel: "Mini Lounge",
    authority: "mini",
    primaryHostId: "gregory-marcel",
    automatedAnnouncer: true,
    paAnnouncerId: "aura-pa",
    priority: 53,
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getAssignment(showId: string): HostAssignment | undefined {
  return HOST_ASSIGNMENT_REGISTRY.find((a) => a.showId === showId);
}

export function getPrimaryHostId(showId: string): string | undefined {
  return getAssignment(showId)?.primaryHostId;
}

export function getAssignmentsByHost(hostId: string): HostAssignment[] {
  return HOST_ASSIGNMENT_REGISTRY.filter(
    (a) =>
      a.primaryHostId === hostId ||
      a.backupHostIds?.includes(hostId) ||
      a.coHostIds?.includes(hostId),
  );
}

export function getWorldAssignments(): HostAssignment[] {
  return HOST_ASSIGNMENT_REGISTRY.filter((a) => a.authority === "world");
}

export function getMiniAssignments(): HostAssignment[] {
  return HOST_ASSIGNMENT_REGISTRY.filter((a) => a.authority === "mini");
}
