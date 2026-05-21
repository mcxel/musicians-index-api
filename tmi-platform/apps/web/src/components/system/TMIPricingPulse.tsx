"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TIERS = [
  { key: "FREE",    label: "Free",    price: "$0",    color: "rgba(255,255,255,0.55)", badge: null },
  { key: "PRO",     label: "Pro",     price: "$9.99/mo",  color: "#00FFFF",  badge: "POPULAR" },
  { key: "DIAMOND", label: "Diamond", price: "$29.99/mo", color: "#FFD700",  badge: "ELITE"   },
] as const;

const SEASON = { label: "Season Pass", price: "$9.99", color: "#FF2DAA", desc: "All-access · 30 days" };

type Phase = "in" | "visible" | "out" | "gone";

export default function TMIPricingPulse() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 60);
    const t2 = setTimeout(() => setPhase("out"), 5500);
    const t3 = setTimeout(() => setPhase("gone"), 6300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "gone") return null;

  const opacity = phase === "in" ? 0 : phase === "out" ? 0 : 1;
  const translateY = phase === "in" ? -12 : phase === "out" ? -12 : 0;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 300,
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: "opacity 0.6s ease, transform 0.6s ease",
        background: "rgba(5,5,16,0.92)",
        border: "1px solid rgba(255,45,170,0.25)",
        borderRadius: 14,
        padding: "12px 16px",
        minWidth: 240,
        boxShadow: "0 0 24px rgba(255,45,170,0.12), 0 8px 32px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA" }}>TMI MEMBERSHIP</span>
        <Link
          href="/pricing"
          style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
        >
          VIEW ALL →
        </Link>
      </div>

      {/* Tier rows */}
      {TIERS.map((t) => (
        <div
          key={t.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.label}</span>
            {t.badge && (
              <span style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.1em",
                color: t.color, border: `1px solid ${t.color}50`,
                borderRadius: 4, padding: "1px 5px", lineHeight: 1.6,
              }}>
                {t.badge}
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t.price}</span>
        </div>
      ))}

      {/* Season pass */}
      <div style={{
        marginTop: 8,
        background: `${SEASON.color}12`,
        border: `1px solid ${SEASON.color}30`,
        borderRadius: 8,
        padding: "7px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: SEASON.color }}>{SEASON.label}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{SEASON.desc}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: SEASON.color }}>{SEASON.price}</span>
      </div>

      {/* Glow pulse line */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "20%",
        right: "20%",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${SEASON.color}80, transparent)`,
        borderRadius: 1,
      }} />
    </div>
  );
}
