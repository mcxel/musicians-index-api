"use client";

import { useMemo, useState } from "react";
import { listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";
import { equipOverlay, type TmiOverlaySurface } from "@/lib/store/tmiOverlayEquipEngine";

export default function TmiOverlayEquipPanel({ userId = "demo-user" }: { userId?: string }) {
  const [surface, setSurface] = useState<TmiOverlaySurface>("artist-profile");
  const [status, setStatus] = useState("Idle");
  const inventory = useMemo(() => listOverlayInventory(userId), [userId]);

  function onEquip(overlayId: string, category: Parameters<typeof equipOverlay>[2]) {
    const result = equipOverlay(userId, overlayId, category, surface);
    setStatus(result.ok ? `Equipped ${overlayId} on ${surface}` : `Equip blocked: ${result.reason}`);
  }

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-black/60 p-4 shadow-[0_0_32px_rgba(34,211,238,0.22)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-cyan-100">Equip Panel</h3>

      <div className="mb-3">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Active Slot</p>
        <select
          value={surface}
          onChange={(e) => setSurface(e.target.value as TmiOverlaySurface)}
          className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white"
        >
          <option value="artist-profile">artist-profile</option>
          <option value="performer-profile">performer-profile</option>
          <option value="fan-dashboard">fan-dashboard</option>
          <option value="venue-stage">venue-stage</option>
          <option value="billboard-wall">billboard-wall</option>
          <option value="magazine-shell">magazine-shell</option>
          <option value="game-panel">game-panel</option>
        </select>
      </div>

      <div className="space-y-2">
        {inventory.map((item) => (
          <article key={`${item.overlayId}-${item.acquiredAt}`} className="rounded-xl border border-white/15 bg-black/35 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white">{item.overlayId}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{item.category}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEquip(item.overlayId, item.category)}
                className="rounded-full border border-cyan-300/55 px-3 py-1 text-[10px] font-black uppercase text-cyan-100"
              >
                Equip
              </button>
              <button className="rounded-full border border-zinc-400/40 px-3 py-1 text-[10px] font-black uppercase text-zinc-200">
                Unequip
              </button>
              <button className="rounded-full border border-fuchsia-300/50 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-100">
                Preview
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200">
        {status}
      </div>
    </section>
  );
}
