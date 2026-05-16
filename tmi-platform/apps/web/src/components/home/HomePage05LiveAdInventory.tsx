"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type InventorySlot = {
  id: string;
  label: string;
  zone: "homepage" | "cypher" | "battle" | "feed" | "magazine";
  totalSlots: number;
  filledSlots: number;
  pricePerSlot: string;
  accent: string;
  live: boolean;
};

const INITIAL_INVENTORY: InventorySlot[] = [
  { id: "hp-hero",     label: "HP Hero Banner",     zone: "homepage", totalSlots: 1, filledSlots: 1, pricePerSlot: "$1,200/wk", accent: "#FFD700",  live: true  },
  { id: "hp-strip",    label: "HP Sponsor Strip",   zone: "homepage", totalSlots: 3, filledSlots: 2, pricePerSlot: "$400/wk",   accent: "#00FFFF",  live: true  },
  { id: "cypher-pre",  label: "Cypher Pre-Roll",    zone: "cypher",   totalSlots: 4, filledSlots: 2, pricePerSlot: "$420/wk",   accent: "#FF2DAA",  live: true  },
  { id: "battle-chip", label: "Battle Chip",        zone: "battle",   totalSlots: 6, filledSlots: 1, pricePerSlot: "$280/wk",   accent: "#FF6B35",  live: true  },
  { id: "feed-card",   label: "Feed Sponsor Card",  zone: "feed",     totalSlots: 5, filledSlots: 3, pricePerSlot: "$180/wk",   accent: "#AA2DFF",  live: true  },
  { id: "mag-back",    label: "Magazine Back Cover", zone: "magazine", totalSlots: 1, filledSlots: 0, pricePerSlot: "$2,100/wk", accent: "#00FF88",  live: false },
];

const ZONE_COLORS: Record<InventorySlot["zone"], string> = {
  homepage: "#FFD700",
  cypher:   "#00FFFF",
  battle:   "#FF2DAA",
  feed:     "#AA2DFF",
  magazine: "#00FF88",
};

const AD_PREVIEWS = [
  "/tmi-curated/home5.png",
  "/tmi-curated/home4.png",
  "/tmi-curated/gameshow-31.jpg",
  "/tmi-curated/mag-82.jpg",
] as const;

function FillMeter({ filled, total, accent }: { filled: number; total: number; accent: string }) {
  const pct = total === 0 ? 0 : (filled / total) * 100;
  return (
    <div style={{ position: "relative", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", flex: 1 }}>
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, background: accent, borderRadius: 2 }}
      />
    </div>
  );
}

export default function HomePage05LiveAdInventory() {
  const [inventory, setInventory] = useState<InventorySlot[]>(INITIAL_INVENTORY);
  const [flashId, setFlashId] = useState<string | null>(null);

  // Simulate real-time slot fills
  useEffect(() => {
    const t = setInterval(() => {
      setInventory((prev) => {
        const available = prev.filter((s) => s.filledSlots < s.totalSlots && s.live);
        if (available.length === 0) return prev;
        const target = available[Math.floor(Math.random() * available.length)]!;
        setFlashId(target.id);
        setTimeout(() => setFlashId(null), 900);
        return prev.map((s) =>
          s.id === target.id ? { ...s, filledSlots: Math.min(s.filledSlots + 1, s.totalSlots) } : s
        );
      });
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const totalOpenSlots = inventory.reduce((sum, s) => sum + (s.totalSlots - s.filledSlots), 0);
  const totalFilledSlots = inventory.reduce((sum, s) => sum + s.filledSlots, 0);
  const totalSlots = inventory.reduce((sum, s) => sum + s.totalSlots, 0);
  const fillPct = Math.round((totalFilledSlots / totalSlots) * 100);

  return (
    <div>
      {/* Header + summary bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
            LIVE AD INVENTORY
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88" }}
          />
          <span style={{ fontSize: 6, fontWeight: 900, color: "#00FF88", letterSpacing: "0.14em", textTransform: "uppercase" }}>LIVE</span>
        </div>
      </div>

      {/* Global fill summary */}
      <div style={{
        borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.4)", padding: "6px 10px", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <FillMeter filled={totalFilledSlots} total={totalSlots} accent="#00FFFF" />
        </div>
        <span style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", flexShrink: 0 }}>{fillPct}%</span>
        <span style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{totalOpenSlots} open</span>
      </div>

      {/* Premium campaign carousel strip */}
      <div style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 6, background: "rgba(0,0,0,0.36)" }}>
        <motion.div
          style={{ display: "flex", gap: 6, width: "max-content", padding: 6 }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {[...AD_PREVIEWS, ...AD_PREVIEWS].map((img, idx) => (
            <div key={`${img}-${idx}`} style={{ position: "relative", width: 96, height: 52, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(0,255,255,0.2)", flexShrink: 0 }}>
              <ImageSlotWrapper imageId="img-0q937h" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.58))" }} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Slot rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {inventory.map((slot) => {
          const open = slot.totalSlots - slot.filledSlots;
          const isFlashing = flashId === slot.id;
          return (
            <AnimatePresence key={slot.id}>
              <motion.div
                animate={isFlashing ? { backgroundColor: [`${slot.accent}18`, `${slot.accent}05`] } : {}}
                transition={{ duration: 0.7 }}
                style={{
                  borderRadius: 7,
                  border: `1px solid ${open === 0 ? "rgba(255,255,255,0.05)" : slot.accent + "2a"}`,
                  background: open === 0 ? "rgba(0,0,0,0.3)" : `${slot.accent}05`,
                  padding: "5px 9px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    padding: "1px 5px", borderRadius: 999,
                    background: `${ZONE_COLORS[slot.zone]}14`,
                    border: `1px solid ${ZONE_COLORS[slot.zone]}33`,
                    fontSize: 5, fontWeight: 900, color: ZONE_COLORS[slot.zone],
                    letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0,
                  }}>
                    {slot.zone}
                  </span>
                  <span style={{ flex: 1, fontSize: 7, fontWeight: 900, color: open === 0 ? "rgba(255,255,255,0.35)" : "#fff", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {slot.label}
                  </span>
                  {!slot.live && (
                    <span style={{ padding: "1px 5px", borderRadius: 999, background: "rgba(255,255,255,0.06)", fontSize: 5, color: "rgba(255,255,255,0.28)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
                      SOON
                    </span>
                  )}
                  {open === 0 && slot.live && (
                    <span style={{ padding: "1px 5px", borderRadius: 999, background: "rgba(255,255,255,0.06)", fontSize: 5, color: "rgba(255,255,255,0.28)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
                      FULL
                    </span>
                  )}
                  {open > 0 && slot.live && (
                    <span style={{ fontSize: 6, fontWeight: 900, color: slot.accent, flexShrink: 0 }}>
                      {open}/{slot.totalSlots}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FillMeter filled={slot.filledSlots} total={slot.totalSlots} accent={slot.accent} />
                  <span style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{slot.pricePerSlot}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
