"use client";

type MonitorMode = "live" | "simulated" | "locked";

export default function AdminOverlayInventoryMonitor({ mode = "simulated" }: { mode?: MonitorMode }) {
  const locked = mode === "locked";
  const stats = {
    equipped: locked ? 0 : 148,
    favorite: locked ? 0 : 223,
    archived: locked ? 0 : 37,
    traded: locked ? 0 : 52,
    gifted: locked ? 0 : 41,
    rewards: locked ? 0 : 67,
  };

  return (
    <section className="rounded-2xl border border-emerald-300/30 bg-black/60 p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-100">Admin Overlay Inventory Monitor</h3>
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-zinc-300">mode: {mode}</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Cell label="equipped overlays" value={stats.equipped} />
        <Cell label="favorite overlays" value={stats.favorite} />
        <Cell label="archived overlays" value={stats.archived} />
        <Cell label="traded overlays" value={stats.traded} />
        <Cell label="gifted overlays" value={stats.gifted} />
        <Cell label="reward unlocks" value={stats.rewards} />
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
