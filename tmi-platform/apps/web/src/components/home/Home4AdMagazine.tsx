"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import LiveMagazineVoiceTicker from "./LiveMagazineVoiceTicker";
import { VENUE_REGISTRY } from '@/lib/venues/VenueRegistry';
import RoomContainer from '@/components/room/RoomContainer';
import WidgetDrawer from '@/components/room/WidgetDrawer';
import NeonWaveUnderlay from '@/components/atmosphere/NeonWaveUnderlay';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';

// ─── Sponsor sticker chaos — race car jacket layout ───────────────────────────

type StickerAd = {
  id: string;
  label: string;
  href: string;
  bg: string;
  color: string;
  border: string;
  size: number;       // px
  x: number;         // % from left
  y: number;         // % from top
  rotate: number;    // deg
  zIndex: number;
  shape: "pill" | "rect" | "diamond" | "badge";
  glow: string;
  pulse?: boolean;
};

const STICKER_ADS: StickerAd[] = [
  { id: "s1",  label: "BEATS BY RAD",      href: "/advertiser/beats-by-rad",      bg: "#FF2DAA", color: "#fff",    border: "#fff3",      size: 90,  x: 4,   y: 8,   rotate: -12, zIndex: 10, shape: "pill",    glow: "#FF2DAA" },
  { id: "s2",  label: "TRAP NATION",       href: "/advertiser/trap-nation",       bg: "#050510", color: "#00FFFF", border: "#00FFFF",    size: 110, x: 14,  y: 18,  rotate: 7,   zIndex: 8,  shape: "rect",    glow: "#00FFFF" },
  { id: "s3",  label: "CROWN AUDIO",       href: "/advertiser/crown-audio",       bg: "#FFD700", color: "#000",    border: "#000",       size: 80,  x: 28,  y: 5,   rotate: -5,  zIndex: 12, shape: "badge",   glow: "#FFD700", pulse: true },
  { id: "s4",  label: "VERSE APPAREL",     href: "/advertiser/verse-apparel",     bg: "#AA2DFF", color: "#fff",    border: "#fff2",      size: 105, x: 42,  y: 22,  rotate: 14,  zIndex: 7,  shape: "rect",    glow: "#AA2DFF" },
  { id: "s5",  label: "808 STUDIO",        href: "/advertiser/808-studio",        bg: "#FF6B35", color: "#fff",    border: "#fff3",      size: 95,  x: 58,  y: 10,  rotate: -18, zIndex: 11, shape: "pill",    glow: "#FF6B35" },
  { id: "s6",  label: "NEON RECORDS",      href: "/advertiser/neon-records",      bg: "#00FFFF", color: "#000",    border: "#000",       size: 88,  x: 72,  y: 3,   rotate: 9,   zIndex: 9,  shape: "badge",   glow: "#00FFFF", pulse: true },
  { id: "s7",  label: "FLEX ENERGY",       href: "/advertiser/flex-energy",       bg: "#050510", color: "#FF2DAA", border: "#FF2DAA",    size: 120, x: 82,  y: 16,  rotate: -4,  zIndex: 6,  shape: "rect",    glow: "#FF2DAA" },
  { id: "s8",  label: "LYRIC THREADS",     href: "/advertiser/lyric-threads",     bg: "#FFD700", color: "#050510", border: "#050510",    size: 75,  x: 3,   y: 38,  rotate: 16,  zIndex: 8,  shape: "pill",    glow: "#FFD700" },
  { id: "s9",  label: "RIPPLE SOUND",      href: "/advertiser/ripple-sound",      bg: "#AA2DFF", color: "#fff",    border: "#fff2",      size: 100, x: 18,  y: 48,  rotate: -22, zIndex: 10, shape: "badge",   glow: "#AA2DFF", pulse: true },
  { id: "s10", label: "GOLD CROWN VODKA",  href: "/advertiser/gold-crown-vodka",  bg: "#FFD700", color: "#000",    border: "#000",       size: 130, x: 35,  y: 42,  rotate: 6,   zIndex: 13, shape: "rect",    glow: "#FFD700", pulse: true },
  { id: "s11", label: "STAGE LOUD",        href: "/advertiser/stage-loud",        bg: "#FF2DAA", color: "#fff",    border: "#fff3",      size: 85,  x: 54,  y: 55,  rotate: -10, zIndex: 7,  shape: "pill",    glow: "#FF2DAA" },
  { id: "s12", label: "CYPHER FEST",       href: "/events/cypher-fest",           bg: "#00FFFF", color: "#000",    border: "#000",       size: 140, x: 68,  y: 44,  rotate: 11,  zIndex: 14, shape: "rect",    glow: "#00FFFF", pulse: true },
  { id: "s13", label: "BASS REPUBLIC",     href: "/advertiser/bass-republic",     bg: "#050510", color: "#FFD700", border: "#FFD700",    size: 92,  x: 84,  y: 52,  rotate: -7,  zIndex: 9,  shape: "badge",   glow: "#FFD700" },
  { id: "s14", label: "WAVE COLLECTIVE",   href: "/advertiser/wave-collective",   bg: "#FF6B35", color: "#fff",    border: "#fff3",      size: 78,  x: 7,   y: 65,  rotate: 19,  zIndex: 8,  shape: "pill",    glow: "#FF6B35" },
  { id: "s15", label: "STREET BEAT WEAR",  href: "/advertiser/street-beat-wear",  bg: "#AA2DFF", color: "#fff",    border: "#fff2",      size: 115, x: 24,  y: 70,  rotate: -14, zIndex: 11, shape: "rect",    glow: "#AA2DFF", pulse: true },
  { id: "s16", label: "TMI GOLD PASS",     href: "/subscribe",                    bg: "#FFD700", color: "#000",    border: "#000",       size: 155, x: 44,  y: 66,  rotate: 3,   zIndex: 15, shape: "badge",   glow: "#FFD700", pulse: true },
  { id: "s17", label: "BATTLE SKINS",      href: "/advertiser/battle-skins",      bg: "#FF2DAA", color: "#fff",    border: "#fff3",      size: 88,  x: 64,  y: 72,  rotate: -20, zIndex: 8,  shape: "pill",    glow: "#FF2DAA" },
  { id: "s18", label: "HYPNOTIC INK",      href: "/advertiser/hypnotic-ink",      bg: "#050510", color: "#00FFFF", border: "#00FFFF",    size: 98,  x: 79,  y: 68,  rotate: 13,  zIndex: 10, shape: "rect",    glow: "#00FFFF" },
];

// ─── Billboard hero ads ───────────────────────────────────────────────────────

const BILLBOARD_ADS = [
  { id: "b1", headline: "CYPHER FEST 2026",     sub: "The Biggest Battle Event of the Year",  cta: "GET TICKETS",  ctaHref: "/events/cypher-fest",     accent: "#00FFFF", bg: "linear-gradient(135deg, #050510 0%, #0a0a2a 40%, #00161a 100%)", badge: "LIVE EVENT" },
  { id: "b2", headline: "TMI GOLD PASS",         sub: "Unlimited Access to Every Show + Battles + Cyphers",  cta: "JOIN NOW — FREE",  ctaHref: "/auth",     accent: "#FFD700", bg: "linear-gradient(135deg, #0a0800 0%, #1a1200 40%, #050510 100%)", badge: "LIMITED TIME" },
  { id: "b3", headline: "MONDAY NIGHT STAGE",   sub: "Your Favorite Artists Live Every Monday",  cta: "SET REMINDER",  ctaHref: "/events/monday-night-stage",  accent: "#FF2DAA", bg: "linear-gradient(135deg, #120510 0%, #1a0515 40%, #050510 100%)", badge: "WEEKLY" },
  { id: "b4", headline: "WORLD DANCE PARTY",    sub: "3,000+ Fans. 60+ Countries. One Stage.",  cta: "JOIN THE PARTY",  ctaHref: "/events/world-dance-party",  accent: "#AA2DFF", bg: "linear-gradient(135deg, #0a0515 0%, #12051a 40%, #050510 100%)", badge: "GLOBAL" },
];

// ─── Venue / ticket sales — registry-driven ──────────────────────────────────

const VENUE_TIER_COLORS: Record<string, string> = { Diamond: '#00FFFF', Platinum: '#FF2DAA', Gold: '#FFD700', Silver: '#C0C0C0', RUBY: '#FF6B35' };
const VENUE_CAT_ICONS: Record<string, string> = { Arena: '🏟️', Stadium: '🏆', Theater: '🎭', Club: '🎤', Studio: '🎛️', Lounge: '🛋️', Outdoor: '🌿', Virtual: '🌐' };

const VENUES = VENUE_REGISTRY.slice(0, 6).map((v) => ({
  id: v.id,
  name: v.name.toUpperCase(),
  date: `${v.city}${v.isLive ? ' · LIVE NOW' : ' · UPCOMING'}`,
  price: v.ticketPriceUsd === 0 ? 'FREE' : `$${v.ticketPriceUsd}`,
  sold: v.occupancyPct,
  href: v.ticketRoute,
  accent: VENUE_TIER_COLORS[v.tier] ?? '#FFD700',
  icon: VENUE_CAT_ICONS[v.category] ?? '🎵',
}));

// ─── Animated billboard hero ──────────────────────────────────────────────────

function BillboardHero() {
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % BILLBOARD_ADS.length);
        setTransitioning(false);
      }, 350);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const ad = BILLBOARD_ADS[idx]!;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, marginBottom: 32, minHeight: 220 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            background: ad.bg,
            borderRadius: 16,
            padding: "48px 40px 40px",
            border: `1.5px solid ${ad.accent}44`,
            boxShadow: `0 0 60px ${ad.accent}22, 0 4px 32px rgba(0,0,0,0.6)`,
            position: "relative",
            overflow: "hidden",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Animated glow orb */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "-20%", right: "-10%",
              width: "60%", height: "160%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ad.accent}55 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          {/* Scan line effect */}
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(to bottom, transparent 45%, ${ad.accent}12 50%, transparent 55%)`,
              pointerEvents: "none",
            }}
          />

          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: ad.accent, marginBottom: 12 }}>
            {ad.badge}
          </span>
          <div style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 10, fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)", letterSpacing: "0.04em" }}>
            {ad.headline}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 24, fontWeight: 500 }}>
            {ad.sub}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href={ad.ctaHref} style={{ textDecoration: "none" }}>
              <motion.span
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "inline-block",
                  background: ad.accent,
                  color: ad.accent === "#FFD700" || ad.accent === "#00FFFF" ? "#000" : "#fff",
                  borderRadius: 8, padding: "12px 28px",
                  fontWeight: 900, fontSize: 12, letterSpacing: "0.12em",
                  fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)",
                  cursor: "pointer", textTransform: "uppercase",
                  boxShadow: `0 0 20px ${ad.accent}60`,
                }}
              >
                {ad.cta}
              </motion.span>
            </Link>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {BILLBOARD_ADS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  style={{
                    width: i === idx ? 20 : 6, height: 6,
                    borderRadius: 999,
                    background: i === idx ? ad.accent : "rgba(255,255,255,0.22)",
                    border: "none", cursor: "pointer", padding: 0,
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Sponsor sticker chaos wall ───────────────────────────────────────────────

function StickerChaosWall() {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", height: 520, marginBottom: 40, overflow: "hidden", borderRadius: 16 }}>
      {/* Dark grunge background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(145deg, #0a0510, #060610, #0a0508)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
      }} />
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        borderRadius: 16,
        pointerEvents: "none",
      }} />

      {/* Section label */}
      <div style={{
        position: "absolute", top: 18, left: 24,
        fontSize: 8, fontWeight: 900, letterSpacing: "0.3em",
        color: "rgba(255,255,255,0.3)", textTransform: "uppercase", zIndex: 20,
      }}>
        Sponsors & Partners
      </div>

      {STICKER_ADS.map((s) => {
        const isHovered = hoverId === s.id;
        const borderRadius = s.shape === "pill" ? 999 : s.shape === "diamond" ? 4 : s.shape === "badge" ? 10 : 8;

        return (
          <Link key={s.id} href={s.href} style={{ textDecoration: "none" }}>
            <motion.div
              onHoverStart={() => setHoverId(s.id)}
              onHoverEnd={() => setHoverId(null)}
              animate={s.pulse ? {
                boxShadow: [
                  `0 0 8px ${s.glow}40`,
                  `0 0 22px ${s.glow}90`,
                  `0 0 8px ${s.glow}40`,
                ],
              } : {
                boxShadow: isHovered
                  ? `0 0 28px ${s.glow}80`
                  : `0 0 6px ${s.glow}30`,
              }}
              whileHover={{ scale: 1.15, zIndex: 50 }}
              whileTap={{ scale: 0.95 }}
              transition={s.pulse ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size * 0.48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: s.bg,
                color: s.color,
                border: `1.5px solid ${s.border}`,
                borderRadius,
                transform: `rotate(${s.rotate}deg)`,
                zIndex: s.zIndex,
                cursor: "pointer",
                padding: "0 12px",
                fontSize: Math.max(7, Math.min(11, s.size * 0.085)),
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {s.label}
            </motion.div>
          </Link>
        );
      })}

      {/* "Advertise Here" ghost slot */}
      <Link href="/advertiser" style={{ textDecoration: "none" }}>
        <motion.div
          whileHover={{ scale: 1.08, borderColor: "#FF2DAA", color: "#FF2DAA" }}
          style={{
            position: "absolute", right: "4%", bottom: "8%",
            width: 130, height: 60,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px dashed rgba(255,45,170,0.35)",
            borderRadius: 10, color: "rgba(255,45,170,0.4)",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer",
            zIndex: 20,
          }}
        >
          + ADVERTISE HERE
        </motion.div>
      </Link>
    </div>
  );
}

// ─── Venue / concert ticket cards ────────────────────────────────────────────

function VenueTicketRail() {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FFD700", textTransform: "uppercase" }}>
          Concerts &amp; Events — Get Tickets
        </div>
        <Link href="/events" style={{ textDecoration: "none", fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          ALL EVENTS →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {VENUES.map((v, i) => (
          <VenueCard key={v.id} venue={v} delay={i * 0.06} />
        ))}
      </div>
    </div>
  );
}

function VenueCard({ venue: v, delay }: { venue: typeof VENUES[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={v.href} style={{ textDecoration: "none" }}>
        <motion.div
          whileHover={{ scale: 1.03, boxShadow: `0 0 28px ${v.accent}44` }}
          style={{
            background: "linear-gradient(145deg, rgba(12,12,28,0.96), rgba(5,5,16,0.98))",
            border: `1px solid ${v.accent}44`,
            borderRadius: 12,
            padding: "18px 20px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Pulse dot if sold > 70 */}
          {v.sold > 70 && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                position: "absolute", top: 14, right: 14,
                width: 7, height: 7, borderRadius: "50%",
                background: v.accent,
                boxShadow: `0 0 8px ${v.accent}`,
              }}
            />
          )}

          <div style={{ fontSize: 22, marginBottom: 8 }}>{v.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "0.04em" }}>{v.name}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 14, fontWeight: 700 }}>{v.date}</div>

          {/* Sold bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginBottom: 14, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${v.sold}%` }}
              transition={{ duration: 0.8, delay: delay + 0.3, ease: "easeOut" }}
              style={{ height: "100%", background: v.accent, borderRadius: 99 }}
            />
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 14 }}>
            {v.sold}% SOLD
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: v.accent, letterSpacing: "0.04em" }}>{v.price}</span>
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
              background: v.accent, color: v.accent === "#FFD700" || v.accent === "#00FFFF" ? "#000" : "#fff",
              borderRadius: 6, padding: "4px 10px",
            }}>
              {v.price === "FREE" ? "RSVP" : "BUY"}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Animated inline ad strip ─────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "🎤 CYPHER FEST TICKETS ON SALE NOW",
  "⭐ TMI GOLD PASS — FIRST MONTH FREE",
  "🎶 MONDAY NIGHT STAGE — EVERY WEEK",
  "🏆 VOTE LIVE FOR YOUR FAVORITE ARTIST",
  "💃 WORLD DANCE PARTY — JOIN 3,000+ FANS",
  "🎯 DEALER FEUD 1000 FINALS — BUY TICKETS",
  "🎵 ADVERTISE ON TMI — FROM $199/MO",
];

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{
      overflow: "hidden", height: 36,
      background: "linear-gradient(90deg, #FF2DAA, #AA2DFF, #00FFFF, #FFD700, #FF2DAA)",
      backgroundSize: "300% 100%",
      marginBottom: 32,
      display: "flex", alignItems: "center",
      borderRadius: 8,
    }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 60, whiteSpace: "nowrap", paddingLeft: 40 }}
      >
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 900, color: "#050510", letterSpacing: "0.1em" }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main surface ─────────────────────────────────────────────────────────────

export default function Home4AdMagazine() {
  return (
    <RoomContainer roomId="home-4" title="Sponsors & Advertise" accentColor="#FFD700" bpm={90}>
    <div
      style={{
        minHeight: "100svh",
        background: "linear-gradient(160deg, #06040f 0%, #050510 50%, #060412 100%)",
        color: "#fff",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <NeonWaveUnderlay colorA="#FFD700" colorB="#AA2DFF" colorC="#FF2DAA" opacity={0.1} zIndex={0} />
      {/* Background ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "40%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(170,45,255,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "45%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: "30%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,45,170,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* ══ MARKETPLACE MASTHEAD — blueprint Home 4 directive ══ */}
      <div style={{ position: 'relative', zIndex: 1, borderBottom: '2px solid rgba(255,215,0,.3)', background: 'linear-gradient(180deg,rgba(255,215,0,.12),rgba(170,45,255,.06),rgba(5,8,21,.98))', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '.2em', color: 'rgba(255,215,0,.7)', fontWeight: 900, marginBottom: 4 }}>THE MUSICIAN&apos;S INDEX</div>
            <div style={{ fontFamily: 'var(--font-tmi-bebas,"Bebas Neue",Impact,sans-serif)', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: '#FFD700', textShadow: '0 0 14px #FFD70088', letterSpacing: '.04em', lineHeight: 1.05 }}>
              THE MARKETPLACE
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', marginTop: 2 }}>
              WHAT CAN I BUY? · TICKETS · BEATS · PASSES · ADS · MERCH
            </div>
          </div>
          <Link href="/advertiser" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#FFD700', color: '#000', borderRadius: 8, padding: '10px 20px', fontSize: 10, fontWeight: 900, letterSpacing: '.1em', boxShadow: '0 0 16px #FFD70060', cursor: 'pointer' }}>
              ADVERTISE WITH US →
            </div>
          </Link>
        </div>

        {/* 3-panel row: Sponsor Spotlight | Main Billboard | Pre-Roll */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
          <div style={{ background: 'rgba(255,215,0,.07)', border: '1px solid rgba(255,215,0,.25)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#FFD700', letterSpacing: '.15em' }}>SPONSOR SPOTLIGHT</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,.05)', border: '1px dashed rgba(255,215,0,.2)', borderRadius: 8, minHeight: 60, fontSize: 12, color: 'rgba(255,215,0,.35)', textAlign: 'center', padding: 8 }}>YOUR BRAND<br/>FEATURED HERE</div>
            <Link href="/sponsors" style={{ display: 'block', textAlign: 'center', padding: '6px', background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 5, color: '#FFD700', textDecoration: 'none', fontSize: 9, fontWeight: 900, letterSpacing: '.08em' }}>
              GET FEATURED
            </Link>
          </div>

          <div style={{ background: 'linear-gradient(135deg,rgba(255,45,170,.1),rgba(170,45,255,.1))', border: '2px solid rgba(255,45,170,.35)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#FF2DAA', letterSpacing: '.15em' }}>MAIN BILLBOARD AD</div>
              <div style={{ fontSize: 7, background: '#FF2DAA', color: '#fff', padding: '2px 6px', borderRadius: 3, fontWeight: 900 }}>PREMIUM</div>
            </div>
            <div style={{ height: 2, background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF,#00E5FF)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>🎧</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>BRAND TAKEOVER</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)' }}>Premium brand campaign</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/advertiser/buy" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '7px', background: '#FF2DAA', borderRadius: 5, color: '#fff', textDecoration: 'none', fontSize: 9, fontWeight: 900 }}>BUY THIS SLOT</Link>
              <Link href="/advertiser" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '7px', background: 'rgba(255,255,255,.08)', borderRadius: 5, color: '#fff', textDecoration: 'none', fontSize: 9, fontWeight: 700 }}>PREVIEW</Link>
            </div>
          </div>

          <div style={{ background: 'rgba(170,45,255,.07)', border: '1px solid rgba(170,45,255,.25)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#AA2DFF', letterSpacing: '.15em' }}>SPONSORED ARTIST</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(170,45,255,.05)', border: '1px dashed rgba(170,45,255,.2)', borderRadius: 8, minHeight: 60, fontSize: 20 }}>🎤</div>
            <Link href="/advertiser/artist-spotlight" style={{ display: 'block', textAlign: 'center', padding: '6px', background: 'rgba(170,45,255,.15)', border: '1px solid rgba(170,45,255,.3)', borderRadius: 5, color: '#AA2DFF', textDecoration: 'none', fontSize: 9, fontWeight: 900 }}>
              BUY PRE-ROLL AD
            </Link>
          </div>
        </div>

        {/* Advertising Marketplace buttons */}
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'BUY AD PLACEMENT', href: '/advertiser/buy', color: '#FF2DAA' },
            { label: 'CAMPAIGN BUILDER', href: '/advertiser/campaigns', color: '#FFD700' },
            { label: 'AUDIENCE TARGETING', href: '/advertiser/targeting', color: '#00E5FF' },
            { label: 'EVENT SPONSORSHIPS', href: '/events/sponsor', color: '#AA2DFF' },
            { label: 'LIVESTREAM SPONSORSHIPS', href: '/live/sponsor', color: '#00FF88' },
          ].map((btn) => (
            <Link key={btn.href} href={btn.href} style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: 5, border: `1px solid ${btn.color}55`, background: `${btn.color}12`, color: btn.color, fontSize: 8, fontWeight: 900, letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
              {btn.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Header — sponsor stage sub-section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800 }}>SPONSOR PARTNERS</div>
            <div style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, color: "#fff", letterSpacing: "0.04em", fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)" }}>
              SPONSOR STAGE
            </div>
          </div>
          <Link href="/advertiser" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                background: "#FF2DAA",
                color: "#fff",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                cursor: "pointer",
                boxShadow: "0 0 16px #FF2DAA50",
              }}
            >
              ADVERTISE WITH US
            </motion.div>
          </Link>
        </div>

        <MarqueeStrip />
        <LiveMagazineVoiceTicker pageId="home-4" accent="#FFD700" />
        <BillboardHero />
        <StickerChaosWall />
        <VenueTicketRail />

        {/* Bottom CTA strip */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 32,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Link href="/advertiser" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ background: "#FF2DAA", color: "#fff", borderRadius: 8, padding: "12px 24px", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 20px #FF2DAA40" }}>
              Become a Sponsor
            </motion.div>
          </Link>
          <Link href="/events" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ background: "#00FFFF", color: "#000", borderRadius: 8, padding: "12px 24px", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 20px #00FFFF40" }}>
              All Events
            </motion.div>
          </Link>
          <Link href="/home/5" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ background: "#AA2DFF", color: "#fff", borderRadius: 8, padding: "12px 24px", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 20px #AA2DFF40" }}>
              Watch Live Battles →
            </motion.div>
          </Link>
        </div>
      </div>
      {/* ── AD — sponsor marketplace footer banner ── */}
      <UnifiedAdSlot venue="home-4" slotKey="homepageBanner" format="horizontal" label="ADVERTISEMENT" style={{ margin: '0 24px 24px', minHeight: 90 }} accentColor="#FFD700" />

      <WidgetDrawer />
    </div>
    </RoomContainer>
  );
}
