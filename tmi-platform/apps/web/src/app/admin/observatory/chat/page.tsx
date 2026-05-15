"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// AdminObservatoryChat → RuntimeConductorEngine → node:crypto — not usable in client bundles
type RoomAlertSeverity = "info" | "warn" | "critical";
type RoomAlert = { id: string; roomId: string; message: string; severity: RoomAlertSeverity; createdAt: number; resolved: boolean };
type ObservatoryRoomView = { roomId: string; presenceCount: number; botCount: number; messageCount: number; avgSentiment: number; alerts: RoomAlert[] };
type ObservatorySnapshot = { rooms: ObservatoryRoomView[]; totalPresence: number; totalMessages: number; criticalAlerts: number; capturedAt: number };
function getObservatorySnapshot(): ObservatorySnapshot { return { rooms: [], totalPresence: 0, totalMessages: 0, criticalAlerts: 0, capturedAt: Date.now() }; }
function getAllAlerts(): RoomAlert[] { return []; }

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

type AccentKey = "cyan" | "fuchsia" | "amber" | "rose" | "violet" | "emerald";

const ACCENT_BORDER: Record<AccentKey, string> = {
  cyan:    "border-cyan-400/40",
  fuchsia: "border-fuchsia-400/40",
  amber:   "border-amber-400/40",
  rose:    "border-rose-400/40",
  violet:  "border-violet-400/40",
  emerald: "border-emerald-400/40",
};

function Card({
  title,
  children,
  accent = "cyan",
}: {
  title: string;
  children: React.ReactNode;
  accent?: AccentKey;
}) {
  return (
    <section className={`rounded-xl border bg-black/40 p-4 backdrop-blur ${ACCENT_BORDER[accent]}`}>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/90">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminObservatoryChatPage() {
  const [snapshot, setSnapshot] = useState<ObservatorySnapshot>(() => getObservatorySnapshot());
  const [alerts, setAlerts] = useState<RoomAlert[]>(() => getAllAlerts());

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(getObservatorySnapshot());
      setAlerts(getAllAlerts());
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const rooms = snapshot.rooms;

  const chatFlowRows = useMemo(
    () =>
      rooms.map((room) => {
        const totalSignals = Object.values(room.intentSummary.distribution).reduce((a, b) => a + b, 0);
        return {
          roomId: room.roomId,
          rate: Math.round(totalSignals / Math.max(1, room.intentSummary.windowMs / 60_000)),
          dominant: room.intentSummary.dominantIntent,
          engagement: room.intentSummary.engagementScore,
        };
      }),
    [rooms],
  );

  const reactionBurstRows = useMemo(
    () =>
      rooms.map((room) => ({
        roomId: room.roomId,
        hype: room.intentSummary.hypeScore,
        boo: room.intentSummary.booScore,
        momentum: room.momentumHypeLevel,
      })),
    [rooms],
  );

  const intentDistRows = useMemo(
    () =>
      rooms.map((room) => {
        const dist = room.intentSummary.distribution;
        const sorted = (Object.entries(dist) as [string, number][])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);
        return { roomId: room.roomId, top: sorted };
      }),
    [rooms],
  );

  const cameraRows = useMemo(
    () =>
      rooms.map((room) => ({
        roomId: room.roomId,
        mode: room.cameraFocus.mode,
        intensity: room.cameraFocus.intensityScore,
        directive: room.cameraFocus.shotDirective ?? "—",
        triggerIntent: room.cameraFocus.triggerIntent ?? "—",
      })),
    [rooms],
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">Admin Observatory</p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-cyan-300">Chat Observatory</h1>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
              Rooms: {rooms.length} · Occupancy: {snapshot.totalOccupancy} · Gifts: {snapshot.totalActiveGifts} · Runtime Conflicts: {snapshot.totalRuntimeConflicts} · Captured: {fmtTime(snapshot.capturedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/observatory"
              className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-200"
            >
              Observatory Home
            </Link>
            <Link
              href="/admin/observatory/runtime"
              className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-200"
            >
              Runtime Timeline
            </Link>
            <Link
              href="/admin/moderation"
              className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rose-200"
            >
              Moderation
            </Link>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">

          {/* ── Room Heat Monitor ─────────────────────────────────────── */}
          <Card title="Room Heat Monitor" accent="amber">
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={`heat-${room.roomId}`} className="flex items-center justify-between rounded border border-white/10 px-3 py-2 text-xs">
                  <span className="font-mono text-zinc-200">{room.roomId}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-amber-400"
                        style={{ width: `${room.population.heatLevel}%` }}
                      />
                    </div>
                    <span className="font-black text-amber-300">{room.population.heatLevel}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Chat Flow Monitor ─────────────────────────────────────── */}
          <Card title="Chat Flow Monitor" accent="cyan">
            <div className="space-y-2">
              {chatFlowRows.map((row) => (
                <div key={`flow-${row.roomId}`} className="grid grid-cols-4 gap-2 rounded border border-white/10 px-3 py-2 text-xs">
                  <span className="font-mono text-zinc-200">{row.roomId}</span>
                  <span className="text-cyan-200">{row.rate}/min</span>
                  <span className="uppercase text-zinc-300">{row.dominant}</span>
                  <span className="text-emerald-200">{row.engagement}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Reaction Burst Stream ─────────────────────────────────── */}
          <Card title="Reaction Burst Stream" accent="fuchsia">
            <div className="space-y-2">
              {reactionBurstRows.map((row) => (
                <div key={`burst-${row.roomId}`} className="grid grid-cols-4 gap-2 rounded border border-white/10 px-3 py-2 text-xs">
                  <span className="font-mono text-zinc-200">{row.roomId}</span>
                  <span className="text-fuchsia-300">Hype {row.hype}%</span>
                  <span className="text-rose-300">Boo {row.boo}%</span>
                  <span className="text-cyan-300">Mom. {row.momentum}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Crowd Intent Distribution ─────────────────────────────── */}
          <Card title="Crowd Intent Distribution" accent="violet">
            <div className="space-y-2">
              {intentDistRows.map((row) => (
                <div key={`intent-${row.roomId}`} className="rounded border border-white/10 px-3 py-2 text-xs">
                  <span className="font-mono text-violet-300">{row.roomId}</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {row.top.map(([intent, count]) => (
                      <span
                        key={intent}
                        className="rounded border border-violet-400/30 bg-violet-950/40 px-2 py-0.5 font-mono uppercase tracking-wider text-violet-200"
                      >
                        {intent} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Camera Focus State ────────────────────────────────────── */}
          <Card title="Camera Focus State" accent="cyan">
            <div className="space-y-2">
              {cameraRows.map((row) => {
                const roomMeta = rooms.find((room) => room.roomId === row.roomId);
                return (
                  <div key={`cam-${row.roomId}`} className="grid grid-cols-5 gap-2 rounded border border-white/10 px-3 py-2 text-xs">
                    <span className="font-mono text-zinc-200">{row.roomId}</span>
                    <span className="font-black uppercase text-cyan-300">{row.mode}</span>
                    <span className="text-zinc-400">{row.intensity}%</span>
                    <span className="truncate text-zinc-500">{row.directive}</span>
                    <span className={roomMeta?.cameraAuthorityGranted ? 'text-emerald-300' : 'text-rose-300'}>
                      {roomMeta?.cameraAuthorityGranted ? 'authority-ok' : 'authority-blocked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── Runtime Authority + Recovery ─────────────────────────── */}
          <Card title="Runtime Authority & Recovery" accent="rose">
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={`runtime-${room.roomId}`} className="rounded border border-rose-300/20 bg-rose-950/20 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-zinc-200">{room.roomId}</span>
                    <span className={room.runtimeBlocked ? 'uppercase text-rose-300' : 'uppercase text-emerald-300'}>
                      {room.runtimeBlocked ? 'blocked' : 'healthy'}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-300">conflicts: {room.runtimeConflictCount}</p>
                  <p className="mt-0.5 text-zinc-400">recovery: {room.runtimeRecoveryActions.length ? room.runtimeRecoveryActions.join(', ') : 'none'}</p>
                </div>
              ))}
              {snapshot.blockedRuntimeRooms.length > 0 ? (
                <div className="rounded border border-rose-400/30 bg-rose-900/20 px-3 py-2 text-xs text-rose-200">
                  Blocked rooms: {snapshot.blockedRuntimeRooms.join(', ')}
                </div>
              ) : null}
            </div>
          </Card>

          {/* ── Safety Events ─────────────────────────────────────────── */}
          <Card title="Safety Events" accent="rose">
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <div className="rounded border border-white/10 px-3 py-2 text-xs text-zinc-400">No active safety/moderation alerts.</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded border border-rose-300/20 bg-rose-950/20 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-zinc-200">{alert.roomId}</span>
                      <span className="uppercase text-rose-300">{alert.severity}</span>
                    </div>
                    <p className="mt-1 text-zinc-300">{alert.message}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-500">{fmtTime(alert.timestampMs)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* ── Sponsor Gift Events ───────────────────────────────────── */}
          <Card title="Sponsor Gift Events" accent="emerald">
            <div className="space-y-2">
              {snapshot.activeGifts.length === 0 ? (
                <div className="rounded border border-white/10 px-3 py-2 text-xs text-zinc-400">No active sponsor gifts.</div>
              ) : (
                snapshot.activeGifts.map((gift) => (
                  <div key={gift.id} className="rounded border border-emerald-400/20 bg-emerald-950/20 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-emerald-300">{gift.title}</span>
                      <span className="text-emerald-200">{gift.valueDisplay}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-zinc-400">{gift.sponsorName}</span>
                      <span className="font-mono text-zinc-300">{gift.claimedCount}/{gift.totalSupply} claimed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* ── Live Billboard Preview Activity ───────────────────────── */}
          <Card title="Live Billboard Preview Activity" accent="amber">
            <div className="space-y-2">
              {snapshot.activeBillboards.length === 0 ? (
                <div className="rounded border border-white/10 px-3 py-2 text-xs text-zinc-400">No active billboard previews.</div>
              ) : (
                snapshot.activeBillboards.map((bb) => (
                  <div key={bb.slotId} className="rounded border border-amber-400/20 bg-amber-950/20 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-amber-300">{bb.slotId}</span>
                      {bb.previewContent ? (
                        <span className="uppercase text-zinc-300">{bb.previewContent.type}</span>
                      ) : null}
                    </div>
                    {bb.previewContent ? (
                      <p className="mt-1 text-zinc-300">{bb.previewContent.title}</p>
                    ) : null}
                    {bb.roomId ? (
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-zinc-500">Room: {bb.roomId}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </main>
  );
}
