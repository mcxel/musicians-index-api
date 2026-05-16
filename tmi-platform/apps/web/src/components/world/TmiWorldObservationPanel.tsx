"use client";

import { getWorldObservationSnapshot } from "@/lib/world/tmiWorldObservationBridge";

export default function TmiWorldObservationPanel() {
  const snap = getWorldObservationSnapshot();

  return (
    <section className="rounded-2xl border border-amber-300/35 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">World Observation</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.14em] text-zinc-200">
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Nodes: {snap.nodeCount}</div>
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Routes: {snap.routeCount}</div>
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Capabilities: {snap.capabilityCount}</div>
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Locked Nodes: {snap.lockedNodes}</div>
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Locked Routes: {snap.lockedRoutes}</div>
        <div className="rounded border border-white/15 bg-zinc-900/70 p-2">Needs Setup: {snap.needsSetupCapabilities}</div>
      </div>
    </section>
  );
}
