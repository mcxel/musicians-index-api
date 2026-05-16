"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const PORTALS = [
  { id: "cypher",     label: "Cypher Arena",     emoji: "⬤",  accent: "#AA2DFF", href: "/cypher" },
  { id: "battle",     label: "Battle Arena",     emoji: "⚔️", accent: "#CC0000", href: "/battles" },
  { id: "instrument", label: "Instrument Arena", emoji: "🎸", accent: "#00FFFF", href: "/cypher" },
  { id: "producer",   label: "Producer Arena",   emoji: "🎹", accent: "#FFD700", href: "/cypher" },
  { id: "open",       label: "Open Jam Arena",   emoji: "⭐", accent: "#00FF88", href: "/lobbies" },
];

function PortalButton({ portal, delay }: { portal: typeof PORTALS[0]; delay: number }) {
  return (
    <Link href={portal.href} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "relative", overflow: "hidden",
          borderRadius: 10, cursor: "pointer",
          border: `1.5px solid ${portal.accent}44`,
          background: `${portal.accent}0c`,
          padding: "8px 10px",
          display: "flex", alignItems: "center", gap: 7,
        }}
      >
        {/* Energy ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2 + delay * 0.3, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: -3, borderRadius: 12, border: `1px solid ${portal.accent}22`, pointerEvents: "none" }}
        />

        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: `${portal.accent}18`, border: `1px solid ${portal.accent}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>
          {portal.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: portal.accent, letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {portal.label}
          </div>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>Enter →</div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Home3GatewayPortalCard() {
  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>
        ENTER AN ARENA
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {PORTALS.map((portal, i) => (
          <PortalButton key={portal.id} portal={portal} delay={i * 0.06} />
        ))}
      </div>
    </div>
  );
}
