"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listBeatCatalog, type BeatCatalogEntry } from "@/lib/beats/BeatStoreEngine";
import TieredAdSlot from "@/components/ads/TieredAdSlot";

// Pull from BeatStoreEngine — no hardcoded BEATS array
const BEATS = listBeatCatalog();

const LICENSE_TIERS: { key: "mp3-lease" | "wav-lease" | "unlimited-lease" | "exclusive-rights"; label: string; color: string }[] = [
  { key: "mp3-lease",       label: "MP3",       color: "rgba(255,255,255,0.6)" },
  { key: "wav-lease",       label: "WAV",       color: "#FFD700" },
  { key: "unlimited-lease", label: "UNLIMITED", color: "#AA2DFF" },
  { key: "exclusive-rights",label: "EXCLUSIVE", color: "#FF2DAA" },
];

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function BeatCheckoutButton({
  beatId,
  licenseType,
  price,
  label,
  color,
}: {
  beatId: string;
  licenseType: string;
  price: number;
  label: string;
  color: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/beats/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId, licenseType, price }),
        credentials: "include",
      });
      const data = await res.json() as { ok?: boolean; url?: string; error?: string };
      if (data.url) {
        router.push(data.url);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void handleBuy()}
      disabled={loading}
      style={{
        textAlign: "center",
        padding: "8px 4px",
        fontSize: 9,
        fontWeight: 800,
        color: loading ? "rgba(255,255,255,0.3)" : color,
        border: `1px solid ${color}55`,
        borderRadius: 7,
        background: loading ? "rgba(255,255,255,0.04)" : `${color}08`,
        cursor: loading ? "not-allowed" : "pointer",
        width: "100%",
      }}
    >
      {label}<br />{loading ? "…" : fmt(price)}
    </button>
  );
}

function BeatCard({ beat, index }: { beat: BeatCatalogEntry; index: number }) {
  return (
    <article style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 14, padding: "22px" }}>
      {/* Preview zone */}
      <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 10, padding: "16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
        <div style={{ fontSize: 9, color: "rgba(255,215,0,0.5)", fontWeight: 700 }}>WATERMARKED PREVIEW</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{beat.title}</h3>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            by{" "}
            <Link href={`/profile/performer/${beat.producerSlug}`} style={{ color: "#FFD700", textDecoration: "none" }}>
              {beat.producerName}
            </Link>
          </div>
        </div>
        {beat.tags.includes("battle") && (
          <span style={{ fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 4, padding: "3px 8px" }}>BATTLE READY</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, padding: "2px 7px" }}>{beat.genre}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 7px" }}>{beat.bpm} BPM</span>
        {beat.tags.slice(0, 2).map((t) => (
          <span key={t} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>#{t}</span>
        ))}
      </div>

      {/* License buttons — 4 tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {LICENSE_TIERS.map(({ key, label, color }) => {
          const price = beat.licensePricing[key];
          return (
            <BeatCheckoutButton
              key={key}
              beatId={beat.beatId}
              licenseType={key}
              price={price}
              label={label}
              color={color}
            />
          );
        })}
      </div>
    </article>
  );
}

export default function BeatMarketplacePage() {
  const totalBeats = BEATS.length;
  const battleBeats = BEATS.filter((b) => b.tags.includes("battle")).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>TMI BEAT VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Beat Marketplace</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 12px", lineHeight: 1.6 }}>
          License-protected beats from TMI producers. Buy a license — producer keeps ownership.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 28, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          <span>{totalBeats} beats listed</span>
          <span>·</span>
          <span>{battleBeats} battle-ready</span>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/beats/submit" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FFD700", borderRadius: 8, textDecoration: "none" }}>SUBMIT A BEAT</Link>
          <Link href="/beats/auctions" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>BEAT AUCTIONS</Link>
          <Link href="/beats" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>ALL BEATS</Link>
        </div>
      </section>

      {/* Leaderboard ad — free tier */}
      <div style={{ maxWidth: 1100, margin: "24px auto 0", padding: "0 24px" }}>
        <TieredAdSlot tier="free" placement="leaderboard" height={70} />
      </div>

      {/* Beat grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {BEATS.map((beat, i) => (
            <>
              <BeatCard key={beat.beatId} beat={beat} index={i} />
              {/* In-content ad every 3 beats for free users */}
              {(i + 1) % 3 === 0 && i < BEATS.length - 1 && (
                <div key={`ad-${i}`} style={{ gridColumn: "1 / -1" }}>
                  <TieredAdSlot tier="free" placement="in-content" height={80} />
                </div>
              )}
            </>
          ))}
        </div>
      </section>

      {/* Footer ad */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
        <TieredAdSlot tier="free" placement="footer-banner" height={60} />
      </div>
    </main>
  );
}
