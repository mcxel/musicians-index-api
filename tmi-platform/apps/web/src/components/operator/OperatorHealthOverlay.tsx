"use client";

import React, { useState } from "react";
import { useAudio } from "@/components/AudioProvider";
import { useSharedPreview } from "@/components/preview/SharedPreviewProvider";
import { useTurnQueue } from "@/components/turnqueue/TurnQueueProvider";
import { useRoomWatchdog } from "@/components/watchdog/RoomWatchdogProvider";
import { useSessionRecovery } from "@/components/recovery/SessionRecoveryProvider";

function healthClass(health: string) {
  if (health === "healthy") return "text-emerald-300";
  if (health === "warning") return "text-amber-300";
  if (health === "degraded") return "text-orange-300";
  return "text-rose-300";
}

export default function OperatorHealthOverlay() {
  const [isOpen, setIsOpen] = useState(true);

  const { currentTrack, isPlaying } = useAudio();
  const { isOpen: previewOpen, content: previewContent } = useSharedPreview();
  const { queue, currentTurnId } = useTurnQueue();
  const { roomStatus, healthState } = useRoomWatchdog();
  const { recoveryMode, isResumable } = useSessionRecovery();

  return (
    <aside className="pointer-events-auto fixed right-4 top-16 z-[77] w-[290px] max-w-[calc(100vw-1rem)]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-2 rounded border border-violet-300/35 bg-black/75 px-3 py-1 text-xs font-medium text-violet-200 backdrop-blur hover:bg-black/90"
        aria-label={isOpen ? "Collapse operator health overlay" : "Expand operator health overlay"}
        title={isOpen ? "Collapse operator health overlay" : "Expand operator health overlay"}
      >
        Operator Health
      </button>

      {isOpen ? (
        <div className="rounded-xl border border-violet-400/35 bg-black/85 p-3 text-xs text-slate-200 shadow-[0_0_24px_rgba(139,92,246,0.25)] backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-white">Runtime Health</p>
            <span className={`font-semibold uppercase ${healthClass(healthState)}`}>{healthState}</span>
          </div>

          <div className="space-y-1 rounded border border-white/10 bg-white/5 p-2">
            <p>Audio: {currentTrack ? (isPlaying ? "playing" : "paused") : "idle"}</p>
            <p>Preview: {previewOpen ? (previewContent?.status ?? "open") : "closed"}</p>
            <p>Queue: {queue.length}</p>
            <p>Current Turn: {currentTurnId ?? "—"}</p>
            <p>Room Status: {roomStatus}</p>
            <p>Recovery: {recoveryMode}</p>
            <p>Resumable: {isResumable ? "yes" : "no"}</p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
