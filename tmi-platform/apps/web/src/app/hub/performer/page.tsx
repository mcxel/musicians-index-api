"use client";

import { useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import TipBar from "@/components/hud/TipBar";
import TokenBalance from "@/components/hud/TokenBalance";

const NAV_LINKS = [
  { href: "/hub/performer",     label: "Control Room" },
  { href: "/performer/studio",  label: "Studio"       },
  { href: "/performer/profile", label: "Profile"      },
  { href: "/battles",           label: "Battles"      },
  { href: "/battles/new",       label: "Challenge"    },
  { href: "/cypher/stage",      label: "Cypher"       },
  { href: "/beat-vault",        label: "Beat Vault"   },
  { href: "/nft/mint",          label: "Mint NFT"     },
  { href: "/messages",          label: "Messages"     },
  { href: "/settings",          label: "Settings"     },
];

const PERFORMER_ACTIONS = [
  { id: "live-rooms", icon: "🎭", label: "Go Live"  },
  { id: "revenue",    icon: "💰", label: "Revenue"  },
  { id: "rankings",   icon: "🏆", label: "Rankings" },
  { id: "messages",   icon: "💬", label: "Messages" },
  { id: "bookings",   icon: "📅", label: "Bookings" },
];

export default function PerformerHubPage() {
  return (
    <RoomContainer roomId="performer-hub" title="Performer Hub" accentColor="#AA2DFF" bpm={120}>
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
        <NeonWaveUnderlay colorA="#AA2DFF" colorB="#FF2DAA" colorC="#00FFFF" opacity={0.08} zIndex={0} />

        {/* Nav bar */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(170,45,255,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto", backdropFilter: "blur(12px)" }}>
          <HubBackNav accentColor="#AA2DFF" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", flexShrink: 0 }}>Performer Hub</span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              {link.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", gap: 10, alignItems: "center" }}>
            <TokenBalance accentColor="#FFD700" compact />
            <PersonaSwitcher currentRole="performer" compact />
          </div>
        </div>

        {/* Go Live action strip */}
        <div style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, rgba(170,45,255,0.15), rgba(255,45,170,0.08))", borderBottom: "1px solid rgba(170,45,255,0.15)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#AA2DFF", fontWeight: 800 }}>PERFORMER CONTROL ROOM</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 3 }}>Nova Cipher <span style={{ color: "#FFD700", fontSize: 13 }}>· Rank #1</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto", flexWrap: "wrap" }}>
            <Link href="/performer/studio" style={{ padding: "9px 20px", borderRadius: 9, background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em", boxShadow: "0 0 20px rgba(170,45,255,0.35)" }}>
              🔴 GO LIVE
            </Link>
            <Link href="/battles/new" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              ⚔️ CHALLENGE
            </Link>
            <Link href="/nft/mint" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(0,255,255,0.07)", border: "1px solid rgba(0,255,255,0.22)", color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🎨 MINT NFT
            </Link>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <PerformerHubDashboard performerId="nova-cipher" displayName="Nova Cipher" />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Live monitor + Backstage / Green Room */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Live monitor */}
              <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>🎥 LIVE MONITOR</div>
                <LiveMediaWall roomId="performer-hub" title="" mode="wall" nodeCount={4} accentColor="#AA2DFF" enterHref="/performer/studio" compact />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link href="/performer/studio" style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", borderRadius: 8, fontWeight: 900, fontSize: 10, textDecoration: "none", textAlign: "center", letterSpacing: "0.1em" }}>🔴 GO LIVE</Link>
                  <Link href="/live/rooms" style={{ flex: 1, padding: "10px", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", borderRadius: 8, fontWeight: 800, fontSize: 10, textDecoration: "none", textAlign: "center" }}>📡 ROOMS</Link>
                </div>
              </div>

              {/* Green Room / Backstage */}
              <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.18)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00E5FF", fontWeight: 800, marginBottom: 12 }}>🎪 BACKSTAGE / GREEN ROOM</div>
                <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Fans waiting in lobby", value: "847", color: "#00FFFF" },
                    { label: "Show starts in", value: "02:34:18", color: "#FFD700" },
                    { label: "Set list items", value: "4 tracks", color: "#AA2DFF" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Link href="/performer/studio" style={{ flex: 1, padding: "8px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00E5FF", borderRadius: 8, fontWeight: 800, fontSize: 9, textDecoration: "none", textAlign: "center" }}>🎚 SOUND CHECK</Link>
                    <Link href="/rooms/fan-meetup" style={{ flex: 1, padding: "8px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF", borderRadius: 8, fontWeight: 800, fontSize: 9, textDecoration: "none", textAlign: "center" }}>💬 FAN CHAT</Link>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <TipBar performerId="nova-cipher" performerName="Nova Cipher" accentColor="#00E5FF" compact />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Desk + Fan Messages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Booking desk */}
              <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>📅 BOOKING DESK</div>
                {[
                  { venue: "Main Stage",     date: "Jun 8",  time: "8:00 PM", status: "CONFIRMED", color: "#00FF88" },
                  { venue: "Cypher Theater", date: "Jun 12", time: "9:00 PM", status: "PENDING",   color: "#FFD700" },
                  { venue: "Underground",    date: "Jun 15", time: "10 PM",   status: "OPEN",      color: "#00FFFF" },
                ].map(b => (
                  <div key={b.venue} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{b.venue}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{b.date} · {b.time}</div>
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 900, color: b.color, background: `${b.color}15`, border: `1px solid ${b.color}30`, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.1em" }}>{b.status}</span>
                  </div>
                ))}
                <Link href="/performer/dashboard" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>View all bookings →</Link>
              </div>

              {/* Fan messages */}
              <div style={{ background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>💬 FAN MESSAGES</div>
                {[
                  { fan: "SkyFan94",   msg: "Can't wait for tonight!! 🔥", time: "2m" },
                  { fan: "MusicLvr22", msg: "Please play Big Moves first!", time: "5m" },
                  { fan: "BeatHead33", msg: "Ready to tip heavy tonight 💰", time: "8m" },
                ].map(m => (
                  <div key={m.fan} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,45,170,0.2)", border: "1px solid rgba(255,45,170,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🎧</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA" }}>{m.fan} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{m.time}</span></div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{m.msg}</div>
                    </div>
                  </div>
                ))}
                <Link href="/messages" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>View all messages →</Link>
              </div>
            </div>

            {/* Merch Wall + Sponsor Wall */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Merch wall */}
              <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 800 }}>🛒 MERCH WALL</div>
                  <Link href="/store" style={{ fontSize: 9, color: "#00FF88", textDecoration: "none", fontWeight: 700 }}>MANAGE →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { item: "Crown Tee", price: "$35", sold: 12, emoji: "👕" },
                    { item: "Beat Pack", price: "$20", sold: 8,  emoji: "🎛️" },
                    { item: "NFT Drop",  price: "$50", sold: 3,  emoji: "🖼️" },
                  ].map(m => (
                    <div key={m.item} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{m.emoji}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{m.item}</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#00FF88" }}>{m.price}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{m.sold} sold</div>
                    </div>
                  ))}
                </div>
                <Link href="/nft" style={{ display: "block", marginTop: 10, padding: "8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", borderRadius: 8, fontSize: 9, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>🎨 MINT NEW NFT</Link>
              </div>

              {/* Sponsor wall */}
              <div style={{ background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>🤝 SPONSOR WALL</div>
                  <Link href="/hub/sponsor" style={{ fontSize: 9, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>ADD SPONSOR →</Link>
                </div>
                <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" accentColor="#AA2DFF" label="SPONSOR SLOT" style={{ minHeight: 140 }} />
              </div>
            </div>

            {/* Memory Wall + Magazine Features */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Memory wall */}
              <div style={{ background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF6B35", fontWeight: 800 }}>🎞️ MEMORY WALL</div>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Videos · Photos · Audio</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {["🎤","🎵","⚔️","👑","🏆","🔥","💎","🎭"].map((e, i) => (
                    <div key={i} style={{ aspectRatio: "1", background: "rgba(255,255,255,0.04)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", border: "1px solid rgba(255,255,255,0.07)" }}>{e}</div>
                  ))}
                </div>
                <Link href="/fan/theater" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FF6B35", textDecoration: "none", fontWeight: 700 }}>View all memories →</Link>
              </div>

              {/* Magazine features */}
              <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800 }}>📰 MAGAZINE FEATURES</div>
                  <Link href="/magazine" style={{ fontSize: 9, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>READ ALL →</Link>
                </div>
                {[
                  { title: "Nova Cipher: The Crown, The Journey", issue: "Issue 01 · Cover Story", color: "#FFD700" },
                  { title: "Top 10 Cypher Moments of 2026",       issue: "Issue 01 · Feature",     color: "#00FFFF" },
                  { title: "Battle Night — Full Recap",            issue: "Issue 01 · Recap",       color: "#FF2DAA" },
                ].map(a => (
                  <Link key={a.title} href="/magazine" style={{ display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: 9, color: a.color }}>{a.issue}</div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        <ActionCanister actions={PERFORMER_ACTIONS} />
        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
