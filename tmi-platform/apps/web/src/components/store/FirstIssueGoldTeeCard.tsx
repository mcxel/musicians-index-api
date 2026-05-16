"use client";

// FirstIssueGoldTeeCard
// Home 2 Platform Belt store card for the First Issue Gold Tee avatar wearable
// Points-only · Founder Limited · Collectible

import Link from "next/link";
import { motion } from "framer-motion";

const ITEM = {
  name:     "First Issue Gold Tee",
  type:     "Avatar Wearable",
  rarity:   "Founder Limited",
  effect:   "+Style XP Boost",
  points:   850,
  stock:    "Weekly Rotation",
  href:     "/store/first-issue-gold-tee",
  previewHref: "/avatar/preview?item=outfit-first-issue-gold-tee",
};

export default function FirstIssueGoldTeeCard() {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,215,0,0.35)",
        background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,0,0,0.65))",
        overflow: "hidden",
      }}
    >
      {/* Product image area */}
      <div
        style={{
          height: 100,
          background: "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(170,45,255,0.18), rgba(0,0,0,0.55))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Gold tee visual */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 44, lineHeight: 1, filter: "drop-shadow(0 0 14px rgba(255,215,0,0.65))" }}
        >
          👕
        </motion.div>

        {/* Founder badge */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "2px 7px",
            borderRadius: 999,
            background: "rgba(255,215,0,0.18)",
            border: "1px solid rgba(255,215,0,0.55)",
            fontSize: 6,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#FFD700",
          }}
        >
          Founders Drop
        </div>

        {/* Limited ribbon */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "2px 7px",
            borderRadius: 999,
            background: "rgba(255,45,170,0.18)",
            border: "1px solid rgba(255,45,170,0.5)",
            fontSize: 6,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#FF2DAA",
          }}
        >
          Limited
        </div>

        {/* TMI crest */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "rgba(255,215,0,0.55)",
          }}
        >
          TMI
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        {/* Type + rarity */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 6,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#FFD700",
            }}
          >
            {ITEM.type}
          </span>
          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.22)" }}>·</span>
          <span
            style={{
              fontSize: 6,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#AA2DFF",
            }}
          >
            {ITEM.rarity}
          </span>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 2,
            letterSpacing: "0.04em",
          }}
        >
          {ITEM.name}
        </div>

        <div
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.38)",
            marginBottom: 10,
          }}
        >
          {ITEM.effect} &nbsp;·&nbsp; {ITEM.stock}
        </div>

        {/* Points price + equip button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Link
            href={ITEM.href}
            style={{
              flex: 1,
              textAlign: "center",
              textDecoration: "none",
              padding: "8px 0",
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,215,0,0.10))",
              border: "1px solid rgba(255,215,0,0.55)",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#FFD700",
              textTransform: "uppercase",
            }}
          >
            ⭐ {ITEM.points.toLocaleString()} Pts
          </Link>
        </div>

        {/* Secondary actions */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Preview on Avatar", href: ITEM.previewHref, color: "#AA2DFF" },
            { label: "Gift to Friend",    href: `/store/gift?item=outfit-first-issue-gold-tee`, color: "#FF2DAA" },
            { label: "Save for Later",    href: `/store/wishlist?item=outfit-first-issue-gold-tee`, color: "rgba(255,255,255,0.35)" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              style={{
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                padding: "5px 4px",
                borderRadius: 6,
                border: `1px solid ${action.color}33`,
                fontSize: 6,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: action.color,
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
