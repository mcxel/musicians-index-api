"use client";

import { useMemo, useState } from "react";
import { listOverlayInventory } from "@/lib/store/tmiOverlayInventoryEngine";

type TabKey = "owned" | "equipped" | "favorites" | "archived" | "gifted" | "traded";

export default function TmiOverlayInventory({ userId = "demo-user" }: { userId?: string }) {
  const [tab, setTab] = useState<TabKey>("owned");
  const items = useMemo(() => listOverlayInventory(userId), [userId]);

  const filtered = useMemo(() => {
    if (tab === "owned") return items;
    if (tab === "favorites") return items.filter((x) => x.favorite);
    if (tab === "archived") return [];
    if (tab === "gifted") return items.filter((x) => x.source === "gift");
    if (tab === "traded") return items.filter((x) => x.source === "trade");
    return [];
  }, [items, tab]);

  const tabs: TabKey[] = ["owned", "equipped", "favorites", "archived", "gifted", "traded"];

  return (
    <section className="rounded-2xl border border-fuchsia-300/30 bg-black/60 p-4 shadow-[0_0_34px_rgba(217,70,239,0.2)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-fuchsia-100">Overlay Inventory</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {tabs.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              tab === key ? "border-fuchsia-300/65 text-fuchsia-100" : "border-white/20 text-zinc-300"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {filtered.map((item) => (
          <article key={`${item.overlayId}-${item.acquiredAt}`} className="rounded-xl border border-white/15 bg-black/35 p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white">{item.overlayId}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{item.category} · {item.source}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
