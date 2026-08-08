"use client";

import { useCallback, useState } from "react";
import type { MonitorShareSlot } from "@/lib/monitors/monitorScreenShareTypes";

export interface UseMonitorScreenShareOptions {
  /** Where to route share when capture starts (default: Monitor B full). */
  defaultSlot?: MonitorShareSlot;
  /** Open slot picker immediately after a successful capture. */
  openPickerOnStart?: boolean;
}

export function useMonitorScreenShare(options: UseMonitorScreenShareOptions = {}) {
  const {
    defaultSlot = { monitor: 1, cellIndex: -1 },
    openPickerOnStart = true,
  } = options;

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [shareSlot, setShareSlot] = useState<MonitorShareSlot | null>(null);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);

  const startScreenShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setScreenStream(null);
        setShareSlot(null);
        setSlotPickerOpen(false);
      });
      setScreenStream(stream);
      setShareSlot(defaultSlot);
      setSlotPickerOpen(openPickerOnStart);
    } catch {
      // user cancelled or denied
    }
  }, [defaultSlot, openPickerOnStart]);

  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
    setShareSlot(null);
    setSlotPickerOpen(false);
  }, [screenStream]);

  const pickShareSlot = useCallback((slot: MonitorShareSlot) => {
    setShareSlot(slot);
    setSlotPickerOpen(false);
  }, []);

  const toggleSlotPicker = useCallback(() => {
    setSlotPickerOpen((v) => !v);
  }, []);

  return {
    screenStream,
    shareSlot,
    slotPickerOpen,
    setSlotPickerOpen,
    startScreenShare,
    stopScreenShare,
    pickShareSlot,
    toggleSlotPicker,
  };
}
