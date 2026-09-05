/**
 * PresentationTargetResolver.ts — Deterministic display-target placement
 *
 * Laws:
 * - UNIVERSAL PLAYER FREEDOM: slots are never dedicated by identity.
 * - DYNAMIC COMMUNICATION PLAYER: EMPTY → IDLE/AMBIENT → SECONDARY AVAILABLE → SAFE SPLIT.
 * - Protect PINNED and active PROGRAMMING; manual MOVE/SWAP/SPLIT always wins later.
 * - Dual-view recommendedAssignment is convenience only — never PLAYER_1_IS_PROGRAM in code.
 *
 * Lives beside CanonicalUniversalPlayerFabric — does not invent a parallel player system.
 */

export type RecommendedRole = "PROGRAM" | "USER_CONTEXT";

export interface RecommendedAssignment {
  role: RecommendedRole;
  sourceId: string;
  viewpointHint: "MAIN" | "SEAT_AVATAR" | "AUDIENCE" | "FRIEND_GROUP" | "FREE_LOOK";
}

export type ResolverLayoutMode =
  | "FULL"
  | "SPLIT_HORIZONTAL"
  | "SPLIT_VERTICAL"
  | "QUAD"
  | "PIP";

export type PresentationResolveReason =
  | "PREFERRED_SLOT"
  | "EMPTY_PRIMARY"
  | "IDLE_PRIMARY"
  | "SECONDARY_AVAILABLE"
  | "SAFE_SPLIT_ON_SECONDARY"
  | "NO_SAFE_TARGET";

export interface PresentationResolveResult {
  success: boolean;
  targetPlayerId: string | null;
  reason: PresentationResolveReason;
  protectPrimary: boolean;
  layoutHint: ResolverLayoutMode;
}

/** Minimal player snapshot — avoids circular import with the fabric. */
export interface ResolverPlayerSnapshot {
  playerId: string;
  sourceId: string | null;
  pinned: boolean;
  audioAuthority: "PROGRAM" | "VOICE" | "SHARE" | "MUTED";
}

export interface ResolverSourceSnapshot {
  sourceId: string;
  sourceType: string;
  audioAuthority: "PROGRAM" | "VOICE" | "SHARE" | "MUTED";
}

function isEmpty(player: ResolverPlayerSnapshot | undefined): boolean {
  return !player?.sourceId;
}

function isIdleOrAmbient(
  player: ResolverPlayerSnapshot | undefined,
  sources: Map<string, ResolverSourceSnapshot>
): boolean {
  if (!player?.sourceId) return true;
  if (player.sourceId === "IDLE") return true;
  const src = sources.get(player.sourceId);
  if (!src) return true;
  return (
    !player.pinned &&
    src.audioAuthority !== "PROGRAM" &&
    src.sourceType !== "BATTLE_PROGRAM" &&
    src.sourceType !== "LIVE_PROGRAM" &&
    src.sourceType !== "CYPHER_ROTATION"
  );
}

function isProtectedProgramming(
  player: ResolverPlayerSnapshot | undefined,
  sources: Map<string, ResolverSourceSnapshot>
): boolean {
  if (!player?.sourceId) return false;
  if (player.pinned) return true;
  const src = sources.get(player.sourceId);
  if (!src) return false;
  return (
    src.audioAuthority === "PROGRAM" ||
    src.sourceType === "BATTLE_PROGRAM" ||
    src.sourceType === "LIVE_PROGRAM" ||
    src.sourceType === "CYPHER_ROTATION" ||
    src.sourceType === "BATTLE_SCOREBOARD"
  );
}

export class PresentationTargetResolver {
  /**
   * Dual-View Experience Law — returns recommended roles only.
   * Never encodes PLAYER_1_IS_PROGRAM / PLAYER_2_IS_SOCIAL.
   */
  public static buildRecommendedDualAssignment(
    programSourceId: string,
    userContextSourceId: string
  ): RecommendedAssignment[] {
    return [
      { role: "PROGRAM", sourceId: programSourceId, viewpointHint: "MAIN" },
      {
        role: "USER_CONTEXT",
        sourceId: userContextSourceId,
        viewpointHint: "SEAT_AVATAR",
      },
    ];
  }

  /**
   * Map recommended roles onto concrete player ids as convenience defaults.
   * Caller may pass any two player ids — defaults are intelligent suggestions only.
   */
  public static mapRecommendationsToPlayers(
    recommendations: RecommendedAssignment[],
    playerIds: [string, string] = ["slot-1", "slot-2"]
  ): Array<{ playerId: string; assignment: RecommendedAssignment }> {
    return recommendations.map((assignment, i) => ({
      playerId: playerIds[Math.min(i, playerIds.length - 1)]!,
      assignment,
    }));
  }

  /**
   * Incoming communication placement priority:
   * EMPTY → IDLE/AMBIENT → SECONDARY AVAILABLE → SAFE SPLIT
   * Protects pinned + active programming.
   */
  public static resolveCommunicationTarget(params: {
    players: ResolverPlayerSnapshot[];
    sources: Map<string, ResolverSourceSnapshot>;
    preferredPlayerId?: string;
    participantCount: number;
  }): PresentationResolveResult {
    const byId = new Map(params.players.map((p) => [p.playerId, p]));
    const layoutHint: ResolverLayoutMode =
      params.participantCount <= 1
        ? "FULL"
        : params.participantCount === 2
          ? "SPLIT_HORIZONTAL"
          : params.participantCount === 3
            ? "SPLIT_HORIZONTAL"
            : "QUAD";

    if (params.preferredPlayerId) {
      const preferred = byId.get(params.preferredPlayerId);
      if (preferred && !preferred.pinned && !isProtectedProgramming(preferred, params.sources)) {
        return {
          success: true,
          targetPlayerId: preferred.playerId,
          reason: "PREFERRED_SLOT",
          protectPrimary: false,
          layoutHint,
        };
      }
    }

    const primary = byId.get("slot-1");
    const primaryProtected = isProtectedProgramming(primary, params.sources);

    if (isEmpty(primary)) {
      return {
        success: true,
        targetPlayerId: "slot-1",
        reason: "EMPTY_PRIMARY",
        protectPrimary: false,
        layoutHint,
      };
    }

    if (!primaryProtected && isIdleOrAmbient(primary, params.sources)) {
      return {
        success: true,
        targetPlayerId: "slot-1",
        reason: "IDLE_PRIMARY",
        protectPrimary: false,
        layoutHint,
      };
    }

    for (let i = 2; i <= 16; i++) {
      const slot = byId.get(`slot-${i}`);
      if (!slot || slot.pinned) continue;
      if (isEmpty(slot) || isIdleOrAmbient(slot, params.sources)) {
        return {
          success: true,
          targetPlayerId: slot.playerId,
          reason: "SECONDARY_AVAILABLE",
          protectPrimary: true,
          layoutHint,
        };
      }
    }

    for (let i = 2; i <= 16; i++) {
      const slot = byId.get(`slot-${i}`);
      if (slot && !slot.pinned && !isProtectedProgramming(slot, params.sources)) {
        return {
          success: true,
          targetPlayerId: slot.playerId,
          reason: "SAFE_SPLIT_ON_SECONDARY",
          protectPrimary: true,
          layoutHint,
        };
      }
    }

    return {
      success: false,
      targetPlayerId: null,
      reason: "NO_SAFE_TARGET",
      protectPrimary: primaryProtected,
      layoutHint: "FULL",
    };
  }
}
