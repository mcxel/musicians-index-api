"use client";

/**
 * Hub live privacy — separate preview vs publication (engineering controls, not legal advice).
 * Defaults ALL false on load. Never calls getUserMedia from this module's store ctor.
 *
 * MUTE vs OFF (product law):
 * - While PUBLISHED: toggles MUTE tracks via enabled=false (keep WebRTC / session alive).
 * - While LOCAL_PREVIEW: OFF stops & releases hardware tracks — UI OFF must never leave capture active.
 */

import { create } from "zustand";
import { getStageSnapshot } from "@/lib/live/StageLifecycleEngine";

export interface LivePrivacyState {
  cameraPreviewActive: boolean;
  micPreviewActive: boolean;
  isLivePublished: boolean;
  previewStream: MediaStream | null;
  /** Canonical world roomId after GO LIVE — fans join this same id via FAN_AVATAR_LOBBY. */
  publishedRoomId: string | null;
  setCameraPreviewActive: (active: boolean) => void;
  setMicPreviewActive: (active: boolean) => void;
  setPreviewStream: (stream: MediaStream | null) => void;
  markLivePublished: (roomId: string) => void;
  clearLivePublished: () => void;
  releasePreviewTracks: () => void;
  syncPreviewTracks: () => void;
  /** Preview-only: stop video tracks (true OFF). No-op while published (use mute). */
  stopCameraHardware: () => void;
  /** Preview-only: stop audio tracks (true OFF). No-op while published (use mute). */
  stopMicHardware: () => void;
}

function stopStreamTracks(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

function stopKind(stream: MediaStream | null | undefined, kind: "video" | "audio") {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    if (track.kind === kind) {
      track.stop();
      stream.removeTrack(track);
    }
  });
}

export const useLivePrivacyState = create<LivePrivacyState>((set, get) => ({
  cameraPreviewActive: false,
  micPreviewActive: false,
  isLivePublished: false,
  previewStream: null,
  publishedRoomId: null,

  setCameraPreviewActive: (active) => set({ cameraPreviewActive: active }),

  setMicPreviewActive: (active) => {
    set({ micPreviewActive: active });
    get().syncPreviewTracks();
  },

  setPreviewStream: (stream) => {
    const prev = get().previewStream;
    if (prev && prev !== stream) stopStreamTracks(prev);
    set({ previewStream: stream });
    get().syncPreviewTracks();
  },

  markLivePublished: (roomId) => {
    set({ isLivePublished: true, publishedRoomId: roomId });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:golive", { detail: { roomId, source: "hub-monitor-live" } }),
      );
    }
  },

  clearLivePublished: () => {
    const roomId = get().publishedRoomId;
    set({ isLivePublished: false, publishedRoomId: null });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:endbroadcast", { detail: { roomId: roomId ?? undefined } }),
      );
    }
  },

  releasePreviewTracks: () => {
    const { previewStream, isLivePublished, cameraPreviewActive, micPreviewActive } = get();
    if (isLivePublished) return;
    if (cameraPreviewActive || micPreviewActive) return;
    stopStreamTracks(previewStream);
    set({ previewStream: null });
  },

  stopCameraHardware: () => {
    const { previewStream, isLivePublished } = get();
    if (isLivePublished || !previewStream) return;
    stopKind(previewStream, "video");
    set({ cameraPreviewActive: false });
    const remaining = previewStream.getTracks().filter((t) => t.readyState !== "ended");
    if (remaining.length === 0) {
      set({ previewStream: null });
    }
  },

  stopMicHardware: () => {
    const { previewStream, isLivePublished } = get();
    if (isLivePublished || !previewStream) return;
    stopKind(previewStream, "audio");
    set({ micPreviewActive: false });
    const remaining = previewStream.getTracks().filter((t) => t.readyState !== "ended");
    if (remaining.length === 0) {
      set({ previewStream: null });
    }
  },

  syncPreviewTracks: () => {
    const { previewStream, isLivePublished, cameraPreviewActive, micPreviewActive } = get();
    if (!previewStream) return;
    // While LIVE: MUTE via enabled (keep hardware for WebRTC continuity).
    if (isLivePublished) {
      const audienceMicMuted = getStageSnapshot().audienceMicMuted;
      previewStream.getVideoTracks().forEach((track) => {
        if (track.readyState === "live") track.enabled = cameraPreviewActive;
      });
      previewStream.getAudioTracks().forEach((track) => {
        if (track.readyState === "live") track.enabled = micPreviewActive && !audienceMicMuted;
      });
      return;
    }
    previewStream.getVideoTracks().forEach((track) => {
      if (track.readyState === "live") track.enabled = cameraPreviewActive;
    });
    previewStream.getAudioTracks().forEach((track) => {
      if (track.readyState === "live") track.enabled = micPreviewActive;
    });
  },
}));

/** Request local camera/mic preview — explicit user action only. */
export async function requestHubCameraPreview(): Promise<{ ok: boolean; error?: string }> {
  const state = useLivePrivacyState.getState();
  if (state.previewStream) {
    const hasVideo = state.previewStream.getVideoTracks().some((t) => t.readyState === "live");
    const hasAudio = state.previewStream.getAudioTracks().some((t) => t.readyState === "live");
    if (hasVideo && hasAudio) {
      state.setCameraPreviewActive(true);
      state.setMicPreviewActive(true);
      state.syncPreviewTracks();
      return { ok: true };
    }
    // Partial stream after OFF — reacquire missing kinds.
    stopStreamTracks(state.previewStream);
    state.setPreviewStream(null);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
    useLivePrivacyState.getState().setPreviewStream(stream);
    useLivePrivacyState.getState().setCameraPreviewActive(true);
    useLivePrivacyState.getState().setMicPreviewActive(Boolean(stream.getAudioTracks()[0]));
    return { ok: true };
  } catch (err) {
    const denied =
      err instanceof Error &&
      (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      error: denied
        ? "Camera/mic permission denied."
        : timedOut
          ? "Camera/mic request timed out."
          : "Could not access camera/mic.",
    };
  }
}

export async function toggleHubMicPreview(): Promise<void> {
  const state = useLivePrivacyState.getState();
  if (state.isLivePublished) {
    // MUTE while published — do not tear WebRTC.
    if (!state.previewStream) {
      const result = await requestHubCameraPreview();
      if (!result.ok) return;
    }
    useLivePrivacyState.getState().setMicPreviewActive(!useLivePrivacyState.getState().micPreviewActive);
    useLivePrivacyState.getState().syncPreviewTracks();
    return;
  }
  if (!state.previewStream || !state.micPreviewActive) {
    const result = await requestHubCameraPreview();
    if (!result.ok) return;
    useLivePrivacyState.getState().setMicPreviewActive(true);
    return;
  }
  // OFF — release mic hardware so UI OFF never leaves capture active.
  state.stopMicHardware();
  if (!useLivePrivacyState.getState().cameraPreviewActive) {
    useLivePrivacyState.getState().releasePreviewTracks();
  }
}

export async function toggleHubCameraPreview(): Promise<void> {
  const state = useLivePrivacyState.getState();
  if (state.isLivePublished) {
    if (!state.previewStream) {
      await requestHubCameraPreview();
      return;
    }
    useLivePrivacyState.getState().setCameraPreviewActive(!state.cameraPreviewActive);
    useLivePrivacyState.getState().syncPreviewTracks();
    return;
  }
  if (!state.previewStream || !state.cameraPreviewActive) {
    await requestHubCameraPreview();
    return;
  }
  // OFF — release camera hardware.
  state.stopCameraHardware();
  if (!useLivePrivacyState.getState().micPreviewActive) {
    useLivePrivacyState.getState().releasePreviewTracks();
  }
}
