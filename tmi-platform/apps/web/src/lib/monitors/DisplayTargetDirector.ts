/**
 * DisplayTargetDirector.ts — Logical Display Target Resolution & Multi-Monitor Routing
 *
 * Laws:
 * 1. CAST REQUEST → CHECK OCCUPANCY → FIND AVAILABLE MONITOR → PREVIEW → TAKE
 * 2. Never automatically evict protected PROGRAM, pinned, or active 1-on-1 private call surfaces.
 * 3. Prefer free secondary displays (e.g. Monitor B) when primary Monitor A carries live broadcast.
 * 4. Supports MOVE / SWAP / PIN post-placement without tearing down media streams.
 */

export type CastContentType =
  | "PLAYLIST"
  | "MEMORY"
  | "YOPHO"
  | "SCREEN_SHARE"
  | "VIDEO_CLIP"
  | "LIVE_SOURCE"
  | "SPONSOR";

export type DisplayTargetClass =
  | "JUMBOTRON"
  | "JUMBOTRON_NORTH"
  | "JUMBOTRON_SOUTH"
  | "JUMBOTRON_EAST"
  | "JUMBOTRON_WEST"
  | "JUMBOTRON_BOTTOM_RING"
  | "JUMBOTRON_UPPER_RIBBON"
  | "VENUE_WALL"
  | "CURTAIN_RAIL"
  | "STAGE_RAIL"
  | "FULL_DISPLAY"
  | "SIDE_DISPLAY"
  | "BILLBOARD"
  | "LOWER_THIRD"
  | "OVERLAY";

export interface MonitorSlotOccupancy {
  slotId: string; // e.g. "mon-a", "mon-b", "mon-c", "mon-d"
  label: string;
  isOccupied: boolean;
  contentType: CastContentType | "PROGRAM" | "CAMERA" | "VENUE_WORLD" | "PRIVATE_CALL" | "IDLE";
  isProtectedProgram: boolean;
  isPinned: boolean;
  mediaUrl?: string | null;
  activeOverlayTarget?: DisplayTargetClass | null;
}

export interface CastRoutingDecision {
  success: boolean;
  targetSlotId: string;
  previousContentPreserved: boolean;
  reason: string;
  requiresUserChoice: boolean;
  candidateSlots: string[];
}

export class DisplayTargetDirector {
  /**
   * Resolves the best available display target for an incoming cast request.
   */
  public static resolveBestDisplayTarget(
    contentType: CastContentType,
    currentSlots: MonitorSlotOccupancy[],
    preferredSlotId?: string
  ): CastRoutingDecision {
    if (!currentSlots || currentSlots.length === 0) {
      return {
        success: true,
        targetSlotId: "mon-a",
        previousContentPreserved: false,
        reason: "Default single-monitor fallback assigned to mon-a",
        requiresUserChoice: false,
        candidateSlots: ["mon-a"],
      };
    }

    // 1. If a preferred slot is requested and it is not a protected program slot, use it
    if (preferredSlotId) {
      const preferred = currentSlots.find((s) => s.slotId === preferredSlotId);
      if (preferred && !preferred.isProtectedProgram && !preferred.isPinned) {
        return {
          success: true,
          targetSlotId: preferred.slotId,
          previousContentPreserved: !preferred.isOccupied,
          reason: `Targeted requested slot ${preferred.slotId}`,
          requiresUserChoice: false,
          candidateSlots: [preferred.slotId],
        };
      }
    }

    // 2. Find completely idle / unoccupied display slots first
    const idleSlots = currentSlots.filter((s) => !s.isOccupied || s.contentType === "IDLE");
    if (idleSlots.length > 0) {
      // If Monitor A is carrying camera/venue and Monitor B is idle, choose B
      const nonPrimaryIdle = idleSlots.find((s) => s.slotId !== "mon-a");
      const selected = nonPrimaryIdle ?? idleSlots[0]!;
      return {
        success: true,
        targetSlotId: selected.slotId,
        previousContentPreserved: true,
        reason: `Routed cast to available idle display ${selected.slotId}`,
        requiresUserChoice: false,
        candidateSlots: idleSlots.map((s) => s.slotId),
      };
    }

    // 3. Find non-protected, non-pinned, non-private-call slots that can be safely updated
    const safeOverwritableSlots = currentSlots.filter(
      (s) => !s.isProtectedProgram && !s.isPinned && s.contentType !== "PRIVATE_CALL"
    );

    if (safeOverwritableSlots.length > 0) {
      // Prefer replacing secondary cast surfaces over primary host camera
      const secondaryReplace = safeOverwritableSlots.find((s) => s.slotId !== "mon-a");
      const selected = secondaryReplace ?? safeOverwritableSlots[0]!;
      return {
        success: true,
        targetSlotId: selected.slotId,
        previousContentPreserved: false,
        reason: `Replaced non-protected display ${selected.slotId} with new cast content`,
        requiresUserChoice: false,
        candidateSlots: safeOverwritableSlots.map((s) => s.slotId),
      };
    }

    // 4. All slots are strictly protected (PROGRAM, PINNED, or PRIVATE_CALL) — require explicit user choice
    return {
      success: false,
      targetSlotId: currentSlots[0]!.slotId,
      previousContentPreserved: true,
      reason: "All active displays are currently carrying protected PROGRAM or private feeds. Choose a display to replace.",
      requiresUserChoice: true,
      candidateSlots: currentSlots.map((s) => s.slotId),
    };
  }

  /**
   * Resolves a CAST request to Jumbotron if authorized and safe.
   * CAST requests may resolve to Jumbotron:
   *   - SPONSOR -> JUMBOTRON
   *   - PLAYLIST ARTWORK -> JUMBOTRON
   *   - MEMORY -> JUMBOTRON (when authorized)
   *   - YOPHO -> JUMBOTRON (when authorized)
   * Ordinary CAST cannot overwrite:
   *   - emergency/safety
   *   - active round timer
   *   - protected program
   *   - winner/reward moment
   *   - contractual sponsor obligation
   */
  public static resolveCastToJumbotron(
    contentType: CastContentType,
    jumbotronProtectedState?: {
      isSafetyEmergency?: boolean;
      isActiveRoundTimer?: boolean;
      isProtectedProgram?: boolean;
      isRewardOrWinnerMoment?: boolean;
      isContractualSponsorActive?: boolean;
    }
  ): {
    canTakeJumbotron: boolean;
    targetClass: DisplayTargetClass;
    reason: string;
  } {
    if (jumbotronProtectedState?.isSafetyEmergency) {
      return {
        canTakeJumbotron: false,
        targetClass: "SIDE_DISPLAY",
        reason: "Jumbotron blocked: Emergency/Safety event active on primary surface",
      };
    }
    if (jumbotronProtectedState?.isActiveRoundTimer) {
      return {
        canTakeJumbotron: false,
        targetClass: "SIDE_DISPLAY",
        reason: "Jumbotron blocked: Critical round timer actively controls Jumbotron",
      };
    }
    if (jumbotronProtectedState?.isRewardOrWinnerMoment) {
      return {
        canTakeJumbotron: false,
        targetClass: "SIDE_DISPLAY",
        reason: "Jumbotron blocked: Verified reward / winner ceremony in progress",
      };
    }
    if (jumbotronProtectedState?.isContractualSponsorActive) {
      return {
        canTakeJumbotron: false,
        targetClass: "SIDE_DISPLAY",
        reason: "Jumbotron blocked: Contracted direct sponsor delivery obligations active",
      };
    }
    if (jumbotronProtectedState?.isProtectedProgram) {
      return {
        canTakeJumbotron: false,
        targetClass: "SIDE_DISPLAY",
        reason: "Jumbotron blocked: Program feed is strictly protected",
      };
    }

    const jumbotronEligibleCast: CastContentType[] = ["SPONSOR", "PLAYLIST", "MEMORY", "YOPHO"];
    if (jumbotronEligibleCast.includes(contentType)) {
      return {
        canTakeJumbotron: true,
        targetClass: "JUMBOTRON",
        reason: `Cast content ${contentType} authorized for Jumbotron display`,
      };
    }

    return {
      canTakeJumbotron: false,
      targetClass: "SIDE_DISPLAY",
      reason: `Cast content ${contentType} routed to secondary display`,
    };
  }
}
