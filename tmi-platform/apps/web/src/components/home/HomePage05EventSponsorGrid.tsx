"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

type EventSlot = {
  type: "battle" | "cypher" | "livestream" | "issue";
  name: string;
  price: string;
  spotsLeft: number;
  accent: string;
  icon: string;
  href: string;
};

export default function HomePage05EventSponsorGrid() {
  const [slots, setSlots] = useState<EventSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsors/slots")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }
        setSlots(
          (data as Array<any>).map((s) => ({
            type: s.type ?? "battle",
            name: s.name ?? "Event",
            price: s.price ?? "$0",
            spotsLeft: s.spotsLeft ?? 0,
            accent: s.accent ?? "#FFD700",
            icon: s.icon ?? "📌",
            href: s.href ?? "/advertise",
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 6 }}>
        EVENT SPONSORSHIP
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Loading sponsor slots...
          </div>
        ) : slots.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            No sponsor slots available.
          </div>
        ) : (
          slots.map((slot) => (
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
          ))
        )}
      </div>
    </div>
  );
}
