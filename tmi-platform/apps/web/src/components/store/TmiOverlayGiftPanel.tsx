"use client";

import { useMemo, useState } from "react";
import { listOverlayMarketplaceItems } from "@/lib/store/tmiOverlayMarketplaceEngine";
import { giftOverlay } from "@/lib/store/tmiOverlayGiftEngine";
import TmiOverlayPreviewViewer from "@/components/store/TmiOverlayPreviewViewer";

type GiftRow = { toUserId: string; overlayId: string; at: number };

export default function TmiOverlayGiftPanel({ userId = "demo-user" }: { userId?: string }) {
  const [query, setQuery] = useState("friend-user");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<GiftRow[]>([]);
  const [status, setStatus] = useState("No transfer yet");

  const items = useMemo(() => listOverlayMarketplaceItems().slice(0, 8), []);
  const selected = useMemo(() => items.find((x) => x.id === selectedId) ?? items[0], [items, selectedId]);

  function sendGift() {
    if (!selected) return;
    const res = giftOverlay(userId, query, selected.id, selected.category);
    if (!res.ok) {
      setStatus(`Transfer blocked: ${res.reason}`);
      return;
    }
    setHistory((prev) => [{ toUserId: query, overlayId: selected.id, at: Date.now() }, ...prev].slice(0, 10));
    setStatus(`Gift confirmed: ${selected.title} -> ${query}`);
  }

  return (
    <section className="rounded-2xl border border-fuchsia-300/30 bg-black/60 p-4 shadow-[0_0_32px_rgba(217,70,239,0.24)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-fuchsia-100">Gift Transfer Panel</h3>

      <div className="mb-3 rounded-xl border border-white/15 bg-black/35 p-3">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Search recipient</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`rounded-xl border p-3 ${selected?.id === item.id ? "border-fuchsia-300/60 bg-fuchsia-500/10" : "border-white/15 bg-black/35"}`}>
              <button onClick={() => setSelectedId(item.id)} className="text-xs font-black uppercase tracking-[0.12em] text-white">
                {item.title}
              </button>
              <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{item.category}</p>
            </article>
          ))}
          <button onClick={sendGift} className="rounded-full border border-fuchsia-300/55 px-4 py-2 text-[10px] font-black uppercase text-fuchsia-100">
            Confirm Transfer
          </button>
          <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200">{status}</div>
        </div>

        <div className="space-y-3">
          {selected ? <TmiOverlayPreviewViewer item={selected} /> : null}
          <div className="rounded-xl border border-white/15 bg-black/35 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Gift history</p>
            <div className="space-y-1">
              {history.map((h) => (
                <p key={`${h.overlayId}-${h.at}`} className="text-[10px] uppercase tracking-[0.12em] text-zinc-200">
                  {h.overlayId} → {h.toUserId}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
