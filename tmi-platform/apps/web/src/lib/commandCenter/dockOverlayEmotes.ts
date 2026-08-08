/**
 * Role-separated Command Center dock overlays (Rule 26).
 * Fan = crowd-origin reactions; Performer = stage-origin appreciation bursts.
 * Distinct IDs — never recolor the same asset for both roles.
 */

import { ingestSignal } from "@/lib/personality/CrowdReactionEngine";
import { emitAudienceReaction, type TmiAudienceReaction } from "@/lib/audience/tmiAudienceReactionEngine";
import { emitStageEvent } from "@/lib/venue/StageEnergyEngine";

export type DockOverlayRole = "fan" | "performer";

export interface DockOverlayEmoteDef {
  id: string;
  label: string;
  emoji: string;
  accent: string;
}

/** Audience / seat-origin motion language */
export const FAN_DOCK_OVERLAY_EMOTES: DockOverlayEmoteDef[] = [
  { id: "fan_crowd_heart_burst", label: "Hearts", emoji: "💜", accent: "#AA2DFF" },
  { id: "fan_crowd_applause_wave", label: "Applause", emoji: "👏", accent: "#00E5FF" },
  { id: "fan_crowd_fire_streak", label: "Fire", emoji: "🔥", accent: "#FF6B35" },
  { id: "fan_crowd_hype_jump", label: "Hype", emoji: "🙌", accent: "#FFD700" },
  { id: "fan_crowd_lights_up", label: "Lights", emoji: "🔦", accent: "#00FF88" },
  { id: "fan_crowd_signs_held", label: "Signs", emoji: "📣", accent: "#FF2DAA" },
];

/** Stage / performer-origin cascading appreciation */
export const PERFORMER_DOCK_OVERLAY_EMOTES: DockOverlayEmoteDef[] = [
  { id: "perf_stage_thank_you", label: "Thank You", emoji: "🙏", accent: "#FFD700" },
  { id: "perf_stage_appreciate", label: "Appreciate", emoji: "🤝", accent: "#00E5FF" },
  { id: "perf_stage_love_cascade", label: "Love", emoji: "💖", accent: "#FF2DAA" },
  { id: "perf_stage_salute", label: "Salute", emoji: "🫡", accent: "#AA2DFF" },
  { id: "perf_stage_crowd_love", label: "Crowd Love", emoji: "❤️‍🔥", accent: "#FF5722" },
];

const FAN_REACTION_MAP: Record<string, TmiAudienceReaction> = {
  fan_crowd_heart_burst: "heart",
  fan_crowd_applause_wave: "clap",
  fan_crowd_fire_streak: "fire",
  fan_crowd_hype_jump: "cheer",
  fan_crowd_lights_up: "cheer",
  fan_crowd_signs_held: "chat",
};

const PERFORMER_STAGE_MAP: Record<string, "ad-lib" | "crowd-sing-along" | "encore-call"> = {
  perf_stage_thank_you: "ad-lib",
  perf_stage_appreciate: "crowd-sing-along",
  perf_stage_love_cascade: "crowd-sing-along",
  perf_stage_salute: "ad-lib",
  perf_stage_crowd_love: "encore-call",
};

export function dockEmotesForRole(role: DockOverlayRole): DockOverlayEmoteDef[] {
  return role === "performer" ? PERFORMER_DOCK_OVERLAY_EMOTES : FAN_DOCK_OVERLAY_EMOTES;
}

export function triggerDockOverlayEmote(opts: {
  role: DockOverlayRole;
  emoteId: string;
  roomId: string;
  userId: string;
}): boolean {
  const { role, emoteId, roomId, userId } = opts;
  if (!roomId || !userId) return false;

  if (role === "fan") {
    const reaction = FAN_REACTION_MAP[emoteId];
    if (!reaction) return false;
    ingestSignal(roomId, reaction === "fire" ? "emoji-storm" : "cheer", 1);
    emitAudienceReaction({ roomId, fanId: userId, reaction });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:command-center:fan-overlay", {
          detail: { emoteId, roomId, userId },
        }),
      );
    }
    return true;
  }

  const stageEvent = PERFORMER_STAGE_MAP[emoteId];
  if (!stageEvent) return false;
  emitStageEvent(roomId, stageEvent);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:command-center:performer-overlay", {
        detail: { emoteId, roomId, userId },
      }),
    );
  }
  return true;
}
