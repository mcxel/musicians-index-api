'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

// RuntimeConductorEngine uses Node.js-only APIs (node:crypto) — fetch via API route instead
type RuntimeConductorSnapshot = {
  roomId: ChatRoomId;
  updatedAtMs: number;
  performanceState: { state: string };
  crowdEmotion: { hype: number; excitement: number; boredom: number; anticipation: number };
  lighting: { colorMode: string; intensity: number };
  stageFx: { confetti: boolean; pyrotechnics: boolean; fog: number; lasers: number };
  camera: { plan: { mode: string }; authorityGranted: boolean; reason: string };
  authority: { conflictCount: number; duplicateOrchestratorDetected: boolean };
  recovery: { healthy: boolean; actions: string[] };
};
function listRuntimeConductorSnapshots(): RuntimeConductorSnapshot[] { return []; }

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function Card({ title, children, accent = 'cyan' }: { title: string; children: React.ReactNode; accent?: string }) {
  const colors: Record<string, string> = {
    cyan: 'border-cyan-400/40',
    fuchsia: 'border-fuchsia-400/40',
    amber: 'border-amber-400/40',
    rose: 'border-rose-400/40',
    emerald: 'border-emerald-400/40',
  };
  return (
    <section className={`rounded-xl border bg-black/40 p-4 backdrop-blur ${colors[accent] ?? colors.cyan}`}>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/90">{title}</h2>
      {children}
    </section>
  );
}

export default function RuntimeTimelinePage() {
  const [snapshots, setSnapshots] = useState<RuntimeConductorSnapshot[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<ChatRoomId | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshots(listRuntimeConductorSnapshots());
      setTick((t) => t + 1);
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const roomIds = [...new Set(snapshots.map((s) => s.roomId))] as ChatRoomId[];
  const selectedSnapshots = selectedRoomId ? snapshots.filter((s) => s.roomId === selectedRoomId) : snapshots;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">Admin Observatory</p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-cyan-300">Runtime Timeline Playback</h1>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
              Live conductor snapshots · {snapshots.length} total · Refresh: {fmtTime(Date.now())}
            </p>
          </div>
          <Link
            href="/admin/observatory/chat"
            className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-200"
          >
            Back to Observatory
          </Link>
        </header>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Room selector – 3 cols */}
          <Card title="Room Selection" accent="fuchsia">
            <div className="space-y-2">
              <button
                onClick={() => setSelectedRoomId(null)}
                className={`w-full rounded-lg px-3 py-2 text-xs font-bold text-left transition ${
                  selectedRoomId === null ? 'bg-fuchsia-500/30 border border-fuchsia-400/60 text-fuchsia-200' : 'bg-white/5 border border-white/10 text-zinc-300 hover:border-fuchsia-400/40'
                }`}
              >
                All Rooms ({roomIds.length})
              </button>
              {roomIds.map((roomId) => {
                const count = snapshots.filter((s) => s.roomId === roomId).length;
                return (
                  <button
                    key={roomId}
                    onClick={() => setSelectedRoomId(roomId)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-bold text-left transition ${
                      selectedRoomId === roomId ? 'bg-fuchsia-500/30 border border-fuchsia-400/60 text-fuchsia-200' : 'bg-white/5 border border-white/10 text-zinc-300 hover:border-fuchsia-400/40'
                    }`}
                  >
                    {roomId} ({count})
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Timeline – 9 cols */}
          <div className="lg:col-span-9 space-y-4">
            {/* Conductor State Timeline */}
            <Card title="Conductor State Timeline" accent="cyan">
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No conductor snapshots captured yet.</div>
                ) : (
                  selectedSnapshots
                    .slice(-50)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-cyan-400/30 pl-3 py-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-cyan-300">{fmtTime(snap.updatedAtMs)}</span>
                          <span className="text-zinc-400">{snap.roomId}</span>
                        </div>
                        <div className="mt-1 text-zinc-400">
                          Performance: <span className="text-amber-300">{snap.performanceState.state}</span> · Hype:{' '}
                          <span className="text-fuchsia-300">{snap.crowdEmotion.hype}%</span> · Lighting:{' '}
                          <span className="text-yellow-300">{snap.lighting.colorMode}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* Camera Decision History */}
            <Card title="Camera Decision History" accent="cyan">
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No camera decisions captured yet.</div>
                ) : (
                  selectedSnapshots
                    .slice(-30)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`cam-${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-cyan-400/30 pl-3 py-1 text-xs bg-black/30 rounded-r px-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-200">{fmtTime(snap.updatedAtMs)}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-cyan-300">{snap.camera.plan.mode}</span>
                            <span className={snap.camera.authorityGranted ? 'text-emerald-300 text-[10px]' : 'text-rose-300 text-[10px]'}>
                              {snap.camera.authorityGranted ? 'authority-ok' : 'blocked'}
                            </span>
                          </div>
                        </div>
                        <p className="mt-0.5 text-zinc-400">{snap.camera.reason}</p>
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* FX + Lighting Transitions */}
            <Card title="FX & Lighting Transitions" accent="amber">
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No FX transitions captured yet.</div>
                ) : (
                  selectedSnapshots
                    .slice(-30)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`fx-${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-amber-400/30 pl-3 py-1 text-xs bg-black/30 rounded-r px-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-amber-200">{fmtTime(snap.updatedAtMs)}</span>
                          <span className="text-zinc-400">Lighting</span>
                        </div>
                        <p className="mt-0.5">
                          intensity: <span className="text-amber-300">{snap.lighting.intensity}%</span> · mode:{' '}
                          <span className="text-amber-300">{snap.lighting.colorMode}</span>
                        </p>
                        <p className="mt-0.5 text-zinc-500">
                          FX: {snap.stageFx.confetti ? 'confetti ' : ''}{snap.stageFx.pyrotechnics ? 'pyro ' : ''}fog: {snap.stageFx.fog}% · lasers:{' '}
                          {snap.stageFx.lasers}%
                        </p>
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* Authority Handoff History */}
            <Card title="Authority Handoff History" accent="rose">
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No authority conflicts captured yet.</div>
                ) : (
                  selectedSnapshots
                    .filter((snap) => snap.authority.conflictCount > 0)
                    .slice(-20)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`auth-${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-rose-400/30 pl-3 py-1 text-xs bg-rose-950/20 rounded-r px-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-rose-200">{fmtTime(snap.updatedAtMs)}</span>
                          <span className="text-rose-300 font-bold">{snap.authority.conflictCount} conflict(s)</span>
                        </div>
                        {snap.authority.duplicateOrchestratorDetected && (
                          <p className="mt-0.5 text-rose-400">⚠️ Duplicate conductor detected</p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* Recovery Event Playback */}
            <Card title="Recovery Event Playback" accent="emerald">
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No recovery events captured yet.</div>
                ) : (
                  selectedSnapshots
                    .filter((snap) => snap.recovery.actions.length > 0)
                    .slice(-20)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`recovery-${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-emerald-400/30 pl-3 py-1 text-xs bg-emerald-950/20 rounded-r px-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-emerald-200">{fmtTime(snap.updatedAtMs)}</span>
                          <span className={snap.recovery.healthy ? 'text-emerald-300 text-[10px]' : 'text-yellow-300 text-[10px]'}>
                            {snap.recovery.healthy ? 'healthy' : 'recovering'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-zinc-400">
                          {snap.recovery.actions.map((action) => (
                            <span key={action} className="inline-block mr-2 px-2 py-0.5 bg-emerald-950/40 rounded text-emerald-300">
                              {action}
                            </span>
                          ))}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* Crowd Emotion Timeline */}
            <Card title="Crowd Emotion Timeline" accent="fuchsia">
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedSnapshots.length === 0 ? (
                  <div className="text-xs text-zinc-500">No emotion data captured yet.</div>
                ) : (
                  selectedSnapshots
                    .slice(-40)
                    .reverse()
                    .map((snap, idx) => (
                      <div key={`emotion-${snap.roomId}-${snap.updatedAtMs}-${idx}`} className="border-l-2 border-fuchsia-400/30 pl-3 py-1 text-xs bg-black/30 rounded-r px-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-fuchsia-200">{fmtTime(snap.updatedAtMs)}</span>
                          <span className="text-zinc-400">Emotion</span>
                        </div>
                        <div className="mt-0.5 grid grid-cols-4 gap-1">
                          <div>
                            exc: <span className="text-fuchsia-300">{snap.crowdEmotion.excitement}%</span>
                          </div>
                          <div>
                            bore: <span className="text-fuchsia-300">{snap.crowdEmotion.boredom}%</span>
                          </div>
                          <div>
                            antic: <span className="text-fuchsia-300">{snap.crowdEmotion.anticipation}%</span>
                          </div>
                          <div>
                            hype: <span className="text-fuchsia-300">{snap.crowdEmotion.hype}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
