"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type EventSlot = {
  type: "battle" | "cypher" | "livestream" | "issue";
  name: string;
  price: string;
  spotsLeft: number;
  accent: string;
  icon: string;
  href: string;
};

const EVENT_SLOTS: EventSlot[] = [
  { type: "battle",     name: "Crown Duel Night",       price: "$3,200",  spotsLeft: 1, accent: "#FF2DAA", icon: "⚔️",  href: "/advertise" },
  { type: "cypher",     name: "Open Cypher Season 1",   price: "$1,400",  spotsLeft: 2, accent: "#AA2DFF", icon: "⬤",  href: "/advertise" },
  { type: "livestream", name: "Monday Night Stage",      price: "$800",    spotsLeft: 3, accent: "#00FFFF", icon: "📡",  href: "/advertise" },
  { type: "issue",      name: "TMI Issue 02 Sponsor",   price: "$2,100",  spotsLeft: 1, accent: "#FFD700", icon: "📰",  href: "/advertise" },
];

export default function HomePage05EventSponsorGrid() {
  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        EVENT SPONSORSHIP
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {EVENT_SLOTS.map((slot) => (
          <div key={slot.type} style={{
            borderRadius: 8, border: `1px solid ${slot.accent}33`,
            background: `${slot.accent}07`,
            padding: "8px 10px",
          }}>
            <div style={{ fontSize: 14, marginBottom: 4, lineHeight: 1 }}>{slot.icon}</div>
            <div style={{ fontSize: 7, fontWeight: 900, color: "#fff", marginBottom: 1 }}>{slot.name}</div>
            <div style={{ fontSize: 8, fontWeight: 900, color: slot.accent, marginBottom: 4 }}>{slot.price}</div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
              {slot.spotsLeft} spot{slot.spotsLeft !== 1 ? "s" : ""} left
            </div>
            <Link href={slot.href} style={{ textDecoration: "none" }}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: "3px 8px", borderRadius: 999,
                  background: slot.accent, color: "#000",
                  fontSize: 5, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Sponsor
              </motion.span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
