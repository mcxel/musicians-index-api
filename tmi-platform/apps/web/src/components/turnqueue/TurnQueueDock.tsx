"use client";

import React from "react";
import { useTurnQueue } from "@/components/turnqueue/TurnQueueProvider";

export default function TurnQueueDock() {
  const {
    isOpen,
    queue,
    currentTurnId,
    isTurnLocked,
    closeQueue,
    nextTurn,
    releaseTurnLock,
  } = useTurnQueue();

  if (!isOpen) return null;

  const currentTurn = queue.find((item) => item.id === currentTurnId);

  return (
    <aside className="pointer-events-auto fixed bottom-6 left-6 z-[68] w-[300px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-cyan-400/40 bg-black/85 shadow-[0_0_24px_rgba(34,211,238,0.22)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-400/30 px-3 py-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-200">Turn Queue</p>
          <p className="text-sm font-semibold text-white">Queue: {queue.length}</p>
        </div>
        <button
          type="button"
          onClick={closeQueue}
          className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
          aria-label="Close turn queue"
          title="Close turn queue"
        >
          Close
        </button>
      </div>

      <div className="space-y-2 p-3 text-xs">
        <div className="rounded border border-white/10 bg-white/5 p-2 text-slate-200">
          <div>Current: {currentTurn ? currentTurn.name : "—"}</div>
          <div>Lock: {isTurnLocked ? "LOCKED" : "UNLOCKED"}</div>
        </div>

        <div className="max-h-32 space-y-1 overflow-auto">
          {queue.length === 0 ? (
            <p className="rounded border border-white/10 bg-white/5 p-2 text-slate-400">Queue is empty</p>
          ) : (
            queue.map((participant) => {
              const isCurrent = participant.id === currentTurnId;
              return (
                <div key={participant.id} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-200">
                  <span className="font-medium">{participant.name}</span>
                  <span className="ml-2 text-slate-400">{participant.role ?? "member"}</span>
                  {isCurrent ? <span className="ml-2 text-emerald-300">(current)</span> : null}
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={nextTurn}
            className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white hover:bg-white/20"
            aria-label="Advance to next turn"
            title="Advance to next turn"
          >
            Next Turn
          </button>
          <button
            type="button"
            onClick={releaseTurnLock}
            className="rounded border border-white/20 bg-white/10 px-2 py-1 text-white hover:bg-white/20"
            aria-label="Release turn lock"
            title="Release turn lock"
          >
            Release Lock
          </button>
        </div>
      </div>
    </aside>
  );
}
