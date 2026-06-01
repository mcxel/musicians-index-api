"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudienceScene from "@/components/live/AudienceScene";

// ── Venue catalog with live data ───────────────────────────────────────────
const VENUES = [
  { id: "world-concert",   name: "World Concert",     type: "CONCERT",   color: "#FFD700", venueIndex: 1 as const, cap: 18500, bpm: 120, viewers: 3400, isLive: true,  dance: false, href: "/rooms/world-concert?autoSeat=1",     tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+World+Concert&mode=payment" },
  { id: "battle-arena",   name: "Battle Arena",       type: "BATTLE",    color: "#FF2DAA", venueIndex: 1 as const, cap: 18500, bpm: 145, viewers: 2100, isLive: true,  dance: false, href: "/battles/live",                        tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+Battle+Arena&mode=payment" },
  { id: "challenge-arena",name: "Challenge Arena",    type: "CHALLENGE", color: "#FFD700", venueIndex: 1 as const, cap: 18500, bpm: 130, viewers: 1640, isLive: true,  dance: false, href: "/rooms/challenge-arena?autoSeat=1",    tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+Challenge+Arena&mode=payment" },
  { id: "cypher",         name: "Cypher Arena",       type: "CYPHER",    color: "#00FFFF", venueIndex: 0 as const, cap: 2730,  bpm: 118, viewers: 841,  isLive: true,  dance: false, href: "/rooms/cypher?autoSeat=1",             tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+Cypher+Arena&mode=payment" },
  { id: "monthly-idol",   name: "Monthly Idol",       type: "GAME SHOW", color: "#FF9500", venueIndex: 0 as const, cap: 2730,  bpm: 110, viewers: 1204, isLive: true,  dance: false, href: "/rooms/monthly-idol?autoSeat=1",       tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+Monthly+Idol&mode=payment" },
  { id: "dirty-dozens",   name: "Dirty Dozens",       type: "GAME SHOW", color: "#AA2DFF", venueIndex: 1 as const, cap: 18500, bpm: 120, viewers: 920,  isLive: false, dance: false, href: "/rooms/dirty-dozens?autoSeat=1",       tipHref: "" },
  { id: "monday-stage",   name: "Monday Night Stage", type: "CONCERT",   color: "#00FF88", venueIndex: 0 as const, cap: 2730,  bpm: 118, viewers: 0,    isLive: false, dance: false, href: "/rooms/monday-stage?autoSeat=1",       tipHref: "" },
  { id: "world-dance-party", name: "World Dance Party", type: "DANCE",  color: "#FF2DAA", venueIndex: 2 as const, cap: 5000,  bpm: 138, viewers: 888,  isLive: true,  dance: true,  href: "/rooms/world-dance-party?autoSeat=1",  tipHref: "/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+Dance+Party&mode=payment" },
];

function VenueCard({ v }: { v: typeof VENUES[0] }) {
  const router = useRouter();
  const [viewers, setViewers] = useState(v.viewers);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!v.isLive) return;
    const id = setInterval(() => setViewers(n => Math.max(5, n + Math.floor((Math.random() - 0.38) * 28))), 3500);
    return () => clearInterval(id);
  }, [v.isLive]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: 14, border: `1.5px solid ${hovered ? v.color : v.color + "28"}`, background: hovered ? `${v.color}0A` : "rgba(255,255,255,0.02)", overflow: "hidden", transition: "all 0.18s", boxShadow: hovered ? `0 0 20px ${v.color}22` : "none" }}
    >
      {/* Mini 3D arena preview */}
      <div style={{ height: 110, position: "relative", overflow: "hidden", background: "#050510", cursor: "pointer" }} onClick={() => router.push(v.href)}>
        {v.dance ? (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #0a0010, ${v.color}18)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 7, color: v.color, fontWeight: 900, letterSpacing: "0.18em" }}>NO SEATING · DANCE FLOOR</div>
          </div>
        ) : (
          <AudienceScene venue={v.venueIndex} watcherCount={v.cap} view="fan" accentColor={v.color} bpm={v.bpm} screenLabel={v.name} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #050510 100%)" }} />
        <div style={{ position: "absolute", top: 7, left: 8, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 7px", backdropFilter: "blur(4px)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: v.isLive ? "#FF2020" : "#FFD700", display: "inline-block" }} />
          <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>{v.isLive ? "LIVE" : "SOON"}</span>
        </div>
        <div style={{ position: "absolute", top: 7, right: 8, fontSize: 7, color: "rgba(255,255,255,0.55)", background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4 }}>{viewers.toLocaleString()} 👁</div>
      </div>

      {/* Card body */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 7, fontWeight: 900, color: v.color, background: `${v.color}15`, border: `1px solid ${v.color}30`, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.08em" }}>{v.type}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", flex: 1 }}>{v.name}</span>
        </div>

        {/* Revenue hooks */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {v.isLive && v.tipHref && (
            <Link href={v.tipHref} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", padding: "2px 8px", borderRadius: 6, textDecoration: "none", fontWeight: 800 }}>💰 TIP</Link>
          )}
          <Link href={`/tickets?event=${v.id}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: v.color, background: `${v.color}10`, border: `1px solid ${v.color}25`, padding: "2px 8px", borderRadius: 6, textDecoration: "none", fontWeight: 800 }}>🎫 TICKET</Link>
          <Link href="/subscribe" onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 6, textDecoration: "none", fontWeight: 800 }}>👑</Link>
        </div>

        <button
          onClick={() => router.push(v.href)}
          style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "none", background: hovered ? v.color : `${v.color}18`, color: hovered ? "#000" : v.color, fontSize: 9, fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.15s" }}
        >
          {v.isLive ? "▶ ENTER + SIT" : "📅 SCHEDULE"}
        </button>
      </div>
    </div>
  );
}

export default function WorldLobbySection() {
  const [totalViewers, setTotalViewers] = useState(VENUES.reduce((s, v) => s + v.viewers, 0));

  useEffect(() => {
    const id = setInterval(() => setTotalViewers(v => Math.max(0, v + Math.floor((Math.random() - 0.35) * 60))), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes wlsBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Section header */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 700 }}>THE MUSICIAN'S INDEX — LIVE NOW</div>
        <h2 style={{ margin: "0 0 10px", fontSize: "clamp(20px,3vw,34px)", fontWeight: 900 }}>THE WORLD IS LIVE</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {[
            { v: VENUES.filter(v => v.isLive).length.toString(), l: "VENUES LIVE", c: "#FF2020" },
            { v: totalViewers.toLocaleString(), l: "TOTAL WATCHING", c: "#FFD700" },
            { v: VENUES.length.toString(), l: "WORLDS OPEN", c: "#00FFFF" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>

        {/* Arena Triangle — 3 primary CTAs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { emoji: "⚔️", label: "BATTLE ARENA",   sub: "1v1 · Winner Stays · 18,500", color: "#FF2DAA", href: "/battles/live" },
            { emoji: "⚡", label: "CHALLENGE ARENA", sub: "Song vs Song · Nonstop",       color: "#FFD700", href: "/rooms/challenge-arena?autoSeat=1" },
            { emoji: "🎤", label: "CYPHER ARENA",    sub: "Open Mic · Community Vote",     color: "#00FFFF", href: "/rooms/cypher?autoSeat=1" },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ textDecoration: "none", padding: "14px 12px", borderRadius: 12, background: `linear-gradient(135deg, ${a.color}12, rgba(5,5,16,0.98))`, border: `1.5px solid ${a.color}44`, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 24 }}>{a.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 900, color: a.color, letterSpacing: "0.06em" }}>{a.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{a.sub}</div>
              <div style={{ marginTop: 4, fontSize: 8, fontWeight: 900, color: a.color, letterSpacing: "0.1em" }}>ENTER → </div>
            </Link>
          ))}
        </div>

        {/* All venues grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          {VENUES.map(v => <VenueCard key={v.id} v={v} />)}
        </div>

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { href: "/live/rooms", label: "📡 ALL ROOMS", color: "#FF2020" },
            { href: "/battles", label: "⚔️ BATTLES", color: "#FF2DAA" },
            { href: "/rooms/world-dance-party", label: "💃 DANCE PARTY", color: "#AA2DFF" },
            { href: "/magazine", label: "📖 MAGAZINE", color: "#FFD700" },
            { href: "/subscribe", label: "👑 SUBSCRIBE", color: "#00FF88" },
            { href: "/live/go", label: "🔴 GO LIVE", color: "#FF6B35" },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 8, fontWeight: 800, color: n.color, border: `1px solid ${n.color}28`, textDecoration: "none", background: `${n.color}06`, letterSpacing: "0.08em" }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
