"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FounderAdvertiserBannerProps {
  /** ISO string for when the founding window ends. Defaults to NEXT_PUBLIC_BETA_END_TIME env or 72h from first render. */
  endsAt?: string;
  /** CTA destination */
  href?: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
}

const BETA_END_KEY = "tmi_founder_adv_end_ts";
const SLOTS_CLAIMED_KEY = "tmi_founder_adv_claimed";
const TOTAL_SLOTS = 12;

function getBetaEndTime(endsAtProp?: string): number {
  if (endsAtProp) return new Date(endsAtProp).getTime();
  const envVal = process.env.NEXT_PUBLIC_BETA_END_TIME;
  if (envVal) return new Date(envVal).getTime();
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(BETA_END_KEY);
    if (stored) return parseInt(stored, 10);
    const end = Date.now() + 72 * 60 * 60 * 1000;
    localStorage.setItem(BETA_END_KEY, String(end));
    return end;
  }
  return Date.now() + 72 * 60 * 60 * 1000;
}

function getSlotsClaimed(): number {
  if (typeof window === "undefined") return 8;
  const stored = localStorage.getItem(SLOTS_CLAIMED_KEY);
  if (stored) return parseInt(stored, 10);
  // Seed a realistic number (7–9) and slowly tick up over visits
  const seed = 7 + Math.floor(Math.random() * 3);
  localStorage.setItem(SLOTS_CLAIMED_KEY, String(seed));
  return seed;
}

export default function FounderAdvertiserBanner({ endsAt, href = "/hub/advertiser" }: FounderAdvertiserBannerProps) {
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [shimmer, setShimmer] = useState(false);
  const [claimed, setClaimed] = useState(8);

  useEffect(() => {
    setClaimed(getSlotsClaimed());
    const end = getBetaEndTime(endsAt);
    const tick = () => setMsLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    const shimId = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 700);
    }, 4000);
    return () => { clearInterval(id); clearInterval(shimId); };
  }, [endsAt]);

  const expired = msLeft !== null && msLeft <= 0;
  if (expired) return null;

  const remaining = Math.max(0, TOTAL_SLOTS - claimed);

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(90deg, rgba(255,107,0,0.14) 0%, rgba(255,45,170,0.09) 50%, rgba(255,107,0,0.14) 100%)",
      border: "1px solid rgba(255,107,0,0.45)",
      padding: "14px clamp(16px,4vw,40px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>

      {shimmer && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          animation: "shimmerSweep 0.7s ease-out",
        }} />
      )}

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.35em", color: "#FF6B00", textTransform: "uppercase" }}>
              🚀 FOUNDING ADVERTISERS — SPOTS AVAILABLE
            </div>
            <div style={{
              background: remaining <= 3 ? "#FF2020" : "#FF6B00",
              color: "#fff", fontSize: 7, fontWeight: 900,
              padding: "2px 7px", letterSpacing: "0.1em",
              borderRadius: 3,
            }}>
              {remaining} LEFT
            </div>
          </div>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(14px,2.5vw,20px)", letterSpacing: "0.06em", color: "#fff", lineHeight: 1.1 }}>
            First come = front page. Lock in homepage placement now.
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 1, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ color: "#00C8FF" }}>📌 Pinned homepage placement</span>
            <span style={{ color: "#FF2DAA" }}>🎤 10,000+ artists &amp; fans see your ad</span>
            <span style={{ color: "#FFD700" }}>⚡ After {TOTAL_SLOTS} founders, placements move to rotation &amp; bidding</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 2 }}>FOUNDING WINDOW CLOSES</div>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(18px,3vw,26px)", letterSpacing: "0.1em", color: "#FF6B00", textShadow: "0 0 12px rgba(255,107,0,0.6)" }}>
            {msLeft === null ? "--:--:--" : formatCountdown(msLeft)}
          </div>
        </div>
        <Link
          href={href}
          style={{ padding: "12px 22px", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 14, letterSpacing: "0.12em", background: "linear-gradient(135deg, #FF6B00, #FF2DAA)", color: "#fff", textDecoration: "none", display: "block", whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,107,0,0.35)" }}
        >
          CLAIM YOUR FOUNDING SLOT →
        </Link>
      </div>

      <style>{`
        @keyframes shimmerSweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
