"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AudienceScene from "@/components/live/AudienceScene";
import { useAudienceWorld } from "@/lib/live/useAudienceWorld";

interface Props { params: { id: string } }

const SEED: Record<string, { name: string; rank: number; genre: string; xp: number; emoji: string; color: string; wins: number; battles: number; cyphers: number; bio: string; isLive: boolean }> = {
  "wavetek":    { name: "Wavetek",     rank: 1,  genre: "Hip-Hop",  xp: 98400, emoji: "🎤", color: "#FF2DAA", wins: 47, battles: 54, cyphers: 112, bio: "Freestyle king from Brooklyn. Crown holder Vol. 7.",              isLive: true  },
  "nova-cipher":{ name: "Nova Cipher", rank: 2,  genre: "R&B/Trap", xp: 94200, emoji: "👑", color: "#FFD700", wins: 41, battles: 49, cyphers: 98,  bio: "Multi-genre producer and battle rapper. Top 3 for 6 seasons.",    isLive: false },
  "krypt":      { name: "Krypt",       rank: 3,  genre: "Drill",    xp: 89700, emoji: "🔥", color: "#AA2DFF", wins: 38, battles: 44, cyphers: 87,  bio: "Drill pioneer. Undefeated in 3v3 formats. NFT artist.",           isLive: true  },
  "bar-god":    { name: "Bar God",     rank: 4,  genre: "Lyrical",  xp: 85100, emoji: "⚔️", color: "#00FFFF", wins: 35, battles: 41, cyphers: 79,  bio: "Bar-for-bar lyricist. Written battles champion 2025.",             isLive: false },
};

export default function RankingProfilePage({ params }: Props) {
  const slug = params.id;
  const performer = SEED[slug] ?? {
    name: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    rank: 99, genre: "Various", xp: 10000, emoji: "🎙️", color: "#00FFFF",
    wins: 5, battles: 10, cyphers: 20, bio: "Rising star on the TMI network.",
    isLive: false,
  };

  const { entities } = useAudienceWorld(`ranking-${slug}`);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "11px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/rankings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Rankings</Link>
        {performer.isLive && (
          <span style={{ fontSize: 9, fontWeight: 900, color: "#FF2020", background: "rgba(255,32,32,0.15)", padding: "3px 10px", borderRadius: 20, letterSpacing: "0.14em" }}>● LIVE NOW</span>
        )}
      </nav>

      {/* Mini 3D arena preview */}
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <AudienceScene entities={entities} venue={1} view="fan" accentColor={performer.color} bpm={130} screenLabel={performer.name} screenSubLabel={`RANK #${performer.rank}`} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #050510 100%)" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "-40px auto 0", padding: "0 20px", position: "relative", zIndex: 2 }}>
        {/* Profile card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${performer.color}33`, borderRadius: 18, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${performer.color}22`, border: `3px solid ${performer.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{performer.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "clamp(20px,3vw,28px)", fontWeight: 900 }}>{performer.name}</h1>
                <span style={{ fontSize: 11, color: performer.color, fontWeight: 800 }}>#{performer.rank}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{performer.genre}</div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{performer.bio}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: performer.color }}>{performer.xp.toLocaleString()}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>XP</div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "WINS",    value: performer.wins.toString(),    color: "#00FF88" },
            { label: "BATTLES", value: performer.battles.toString(), color: performer.color },
            { label: "CYPHERS", value: performer.cyphers.toString(), color: "#00FFFF" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/rooms/${slug}-stage?autoSeat=1`} style={{ padding: "11px 22px", background: performer.color, color: "#000", borderRadius: 10, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>
            {performer.isLive ? "▶ WATCH LIVE" : "📅 BOOK SHOW"}
          </Link>
          <Link href="/vote" style={{ padding: "11px 22px", background: "transparent", color: performer.color, border: `1px solid ${performer.color}44`, borderRadius: 10, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>
            👑 VOTE FOR CROWN
          </Link>
          <Link href="/messages" style={{ padding: "11px 22px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>
            💬 MESSAGE
          </Link>
          <Link href={`/api/stripe/checkout?priceId=price_tip&amount=500&productName=${encodeURIComponent("Tip for " + performer.name)}&mode=payment`} style={{ padding: "11px 22px", background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>
            💰 TIP
          </Link>
        </div>

        <div style={{ marginTop: 28, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/rankings" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Full Rankings</Link>
          <Link href="/battles" style={{ fontSize: 11, color: "#FF2DAA", textDecoration: "none" }}>⚔️ Battle This Performer</Link>
          <Link href="/live/rooms" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>🎭 Find Their Room</Link>
        </div>
      </div>
    </main>
  );
}
