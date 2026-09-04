/**
 * PersonalMediaCommandBus — typed MEDIA.* commands for client-local curation.
 *
 * HudCommandBus is a real generic bus; MEDIA commands stay on this dedicated
 * bus and can optionally bind onto HudCommandBus for HUD execute() paths.
 * Commands never POST to room authority and never reconnect WebRTC.
 */

import type { PersonalMediaRouter } from "./PersonalMediaRouter";
import { defaultPersonalMediaRouter } from "./PersonalMediaRouter";
import type { MonitorTarget } from "./types";

export const PERSONAL_MEDIA_COMMANDS = [
  "MEDIA.ASSIGN_TO_MONITOR",
  "MEDIA.REMOVE_FROM_MONITOR",
  "MEDIA.SWAP_MONITOR_ASSIGNMENTS",
  "MEDIA.PIN_AUDIO",
  "MEDIA.UNPIN_AUDIO",
  "MEDIA.MUTE_LOCAL",
  "MEDIA.UNMUTE_LOCAL",
  "MEDIA.HIDE_VIDEO_LOCAL",
  "MEDIA.RESTORE_VIDEO_LOCAL",
  "MEDIA.REMOVE_FROM_VIEW",
  "MEDIA.RESTORE_TO_VIEW",
  "MEDIA.RESTORE_ALL",
] as const;

export type PersonalMediaCommand = (typeof PERSONAL_MEDIA_COMMANDS)[number];

export type PersonalMediaCommandPayloadMap = {
  "MEDIA.ASSIGN_TO_MONITOR": { participantId: string; target: MonitorTarget; privateSocial?: boolean };
  "MEDIA.REMOVE_FROM_MONITOR": { target: MonitorTarget };
  "MEDIA.SWAP_MONITOR_ASSIGNMENTS": { a: MonitorTarget; b: MonitorTarget };
  "MEDIA.PIN_AUDIO": { participantId: string };
  "MEDIA.UNPIN_AUDIO": { participantId: string };
  "MEDIA.MUTE_LOCAL": { participantId: string };
  "MEDIA.UNMUTE_LOCAL": { participantId: string };
  "MEDIA.HIDE_VIDEO_LOCAL": { participantId: string };
  "MEDIA.RESTORE_VIDEO_LOCAL": { participantId: string };
  "MEDIA.REMOVE_FROM_VIEW": { participantId: string };
  "MEDIA.RESTORE_TO_VIEW": { participantId: string };
  "MEDIA.RESTORE_ALL": Record<string, never> | undefined;
};

export type HudLikeCommandBus = {
  register: (
    actionId: string,
    handler: (payload: { actionId: string; params?: Record<string, unknown> }) => boolean | Promise<boolean>,
  ) => () => void;
};

export class PersonalMediaCommandBus {
  constructor(private readonly router: PersonalMediaRouter = defaultPersonalMediaRouter) {}

  getRouter(): PersonalMediaRouter {
    return this.router;
  }

  execute<K extends PersonalMediaCommand>(
    command: K,
    payload?: PersonalMediaCommandPayloadMap[K],
  ): boolean {
    switch (command) {
      case "MEDIA.ASSIGN_TO_MONITOR": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.ASSIGN_TO_MONITOR"] | undefined;
        if (!p?.participantId || !p.target) return false;
        const result = this.router.assignToMonitor(p.participantId, p.target, {
          privateSocial: p.privateSocial === true,
        });
        return result.ok;
      }
      case "MEDIA.REMOVE_FROM_MONITOR": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.REMOVE_FROM_MONITOR"] | undefined;
        if (!p?.target) return false;
        return this.router.removeFromMonitor(p.target).ok;
      }
      case "MEDIA.SWAP_MONITOR_ASSIGNMENTS": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.SWAP_MONITOR_ASSIGNMENTS"] | undefined;
        if (!p?.a || !p.b) return false;
        return this.router.swapMonitorAssignments(p.a, p.b);
      }
      case "MEDIA.PIN_AUDIO": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.PIN_AUDIO"];
        return this.router.pinAudio(p.participantId);
      }
      case "MEDIA.UNPIN_AUDIO": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.UNPIN_AUDIO"];
        return this.router.unpinAudio(p.participantId);
      }
      case "MEDIA.MUTE_LOCAL": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.MUTE_LOCAL"];
        return this.router.muteLocal(p.participantId);
      }
      case "MEDIA.UNMUTE_LOCAL": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.UNMUTE_LOCAL"];
        return this.router.unmuteLocal(p.participantId);
      }
      case "MEDIA.HIDE_VIDEO_LOCAL": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.HIDE_VIDEO_LOCAL"];
        return this.router.hideVideoLocal(p.participantId);
      }
      case "MEDIA.RESTORE_VIDEO_LOCAL": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.RESTORE_VIDEO_LOCAL"];
        return this.router.restoreVideoLocal(p.participantId);
      }
      case "MEDIA.REMOVE_FROM_VIEW": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.REMOVE_FROM_VIEW"];
        return this.router.removeFromView(p.participantId);
      }
      case "MEDIA.RESTORE_TO_VIEW": {
        const p = payload as PersonalMediaCommandPayloadMap["MEDIA.RESTORE_TO_VIEW"];
        return this.router.restoreToView(p.participantId);
      }
      case "MEDIA.RESTORE_ALL": {
        this.router.restoreAll();
        return true;
      }
      default:
        return false;
    }
  }

  /**
   * Optional HUD glue. Registers MEDIA.* on an existing HudCommandBus-shaped bus.
   * Does not replace HudCommandBus; lounge HUD can execute either path.
   */
  bindToHudBus(hud: HudLikeCommandBus): () => void {
    const unsubs = PERSONAL_MEDIA_COMMANDS.map((command) =>
      hud.register(command, (payload) => {
        return this.execute(command, payload.params as PersonalMediaCommandPayloadMap[typeof command]);
      }),
    );
    return () => unsubs.forEach((unsub) => unsub());
  }
}

export const defaultPersonalMediaCommandBus = new PersonalMediaCommandBus(
  defaultPersonalMediaRouter,
);

export function createPersonalMediaCommandBus(
  router: PersonalMediaRouter = defaultPersonalMediaRouter,
): PersonalMediaCommandBus {
  return new PersonalMediaCommandBus(router);
}
