"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PassItem {
  id: string;
  label: string;
  icon: string;
  price: number;
  description: string;
  perks: string[];
  color: string;
  popular?: boolean;
}

const SEASON_PASSES: PassItem[] = [
  {
    id: "silver",
    label: "Silver Pass",
    icon: "🥈",
    price: 9.99,
    description: "Core access to all live rooms + community features.",
    perks: ["All live rooms", "Chat + reactions", "250 XP/month", "Monthly badge"],
    color: "#888",
  },
  {
    id: "gold",
    label: "Gold Pass",
    icon: "🥇",
    price: 19.99,
    description: "Priority seating, bonus XP, early access to events.",
    perks: ["Priority seating", "2x XP multiplier", "Backstage access", "Gold badge + emotes", "Early event access"],
    color: "#FFD700",
    popular: true,
  },
  {
    id: "diamond",
    label: "Diamond Pass",
    icon: "💎",
    price: 49.99,
    description: "VIP everything — front row, drops, crown glow.",
    perks: ["VIP front-row seat", "4x XP multiplier", "Crown glow on avatar", "NFT season drop", "Direct artist access", "Diamond badge + exclusive emotes"],
    color: "#00FFFF",
  },
];

const EMOTE_PACKS: PassItem[] = [
  { id: "ep1", label: "Fire Pack",    icon: "🔥", price: 2.99,  description: "6 fire-themed animated emotes", perks: ["🔥💥🌋🎆✨⚡"], color: "#FF9500" },
  { id: "ep2", label: "Crown Pack",   icon: "👑", price: 4.99,  description: "8 crown & royalty emotes",       perks: ["👑💰🏆🎖🥇💎🌟⭐"], color: "#FFD700" },
  { id: "ep3", label: "Cypher Pack",  icon: "🎤", price: 3.99,  description: "7 battle rap emotes",            perks: ["🎤⚔️🥊🔊📢🎵🎶"], color: "#FF2DAA" },
];

function PassCard({ item, onBuy }: { item: PassItem; onBuy: (id: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        borderRadius: 14,
        border: `1px solid ${item.color}30`,
        background: `linear-gradient(160deg, ${item.color}08 0%, rgba(4,4,20,0.96) 100%)`,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {item.popular && (
        <div style={{ position: "absolute", top: 0, right: 0, background: item.color, color: "#000", fontSize: 8, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 0 8px", letterSpacing: "0.1em" }}>
          POPULAR
        </div>
      )}
      <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 14, lineHeight: 1.4 }}>{item.description}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
        {item.perks.map(p => (
          <li key={p} style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "flex", gap: 7, alignItems: "center" }}>
            <span style={{ color: item.color, fontSize: 9 }}>✓</span>{p}
          </li>
        ))}
      </ul>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onBuy(item.id)}
        style={{
          width: "100%", padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${item.color}, ${item.color}99)`,
          color: "#050510", fontSize: 10, fontWeight: 900, letterSpacing: "0.14em",
        }}
      >
        GET FOR ${item.price}/mo
      </motion.button>
    </motion.div>
  );
}

export default function SeasonPassStore() {
  const [tab, setTab] = useState<"passes" | "emotes">("passes");
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function handleBuy(id: string) {
    setPurchased(prev => new Set([...prev, id]));
    const item = [...SEASON_PASSES, ...EMOTE_PACKS].find(p => p.id === id);
    setToastMsg(`${item?.label ?? "Item"} activated!`);
    setTimeout(() => setToastMsg(null), 2500);
  }

  const items = tab === "passes" ? SEASON_PASSES : EMOTE_PACKS;

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 800, color: "#AA2DFF", marginBottom: 6 }}>SEASON STORE</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.01em" }}>Passes & Emote Packs</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["passes", "emotes"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", cursor: "pointer",
              border: `1px solid ${tab === t ? "rgba(170,45,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: tab === t ? "rgba(170,45,255,0.1)" : "transparent",
              color: tab === t ? "#AA2DFF" : "rgba(255,255,255,0.4)",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {items.map(item => (
          purchased.has(item.id) ? (
            <div key={item.id} style={{ borderRadius: 14, border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)", padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88" }}>{item.label} Active</div>
            </div>
          ) : (
            <PassCard key={item.id} item={item} onBuy={handleBuy} />
          )
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 20, padding: "10px 24px", fontSize: 11, fontWeight: 800, color: "#00FF88", zIndex: 9999, backdropFilter: "blur(10px)" }}
          >
            ✓ {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
