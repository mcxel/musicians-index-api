"use client";

import { useEffect, useMemo, useState } from "react";
import { listSeasonalOverlaysByShelf, type TmiOverlaySeasonShelf } from "@/lib/store/tmiOverlaySeasonalEngine";
import { listSeasonLifecycle } from "@/lib/store/tmiOverlaySeasonLifecycleEngine";

type ShelfKey = TmiOverlaySeasonShelf;

export default function TmiOverlaySeasonalShelf() {
  const [now, setNow] = useState(Date.now());
  const [shelf, setShelf] = useState<ShelfKey>("active");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => listSeasonalOverlaysByShelf(shelf), [shelf]);
  const lifecycle = useMemo(() => listSeasonLifecycle(), []);

  function countdown(ref?: number) {
    if (!ref) return "no timer";
    const diff = Math.max(0, ref - now);
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  }

  return (
    <section className="rounded-2xl border border-amber-300/30 bg-black/60 p-4 shadow-[0_0_30px_rgba(251,191,36,0.22)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-amber-100">Seasonal Shelf</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["active", "retired", "returning", "event"] as ShelfKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setShelf(key)}
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              shelf === key ? "border-amber-300/65 text-amber-100" : "border-white/20 text-zinc-300"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {rows.map((row) => {
          const life = lifecycle.find((x) => x.overlayId === row.overlayId);
          return (
            <article key={row.overlayId} className="rounded-xl border border-white/15 bg-black/35 p-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white">{row.overlayId}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">season {row.seasonTag}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200">return votes {life?.votesToReturn ?? 0}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">countdown {countdown(life?.refundEligibleUntil)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
