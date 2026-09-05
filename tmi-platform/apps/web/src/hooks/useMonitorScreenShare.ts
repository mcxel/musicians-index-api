"use client";

/**
 * Canonical monitor screen-share hook — cyclic single-button controller.
 *
 * Law: IDLE → SHARING_SOURCE_1 → … → SHARING_SOURCE_N → IDLE
 * based on actually available/authorized share sources in the session set.
 *
 * - First add may require getDisplayMedia picker.
 * - Switching sources replaces top-surface track only (same live session).
 * - Stop / track.onended restores prior media presentation via callbacks.
 * - Screen audio registers once with the caller-supplied audio owner (no duplicate <audio>).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MonitorShareSlot, ScreenShareErrorCode, ScreenShareSource } from "@/lib/monitors/monitorScreenShareTypes";
import {
  aliveShareSources,
  reduceShareCycle,
  resolveShareButtonLabel,
  type ShareCycleState,
  type ShareSourceDescriptor,
} from "@/lib/monitors/MediaSurfaceLayoutDirector";

export interface UseMonitorScreenShareOptions {
  /** Where to route share when capture starts (default: Monitor A full — top surface). */
  defaultSlot?: MonitorShareSlot;
  /** @deprecated Slot picker is no longer the primary share UX; kept for aux routing. */
  openPickerOnStart?: boolean;
  /** Called when share fully stops so prior media presentation can restore. */
  onShareStopped?: () => void;
  /**
   * Single audio-owner registration. Called with the active share stream's audio
   * track id (or null when cleared). Caller must not create a second <audio>.
   */
  onScreenAudioOwnership?: (payload: {
    sourceId: string | null;
    stream: MediaStream | null;
    hasAudio: boolean;
  }) => void;
}

function makeSourceId(): string {
  return `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDescriptors(sources: ScreenShareSource[]): ShareSourceDescriptor[] {
  return sources.map((s) => ({ id: s.id, label: s.label, alive: s.alive }));
}

export function useMonitorScreenShare(options: UseMonitorScreenShareOptions = {}) {
  const {
    defaultSlot = { monitor: 0, cellIndex: -1 },
    openPickerOnStart = false,
    onShareStopped,
    onScreenAudioOwnership,
  } = options;

  const [sources, setSources] = useState<ScreenShareSource[]>([]);
  const [shareSourceIndex, setShareSourceIndex] = useState<number | null>(null);
  const [shareActive, setShareActive] = useState(false);
  const [shareSlot, setShareSlot] = useState<MonitorShareSlot | null>(null);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [error, setError] = useState<ScreenShareErrorCode>(null);
  const [busy, setBusy] = useState(false);

  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const onShareStoppedRef = useRef(onShareStopped);
  onShareStoppedRef.current = onShareStopped;
  const onAudioRef = useRef(onScreenAudioOwnership);
  onAudioRef.current = onScreenAudioOwnership;

  const cycleState: ShareCycleState = useMemo(
    () => ({
      shareActive,
      shareSourceIndex,
      availableShareSources: toDescriptors(sources),
    }),
    [shareActive, shareSourceIndex, sources],
  );

  const alive = useMemo(() => sources.filter((s) => s.alive), [sources]);
  const activeSource =
    shareActive && shareSourceIndex != null ? alive[shareSourceIndex] ?? null : null;
  const screenStream = activeSource?.stream ?? null;
  const shareButtonLabel = resolveShareButtonLabel(cycleState);

  const applyCycleResult = useCallback(
    (result: ReturnType<typeof reduceShareCycle>, nextSources?: ScreenShareSource[]) => {
      if (nextSources) setSources(nextSources);
      setShareActive(result.next.shareActive);
      setShareSourceIndex(result.next.shareSourceIndex);
      if (!result.next.shareActive) {
        setShareSlot(null);
        setSlotPickerOpen(false);
        onAudioRef.current?.({ sourceId: null, stream: null, hasAudio: false });
        if (result.restoredPrior) onShareStoppedRef.current?.();
      } else if (result.activeSourceId) {
        const src = (nextSources ?? sourcesRef.current).find((s) => s.id === result.activeSourceId);
        if (src) {
          onAudioRef.current?.({
            sourceId: src.id,
            stream: src.stream,
            hasAudio: src.hasAudio,
          });
        }
      }
    },
    [],
  );

  const detachSourceTracks = useCallback((source: ScreenShareSource) => {
    source.stream.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch {
        /* already stopped */
      }
    });
  }, []);

  const markEnded = useCallback(
    (sourceId: string, code: ScreenShareErrorCode = "ended") => {
      const current = sourcesRef.current;
      const descriptors = toDescriptors(current);
      const result = reduceShareCycle(
        {
          shareActive: true,
          shareSourceIndex,
          availableShareSources: descriptors,
        },
        { type: "SOURCE_ENDED", sourceId },
      );
      const nextSources = current.map((s) =>
        s.id === sourceId ? { ...s, alive: false } : s,
      );
      setError(code);
      applyCycleResult(result, nextSources);
      const ended = current.find((s) => s.id === sourceId);
      if (ended) detachSourceTracks(ended);
    },
    [applyCycleResult, detachSourceTracks, shareSourceIndex],
  );

  const captureDisplayMedia = useCallback(async (): Promise<ScreenShareSource | null> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      setError("unsupported");
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const hasAudio = stream.getAudioTracks().length > 0;
      if (!hasAudio) {
        // Video share still valid — surface honest audio state
        setError("audio_unavailable");
      }
      const id = makeSourceId();
      const label = `Screen ${aliveShareSources(toDescriptors(sourcesRef.current)).length + 1}`;
      const source: ScreenShareSource = { id, label, stream, alive: true, hasAudio };

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.addEventListener("ended", () => {
        markEnded(id, "ended");
      });
      videoTrack?.addEventListener("mute", () => {
        if (videoTrack.readyState === "ended") markEnded(id, "track_disconnected");
      });

      return source;
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setError("denied");
      else if (name === "AbortError" || name === "NotFoundError") setError("cancelled");
      else setError("cancelled");
      return null;
    } finally {
      setBusy(false);
    }
  }, [markEnded]);

  const addShareSource = useCallback(async () => {
    const source = await captureDisplayMedia();
    if (!source) return false;
    const result = reduceShareCycle(
      {
        shareActive,
        shareSourceIndex,
        availableShareSources: toDescriptors(sourcesRef.current),
      },
      { type: "ADD_SOURCE", source: { id: source.id, label: source.label, alive: true } },
    );
    const nextSources = [...sourcesRef.current, source];
    applyCycleResult(result, nextSources);
    setShareSlot(defaultSlot);
    if (openPickerOnStart) setSlotPickerOpen(true);
    return true;
  }, [
    applyCycleResult,
    captureDisplayMedia,
    defaultSlot,
    openPickerOnStart,
    shareActive,
    shareSourceIndex,
  ]);

  /** Primary cyclic controller — each press advances or captures. */
  const cycleSharePress = useCallback(async () => {
    const result = reduceShareCycle(
      {
        shareActive,
        shareSourceIndex,
        availableShareSources: toDescriptors(sourcesRef.current),
      },
      { type: "ADVANCE" },
    );

    if (result.needsCapture) {
      return addShareSource();
    }

    if (result.restoredPrior) {
      // Stop all tracks when cycling off
      sourcesRef.current.forEach(detachSourceTracks);
      applyCycleResult(result, sourcesRef.current.map((s) => ({ ...s, alive: false })));
      setError(null);
      return true;
    }

    applyCycleResult(result);
    return true;
  }, [
    addShareSource,
    applyCycleResult,
    detachSourceTracks,
    shareActive,
    shareSourceIndex,
  ]);

  /** @deprecated Prefer cycleSharePress — kept for callers that only start. */
  const startScreenShare = useCallback(async () => {
    if (shareActive) return;
    await addShareSource();
  }, [addShareSource, shareActive]);

  const stopScreenShare = useCallback(() => {
    sourcesRef.current.forEach(detachSourceTracks);
    const result = reduceShareCycle(
      {
        shareActive: true,
        shareSourceIndex,
        availableShareSources: toDescriptors(sourcesRef.current),
      },
      { type: "STOP_ALL" },
    );
    applyCycleResult(
      result,
      sourcesRef.current.map((s) => ({ ...s, alive: false })),
    );
    setError(null);
  }, [applyCycleResult, detachSourceTracks, shareSourceIndex]);

  const pickShareSlot = useCallback((slot: MonitorShareSlot) => {
    setShareSlot(slot);
    setSlotPickerOpen(false);
  }, []);

  const toggleSlotPicker = useCallback(() => {
    setSlotPickerOpen((v) => !v);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Notify audio owner when active source changes
  useEffect(() => {
    if (!activeSource) {
      onAudioRef.current?.({ sourceId: null, stream: null, hasAudio: false });
      return;
    }
    onAudioRef.current?.({
      sourceId: activeSource.id,
      stream: activeSource.stream,
      hasAudio: activeSource.hasAudio,
    });
  }, [activeSource]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sourcesRef.current.forEach((s) => {
        s.stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            /* ignore */
          }
        });
      });
    };
  }, []);

  return {
    /** Active display MediaStream (current cycle index), or null. */
    screenStream,
    /** All authorized share sources in this session (including ended). */
    availableShareSources: sources,
    shareSourceIndex,
    shareActive,
    shareButtonLabel,
    shareSlot,
    slotPickerOpen,
    setSlotPickerOpen,
    error,
    busy,
    clearError,
    /** Cyclic single-button controller. */
    cycleSharePress,
    /** Add another authorized source via getDisplayMedia (same control / picker). */
    addShareSource,
    startScreenShare,
    stopScreenShare,
    pickShareSlot,
    toggleSlotPicker,
  };
}
