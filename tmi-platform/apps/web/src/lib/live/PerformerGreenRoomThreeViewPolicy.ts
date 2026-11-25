/**
 * Performer Green Room Three-View Voltron Law
 *
 * Authorized backstage performers may simultaneously view:
 * 1. OTHER PERFORMERS — private Green Room / backstage lineup (PASS-to-tail door line)
 * 2. CURRENT PERFORMANCE — public stage / Battle / Cypher program
 * 3. AUDIENCE — authorized audience / venue camera
 *
 * One monitor (Voltron split) OR multi-monitor routing — same sources.
 * Fans: public stage + audience only. Never private Green Room feeds.
 *
 * Reuses Workspace → Monitor → Composition → Panel → Authorized Media Source.
 * No duplicate media engine. Reference slots ≠ 13-member interactive capacity.
 */

import type { LayoutMode, MediaSource } from "@/lib/media/canonicalMediaPlayerRuntime";
import type { VoltronCompositionFamily } from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import {
  MAX_INTERACTIVE_ROOM_MEMBERS,
  MAX_VOLTRON_REFERENCE_SLOTS,
} from "@/lib/live/InteractiveRoomCapacityPolicy";

export const PERFORMER_GREEN_ROOM_THREE_VIEW_POLICY_ID =
  "PERFORMER_GREEN_ROOM_THREE_VIEW_v1" as const;

export const NEW_GREEN_ROOM_MEDIA_ENGINE = false as const;
export const FAN_MAY_SUBSCRIBE_PRIVATE_GREEN_ROOM = 0 as const;
export const PERFORMER_ACCOUNT_GRANTS_ALL_GREEN_ROOMS = 0 as const;
export const LAYOUT_CHANGE_REMOUNTS_WEBRTC = 0 as const;
export const REQUIRES_FAN_ACCOUNT_TO_WATCH_PUBLIC = 0 as const;

export type GreenRoomThreeViewPanelId =
  | "CURRENT_PERFORMANCE"
  | "PRIVATE_BACKSTAGE"
  | "LIVE_AUDIENCE";

export type GreenRoomSourceClass = "PUBLIC_STAGE" | "PUBLIC_AUDIENCE" | "PRIVATE_BACKSTAGE";

export type BackstageAccessContext = {
  role: string | null | undefined;
  /** Authenticated membership / invite / competition queue authorization for THIS room. */
  authorizedBackstageMember: boolean;
  /** Explicit video consent for private backstage mosaic. */
  backstageVideoConsent: boolean;
};

export const GREEN_ROOM_THREE_VIEW_PANELS: Record<
  GreenRoomThreeViewPanelId,
  {
    label: string;
    sourceClass: GreenRoomSourceClass;
    /** Canonical frame defaults for one-monitor Voltron. */
    canonicalDefaultFrame: "a" | "b" | "c";
    /** Preferred MediaSource assignment (public paths only for stage/audience). */
    mediaSource: MediaSource;
    fanVisible: boolean;
  }
> = {
  CURRENT_PERFORMANCE: {
    label: "LIVE STAGE",
    sourceClass: "PUBLIC_STAGE",
    canonicalDefaultFrame: "a",
    mediaSource: "PERFORMER_FEED",
    fanVisible: true,
  },
  PRIVATE_BACKSTAGE: {
    label: "PRIVATE BACKSTAGE",
    sourceClass: "PRIVATE_BACKSTAGE",
    canonicalDefaultFrame: "b",
    /** Mosaic uses MONITOR_FEED label; real tracks only after SFU auth (Claude). */
    mediaSource: "MONITOR_FEED",
    fanVisible: false,
  },
  LIVE_AUDIENCE: {
    label: "LIVE AUDIENCE",
    sourceClass: "PUBLIC_AUDIENCE",
    canonicalDefaultFrame: "c",
    mediaSource: "AUDIENCE_VIEW",
    fanVisible: true,
  },
};

const PERFORMER_ROLES = new Set([
  "PERFORMER",
  "ARTIST",
  "BAND",
  "ADMIN",
  "STAFF",
]);

export function isPerformerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return PERFORMER_ROLES.has(role.toUpperCase());
}

/**
 * Server/UI gate: private backstage sources require room membership + consent.
 * Performer role alone is insufficient.
 */
export function mayAccessPrivateGreenRoomSource(ctx: BackstageAccessContext): {
  allowed: boolean;
  reason: string;
} {
  if (!isPerformerRole(ctx.role) && ctx.role?.toUpperCase() !== "ADMIN") {
    return {
      allowed: false,
      reason: "Private Green Room is performer-only — fans never receive backstage feeds",
    };
  }
  if (!ctx.authorizedBackstageMember) {
    return {
      allowed: false,
      reason: "Performer account alone does not grant every Green Room — need room backstage authorization",
    };
  }
  if (!ctx.backstageVideoConsent) {
    return {
      allowed: false,
      reason: "Backstage video requires participant consent",
    };
  }
  return {
    allowed: true,
    reason: "Authorized backstage performer with video consent",
  };
}

export function mayAccessPublicStageOrAudience(_role: string | null | undefined): true {
  return true;
}

/** Fan-facing composition never includes PRIVATE_BACKSTAGE panels. */
export function filterPanelsForAudience(role: string | null | undefined): GreenRoomThreeViewPanelId[] {
  const isFanFacing = !isPerformerRole(role);
  return (Object.keys(GREEN_ROOM_THREE_VIEW_PANELS) as GreenRoomThreeViewPanelId[]).filter(
    (id) => !isFanFacing || GREEN_ROOM_THREE_VIEW_PANELS[id].fanVisible,
  );
}

export type ThreeViewCompositionPlan = {
  voltronFamily: VoltronCompositionFamily;
  canonicalLayout: LayoutMode;
  panels: Array<{
    panelId: GreenRoomThreeViewPanelId;
    frameId: "a" | "b" | "c";
    mediaSource: MediaSource;
    label: string;
    include: boolean;
  }>;
  remountWebRtc: false;
  reason: string;
};

/**
 * One-monitor Voltron: Stage | Backstage | Audience (authorized performers).
 * Fans get Stage | Audience only (SPLIT_2) — backstage frame stays unassigned.
 */
export function resolvePerformerGreenRoomThreeViewPlan(input: {
  role: string | null | undefined;
  authorizedBackstageMember: boolean;
  backstageVideoConsent: boolean;
  mode?: "ONE_MONITOR" | "MULTI_MONITOR";
}): ThreeViewCompositionPlan {
  const privateGate = mayAccessPrivateGreenRoomSource({
    role: input.role,
    authorizedBackstageMember: input.authorizedBackstageMember,
    backstageVideoConsent: input.backstageVideoConsent,
  });

  const includeBackstage = privateGate.allowed;
  const panels: ThreeViewCompositionPlan["panels"] = [
    {
      panelId: "CURRENT_PERFORMANCE",
      frameId: "a",
      mediaSource: GREEN_ROOM_THREE_VIEW_PANELS.CURRENT_PERFORMANCE.mediaSource,
      label: GREEN_ROOM_THREE_VIEW_PANELS.CURRENT_PERFORMANCE.label,
      include: true,
    },
    {
      panelId: "PRIVATE_BACKSTAGE",
      frameId: "b",
      mediaSource: GREEN_ROOM_THREE_VIEW_PANELS.PRIVATE_BACKSTAGE.mediaSource,
      label: GREEN_ROOM_THREE_VIEW_PANELS.PRIVATE_BACKSTAGE.label,
      include: includeBackstage,
    },
    {
      panelId: "LIVE_AUDIENCE",
      frameId: "c",
      mediaSource: GREEN_ROOM_THREE_VIEW_PANELS.LIVE_AUDIENCE.mediaSource,
      label: GREEN_ROOM_THREE_VIEW_PANELS.LIVE_AUDIENCE.label,
      include: true,
    },
  ];

  if (includeBackstage) {
    return {
      voltronFamily: "PRIMARY_PLUS_STRIP",
      canonicalLayout: "SPLIT_3",
      panels,
      remountWebRtc: false,
      reason:
        input.mode === "MULTI_MONITOR"
          ? "Multi-monitor: same three authorized sources — Stage / Backstage / Audience"
          : "One-monitor Voltron: LIVE STAGE | PRIVATE BACKSTAGE | LIVE AUDIENCE",
    };
  }

  return {
    voltronFamily: "LEFT_RIGHT",
    canonicalLayout: "SPLIT_2",
    panels: panels.map((p) =>
      p.panelId === "LIVE_AUDIENCE" ? { ...p, frameId: "b" as const } : p,
    ),
    remountWebRtc: false,
    reason: "Public-only composition — stage + audience; private Green Room omitted",
  };
}

export function greenRoomCapacityLocks() {
  return {
    MAX_INTERACTIVE_ROOM_MEMBERS,
    MAX_VOLTRON_REFERENCE_SLOTS,
    NEW_GREEN_ROOM_MEDIA_ENGINE,
    FAN_MAY_SUBSCRIBE_PRIVATE_GREEN_ROOM,
    PERFORMER_ACCOUNT_GRANTS_ALL_GREEN_ROOMS,
    LAYOUT_CHANGE_REMOUNTS_WEBRTC,
    REQUIRES_FAN_ACCOUNT_TO_WATCH_PUBLIC,
  };
}
