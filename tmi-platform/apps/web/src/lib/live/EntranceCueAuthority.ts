/**
 * Subtle entrance notification cues — NOT a loud boxing bell by default.
 *
 * REGULAR LIVE guest admit → soft SINGLE ding (ui_copper_bell)
 * COMPETITION challenger reveal → soft DOUBLE ding (ui_digital_bell ×2)
 *
 * Reuses playSound + SoundManifest. Respects mute via SoundSystemEngine settings.
 * Deduplicates by eventId. Never remounts WebRTC / mic / camera.
 */

import { playSound } from "@/lib/sound/playSound";
import { getSoundById } from "@/lib/sound/SoundManifest";

export type EntranceCueKind = "REGULAR_GUEST" | "COMPETITION_CHALLENGER";

export type EntranceCuePlan = {
  kind: EntranceCueKind;
  soundIds: string[];
  playCount: 1 | 2;
  defaultVolumeHint: number;
  visualAnnouncement: string;
  loudBoxingBellForbidden: true;
  webrtcIntact: true;
  experienceOverrideSoundId: string | null;
};

const playedEvents = new Set<string>();

const EXPERIENCE_SOUND_OVERRIDES: Record<string, string> = {
  // Future-configurable; default remains soft digital/copper bells
  // BATTLE: soft double ding (default)
  // SONG_CHALLENGE: could later map to a musical sting when licensed asset exists
};

export function planEntranceCue(input: {
  kind: EntranceCueKind;
  experienceKind?: string | null;
}): EntranceCuePlan {
  const exp = (input.experienceKind ?? "").toUpperCase();
  const override = EXPERIENCE_SOUND_OVERRIDES[exp] ?? null;

  if (input.kind === "REGULAR_GUEST") {
    return {
      kind: "REGULAR_GUEST",
      soundIds: [override ?? "ui_copper_bell"],
      playCount: 1,
      defaultVolumeHint: 0.35,
      visualAnnouncement: "Guest joined",
      loudBoxingBellForbidden: true,
      webrtcIntact: true,
      experienceOverrideSoundId: override,
    };
  }

  return {
    kind: "COMPETITION_CHALLENGER",
    soundIds: [override ?? "ui_digital_bell", override ?? "ui_digital_bell"],
    playCount: 2,
    defaultVolumeHint: 0.4,
    visualAnnouncement: "New challenger entering",
    loudBoxingBellForbidden: true,
    webrtcIntact: true,
    experienceOverrideSoundId: override,
  };
}

export function emitEntranceCue(input: {
  eventId: string;
  kind: EntranceCueKind;
  experienceKind?: string | null;
  muted?: boolean;
}): {
  played: boolean;
  reason: string;
  plan: EntranceCuePlan;
  visualOnly: boolean;
} {
  const plan = planEntranceCue(input);
  if (playedEvents.has(input.eventId)) {
    return { played: false, reason: "DUPLICATE_EVENT_SUPPRESSED", plan, visualOnly: true };
  }
  playedEvents.add(input.eventId);

  if (input.muted) {
    return { played: false, reason: "MUTED_VISUAL_ONLY", plan, visualOnly: true };
  }

  let anyPlayed = false;
  for (const id of plan.soundIds) {
    const entry = getSoundById(id);
    if (!entry) continue;
    try {
      playSound(id);
      anyPlayed = true;
    } catch {
      // autoplay restrictions — visual fallback remains
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:entrance-cue", {
        detail: {
          eventId: input.eventId,
          kind: input.kind,
          announcement: plan.visualAnnouncement,
          soundPlayed: anyPlayed,
        },
      }),
    );
  }

  return {
    played: anyPlayed,
    reason: anyPlayed ? "CUE_EMITTED" : "SOUND_UNAVAILABLE_VISUAL_ONLY",
    plan,
    visualOnly: !anyPlayed,
  };
}

export function resetEntranceCuesForTests(): void {
  playedEvents.clear();
}
