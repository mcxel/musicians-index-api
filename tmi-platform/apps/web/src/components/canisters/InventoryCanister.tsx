"use client";

/**
 * InventoryCanister — Phase 5.4 High-Fidelity Cyberpunk Inventory Vault
 * 3-Column Glassmorphic Vault Deck:
 *   Left: Equipped Gear, Avatar Chassis & Active Aura
 *   Center: Props, Emotes & Collectibles Grid (Rarity Badges & Equip Actions)
 *   Right: Inventory Stats, TMI Points Balance & Store Quick-Redeem
 */

import { useState, type CSSProperties } from "react";
import { InventoryPanel } from "@/components/InventoryPanel";

interface InventoryCanisterProps {
  accentColor?: string;
  onEquip?: () => void;
}

const INVENTORY_ITEMS = [
  { id: "i1", name: "Neon Glow Glasses", category: "Wearable", rarity: "LEGENDARY", color: "#00FFFF", equipped: true },
  { id: "i2", name: "Cyberpunk Stage Aura", category: "Aura", rarity: "EPIC", color: "#FF2DAA", equipped: true },
  { id: "i3", name: "Flame Hype Emote", category: "Emote", rarity: "RARE", color: "#FF5500", equipped: false },
  { id: "i4", name: "Gold Mic Trophy", category: "Prop", rarity: "LEGENDARY", color: "#FFD700", equipped: false },
  { id: "i5", name: "Submarine Bass Chassis", category: "Chassis", rarity: "EPIC", color: "#AA2DFF", equipped: false },
  { id: "i6", name: "Laser Spotlight", category: "Stage Prop", rarity: "RARE", color: "#00FF88", equipped: false },
];

export function InventoryCanister({ accentColor = "#FF6B35", onEquip }: InventoryCanisterProps) {
  const [items, setItems] = useState(INVENTORY_ITEMS);

  const toggleEquip = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, equipped: !item.equipped } : item))
    );
    onEquip?.();
  };

  return (
    <div
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 25px ${accentColor}33`,
      }}
    >
      {/* Vault Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            📦
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              CANISTER · GEAR & INVENTORY VAULT
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Equipped props, wearables, emotes & chassis — persistent across all rooms
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#FFD700", background: "rgba(255,215,0,0.12)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.4)" }}>
            💎 12,450 TMI POINTS
          </div>
        </div>
      </div>

      {/* 3-Column Deck */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", gap: 12 }}>
        {/* Left Column: Equipped Loadout */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>EQUIPPED LOADOUT</div>
          <div style={{ height: 130, background: "radial-gradient(circle, rgba(0,255,255,0.15), #000)", borderRadius: 8, border: "1px solid #00FFFF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 36 }}>🕶</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff", marginTop: 4 }}>Neon Cyberpunk Avatar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {items.filter((i) => i.equipped).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,255,255,0.1)", padding: "4px 8px", borderRadius: 6, border: "1px solid #00FFFF", fontSize: 9 }}>
                <span>{item.name}</span>
                <strong style={{ color: "#00FFFF" }}>EQUIPPED</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Collectibles Grid */}
        <div style={{ background: "rgba(10,5,25,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.12em" }}>PROPS, EMOTES & WEARABLES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, flex: 1, overflowY: "auto" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.equipped ? `${item.color}15` : "rgba(255,255,255,0.03)",
                  border: item.equipped ? `1.5px solid ${item.color}` : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 8, fontWeight: 900, color: item.color }}>{item.rarity}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{item.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{item.category}</div>
                <button
                  type="button"
                  onClick={() => toggleEquip(item.id)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: "3px 6px",
                    borderRadius: 4,
                    border: `1px solid ${item.color}`,
                    background: item.equipped ? item.color : "transparent",
                    color: item.equipped ? "#000" : item.color,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  {item.equipped ? "UNEQUIP" : "EQUIP"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Original Source Fallback */}
        <div style={{ background: "rgba(10,5,25,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", marginBottom: 6 }}>AVATAR STUDIO SOURCE</div>
          <InventoryPanel onEquip={onEquip} />
        </div>
      </div>
    </div>
  );
}

export default InventoryCanister;
