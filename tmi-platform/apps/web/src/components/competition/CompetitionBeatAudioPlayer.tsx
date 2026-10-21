"use client";

/**
 * CompetitionBeatAudioPlayer — mounts the real <audio> element for the
 * attached competition beat and attaches it to the canonical "music" mixer
 * channel (Step 2B.1 closure repair, 2026-09-24).
 *
 * Closes the gap documented in EventAudioDuckingCoordinator/
 * TMIAudioSafetyMixer: winner-ducking math had a real, connected GainNode
 * but no audio source ever attached to it because no component played the
 * authorized event-stream beat URL. This is that missing player.
 *
 * - Plays only the authorized EVENT_PLAYBACK stream URL (never a raw master).
 * - Starts at the Pocket Drop cue offset (BeatPocketDropAuthority) instead
 *   of assuming 0.
 * - Loops only within the reported safe boundaries (isSafeLoopable +
 *   loopStartMs/loopEndMs) — never a blind/arbitrary loop.
 * - Reuses the existing TMIAudioSafetyMixer singleton via
 *   attachMusicElement/detachMusicElement — does not create a second
 *   AudioContext or a second mixer authority.
 */

import { useEffect, useRef } from "react";
import type { AttachedBeatRef } from "@/lib/competition/CompetitionBeatRoomEngine";
import { attachMusicElement, detachMusicElement } from "@/lib/audio/mixer/LiveRoomMixerBind";

type Props = {
  attached: AttachedBeatRef | null | undefined;
};

export default function CompetitionBeatAudioPlayer({ attached }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const attachedUrl = attached?.playbackStreamUrl ?? attached?.audioUrl ?? null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !attachedUrl) return;

    attachMusicElement(el);

    const cueOffsetSeconds =
      attached?.cueOffsetSeconds ?? (attached?.cueOffsetMs ? attached.cueOffsetMs / 1000 : 0);

    function seekToCue() {
      if (el && cueOffsetSeconds > 0 && el.currentTime < cueOffsetSeconds) {
        el.currentTime = cueOffsetSeconds;
      }
    }

    function retryPlayOnGesture() {
      void el?.play().catch(() => {});
    }

    el.addEventListener("loadedmetadata", seekToCue);
    void el.play().catch(() => {
      // Autoplay blocked — resume on the next real user interaction.
      window.addEventListener("pointerdown", retryPlayOnGesture, { once: true });
    });

    return () => {
      el.removeEventListener("loadedmetadata", seekToCue);
      window.removeEventListener("pointerdown", retryPlayOnGesture);
      detachMusicElement();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const canLoop = Boolean(
      attached?.isSafeLoopable &&
        typeof attached?.loopStartMs === "number" &&
        typeof attached?.loopEndMs === "number" &&
        attached.loopEndMs > attached.loopStartMs,
    );
    if (!canLoop) return;

    const loopStartSeconds = attached!.loopStartMs! / 1000;
    const loopEndSeconds = attached!.loopEndMs! / 1000;

    function onTimeUpdate() {
      if (el && el.currentTime >= loopEndSeconds) {
        el.currentTime = loopStartSeconds;
      }
    }

    el.addEventListener("timeupdate", onTimeUpdate);
    return () => el.removeEventListener("timeupdate", onTimeUpdate);
  }, [attached]);

  if (!attachedUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={attachedUrl}
      preload="auto"
      // The safety mixer graph owns the audible output; this element's own
      // volume must stay at 1 so it doesn't fight the mixer's music gain.
      style={{ display: "none" }}
      data-tmi-role="competition-beat-audio"
    />
  );
}
