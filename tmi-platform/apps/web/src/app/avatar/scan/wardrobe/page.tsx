"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStarterInventory, equipItem, unequipItem, syncInventoryToProfile } from "@/lib/avatar/avatarInventoryEngine";
import type { AvatarInventoryItem, AvatarInventoryCategory } from "@/lib/avatar/avatarInventoryEngine";

const RARITY_COLORS = {
  free: "#64748b",
  rare: "#3b82f6",
  epic: "#AA2DFF",
  legendary: "#fcd34d",
};

const CATEGORY_LABELS: Partial<Record<AvatarInventoryCategory, string>> = {
  skins: "SKINS",
  hats: "HATS",
  eyes: "EYES",
  accessories: "ACCESSORIES",
  outfits: "OUTFITS",
  emotes: "EMOTES",
  "mic-skins": "MIC SKINS",
  "lighting-packs": "LIGHTING",
};

export default function AvatarScanWardrobePage() {
  const searchParams = useSearchParams() ?? undefined;
  const scanId = searchParams?.get("scanId") || "";

  const [items, setItems] = useState<AvatarInventoryItem[]>(getStarterInventory());
  const [activeCategory, setActiveCategory] = useState<AvatarInventoryCategory>("skins");
  const [synced, setSynced] = useState(false);

  const categories = [...new Set(items.map(i => i.category))].filter((c): c is AvatarInventoryCategory => !!c && c in CATEGORY_LABELS);
  const filtered = items.filter(i => i.category === activeCategory);
  const equippedCount = items.filter(i => i.equipped).length;

  function handleEquip(id: string) {
    setItems(prev => equipItem(prev, id));
    setSynced(false);
  }

  function handleUnequip(id: string) {
    setItems(prev => unequipItem(prev, id));
    setSynced(false);
  }

  function handleSync() {
    syncInventoryToProfile(items);
    setSynced(true);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 60px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(255,45,170,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/avatar/scan/build${scanId ? `?scanId=${scanId}` : ""}`} style={{ color: "#f9a8d4", fontSize: 10, textDecoration: "none", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← BUILD</Link>
        <strong style={{ color: "#f9a8d4", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>WARDROBE</strong>
        <span style={{ color: "#64748b", fontSize: 10, marginLeft: "auto" }}>{equippedCount} equipped</span>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["SCAN", "VERIFY", "BUILD", "WARDROBE"] as const).map((step, i) => {
            const routes = ["/avatar/scan", "/avatar/scan/verify", "/avatar/scan/build", "/avatar/scan/wardrobe"];
            const active = i === 3;
            return (
              <Link key={step} href={routes[i] + (scanId ? `?scanId=${scanId}` : "")} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 6, border: `1px solid ${active ? "#FF2DAA" : "#334155"}`, background: active ? "rgba(255,45,170,0.12)" : "transparent", color: active ? "#f9a8d4" : "#475569", fontSize: 9, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>
                {i + 1}. {step}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: activeCategory === cat ? "rgba(255,45,170,0.15)" : "transparent", border: `1px solid ${activeCategory === cat ? "rgba(255,45,170,0.4)" : "#334155"}`, borderRadius: 6, color: activeCategory === cat ? "#f9a8d4" : "#64748b", fontSize: 9, padding: "4px 12px", cursor: "pointer", fontWeight: 700, textTransform: "uppercase" }}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {filtered.map(item => {
            const rarity = RARITY_COLORS[item.rarity ?? "free"];
            const itemKey = item.id ?? item.itemId ?? item.name;
            return (
              <div key={itemKey} style={{ background: item.equipped ? "rgba(255,45,170,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${item.equipped ? "rgba(255,45,170,0.35)" : `${rarity}33`}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                  <span style={{ background: `${rarity}22`, border: `1px solid ${rarity}55`, borderRadius: 4, color: rarity, fontSize: 8, padding: "1px 6px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {(item.rarity ?? "free").toUpperCase()}
                  </span>
                </div>
                {!item.owned && (
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 6 }}>{item.unlockRequirement}</div>
                )}
                {item.owned ? (
                  <button onClick={() => item.equipped ? handleUnequip(itemKey) : handleEquip(itemKey)} style={{ width: "100%", background: item.equipped ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${item.equipped ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 5, color: item.equipped ? "#f87171" : "#22c55e", fontSize: 10, padding: "5px 0", cursor: "pointer", fontWeight: 700 }}>
                    {item.equipped ? "UNEQUIP" : "EQUIP"}
                  </button>
                ) : (
                  <button disabled style={{ width: "100%", background: "transparent", border: "1px solid #1e293b", borderRadius: 5, color: "#334155", fontSize: 10, padding: "5px 0", cursor: "default", fontWeight: 700 }}>
                    LOCKED
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={handleSync} style={{ width: "100%", background: synced ? "rgba(34,197,94,0.12)" : "rgba(170,45,255,0.15)", border: `1px solid ${synced ? "rgba(34,197,94,0.4)" : "rgba(170,45,255,0.4)"}`, borderRadius: 8, color: synced ? "#22c55e" : "#c4b5fd", fontSize: 13, padding: "12px 0", cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em" }}>
          {synced ? "✓ WARDROBE SYNCED TO PROFILE" : "SYNC WARDROBE TO PROFILE"}
        </button>
      </div>
    </main>
  );
}
