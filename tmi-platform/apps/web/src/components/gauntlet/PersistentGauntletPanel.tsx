"use client";

/**
 * PersistentGauntletPanel.tsx — Target 3: Persistent Gauntlet HUD Surface
 * Displays real-time Belt Holder, Active Match Stage, Queue Dock, and Split Action Controls.
 *
 * State is server-authoritative (see /api/gauntlet/state, /api/gauntlet/resolve —
 * both backed by PersistentGauntletEngine.ts). This panel only fetches/posts to
 * those routes; it never imports the engine directly. Importing it directly
 * would give each browser tab its own private copy of the engine's in-memory
 * state (it's bundled into the client and re-evaluated per page load), so two
 * fans in the same room would see two disconnected queues instead of one
 * shared gauntlet.
 */

import { useState, useEffect, useCallback } from "react";
import type { PersistentGauntletState } from "@/lib/gauntlet/PersistentGauntletEngine";

export interface PersistentGauntletPanelProps {
  roomId: string;
  currentUserId: string;
  currentDisplayName: string;
  className?: string;
}

const POLL_MS = 4000;

export default function PersistentGauntletPanel({
  roomId,
  currentUserId,
  className = "",
}: PersistentGauntletPanelProps) {
  const [state, setState] = useState<PersistentGauntletState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    fetch(`/api/gauntlet/state?roomId=${encodeURIComponent(roomId)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setState(d.state);
      })
      .catch(() => undefined);
  }, [roomId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const isQueued = Boolean(state?.queue.some((c) => c.userId === currentUserId));

  const handleToggleQueue = async () => {
    if (busy || !currentUserId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gauntlet/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: isQueued ? "leave" : "enqueue", roomId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Request failed");
      setState(data.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const handleResolveWinner = async (winnerId: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gauntlet/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId, winnerId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Request failed");
      setState(data.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (!state) {
    return (
      <div
        data-persistent-gauntlet={roomId}
        className={`p-4 rounded-2xl border bg-black/60 text-white/40 text-xs text-center ${className}`}
        style={{ borderColor: "rgba(255, 107, 0, 0.4)" }}
      >
        Loading gauntlet…
      </div>
    );
  }

  const { belt, activeMatch, queue, history } = state;

  return (
    <div
      data-persistent-gauntlet={roomId}
      className={`flex flex-col gap-3 p-4 rounded-2xl border bg-gradient-to-b from-[#0e0416] via-[#06020a] to-[#020005] text-white ${className}`}
      style={{ borderColor: "rgba(255, 107, 0, 0.4)", boxShadow: "0 0 25px rgba(255, 107, 0, 0.15)" }}
    >
      {/* Top Belt Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-[#FF6B00]/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🏆</span>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#FF6B00] uppercase tracking-widest">
              {belt.beltTitle}
            </span>
            <span className="text-sm font-black text-amber-300">
              {belt.championName ? `CHAMPION: ${belt.championName}` : "VACANT BELT"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-extrabold text-white/50 uppercase">DEFENSE STREAK</span>
          <span className="text-xs font-black text-emerald-400">
            {belt.defensesCount}x STREAK
          </span>
        </div>
      </div>

      {/* Active Match Stage */}
      {activeMatch ? (
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-col items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <span className="text-[8px] font-black text-amber-400 uppercase">CHAMPION STAGE</span>
            <span className="text-xs font-bold my-1">{belt.championName}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleResolveWinner(activeMatch.championId)}
              className="text-[9px] font-black uppercase px-3 py-1 rounded bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            >
              Defend (+1)
            </button>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <span className="text-[8px] font-black text-cyan-400 uppercase">CHALLENGER STAGE</span>
            <span className="text-xs font-bold my-1">Challenger</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleResolveWinner(activeMatch.challengerId)}
              className="text-[9px] font-black uppercase px-3 py-1 rounded bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-50"
            >
              Crown Challenger
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
          Waiting for next challenger in queue...
        </div>
      )}

      {/* Queue & Action Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-[8px] font-extrabold text-white/40 uppercase">GAUNTLET QUEUE</span>
          <span className="text-xs font-bold">{queue.length} Challengers Waiting</span>
        </div>

        {currentUserId ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleToggleQueue}
            className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${
              isQueued
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-gradient-to-r from-[#FF6B00] to-amber-400 text-black shadow-lg"
            }`}
          >
            {isQueued ? "Leave Gauntlet Line" : "Step Up To Gauntlet →"}
          </button>
        ) : (
          <span className="text-[9px] font-bold text-white/30 uppercase">Sign in to join the line</span>
        )}
      </div>

      {error && (
        <div className="text-[9px] font-bold text-red-400 text-center">{error}</div>
      )}

      {/* Recent Match History */}
      {history.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[8px] font-black text-white/30 uppercase">RECENT BELT MATCHES</span>
          {history.slice(0, 3).map((m) => (
            <div
              key={m.matchId}
              className="flex items-center justify-between text-[9px] text-white/60 p-1.5 rounded bg-white/5"
            >
              <span>Match #{m.matchId.slice(-4)}</span>
              <span className="font-bold text-amber-300">Winner Stays ({m.defensesAtTime}x)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
