/**
 * Voltron Automatic Composition Bridge
 *
 * Binds AdaptiveVoltronPresentationDirector ↔ canonicalMediaPlayerRuntime
 * using VoltronAutomaticCompositionPolicy. Layout-only — never remounts WebRTC.
 *
 * Cursor ownership: wire existing 1–16 refs + peer-call accept path.
 * Claude owns server 13-member admission + SFU subscriptions.
 */

import {
  useAdaptiveVoltronStore,
  type VoltronCompositionFamily,
} from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import {
  useCanonicalMediaPlayerRuntime,
  type LayoutMode,
  type MediaSource,
} from "@/lib/media/canonicalMediaPlayerRuntime";
import {
  resolveAutomaticVoltronComposition,
  resolveThreeWayVoltronPlan,
  VOLTRON_THREE_WAY_PANELS,
  type AutoCompositionEvent,
  type FanViewingMode,
} from "@/lib/monitors/VoltronAutomaticCompositionPolicy";
import { resolvePerformerGreenRoomThreeViewPlan } from "@/lib/live/PerformerGreenRoomThreeViewPolicy";

export const VOLTRON_AUTO_COMPOSITION_BRIDGE_ID =
  "VOLTRON_AUTO_COMPOSITION_BRIDGE_v1" as const;

export type SyncVoltronCompositionResult = {
  applied: boolean;
  event: AutoCompositionEvent;
  voltronFamily: VoltronCompositionFamily;
  canonicalLayout: LayoutMode;
  remountWebRtc: false;
  autoPublishCamera: false;
  reason: string;
};

function mapEventFromFriendDelta(
  acceptedFriendCount: number,
  previousCount: number,
): AutoCompositionEvent {
  if (acceptedFriendCount === 0) {
    return previousCount > 0 ? "ALL_CALLS_ENDED" : "SHOW_ONLY";
  }
  if (previousCount === 0 && acceptedFriendCount >= 1) return "FRIEND_CALL_ACCEPTED";
  if (acceptedFriendCount < previousCount) return "FRIEND_LEFT";
  return "FRIEND_JOINED";
}

/**
 * Apply auto-reflow after accepted call / friend join / leave / end.
 * Does not publish camera/mic. Does not remount media sessions.
 */
export function syncVoltronAutoComposition(input?: {
  event?: AutoCompositionEvent;
  fanMode?: FanViewingMode;
  pinned?: boolean;
  previousFriendCount?: number;
}): SyncVoltronCompositionResult {
  const voltron = useAdaptiveVoltronStore.getState();
  const acceptedFriendCount = voltron.friends.length;
  const previous = input?.previousFriendCount ?? acceptedFriendCount;
  const event =
    input?.event ?? mapEventFromFriendDelta(acceptedFriendCount, previous);

  const userPinnedLayout = input?.pinned === true || !voltron.isAutoLayout;

  const plan = resolveAutomaticVoltronComposition({
    event: userPinnedLayout ? "USER_PINNED" : event,
    acceptedFriendCount,
    pinned: userPinnedLayout,
    fanMode: input?.fanMode,
  });

  // Auto layout: update Voltron family. Pinned: preserve composition, still sync canonical only if needed.
  if (!userPinnedLayout && voltron.composition !== plan.voltronFamily) {
    useAdaptiveVoltronStore.getState().setComposition(plan.voltronFamily);
  }

  const runtime = useCanonicalMediaPlayerRuntime.getState();
  if (!userPinnedLayout && runtime.layout !== plan.canonicalLayout) {
    runtime.setLayout(plan.canonicalLayout);
  }

  return {
    applied: true,
    event: plan.event,
    voltronFamily: plan.voltronFamily,
    canonicalLayout: plan.canonicalLayout,
    remountWebRtc: false,
    autoPublishCamera: false,
    reason: plan.reason,
  };
}

/**
 * Bind MY CAMERA | PERFORMER | AUDIENCE into one monitor (SPLIT_3).
 * Sources are labels/assignments only — streams stay on existing authorities.
 */
export function applyThreeWayVoltronComposition(): SyncVoltronCompositionResult {
  const plan = resolveThreeWayVoltronPlan();
  const runtime = useCanonicalMediaPlayerRuntime.getState();

  const bindings: Array<{ frameId: "a" | "b" | "c"; source: MediaSource; label: string }> = [
    {
      frameId: VOLTRON_THREE_WAY_PANELS.MY_CAMERA.canonicalDefaultFrame,
      source: "SELF_CAMERA",
      label: VOLTRON_THREE_WAY_PANELS.MY_CAMERA.label,
    },
    {
      frameId: VOLTRON_THREE_WAY_PANELS.PERFORMER.canonicalDefaultFrame,
      source: "PERFORMER_FEED",
      label: VOLTRON_THREE_WAY_PANELS.PERFORMER.label,
    },
    {
      frameId: VOLTRON_THREE_WAY_PANELS.AUDIENCE.canonicalDefaultFrame,
      source: "AUDIENCE_VIEW",
      label: VOLTRON_THREE_WAY_PANELS.AUDIENCE.label,
    },
  ];

  for (const b of bindings) {
    runtime.assignSource(b.frameId, b.source);
  }

  runtime.setLayout(plan.canonicalLayout);
  useAdaptiveVoltronStore.getState().setComposition(plan.voltronFamily);

  // Addressable 16-ref panels: keep experience on 1-a; label three-way on M1 a/b/c.
  useAdaptiveVoltronStore.setState((s) => ({
    panels: s.panels.map((p) => {
      if (p.id === "panel-1-a") {
        return {
          ...p,
          occupancy: "LIVE_EVENT_LOCKED" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "self-camera-preview",
          label: "MY CAMERA",
        };
      }
      if (p.id === "panel-1-b") {
        return {
          ...p,
          occupancy: "OCCUPIED_REPLACEABLE" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "performer-program-feed",
          label: "PERFORMER",
        };
      }
      if (p.id === "panel-1-c") {
        return {
          ...p,
          occupancy: "OCCUPIED_REPLACEABLE" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "audience-mosaic",
          label: "AUDIENCE",
        };
      }
      return p;
    }),
    composition: plan.voltronFamily,
  }));

  return {
    applied: true,
    event: plan.event,
    voltronFamily: plan.voltronFamily,
    canonicalLayout: plan.canonicalLayout,
    remountWebRtc: false,
    autoPublishCamera: false,
    reason: plan.reason,
  };
}

/** Show-director beat → composition only (competition events must be server-authoritative upstream). */
export function applyShowDirectorBeat(
  event: Extract<
    AutoCompositionEvent,
    "BATTLE_ACTIVE" | "CYPHER_ACTIVE" | "AUDIENCE_FEATURE" | "VOTING" | "WINNER" | "NEXT_CHALLENGER"
  >,
): SyncVoltronCompositionResult {
  return syncVoltronAutoComposition({ event, previousFriendCount: useAdaptiveVoltronStore.getState().friends.length });
}

/**
 * Performer Green Room three-view: LIVE STAGE | PRIVATE BACKSTAGE | LIVE AUDIENCE.
 * Private backstage assign only when mayAccessPrivateGreenRoomSource allows.
 * Layout-only — no WebRTC remount.
 */
export function applyPerformerGreenRoomThreeView(input: {
  role: string | null | undefined;
  authorizedBackstageMember: boolean;
  backstageVideoConsent: boolean;
  mode?: "ONE_MONITOR" | "MULTI_MONITOR";
}): SyncVoltronCompositionResult & { privateBackstageIncluded: boolean } {
  const plan = resolvePerformerGreenRoomThreeViewPlan(input);
  const runtime = useCanonicalMediaPlayerRuntime.getState();

  for (const p of plan.panels) {
    if (!p.include) continue;
    runtime.assignSource(p.frameId, p.mediaSource);
  }

  runtime.setLayout(plan.canonicalLayout);
  useAdaptiveVoltronStore.getState().setComposition(plan.voltronFamily);

  const includeBackstage = plan.panels.some(
    (p) => p.panelId === "PRIVATE_BACKSTAGE" && p.include,
  );

  useAdaptiveVoltronStore.setState((s) => ({
    panels: s.panels.map((panel) => {
      if (panel.id === "panel-1-a") {
        return {
          ...panel,
          occupancy: "LIVE_EVENT_LOCKED" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "public-stage-program",
          label: "LIVE STAGE",
        };
      }
      if (panel.id === "panel-1-b") {
        if (!includeBackstage) {
          return {
            ...panel,
            occupancy: "OCCUPIED_REPLACEABLE" as const,
            sourceType: "EXPERIENCE" as const,
            sourceId: "audience-venue-view",
            label: "LIVE AUDIENCE",
          };
        }
        return {
          ...panel,
          occupancy: "OCCUPIED_REPLACEABLE" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "private-green-room-mosaic",
          label: "PRIVATE BACKSTAGE",
        };
      }
      if (panel.id === "panel-1-c" && includeBackstage) {
        return {
          ...panel,
          occupancy: "OCCUPIED_REPLACEABLE" as const,
          sourceType: "EXPERIENCE" as const,
          sourceId: "audience-venue-view",
          label: "LIVE AUDIENCE",
        };
      }
      return panel;
    }),
    composition: plan.voltronFamily,
    monitorMode: input.mode === "MULTI_MONITOR" ? "DUAL" : s.monitorMode,
  }));

  return {
    applied: true,
    event: "SHOW_ONLY",
    voltronFamily: plan.voltronFamily,
    canonicalLayout: plan.canonicalLayout,
    remountWebRtc: false,
    autoPublishCamera: false,
    reason: plan.reason,
    privateBackstageIncluded: includeBackstage,
  };
}
