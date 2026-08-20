"use client";

/**
 * Hub live privacy — separate preview vs publication (engineering controls, not legal advice).
 * Defaults ALL false on load. Never calls getUserMedia from this module.
 */

import { create } from "zustand";

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
}

function stopStreamTracks(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
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
    set({ isLivePublished: false, publishedRoomId: null });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tmi:endbroadcast"));
    }
  },

  releasePreviewTracks: () => {
    const { previewStream, isLivePublished, cameraPreviewActive, micPreviewActive } = get();
    if (isLivePublished) return;
    if (cameraPreviewActive || micPreviewActive) return;
    stopStreamTracks(previewStream);
    set({ previewStream: null });
  },

  syncPreviewTracks: () => {
    const { previewStream, isLivePublished, cameraPreviewActive, micPreviewActive } = get();
    if (!previewStream || isLivePublished) return;
    previewStream.getVideoTracks().forEach((track) => {
      track.enabled = cameraPreviewActive;
    });
    previewStream.getAudioTracks().forEach((track) => {
      track.enabled = micPreviewActive;
    });
  },
}));

/** Request local camera/mic preview — explicit user action only. */
export async function requestHubCameraPreview(): Promise<{ ok: boolean; error?: string }> {
  const state = useLivePrivacyState.getState();
  if (state.previewStream) {
    state.setCameraPreviewActive(true);
    state.syncPreviewTracks();
    return { ok: true };
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
  if (!state.previewStream) {
    const result = await requestHubCameraPreview();
    if (!result.ok) return;
    useLivePrivacyState.getState().setMicPreviewActive(true);
    return;
  }
  state.setMicPreviewActive(!state.micPreviewActive);
}

export async function toggleHubCameraPreview(): Promise<void> {
  const state = useLivePrivacyState.getState();
  if (!state.previewStream) {
    await requestHubCameraPreview();
    return;
  }
  const next = !state.cameraPreviewActive;
  state.setCameraPreviewActive(next);
  if (!next && !state.micPreviewActive && !state.isLivePublished) {
    state.releasePreviewTracks();
  }
}
