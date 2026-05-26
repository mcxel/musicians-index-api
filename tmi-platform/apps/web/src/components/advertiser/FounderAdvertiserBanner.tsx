"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FounderAdvertiserBannerProps {
  /** ISO string for when the founding window ends. Defaults to NEXT_PUBLIC_BETA_END_TIME env or 48h from first render. */
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

const BETA_END_KEY = "tmi_beta_end_ts";

function getBetaEndTime(endsAtProp?: string): number {
  if (endsAtProp) return new Date(endsAtProp).getTime();
  const envVal = process.env.NEXT_PUBLIC_BETA_END_TIME;
  if (envVal) return new Date(envVal).getTime();

  // Persist 48h window in localStorage so it survives page reloads
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(BETA_END_KEY);
    if (stored) return parseInt(stored, 10);
    const end = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem(BETA_END_KEY, String(end));
    return end;
  }
  return Date.now() + 48 * 60 * 60 * 1000;
}

export default function FounderAdvertiserBanner({ endsAt, href = "/hub/advertiser" }: FounderAdvertiserBannerProps) {
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    const end = getBetaEndTime(endsAt);
    const tick = () => setMsLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);

    // Shimmer pulse every 4s
    const shimId = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 700);
    }, 4000);

    return () => { clearInterval(id); clearInterval(shimId); };
  }, [endsAt]);

  const expired = msLeft !== null && msLeft <= 0;
  if (expired) return null;

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(90deg, rgba(255,107,0,0.12) 0%, rgba(255,45,170,0.08) 50%, rgba(255,107,0,0.12) 100%)",
      border: "1px solid rgba(255,107,0,0.4)",
      padding: "14px clamp(16px,4vw,40px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>

      {/* Shimmer sweep */}
      {shimmer && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          animation: "shimmerSweep 0.7s ease-out",
        }} />
      )}

      {/* Left: badge + text */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.35em", color: "#FF6B00", textTransform: "uppercase" }}>
            FOUNDING ADVERTISERS · 48-HOUR ACCESS
          </div>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(14px,2.5vw,20px)", letterSpacing: "0.06em", color: "#fff", lineHeight: 1.1 }}>
            Your business is LIVE on our billboard right now.
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ color: "#00C8FF" }}>🎯 Free placement</span>
            <span style={{ color: "#FF2DAA" }}>🎤 Reach performers &amp; fans</span>
            <span style={{ color: "#FFD700" }}>📈 Lock your spot before launch</span>
          </div>
        </div>
      </div>

      {/* Right: countdown + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 2 }}>ENDS IN</div>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(18px,3vw,26px)", letterSpacing: "0.1em", color: "#FF6B00", textShadow: "0 0 12px rgba(255,107,0,0.6)" }}>
            {msLeft === null ? "48:00:00" : formatCountdown(msLeft)}
          </div>
        </div>
        <Link
          href={href}
          style={{ padding: "10px 20px", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 13, letterSpacing: "0.12em", background: "linear-gradient(135deg, #FF6B00, #FF2DAA)", color: "#fff", textDecoration: "none", display: "block", whiteSpace: "nowrap" }}
        >
          CLAIM YOUR SLOT →
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
