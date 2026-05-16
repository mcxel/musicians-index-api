"use client";

import { useMemo, useState } from "react";
import { listOverlayMarketplaceItems, type TmiOverlayMarketplaceItem } from "@/lib/store/tmiOverlayMarketplaceEngine";
import { purchaseOverlayWithReceipt } from "@/lib/store/tmiOverlayPurchaseEngine";
import { giftOverlay } from "@/lib/store/tmiOverlayGiftEngine";
import { equipOverlay, type TmiOverlaySurface } from "@/lib/store/tmiOverlayEquipEngine";
import TmiOverlayRarityBadge from "@/components/store/TmiOverlayRarityBadge";
import TmiOverlayPreviewViewer from "@/components/store/TmiOverlayPreviewViewer";

export default function TmiOverlayStore({ userId = "demo-user" }: { userId?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [surface, setSurface] = useState<TmiOverlaySurface>("artist-profile");
  const [toUser, setToUser] = useState("friend-user");
  const [status, setStatus] = useState<string>("");

  const items = useMemo(() => listOverlayMarketplaceItems(), []);
  const selected: TmiOverlayMarketplaceItem | undefined = useMemo(
    () => items.find((x) => x.id === selectedId) ?? items[0],
    [items, selectedId]
  );

  function onBuy(item: TmiOverlayMarketplaceItem) {
    const result = purchaseOverlayWithReceipt(userId, item.id);
    setStatus(result.ok ? `Purchased ${item.title}` : `Buy failed: ${"reason" in result ? result.reason : "unknown"}`);
  }

  function onGift(item: TmiOverlayMarketplaceItem) {
    const result = giftOverlay(userId, toUser, item.id, item.category);
    setStatus(result.ok ? `Gifted ${item.title} to ${toUser}` : `Gift failed: ${result.reason}`);
  }

  function onEquip(item: TmiOverlayMarketplaceItem) {
    const result = equipOverlay(userId, item.id, item.category, surface);
    setStatus(result.ok ? `Equipped ${item.title} on ${surface}` : `Equip failed: ${result.reason}`);
  }

  return (
    <section className="rounded-2xl border border-cyan-300/25 bg-black/60 p-4 shadow-[0_0_36px_rgba(34,211,238,0.2)] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-[0.16em] text-cyan-100">Overlay Store</h2>
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Neon marketplace · live actions</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl border p-3 transition ${selected?.id === item.id ? "border-cyan-300/60 bg-cyan-500/10" : "border-white/15 bg-black/35"}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={() => setSelectedId(item.id)}
                  className="text-left text-sm font-black uppercase tracking-[0.12em] text-white hover:text-cyan-200"
                >
                  {item.title}
                </button>
                <TmiOverlayRarityBadge rarity={item.rarity} />
              </div>
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-zinc-300">
                <span>{item.category}</span>
                <span>{item.priceCoins} coins</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onBuy(item)} className="rounded-full border border-emerald-300/50 px-3 py-1 text-[10px] font-black uppercase text-emerald-200">Buy</button>
                <button onClick={() => onGift(item)} className="rounded-full border border-fuchsia-300/50 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-200">Gift</button>
                <button onClick={() => onEquip(item)} className="rounded-full border border-cyan-300/50 px-3 py-1 text-[10px] font-black uppercase text-cyan-200">Equip</button>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-3">
          {selected ? <TmiOverlayPreviewViewer item={selected} /> : null}

          <div className="rounded-xl border border-white/15 bg-black/35 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Gift Receiver</p>
            <input
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/15 bg-black/35 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Equip Surface</p>
            <select
              value={surface}
              onChange={(e) => setSurface(e.target.value as TmiOverlaySurface)}
              className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white outline-none"
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

          <div className="rounded-xl border border-white/15 bg-black/35 p-3 text-[11px] uppercase tracking-[0.12em] text-zinc-200">
            {status || "No action yet"}
          </div>
        </div>
      </div>
    </section>
  );
}
