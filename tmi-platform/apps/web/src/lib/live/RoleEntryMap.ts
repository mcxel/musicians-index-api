/**
 * RoleEntryMap — canonical role -> presentation profile for a live session.
 *
 * Every participant role resolves into the SAME `roomId` + `liveSessionId`
 * for a given live session. Only entryZone, spawnAnchor, presenceMode,
 * capabilities, and hudPolicy differ by role. roomId/liveSessionId are never
 * invented here — they are always the caller's real, already-minted values
 * (see executeInstantGoLive.ts / goLiveBootstrapStore.ts for where those are
 * actually created), so this map cannot itself cause role-specific room
 * fragmentation.
 */

export type LiveParticipantRole =
  | "fan"
  | "performer"
  | "host"
  | "dj"
  | "moderator"
  | "writer"
  | "system_host"
  | "qa_bot";

export type PresenceMode = "avatar" | "video" | "mixed" | "system";

export interface RoleEntryProfile {
  entryZone: string;
  spawnAnchor: string;
  presenceMode: PresenceMode;
  capabilities: string[];
  hudPolicy: string;
}

export interface RoleEntry extends RoleEntryProfile {
  role: LiveParticipantRole;
  roomId: string;
  liveSessionId: string;
  isPrivate: boolean;
}

type RoleProfileTable = Record<LiveParticipantRole, { public: RoleEntryProfile; private: RoleEntryProfile }>;

/** Per-role presentation profile, independent of any specific room/session. */
const ROLE_PROFILES: RoleProfileTable = {
  fan: {
    public: {
      entryZone: "fan-lobby",
      spawnAnchor: "audienceAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "emoji"],
      hudPolicy: "hudFanPublic",
    },
    private: {
      entryZone: "private-fan-lobby",
      spawnAnchor: "privateAudienceAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "emoji"],
      hudPolicy: "hudFanPrivate",
    },
  },
  performer: {
    public: {
      entryZone: "stage",
      spawnAnchor: "stageAnchor",
      presenceMode: "video",
      capabilities: ["camera", "mic", "stageControls"],
      hudPolicy: "hudPerformerPublic",
    },
    private: {
      entryZone: "rehearsal",
      spawnAnchor: "rehearsalAnchor",
      presenceMode: "video",
      capabilities: ["camera", "mic", "stageControls"],
      hudPolicy: "hudPerformerPrivate",
    },
  },
  host: {
    public: {
      entryZone: "host-booth",
      spawnAnchor: "hostAnchor",
      presenceMode: "video",
      capabilities: ["camera", "mic", "hostControls", "queueControl"],
      hudPolicy: "hudHostPublic",
    },
    private: {
      entryZone: "private-host-booth",
      spawnAnchor: "privateHostAnchor",
      presenceMode: "video",
      capabilities: ["camera", "mic", "hostControls", "queueControl"],
      hudPolicy: "hudHostPrivate",
    },
  },
  dj: {
    public: {
      entryZone: "dj-booth",
      spawnAnchor: "djAnchor",
      presenceMode: "mixed",
      capabilities: ["mic", "trackControl", "crossfade"],
      hudPolicy: "hudDjPublic",
    },
    private: {
      entryZone: "private-dj-booth",
      spawnAnchor: "privateDjAnchor",
      presenceMode: "mixed",
      capabilities: ["mic", "trackControl", "crossfade"],
      hudPolicy: "hudDjPrivate",
    },
  },
  moderator: {
    public: {
      entryZone: "moderation-deck",
      spawnAnchor: "modAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "moderationTools", "reportQueue"],
      hudPolicy: "hudModeratorPublic",
    },
    private: {
      entryZone: "private-moderation-deck",
      spawnAnchor: "privateModAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "moderationTools", "reportQueue"],
      hudPolicy: "hudModeratorPrivate",
    },
  },
  writer: {
    public: {
      entryZone: "press-box",
      spawnAnchor: "pressAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "noteCapture"],
      hudPolicy: "hudWriterPublic",
    },
    private: {
      entryZone: "private-press-box",
      spawnAnchor: "privatePressAnchor",
      presenceMode: "avatar",
      capabilities: ["chat", "noteCapture"],
      hudPolicy: "hudWriterPrivate",
    },
  },
  system_host: {
    public: {
      entryZone: "system-host-anchor",
      spawnAnchor: "systemHostAnchor",
      presenceMode: "system",
      capabilities: ["automatedAnnouncements", "queueControl"],
      hudPolicy: "hudSystemHostPublic",
    },
    private: {
      entryZone: "private-system-host-anchor",
      spawnAnchor: "privateSystemHostAnchor",
      presenceMode: "system",
      capabilities: ["automatedAnnouncements", "queueControl"],
      hudPolicy: "hudSystemHostPrivate",
    },
  },
  qa_bot: {
    public: {
      entryZone: "qa-observer",
      spawnAnchor: "qaAnchor",
      presenceMode: "system",
      capabilities: ["telemetryCapture", "silentObserve"],
      hudPolicy: "hudQaPublic",
    },
    private: {
      entryZone: "private-qa-observer",
      spawnAnchor: "privateQaAnchor",
      presenceMode: "system",
      capabilities: ["telemetryCapture", "silentObserve"],
      hudPolicy: "hudQaPrivate",
    },
  },
};

export const LIVE_PARTICIPANT_ROLES: LiveParticipantRole[] = Object.keys(ROLE_PROFILES) as LiveParticipantRole[];

/** Per-role presentation profile only — no roomId/liveSessionId (none exists yet pre-mint). */
export function getRoleEntryProfile(role: LiveParticipantRole, isPrivate: boolean): RoleEntryProfile {
  return ROLE_PROFILES[role][isPrivate ? "private" : "public"];
}

/**
 * Resolve a role's full entry for an ALREADY-KNOWN roomId + liveSessionId.
 * roomId/liveSessionId are always echoed back unchanged — every role for the
 * same live session gets the same two values by construction.
 */
export function resolveRoleEntry(
  role: LiveParticipantRole,
  roomId: string,
  liveSessionId: string,
  isPrivate = false,
): RoleEntry {
  const profile = getRoleEntryProfile(role, isPrivate);
  return {
    role,
    roomId,
    liveSessionId,
    isPrivate,
    ...profile,
  };
}
