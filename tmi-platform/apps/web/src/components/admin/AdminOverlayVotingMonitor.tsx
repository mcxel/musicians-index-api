"use client";

import { useMemo } from "react";
import { listJuliusPolls } from "@/lib/julius/tmiJuliusOverlayPollEngine";

type MonitorMode = "live" | "simulated" | "locked";

export default function AdminOverlayVotingMonitor({ mode = "simulated" }: { mode?: MonitorMode }) {
  const polls = useMemo(() => listJuliusPolls(), []);
  const locked = mode === "locked";

  const stats = {
    liveJuliusPolls: locked ? 0 : polls.filter((p) => p.state === "open").length,
    activeVoteCount: locked ? 0 : polls.length * 24,
    pendingRetirements: locked ? 0 : polls.filter((p) => p.type === "retire" && p.state !== "resolved").length,
    returningOverlays: locked ? 0 : polls.filter((p) => p.type === "return").length,
    premiumVoteRequests: locked ? 0 : polls.filter((p) => p.type === "premium").length,
    freeUnlockVoteRequests: locked ? 0 : polls.filter((p) => p.type === "free").length,
  };

  return (
    <section className="rounded-2xl border border-fuchsia-300/30 bg-black/60 p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-fuchsia-100">Admin Overlay Voting Monitor</h3>
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-zinc-300">mode: {mode}</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Cell label="live Julius polls" value={stats.liveJuliusPolls} />
        <Cell label="active vote count" value={stats.activeVoteCount} />
        <Cell label="pending retirements" value={stats.pendingRetirements} />
        <Cell label="returning overlays" value={stats.returningOverlays} />
        <Cell label="premium requests" value={stats.premiumVoteRequests} />
        <Cell label="free unlock requests" value={stats.freeUnlockVoteRequests} />
      </div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/35 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="text-sm font-black uppercase text-white">{value}</p>
    </div>
  );
}
