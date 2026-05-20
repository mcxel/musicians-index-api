"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type WardrobeCategory = "HAIR" | "EYES" | "ACCESSORIES" | "OUTFITS" | "PROPS" | "BACKGROUND" | "LIGHTING";
type RarityTier = "COMMON" | "RARE" | "EPIC" | "DIAMOND";

interface CosmeticItem {
  id: string;
  label: string;
  icon: string;
  rarity: RarityTier;
  cost: number;
  owned: boolean;
}

const RARITY_COLOR: Record<RarityTier, string> = {
  COMMON: "#888",
  RARE: "#00FFFF",
  EPIC: "#AA2DFF",
  DIAMOND: "#FFD700",
};

const CATEGORY_ICONS: Record<WardrobeCategory, string> = {
  HAIR: "💇", EYES: "👁️", ACCESSORIES: "💎", OUTFITS: "👗", PROPS: "🎸", BACKGROUND: "🌌", LIGHTING: "💡",
};

const SEED_ITEMS: Record<WardrobeCategory, CosmeticItem[]> = {
  HAIR: [
    { id: "h1", label: "Neon Fade",    icon: "🟦", rarity: "RARE",    cost: 200,  owned: true  },
    { id: "h2", label: "Gold Dreads",  icon: "🟡", rarity: "EPIC",    cost: 500,  owned: false },
    { id: "h3", label: "Afro Crown",   icon: "⭕", rarity: "DIAMOND", cost: 1200, owned: false },
    { id: "h4", label: "Clean Fade",   icon: "⬜", rarity: "COMMON",  cost: 0,    owned: true  },
  ],
  EYES: [
    { id: "e1", label: "Cyan Glow",    icon: "💠", rarity: "RARE",    cost: 180,  owned: false },
    { id: "e2", label: "Fire Eyes",    icon: "🔥", rarity: "EPIC",    cost: 450,  owned: false },
    { id: "e3", label: "Diamond Iris", icon: "💎", rarity: "DIAMOND", cost: 1000, owned: false },
    { id: "e4", label: "Natural",      icon: "🟫", rarity: "COMMON",  cost: 0,    owned: true  },
  ],
  ACCESSORIES: [
    { id: "a1", label: "Gold Chain",   icon: "⛓️",  rarity: "EPIC",    cost: 600,  owned: false },
    { id: "a2", label: "TMI Badge",    icon: "🏅", rarity: "RARE",    cost: 250,  owned: false },
    { id: "a3", label: "Diamond Grill",icon: "💎", rarity: "DIAMOND", cost: 2000, owned: false },
    { id: "a4", label: "None",         icon: "—",  rarity: "COMMON",  cost: 0,    owned: true  },
  ],
  OUTFITS: [
    { id: "o1", label: "Stage Drip",   icon: "🎽", rarity: "EPIC",    cost: 800,  owned: false },
    { id: "o2", label: "Neon Jacket",  icon: "🧥", rarity: "RARE",    cost: 350,  owned: false },
    { id: "o3", label: "Diamond Suit", icon: "🤵", rarity: "DIAMOND", cost: 2500, owned: false },
    { id: "o4", label: "Basic",        icon: "👕", rarity: "COMMON",  cost: 0,    owned: true  },
  ],
  PROPS: [
    { id: "p1", label: "Mic Stand",    icon: "🎤", rarity: "COMMON",  cost: 0,    owned: true  },
    { id: "p2", label: "Beat Pad",     icon: "🎹", rarity: "RARE",    cost: 300,  owned: false },
    { id: "p3", label: "Gold Trophy",  icon: "🏆", rarity: "EPIC",    cost: 700,  owned: false },
    { id: "p4", label: "NFT Crown",    icon: "👑", rarity: "DIAMOND", cost: 1500, owned: false },
  ],
  BACKGROUND: [
    { id: "bg1", label: "Dark Space",  icon: "🌌", rarity: "COMMON",  cost: 0,    owned: true  },
    { id: "bg2", label: "Neon City",   icon: "🏙️", rarity: "RARE",    cost: 220,  owned: false },
    { id: "bg3", label: "Arena Stage", icon: "🎪", rarity: "EPIC",    cost: 550,  owned: false },
    { id: "bg4", label: "Cloud 9",     icon: "☁️", rarity: "DIAMOND", cost: 1100, owned: false },
  ],
  LIGHTING: [
    { id: "l1", label: "Spotlight",    icon: "💫", rarity: "COMMON",  cost: 0,    owned: true  },
    { id: "l2", label: "Cyan Wash",    icon: "🔵", rarity: "RARE",    cost: 160,  owned: false },
    { id: "l3", label: "Fuchsia Haze", icon: "🟣", rarity: "EPIC",    cost: 380,  owned: false },
    { id: "l4", label: "Diamond Beam", icon: "⚡", rarity: "DIAMOND", cost: 900,  owned: false },
  ],
};

const ACTIONS = ["Rotate", "Dance", "Sing Demo"] as const;
const CATEGORIES = Object.keys(CATEGORY_ICONS) as WardrobeCategory[];

export default function AvatarWardrobePage() {
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>("HAIR");
  const [selected, setSelected] = useState<Record<WardrobeCategory, string>>({
    HAIR: "h4", EYES: "e4", ACCESSORIES: "a4", OUTFITS: "o4", PROPS: "p1", BACKGROUND: "bg1", LIGHTING: "l1",
  });
  const [action, setAction] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const items = SEED_ITEMS[activeCategory];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14, background: "rgba(4,4,16,0.9)" }}>
        <Link href="/fan/dashboard" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← FAN HUB
        </Link>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#AA2DFF" }}>AVATAR WARDROBE</span>
      </nav>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left — Category sidebar */}
        <aside style={{ width: 80, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 6 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              title={cat}
              style={{
                width: 52, height: 52, borderRadius: 10, border: `1px solid ${activeCategory === cat ? "rgba(170,45,255,0.5)" : "rgba(255,255,255,0.06)"}`,
                background: activeCategory === cat ? "rgba(170,45,255,0.12)" : "rgba(255,255,255,0.02)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat]}</span>
              <span style={{ fontSize: 7, color: activeCategory === cat ? "#AA2DFF" : "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em" }}>
                {cat.slice(0, 4)}
              </span>
            </button>
          ))}
        </aside>

        {/* Center — Avatar preview */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div
            style={{
              width: 220, height: 300, borderRadius: 20,
              background: "radial-gradient(ellipse at 50% 30%, rgba(170,45,255,0.18) 0%, rgba(0,255,255,0.06) 60%, transparent 100%)",
              border: "2px solid rgba(170,45,255,0.2)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", marginBottom: 20,
              boxShadow: "0 0 40px rgba(170,45,255,0.08)",
            }}
          >
            {/* Avatar silhouette */}
            <div style={{ fontSize: 80, lineHeight: 1 }}>🧑‍🎤</div>
            <AnimatePresence>
              {action && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ position: "absolute", bottom: 14, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF" }}
                >
                  {action.toUpperCase()}…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {ACTIONS.map(a => (
              <button
                key={a}
                onClick={() => { setAction(a); setTimeout(() => setAction(null), 1800); }}
                style={{
                  padding: "7px 14px", borderRadius: 7, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Save actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "9px 18px", borderRadius: 8, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                border: "1px solid rgba(0,255,136,0.3)", background: saved ? "rgba(0,255,136,0.12)" : "rgba(0,255,136,0.06)",
                color: saved ? "#00FF88" : "rgba(0,255,136,0.7)", cursor: "pointer",
              }}
            >
              {saved ? "✓ SAVED" : "SAVE LOOK"}
            </button>
            <button
              style={{ padding: "9px 18px", borderRadius: 8, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.06)", color: "rgba(0,255,255,0.7)", cursor: "pointer" }}
            >
              SET AS STAGE AVATAR
            </button>
            <button
              style={{ padding: "9px 18px", borderRadius: 8, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", border: "1px solid rgba(255,213,0,0.3)", background: "rgba(255,213,0,0.06)", color: "rgba(255,213,0,0.7)", cursor: "pointer" }}
            >
              💎 GENERATE NFT VERSION
            </button>
          </div>
        </div>

        {/* Right — Item grid */}
        <aside style={{ width: 280, borderLeft: "1px solid rgba(255,255,255,0.06)", padding: 16, overflowY: "auto" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
            {activeCategory} — {items.length} ITEMS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map(item => {
              const isSelected = selected[activeCategory] === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(s => ({ ...s, [activeCategory]: item.id }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 9, cursor: "pointer", textAlign: "left",
                    background: isSelected ? `${RARITY_COLOR[item.rarity]}12` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? RARITY_COLOR[item.rarity] : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? RARITY_COLOR[item.rarity] : "#fff", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: RARITY_COLOR[item.rarity], letterSpacing: "0.08em" }}>
                        {item.rarity}
                      </span>
                      {!item.owned && (
                        <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>
                          💎 {item.cost}
                        </span>
                      )}
                      {item.owned && (
                        <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>OWNED</span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: 9, color: RARITY_COLOR[item.rarity], fontWeight: 800 }}>✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
