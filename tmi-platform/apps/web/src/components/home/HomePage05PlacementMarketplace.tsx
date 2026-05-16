"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type AdSlot = {
  id: string;
  name: string;
  price: string;
  fill: number; // 0–100 %
  accent: string;
  available: boolean;
  href: string;
  preview: string;
};

const SLOTS: AdSlot[] = [
  { id: "hp-cover",   name: "Homepage Cover",    price: "$1,200 / wk", fill: 85, accent: "#FFD700", available: false, href: "/advertise", preview: "/tmi-curated/home5.png" },
  { id: "hp-banner",  name: "Home 2 Banner",     price: "$650 / wk",   fill: 60, accent: "#00FFFF", available: true,  href: "/advertise", preview: "/tmi-curated/home2.png" },
  { id: "cypher-pre", name: "Cypher Pre-Roll",   price: "$420 / wk",   fill: 40, accent: "#FF2DAA", available: true,  href: "/advertise", preview: "/tmi-curated/mag-66.jpg" },
  { id: "battle-chip",name: "Battle Sponsor Chip",price: "$280 / wk", fill: 20, accent: "#FF6B35", available: true,  href: "/advertise", preview: "/tmi-curated/gameshow-36.jpg" },
  { id: "reward-skin",name: "Reward Card Skin",  price: "$180 / wk",   fill: 10, accent: "#AA2DFF", available: true,  href: "/advertise", preview: "/tmi-curated/mag-42.jpg" },
];

export default function HomePage05PlacementMarketplace() {
  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        PLACEMENT INVENTORY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {SLOTS.map((slot) => (
          <motion.div key={slot.id} whileHover={{ y: -2 }} style={{
            borderRadius: 8, border: `1px solid ${slot.available ? slot.accent + "33" : "rgba(255,255,255,0.06)"}`,
            background: slot.available ? `${slot.accent}06` : "rgba(0,0,0,0.3)",
            padding: "6px 10px",
          }}>
            <div style={{ position: "relative", height: 44, borderRadius: 6, overflow: "hidden", marginBottom: 5, border: `1px solid ${slot.accent}22` }}>
              <ImageSlotWrapper imageId="img-mpnox" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.56))" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: slot.available ? "#fff" : "rgba(255,255,255,0.4)" }}>{slot.name}</span>
                  {!slot.available && (
                    <span style={{ padding: "1px 5px", borderRadius: 999, background: "rgba(255,255,255,0.08)", fontSize: 5, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>FULL</span>
                  )}
                </div>
                <span style={{ fontSize: 7, color: slot.accent, fontWeight: 700 }}>{slot.price}</span>
              </div>
              {slot.available && (
                <Link href={slot.href} style={{ textDecoration: "none" }}>
                  <motion.span
                    whileHover={{ scale: 1.06 }}
                    style={{
                      padding: "3px 9px", borderRadius: 999,
                      background: slot.accent, color: "#000",
                      fontSize: 6, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    Book
                  </motion.span>
                </Link>
              )}
            </div>
            {/* Fill bar */}
            <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${slot.fill}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", background: slot.accent, borderRadius: 1 }}
              />
            </div>
            <div style={{ fontSize: 5, color: "rgba(255,255,255,0.22)", marginTop: 2, letterSpacing: "0.08em" }}>
              {slot.fill}% BOOKED
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
