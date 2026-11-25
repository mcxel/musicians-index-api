/**
 * Mini-Me vocal cue playback — owner-private HTMLAudioElement + 30fps ARKit viseme drive.
 * Never routes into WebRTC / PROGRAM / room chat. Serves cues via /api/minime/vocal-cue/*
 * (manufacturing artifact path) without flipping LIVE_ASSET_SWITCHES.
 */

import { assertLayerSeparation } from "@/lib/avatars/FaceIdentityGeometryContract";
import type { ArkitWeightMap } from "@/lib/avatars/AvatarFacialComposition";
import type { VisemeFrame30Fps } from "@/lib/avatars/MiniMeCompanionRuntimeService";

export type ManufacturedVocalCueClient = {
  soundId: string;
  filename: string;
  durationSec: number;
  sampleRateHz: 24000;
  pairedClip: string;
  defaultVolume: number;
  visemeFrames: readonly VisemeFrame30Fps[];
  phoneticTranscript?: string;
};

export type VocalCuePlaybackHandle = {
  stop: () => void;
  promise: Promise<{ played: boolean; reason?: string }>;
};

export type VocalCuePlaybackCallbacks = {
  onVisemeFrame?: (weights: ArkitWeightMap, frame: VisemeFrame30Fps) => void;
  onStart?: (cue: ManufacturedVocalCueClient) => void;
  onEnd?: (result: { played: boolean; reason?: string }) => void;
  /** When true, skip audio element (reduced motion / mute) but still drive visemes if allowed. */
  muted?: boolean;
  reducedMotion?: boolean;
  volume?: number;
};

let activeAudio: HTMLAudioElement | null = null;
let activeRaf: number | null = null;

function cancelActive(): void {
  if (activeRaf != null && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(activeRaf);
    activeRaf = null;
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = "";
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
}

export function vocalCuePublicUrl(soundId: string): string {
  return `/api/minime/vocal-cue/${encodeURIComponent(soundId)}`;
}

/**
 * Probe whether a manufactured cue file is reachable (HEAD).
 * Does not claim playback works — only that the route can serve bytes.
 */
export async function probeVocalCueAsset(soundId: string): Promise<{
  reachable: boolean;
  status: number;
  contentType?: string | null;
}> {
  try {
    const res = await fetch(vocalCuePublicUrl(soundId), {
      method: "HEAD",
      credentials: "include",
    });
    return {
      reachable: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type"),
    };
  } catch {
    return { reachable: false, status: 0 };
  }
}

export function visemeFrameToArkitWeights(frame: VisemeFrame30Fps): ArkitWeightMap {
  const w = frame.arkitWeights;
  const expression: ArkitWeightMap = {
    jawOpen: w.jawOpen,
    mouthFunnel: w.mouthFunnel,
    mouthPucker: w.mouthPucker,
    mouthSmileLeft: w.mouthSmileLeft,
    mouthSmileRight: w.mouthSmileRight,
    cheekPuff: w.cheekPuff,
    cheekSquintLeft: w.cheekSquintLeft,
    cheekSquintRight: w.cheekSquintRight,
    browInnerUp: w.browInnerUp,
  };
  const sep = assertLayerSeparation({}, expression);
  if (!sep.ok) {
    // Strip any accidental id_* keys rather than writing identity morphs.
    const cleaned: ArkitWeightMap = {};
    for (const [k, v] of Object.entries(expression)) {
      if (!k.startsWith("id_")) cleaned[k] = v;
    }
    return cleaned;
  }
  return expression;
}

/**
 * Play a manufactured vocal cue locally and drive viseme frames at authored 30fps timing.
 * Owner-private only — caller must not publish this Audio element into venue buses.
 */
export function playManufacturedVocalCue(
  cue: ManufacturedVocalCueClient,
  callbacks: VocalCuePlaybackCallbacks = {},
): VocalCuePlaybackHandle {
  cancelActive();
  let stopped = false;
  const stop = () => {
    stopped = true;
    cancelActive();
    callbacks.onVisemeFrame?.({}, {
      frame: 0,
      timeMs: 0,
      arkitWeights: {
        jawOpen: 0,
        mouthFunnel: 0,
        mouthPucker: 0,
        mouthSmileLeft: 0,
        mouthSmileRight: 0,
        cheekPuff: 0,
        cheekSquintLeft: 0,
        cheekSquintRight: 0,
        browInnerUp: 0,
      },
    });
  };

  const promise = (async (): Promise<{ played: boolean; reason?: string }> => {
    if (typeof window === "undefined") {
      return { played: false, reason: "SSR" };
    }
    callbacks.onStart?.(cue);

    const frames = cue.visemeFrames ?? [];
    const startMs = performance.now();
    const driveVisemes = !callbacks.reducedMotion;

    const tickVisemes = () => {
      if (stopped || !driveVisemes) return;
      const elapsed = performance.now() - startMs;
      let current = frames[0];
      for (const f of frames) {
        if (f.timeMs <= elapsed) current = f;
        else break;
      }
      if (current) {
        callbacks.onVisemeFrame?.(visemeFrameToArkitWeights(current), current);
      }
      if (elapsed < cue.durationSec * 1000 + 50) {
        activeRaf = requestAnimationFrame(tickVisemes);
      } else {
        callbacks.onVisemeFrame?.({}, {
          frame: 0,
          timeMs: 0,
          arkitWeights: {
            jawOpen: 0,
            mouthFunnel: 0,
            mouthPucker: 0,
            mouthSmileLeft: 0,
            mouthSmileRight: 0,
            cheekPuff: 0,
            cheekSquintLeft: 0,
            cheekSquintRight: 0,
            browInnerUp: 0,
          },
        });
      }
    };
    if (driveVisemes && frames.length) {
      activeRaf = requestAnimationFrame(tickVisemes);
    }

    if (callbacks.muted) {
      await new Promise((r) => setTimeout(r, Math.round(cue.durationSec * 1000)));
      const result = { played: false, reason: "MUTED" as const };
      callbacks.onEnd?.(result);
      return result;
    }

    try {
      const audio = new Audio(vocalCuePublicUrl(cue.soundId));
      activeAudio = audio;
      audio.volume = Math.max(
        0,
        Math.min(1, callbacks.volume ?? cue.defaultVolume ?? 0.22),
      );
      // Owner-private local element — never assign to MediaStream / WebRTC tracks.
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        window.setTimeout(resolve, Math.round(cue.durationSec * 1000) + 400);
      });
      if (stopped) {
        const result = { played: false, reason: "STOPPED" as const };
        callbacks.onEnd?.(result);
        return result;
      }
      const result = { played: true as const };
      callbacks.onEnd?.(result);
      return result;
    } catch (err) {
      const result = {
        played: false,
        reason: err instanceof Error ? err.message : "PLAY_FAILED",
      };
      callbacks.onEnd?.(result);
      return result;
    } finally {
      if (activeAudio) {
        try {
          activeAudio.pause();
        } catch {
          /* ignore */
        }
        activeAudio = null;
      }
    }
  })();

  return { stop, promise };
}
