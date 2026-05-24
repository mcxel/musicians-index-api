"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type EmoteCategory = "reactions" | "hype" | "fun";

type Emote = {
  id: string;
  label: string;
  emoji: string;
  price: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  category: EmoteCategory;
  owned?: boolean;
  animation?: string;
};

const EMOTES: Emote[] = [
  // Reactions
  { id: "fire",       label: "Fire",        emoji: "🔥", price: 200,  rarity: "common",    category: "reactions", owned: true  },
  { id: "heart",      label: "Heart",       emoji: "❤️", price: 150,  rarity: "common",    category: "reactions", owned: true  },
  { id: "100",        label: "100",         emoji: "💯", price: 200,  rarity: "common",    category: "reactions"               },
  { id: "cry",        label: "Cry",         emoji: "😭", price: 250,  rarity: "uncommon",  category: "reactions"               },
  { id: "goat",       label: "GOAT",        emoji: "🐐", price: 600,  rarity: "rare",      category: "reactions"               },
  { id: "skull",      label: "Dead",        emoji: "💀", price: 300,  rarity: "uncommon",  category: "reactions"               },
  // Hype
  { id: "wave",       label: "Wave",        emoji: "🌊", price: 300,  rarity: "uncommon",  category: "hype"                    },
  { id: "mic",        label: "Mic Drop",    emoji: "🎤", price: 400,  rarity: "uncommon",  category: "hype",      owned: true  },
  { id: "crown",      label: "Crown",       emoji: "👑", price: 500,  rarity: "rare",      category: "hype"                    },
  { id: "zap",        label: "Zap",         emoji: "⚡", price: 250,  rarity: "common",    category: "hype",      owned: true  },
  { id: "rocket",     label: "Rocket",      emoji: "🚀", price: 450,  rarity: "uncommon",  category: "hype"                    },
  { id: "trophy",     label: "Trophy",      emoji: "🏆", price: 700,  rarity: "rare",      category: "hype"                    },
  // Fun
  { id: "star",       label: "Star",        emoji: "⭐", price: 600,  rarity: "rare",      category: "fun"                     },
  { id: "diamond",    label: "Diamond",     emoji: "💎", price: 900,  rarity: "legendary", category: "fun"                     },
  { id: "cash",       label: "Cash",        emoji: "💰", price: 350,  rarity: "uncommon",  category: "fun"                     },
  { id: "eyes",       label: "Eyes",        emoji: "👀", price: 200,  rarity: "common",    category: "fun"                     },
  { id: "clap",       label: "Clap",        emoji: "👏", price: 250,  rarity: "common",    category: "fun",       owned: true  },
  { id: "tmi-logo",   label: "TMI",         emoji: "🎵", price: 1200, rarity: "legendary", category: "fun"                     },
];

const EMOTE_PACKS = [
  { id: "starter",   label: "Starter Pack",    price: 500,  icon: "🎁", emotes: ["fire","zap","clap"],              color: "#00FFFF" },
  { id: "hype-pack", label: "Hype Pack",       price: 1200, icon: "⚡", emotes: ["wave","rocket","trophy","crown"], color: "#FFD700" },
  { id: "legend",    label: "Legend Pack",     price: 2500, icon: "👑", emotes: ["goat","diamond","tmi-logo"],      color: "#AA2DFF", badge: "RARE" },
];

const RARITY_COLORS: Record<string, { color: string; bg: string }> = {
  common:    { color: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
  uncommon:  { color: "#86efac", bg: "rgba(134,239,172,0.08)" },
  rare:      { color: "#00FFFF", bg: "rgba(0,255,255,0.08)"   },
  legendary: { color: "#FFD700", bg: "rgba(255,215,0,0.1)"    },
};

const CATEGORIES: { id: EmoteCategory | "all"; label: string; icon: string }[] = [
  { id: "all",       label: "All",       icon: "✨" },
  { id: "reactions", label: "Reactions", icon: "😮" },
  { id: "hype",      label: "Hype",      icon: "🔥" },
  { id: "fun",       label: "Fun",       icon: "🎉" },
];

export default function EmotesPage() {
  const [activeCategory, setActiveCategory] = useState<EmoteCategory | "all">("all");
  const [animating, setAnimating] = useState<string | null>(null);
  const [owned, setOwned] = useState<Set<string>>(new Set(EMOTES.filter(e => e.owned).map(e => e.id)));

  const displayed = activeCategory === "all" ? EMOTES : EMOTES.filter(e => e.category === activeCategory);

  function triggerAnimation(id: string) {
    setAnimating(id);
    setTimeout(() => setAnimating(null), 1000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", paddingBottom: 80, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/lobbies" style={{ fontSize: 11, color: "#93c5fd", textDecoration: "none" }}>← Lobbies</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <Link href="/store" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Store</Link>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.35em", marginBottom: 8 }}>EMOTES</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 6px" }}>Emote Collection</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Express yourself in live rooms and lobbies. {owned.size} owned.</p>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", gap: 6, alignItems: "center",
                background: activeCategory === cat.id ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeCategory === cat.id ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: activeCategory === cat.id ? "#00FFFF" : "rgba(255,255,255,0.5)" }}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Emote grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 40 }}>
          {displayed.map(emote => {
            const rc = RARITY_COLORS[emote.rarity];
            const isOwned = owned.has(emote.id);
            const isAnimating = animating === emote.id;
            return (
              <motion.div key={emote.id}
                whileHover={{ y: -4, boxShadow: `0 8px 30px ${rc.color}20` }}
                style={{ border: `1px solid ${rc.color}44`, borderRadius: 14, padding: 16, background: rc.bg, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", position: "relative" }}>
                {/* Rarity badge */}
                <div style={{ position: "absolute", top: 8, right: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: rc.color, textTransform: "uppercase" }}>{emote.rarity}</div>

                {/* Emoji with animation */}
                <motion.span
                  animate={isAnimating ? { scale: [1, 1.8, 1], rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  style={{ fontSize: 40, display: "block", cursor: "pointer" }}
                  onClick={() => isOwned && triggerAnimation(emote.id)}>
                  {emote.emoji}
                </motion.span>

                <span style={{ fontWeight: 700, fontSize: 13 }}>{emote.label}</span>
                <span style={{ fontSize: 9, color: rc.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{emote.category}</span>

                {/* Actions */}
                {isOwned ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => triggerAnimation(emote.id)}
                    style={{ width: "100%", padding: "7px", border: "1px solid rgba(0,255,136,0.35)", borderRadius: 7, background: "rgba(0,255,136,0.1)", color: "#00FF88", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Use {isAnimating ? "✨" : ""}
                  </motion.button>
                ) : (
                  <button onClick={() => setOwned(prev => new Set([...prev, emote.id]))}
                    style={{ width: "100%", padding: "7px", border: `1px solid ${rc.color}50`, borderRadius: 7, background: rc.color + "15", color: rc.color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {emote.price} coins
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Emote Packs */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 16 }}>EMOTE PACKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {EMOTE_PACKS.map(pack => (
              <motion.div key={pack.id} whileHover={{ y: -3, boxShadow: `0 8px 30px ${pack.color}18` }}
                style={{ border: `1px solid ${pack.color}30`, borderRadius: 14, padding: "18px 16px", background: pack.color + "08", position: "relative" }}>
                {pack.badge && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 3, background: pack.color + "20", color: pack.color }}>{pack.badge}</span>}
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{pack.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{pack.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: pack.color }}>{pack.price} coins</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {pack.emotes.map(id => {
                    const e = EMOTES.find(em => em.id === id);
                    return <span key={id} style={{ fontSize: 18 }}>{e?.emoji}</span>;
                  })}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{pack.emotes.length} emotes • Save vs. individual</div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ width: "100%", padding: "9px", background: `linear-gradient(135deg,${pack.color}CC,${pack.color}99)`, border: "none", borderRadius: 8, color: "#050510", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                  Buy Pack →
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
