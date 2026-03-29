"use client";

import React, { useState } from "react";
import { useAudio } from "@/components/AudioProvider";
import { useSharedPreview } from "@/components/preview/SharedPreviewProvider";
import { useTurnQueue } from "@/components/turnqueue/TurnQueueProvider";
import { useRoomWatchdog } from "@/components/watchdog/RoomWatchdogProvider";

export default function LiveControlPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const { currentTrack, isPlaying, play, pause } = useAudio();
  const { isOpen: previewOpen, openPreview, closePreview } = useSharedPreview();
  const {
    isOpen: queueOpen,
    queue,
    openQueue,
    closeQueue,
    enqueue,
    nextTurn,
    releaseTurnLock,
  } = useTurnQueue();
  const { roomStatus, setRoomStatus, healthState } = useRoomWatchdog();

  const toggleAudio = () => {
    if (isPlaying) {
      pause();
      return;
    }
    if (currentTrack) {
      play();
    }
  };

  const openDemoPreview = () => {
    openPreview({
      sourceType: "artist-media",
      title: "Preview Scaffold",
      subtitle: "Live Control Panel",
      status: "live",
    });
  };

  const seedQueue = () => {
    enqueue({ id: "artist-a", name: "Artist A", role: "artist" });
    enqueue({ id: "artist-b", name: "Artist B", role: "artist" });
  };

  return (
    <div className="pointer-events-auto fixed left-4 top-12 z-[76]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded border border-cyan-300/40 bg-black/75 px-3 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur hover:bg-black/90"
        aria-label={isOpen ? "Close live control panel" : "Open live control panel"}
        title={isOpen ? "Close live control panel" : "Open live control panel"}
      >
        Live Ctrl
      </button>

      {isOpen ? (
        <div className="mt-2 w-[320px] rounded-xl border border-cyan-400/35 bg-black/85 p-3 text-xs text-slate-200 shadow-[0_0_24px_rgba(34,211,238,0.25)] backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-white">Live Control Panel</p>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase">scaffold</span>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              disabled={!currentTrack}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlaying ? "Pause Audio" : "Play Audio"}
            </button>
            <button
              type="button"
              onClick={previewOpen ? closePreview : openDemoPreview}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
            >
              {previewOpen ? "Close Preview" : "Open Preview"}
            </button>
            <button
              type="button"
              onClick={queueOpen ? closeQueue : openQueue}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
            >
              {queueOpen ? "Close Queue" : "Open Queue"}
            </button>
            <button
              type="button"
              onClick={seedQueue}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
            >
              Seed Queue
            </button>
            <button
              type="button"
              onClick={nextTurn}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
            >
              Next Turn
            </button>
            <button
              type="button"
              onClick={releaseTurnLock}
              className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
            >
              Release Lock
            </button>
          </div>

          <div className="space-y-1 rounded border border-white/10 bg-white/5 p-2">
            <p>Health: <span className="font-semibold uppercase">{healthState}</span></p>
            <p>Room Status: <span className="font-semibold uppercase">{roomStatus}</span></p>
            <p>Queue Size: <span className="font-semibold">{queue.length}</span></p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setRoomStatus("idle")}
                className="rounded border border-white/20 bg-white/10 px-2 py-1 text-[10px] text-white"
              >
                idle
              </button>
              <button
                type="button"
                onClick={() => setRoomStatus("active")}
                className="rounded border border-white/20 bg-white/10 px-2 py-1 text-[10px] text-white"
              >
                active
              </button>
              <button
                type="button"
                onClick={() => setRoomStatus("paused")}
                className="rounded border border-white/20 bg-white/10 px-2 py-1 text-[10px] text-white"
              >
                paused
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
