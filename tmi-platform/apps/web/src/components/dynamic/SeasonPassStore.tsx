"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  listSeasonPassOffers,
  seasonPassCheckoutHref,
  type SeasonPassOffer,
} from "@/lib/season/SeasonPassCatalog";

interface EmotePack {
  id: string;
  label: string;
  icon: string;
  priceCents: number;
  description: string;
  perks: string[];
  color: string;
}

/** Emote packs stay separate; season passes come from authoritative catalog ASC. */
const EMOTE_PACKS: EmotePack[] = [
  { id: "ep1", label: "Fire Pack",   icon: "🔥", priceCents: 299, description: "6 fire-themed animated emotes", perks: ["🔥💥🌋🎆✨⚡"], color: "#FF9500" },
  { id: "ep2", label: "Crown Pack",  icon: "👑", priceCents: 499, description: "8 crown & royalty emotes",       perks: ["👑💰🏆🎖🥇💎🌟⭐"], color: "#FFD700" },
  { id: "ep3", label: "Cypher Pack", icon: "🎤", priceCents: 399, description: "7 battle rap emotes",            perks: ["🎤⚔️🥊🔊📢🎵🎶"], color: "#FF2DAA" },
].sort((a, b) => a.priceCents - b.priceCents);

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function PassCard({ offer }: { offer: SeasonPassOffer }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        borderRadius: 14,
        border: `1px solid ${offer.color}30`,
        background: `linear-gradient(160deg, ${offer.color}08 0%, rgba(4,4,20,0.96) 100%)`,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        flex: "0 0 min(220px, 80vw)",
        scrollSnapAlign: "start",
        opacity: offer.available ? 1 : 0.55,
      }}
    >
      {offer.entry && (
        <div style={{ position: "absolute", top: 0, right: 0, background: offer.color, color: "#000", fontSize: 8, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 0 8px", letterSpacing: "0.1em" }}>
          START HERE
        </div>
      )}
      {offer.popular && !offer.entry && (
        <div style={{ position: "absolute", top: 0, right: 0, background: offer.color, color: "#000", fontSize: 8, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 0 8px", letterSpacing: "0.1em" }}>
          POPULAR
        </div>
      )}
      <div style={{ fontSize: 32, marginBottom: 10 }}>{offer.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: offer.color, marginBottom: 4 }}>{offer.shortLabel}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 14, lineHeight: 1.4 }}>{offer.description}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
        {offer.perks.map((p) => (
          <li key={p} style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "flex", gap: 7, alignItems: "center" }}>
            <span style={{ color: offer.color, fontSize: 9 }}>✓</span>{p}
          </li>
        ))}
      </ul>
      {offer.available ? (
        <Link
          href={seasonPassCheckoutHref(offer)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            background: `linear-gradient(135deg, ${offer.color}, ${offer.color}99)`,
            color: "#050510",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.14em",
            boxSizing: "border-box",
          }}
        >
          GET FOR {offer.priceDisplay}
        </Link>
      ) : (
        <div style={{ padding: "10px", textAlign: "center", fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }}>
          UNAVAILABLE
        </div>
      )}
    </motion.div>
  );
}

export default function SeasonPassStore() {
  const [tab, setTab] = useState<"passes" | "emotes">("passes");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const seasonPasses = listSeasonPassOffers();

  function handleEmoteBuy(id: string) {
    const item = EMOTE_PACKS.find((p) => p.id === id);
    setToastMsg(`${item?.label ?? "Item"} — checkout coming soon`);
    setTimeout(() => setToastMsg(null), 2500);
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 800, color: "#AA2DFF", marginBottom: 6 }}>SEASON STORE</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.01em" }}>Passes & Emote Packs</h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
          Season passes start at {seasonPasses[0]?.priceDisplay ?? "$1.99"} — separate from monthly memberships.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["passes", "emotes"] as const).map((t) => (
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

      {tab === "passes" ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 4,
          }}
        >
          {seasonPasses.map((offer) => (
            <PassCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {EMOTE_PACKS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              style={{
                borderRadius: 14,
                border: `1px solid ${item.color}30`,
                background: `linear-gradient(160deg, ${item.color}08 0%, rgba(4,4,20,0.96) 100%)`,
                padding: "20px",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{item.description}</div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleEmoteBuy(item.id)}
                style={{
                  width: "100%", padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}99)`,
                  color: "#050510", fontSize: 10, fontWeight: 900, letterSpacing: "0.14em",
                }}
              >
                GET FOR {formatUsd(item.priceCents)}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

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
