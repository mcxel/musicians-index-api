/**
 * Lounge / chevron context-ring actions for a participant identity.
 * Thin model consumed by ParticipantMediaContextMenu. No 3D lounge implied.
 */

import type { PersonalMediaRouter } from "./PersonalMediaRouter";
import {
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  MONITOR_A_ID,
  MONITOR_B_ID,
  SLOT_MAIN,
  SPLIT_SLOT_IDS,
  type MonitorTarget,
} from "./types";

export type ParticipantMediaMenuActionId =
  | "WATCH_ON"
  | "PIN_AUDIO"
  | "UNPIN_AUDIO"
  | "MUTE_FOR_ME"
  | "UNMUTE_FOR_ME"
  | "HIDE_VIDEO_FOR_ME"
  | "RESTORE_VIDEO_FOR_ME"
  | "REMOVE_FROM_MY_VIEW"
  | "PROFILE"
  | "PRIVATE_TALK"
  | "MOVE_TO"
  | "REMOVE_FROM_MONITOR";

export type ParticipantMediaMenuItem = {
  id: ParticipantMediaMenuActionId;
  label: string;
  command?: string;
  href?: string;
  targets?: MonitorTarget[];
  participantId: string;
};

export type ParticipantMediaMenuOptions = {
  profileHref?: string;
  privateTalkAvailable?: boolean;
};

function isAssignedTo(router: PersonalMediaRouter, participantId: string): MonitorTarget[] {
  return router
    .getSnapshot()
    .assignments.filter((row) => row.identity.participantId === participantId)
    .map((row) => row.target);
}

export function availableSplitSlots(
  router: PersonalMediaRouter,
  monitorId: string,
): MonitorTarget[] {
  return SPLIT_SLOT_IDS.map((slotId) => ({ monitorId, slotId })).filter(
    (target) => router.getMonitorAssignment(target) === null,
  );
}

export function getParticipantMediaMenu(
  router: PersonalMediaRouter,
  participantId: string,
  options: ParticipantMediaMenuOptions = {},
): ParticipantMediaMenuItem[] {
  const identity = router.getParticipant(participantId);
  if (!identity) return [];

  const snapshot = router.getSnapshot();
  const assigned = isAssignedTo(router, participantId);
  const pinned = snapshot.pinnedAudio.some((p) => p.participantId === participantId);
  const muted = snapshot.mutedPeople.some((p) => p.participantId === participantId);
  const hidden = snapshot.hiddenVideo.some((p) => p.participantId === participantId);

  const watchTargets: MonitorTarget[] = [
    DEFAULT_MONITOR_A,
    DEFAULT_MONITOR_B,
    ...availableSplitSlots(router, MONITOR_A_ID),
    ...availableSplitSlots(router, MONITOR_B_ID),
  ];

  const items: ParticipantMediaMenuItem[] = [
    {
      id: "WATCH_ON",
      label: "WATCH ON",
      command: "MEDIA.ASSIGN_TO_MONITOR",
      targets: watchTargets,
      participantId,
    },
  ];

  if (assigned.length > 0) {
    items.push({
      id: "MOVE_TO",
      label: "MOVE TO",
      command: "MEDIA.ASSIGN_TO_MONITOR",
      targets: watchTargets.filter(
        (t) =>
          !assigned.some((a) => a.monitorId === t.monitorId && a.slotId === t.slotId),
      ),
      participantId,
    });
    items.push({
      id: "REMOVE_FROM_MONITOR",
      label: "REMOVE FROM MONITOR",
      command: "MEDIA.REMOVE_FROM_MONITOR",
      targets: assigned,
      participantId,
    });
  }

  items.push({
    id: pinned ? "UNPIN_AUDIO" : "PIN_AUDIO",
    label: pinned ? "UNPIN AUDIO" : "PIN AUDIO",
    command: pinned ? "MEDIA.UNPIN_AUDIO" : "MEDIA.PIN_AUDIO",
    participantId,
  });

  items.push({
    id: muted ? "UNMUTE_FOR_ME" : "MUTE_FOR_ME",
    label: muted ? "UNMUTE FOR ME" : "MUTE FOR ME",
    command: muted ? "MEDIA.UNMUTE_LOCAL" : "MEDIA.MUTE_LOCAL",
    participantId,
  });

  items.push({
    id: hidden ? "RESTORE_VIDEO_FOR_ME" : "HIDE_VIDEO_FOR_ME",
    label: hidden ? "RESTORE VIDEO FOR ME" : "HIDE VIDEO FOR ME",
    command: hidden ? "MEDIA.RESTORE_VIDEO_LOCAL" : "MEDIA.HIDE_VIDEO_LOCAL",
    participantId,
  });

  items.push({
    id: "REMOVE_FROM_MY_VIEW",
    label: "REMOVE FROM MY VIEW",
    command: "MEDIA.REMOVE_FROM_VIEW",
    participantId,
  });

  if (options.profileHref) {
    items.push({
      id: "PROFILE",
      label: "PROFILE",
      href: options.profileHref,
      participantId,
    });
  }

  if (options.privateTalkAvailable) {
    items.push({
      id: "PRIVATE_TALK",
      label: "PRIVATE TALK",
      command: "LOUNGE_PRIVATE_TALK",
      participantId,
    });
  }

  return items;
}

export function labelMonitorTarget(target: MonitorTarget): string {
  const monitor =
    target.monitorId === MONITOR_A_ID
      ? "Monitor A"
      : target.monitorId === MONITOR_B_ID
        ? "Monitor B"
        : target.monitorId;
  if (target.slotId === SLOT_MAIN) return monitor;
  return `${monitor} ${target.slotId.replace("slot-", "slot ")}`;
}
