"use client";

/**
 * @prototype PROTOTYPE — NOT USED IN PRODUCTION (2026-08-01)
 *
 * TMIRoleDrawerDock — role-aware, expandable overlay drawer dock.
 *
 * The canonical production drawer system is:
 *   CommandCenterShell → CommandCenterDrawer → UniversalDrawerRegistry
 *
 * This file is retained as a standalone reference for non-hub surfaces
 * (live room pages, battle pages, embedded contexts). It must NOT replace
 * CommandCenterDrawer inside CommandCenterShell.
 *
 * DRAWER vs PANEL CLASSIFICATION (per owner voice notes 2026-07-31):
 * ─────────────────────────────────────────────────────────────────
 * DRAWERS = persistent workspaces where users manage ongoing information.
 * PANELS  = fast single-action pop-overs for in-the-moment tasks.
 *
 * QUICK PANELS (use QuickPanelDock.tsx):
 *   • Lobby access (Avatar Fan Lobby is panel, NOT drawer)
 *   • Live Wall (browse rooms — panel only)
 *   • Notifications (single-action)
 *   • Online friends (quick browse)
 *   • Queue / Now Playing mini (quick action)
 *
 * ═══════════════════════════════════════════════════════════════
 * PERFORMER DRAWERS (6 total):
 * ─────────────────────────────────────────────────────────────
 * 🎤 Live Control   orbit          orange  #FF6B1A
 *    Go Live · Curtain · Camera · Audio · Lighting · Sponsor Break
 *    Giveaway · Intermission · Performance Presets · Countdowns
 *
 * 📅 Booking        mechanical     cyan    #00D4FF
 *    Incoming Requests · Calendar · Contracts / Deposits
 *    Booker / Venue / Promoter Chat · Travel (Hotel/Flights/Maps)
 *
 * 💼 Sponsor        fold           gold    #FFD700
 *    Active Sponsors · Opportunities · Campaigns · Brand Approvals
 *    Deliverables · Sponsor Messaging · Campaign Performance
 *    Revenue from Sponsors · Renewal Dates
 *
 * 🎵 Media Locker   vinyl_flip     purple  #9B59FF
 *    Songs · Videos · Albums · Photos · Promo Graphics
 *    Press Kits · Downloads
 *
 * 🌟 YoPho          hologram       fuchsia #FF2DAA
 *    YoPho Cards · Motion Cards · Backgrounds · Effects
 *    Animations · Scenes · Now Playing · Sharing · Analytics · QR Code
 *
 * 📊 Analytics      command_lift   green   #00FF88
 *    Revenue (Today → 5yr → Lifetime) · Audience · Content · Performance
 *    Broken down by: Tickets · Merch · Tips · Sponsors · Booking ·
 *    Advertising · Affiliate · Prizes · Digital · Subscriptions
 *
 * ═══════════════════════════════════════════════════════════════
 * FAN DRAWERS (5 total):
 * ─────────────────────────────────────────────────────────────
 * 👤 Avatar         portal         cyan    #00D4FF
 *    Appearance (Hair/Hats/Glasses/Shirts/Pants/Shoes)
 *    Accessories (Chains/Watches/Earrings/Rings)
 *    Props (Mics/Signs/Glow Sticks) · Effects (Aura/Wings/Fire)
 *    Animations (Dance Packs · Walk Styles · Emotes · Idle Poses)
 *
 * 🎁 Prize Vault    memory_scatter orange  #FF6B1A
 *    Digital Prizes · Physical Prizes · Shipping · Tracking
 *    Claims · Coupons
 *
 * ❤️ Favorites      orbit          fuchsia #FF2DAA
 *    Artists · Songs · Videos · Battles · Concerts · YoPho Cards
 *
 * 🌟 YoPho          hologram       fuchsia #FF2DAA  (same as performer)
 *    Fan YoPho Cards · Motion Cards · Themes · Sharing · Now Playing
 *    Scenes · Analytics
 *
 * 📈 Fan Stats      command_lift   purple  #9B59FF
 *    Activity (Hours Watched · Battles · Concerts · Tips · Gifts)
 *    Progress (XP · Level · Rank · Achievements · Streaks)
 *    Spending (Today → Lifetime by: Tickets · Merch · Avatar · YoPho · Tips)
 *
 * ═══════════════════════════════════════════════════════════════
 * DRAWER STATES:
 *   default   → min(50vh, 500px)   — the build size
 *   expanded  → min(78vh, 720px)   — more room
 *   fullscreen → 100dvh            — phone-friendly full view
 * ═══════════════════════════════════════════════════════════════
 */

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CSSProperties } from "react";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import {
  DRAWER_OPEN_HEIGHT,
  type DrawerAnimationId,
} from "@/lib/drawers/DrawerAnimationProfile";

// ─── Lazy canisters ──────────────────────────────────────────────────────────

const MessagingCanister = dynamic(
  () => import("@/components/canisters/MessagingCanister"),
  { ssr: false, loading: () => <LoadingSlot label="Loading Messenger…" /> },
);

// ─── Types ───────────────────────────────────────────────────────────────────

type DrawerRole = "performer" | "fan" | "demo";
type DrawerSize = "default" | "expanded" | "fullscreen";

type PerformerDrawerId = "live_control" | "booking" | "sponsor" | "media_locker" | "yopho" | "analytics";
type FanDrawerId = "avatar" | "prize_vault" | "favorites" | "yopho" | "fan_stats";
type DemoDrawerId = "playlist" | "messenger" | "demo_sponsor" | "demo_analytics" | "demo_yopho";
type DrawerId = PerformerDrawerId | FanDrawerId | DemoDrawerId;

interface DrawerDef {
  id: DrawerId;
  icon: string;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  animation: DrawerAnimationId;
  role: DrawerRole;
}

// ─── Drawer registry ─────────────────────────────────────────────────────────

const PERFORMER_DRAWERS: DrawerDef[] = [
  {
    id: "live_control",
    icon: "🎤",
    label: "LIVE",
    title: "🎤 LIVE CONTROL",
    subtitle: "Go Live · Camera · Audio · Lighting · Sponsor Breaks",
    accent: "#FF6B1A",
    animation: "orbit",
    role: "performer",
  },
  {
    id: "booking",
    icon: "📅",
    label: "BOOKING",
    title: "📅 BOOKING",
    subtitle: "Requests · Calendar · Contracts · Travel",
    accent: "#00D4FF",
    animation: "mechanical",
    role: "performer",
  },
  {
    id: "sponsor",
    icon: "💼",
    label: "SPONSORS",
    title: "💼 SPONSOR HUB",
    subtitle: "Active Sponsors · Campaigns · Revenue · Renewals",
    accent: "#FFD700",
    animation: "fold",
    role: "performer",
  },
  {
    id: "media_locker",
    icon: "🎵",
    label: "MEDIA",
    title: "🎵 MEDIA LOCKER",
    subtitle: "Songs · Videos · Albums · Press Kits",
    accent: "#9B59FF",
    animation: "vinyl_flip",
    role: "performer",
  },
  {
    id: "yopho",
    icon: "🌟",
    label: "YOPHO",
    title: "🌟 YOPHO IDENTITY",
    subtitle: "Cards · Motion · Backgrounds · Effects · QR Code",
    accent: "#FF2DAA",
    animation: "hologram",
    role: "performer",
  },
  {
    id: "analytics",
    icon: "📊",
    label: "ANALYTICS",
    title: "📊 ANALYTICS",
    subtitle: "Revenue · Audience · Content · Performance",
    accent: "#00FF88",
    animation: "command_lift",
    role: "performer",
  },
];

const FAN_DRAWERS: DrawerDef[] = [
  {
    id: "avatar",
    icon: "👤",
    label: "AVATAR",
    title: "👤 AVATAR INVENTORY",
    subtitle: "Appearance · Accessories · Props · Effects · Animations",
    accent: "#00D4FF",
    animation: "portal",
    role: "fan",
  },
  {
    id: "prize_vault",
    icon: "🎁",
    label: "PRIZES",
    title: "🎁 PRIZE VAULT",
    subtitle: "Digital · Physical · Shipping · Claims · Coupons",
    accent: "#FF6B1A",
    animation: "memory_scatter",
    role: "fan",
  },
  {
    id: "favorites",
    icon: "❤️",
    label: "FAVORITES",
    title: "❤️ FAVORITES",
    subtitle: "Artists · Songs · Videos · Battles · Concerts",
    accent: "#FF2DAA",
    animation: "orbit",
    role: "fan",
  },
  {
    id: "yopho",
    icon: "🌟",
    label: "YOPHO",
    title: "🌟 YOPHO IDENTITY",
    subtitle: "Cards · Motion · Themes · Sharing · Analytics",
    accent: "#FF2DAA",
    animation: "hologram",
    role: "fan",
  },
  {
    id: "fan_stats",
    icon: "📈",
    label: "MY STATS",
    title: "📈 FAN STATS",
    subtitle: "Activity · Progress · XP · Spending",
    accent: "#9B59FF",
    animation: "command_lift",
    role: "fan",
  },
];

const DEMO_DRAWERS: DrawerDef[] = [
  {
    id: "playlist",
    icon: "🎵",
    label: "PLAYLIST",
    title: "🎵 PLAYLIST",
    subtitle: "Now Playing · Library · Cast",
    accent: "#FF6B1A",
    animation: "vinyl_flip",
    role: "demo",
  },
  {
    id: "messenger",
    icon: "💬",
    label: "MESSAGES",
    title: "💬 MESSENGER",
    subtitle: "Threads · Calls · Invitations",
    accent: "#00D4FF",
    animation: "mechanical",
    role: "demo",
  },
  {
    id: "demo_sponsor",
    icon: "🤝",
    label: "SPONSORS",
    title: "🤝 SPONSOR",
    subtitle: "Placements · Engagement · Gift Drop",
    accent: "#FFD700",
    animation: "fold",
    role: "demo",
  },
  {
    id: "demo_analytics",
    icon: "📊",
    label: "ANALYTICS",
    title: "📊 ANALYTICS",
    subtitle: "Revenue · Viewers · Fan Club",
    accent: "#9B59FF",
    animation: "command_lift",
    role: "demo",
  },
  {
    id: "demo_yopho",
    icon: "👤",
    label: "YOPHO",
    title: "👤 YOPHO IDENTITY CREATOR",
    subtitle: "Avatar · Vibe · Background · Template",
    accent: "#FF2DAA",
    animation: "hologram",
    role: "demo",
  },
];

const DRAWER_HEIGHTS: Record<DrawerSize, string> = {
  // Align with UniversalDrawerBase open height — claim bottom gap, leave dock chrome.
  default: DRAWER_OPEN_HEIGHT,
  expanded: "min(96vh, 1120px)",
  fullscreen: "100dvh",
};

// ─── Shared UI atoms ─────────────────────────────────────────────────────────

function LoadingSlot({ label }: { label: string }) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: "#7878AA", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

function Rail({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", overflowY: "visible", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory", padding: "4px 16px 10px", ...style }}>
      {children}
    </div>
  );
}

function Card({ minWidth = 220, maxHeight = 400, accent, children, fullWidth }: { minWidth?: number; maxHeight?: number; accent: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{ scrollSnapAlign: "start", flexShrink: fullWidth ? 0 : 1, minWidth: fullWidth ? "min(100%, 600px)" : minWidth, maxHeight, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "#0D0D24", border: `1px solid ${accent}33`, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      {children}
    </div>
  );
}

function Label({ children, color = "#7878AA" }: { children: React.ReactNode; color?: string }) {
  return <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color, textTransform: "uppercase", marginBottom: 2 }}>{children}</div>;
}

function Row({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: `1px solid ${accent ? accent + "22" : "#1A1A3A"}` }}>{children}</div>;
}

function Btn({ children, color, outline }: { children: React.ReactNode; color: string; outline?: boolean }) {
  return (
    <span style={{ padding: "3px 10px", fontSize: 8, fontWeight: 800, borderRadius: 4, background: outline ? `${color}18` : color, border: outline ? `1px solid ${color}88` : "none", color: outline ? color : "#fff", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#0A0A1A", border: "1px solid #1E1E45", borderRadius: 6, padding: 8 }}>
      <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function BarChart({ bars, height = 36 }: { bars: number[]; height?: number }) {
  const max = Math.max(...bars, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {bars.map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: "currentColor", borderRadius: "2px 2px 0 0", opacity: 0.8 }} />
      ))}
    </div>
  );
}

// ─── Size control bar (rendered inside each drawer at top) ────────────────────

function SizeBar({ size, setSize, accent }: { size: DrawerSize; setSize: (s: DrawerSize) => void; accent: string }) {
  const sizes: { key: DrawerSize; icon: string; label: string }[] = [
    { key: "default", icon: "▬", label: "Default" },
    { key: "expanded", icon: "⬒", label: "Expand" },
    { key: "fullscreen", icon: "⛶", label: "Full" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 16px 0", marginBottom: 4 }}>
      <div style={{ fontSize: 8, color: "#7878AA", marginRight: 4, userSelect: "none" }}>SIZE</div>
      {sizes.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => setSize(s.key)}
          title={s.label}
          style={{
            padding: "2px 8px",
            background: size === s.key ? `${accent}22` : "transparent",
            border: `1px solid ${size === s.key ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 4,
            color: size === s.key ? accent : "#7878AA",
            fontSize: 10,
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 0.15s",
          }}
        >
          {s.icon}
        </button>
      ))}
      <span style={{ marginLeft: "auto", fontSize: 7, color: "#7878AA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {size === "fullscreen" ? "Full Screen" : size === "expanded" ? "Expanded" : "Default"}
      </span>
    </div>
  );
}

// ─════════════════════════════════════════════════════════════════════════════
//  PERFORMER DRAWER CONTENTS
// ═════════════════════════════════════════════════════════════════════════════

// 🎤 LIVE CONTROL
function LiveControlContent() {
  const presets = ["Intro", "Main Set", "Encore", "Cypher Mode", "Intermission", "Outro"];
  return (
    <Rail>
      {/* Broadcast Control Card */}
      <Card minWidth={250} accent="#FF6B1A">
        <Label color="#FF6B1A">BROADCAST CONTROL</Label>
        <div style={{ background: "#FF6B1A22", border: "1px solid #FF6B1A44", borderRadius: 6, padding: 10, textAlign: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#FF6B1A", letterSpacing: 2, marginBottom: 4 }}>● READY TO GO LIVE</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            <Btn color="#FF6B1A">▶ GO LIVE</Btn>
            <Btn color="#7878AA" outline>⟳ Rehearsal</Btn>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {[["🎬", "Curtain Up", "#FF6B1A"], ["⏸", "Intermission", "#9B59FF"], ["⏱", "Countdown", "#FFD700"], ["🔄", "Resume", "#00FF88"]].map(([ic, lb, col]) => (
            <div key={lb as string} style={{ background: "#0A0A1A", border: `1px solid ${col as string}33`, borderRadius: 5, padding: "6px 8px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{ic as string}</div>
              <div style={{ fontSize: 7, color: col as string, fontWeight: 800 }}>{lb as string}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Camera + Audio Card */}
      <Card minWidth={220} accent="#9B59FF">
        <Label color="#9B59FF">CAMERA &amp; AUDIO</Label>
        {[["📹 Camera", "#00D4FF", 80], ["🎙 Voice", "#9B59FF", 75], ["🎚 Beat", "#FFD700", 60]].map(([lb, col, val]) => (
          <div key={lb as string} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#E8E8FF", marginBottom: 2 }}>
              <span>{lb as string}</span><span style={{ color: col as string }}>{val}%</span>
            </div>
            <div style={{ height: 3, background: "#1A1A40", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${val}%`, background: col as string, borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>
        ))}
        <Label color="#7878AA">LIGHTING PRESETS</Label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["Concert", "Dramatic", "Warm", "Neon", "Custom"].map((p) => (
            <Btn key={p} color="#9B59FF" outline>{p}</Btn>
          ))}
        </div>
      </Card>

      {/* Performance Presets + Sponsor Break */}
      <Card minWidth={220} accent="#FFD700">
        <Label color="#FFD700">PERFORMANCE PRESETS</Label>
        {presets.map((p) => (
          <Row key={p} accent="#FFD700">
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>▸ {p}</span>
            <Btn color="#FFD700" outline>Load</Btn>
          </Row>
        ))}
        <div style={{ marginTop: 6 }}>
          <Label color="#FF2DAA">SPONSOR BREAK</Label>
          <Btn color="#FF2DAA">🤝 Insert Sponsor Break</Btn>
        </div>
      </Card>

      {/* Giveaway + Countdown */}
      <Card minWidth={200} accent="#00FF88">
        <Label color="#00FF88">GIVEAWAY CONTROLS</Label>
        <div style={{ background: "#00FF8822", border: "1px solid #00FF8844", borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: "#E8E8FF", marginBottom: 4 }}>Active Giveaway</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#00FF88", marginBottom: 6 }}>🎁 Signed Merch Bundle</div>
          <Btn color="#00FF88">Drop to Audience</Btn>
        </div>
        <Label color="#FFD700">COUNTDOWN TIMER</Label>
        <div style={{ background: "#FFD70022", border: "1px solid #FFD70044", borderRadius: 6, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", fontVariantNumeric: "tabular-nums" }}>03:00</div>
          <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
            <Btn color="#FFD700">▶ Start</Btn>
            <Btn color="#7878AA" outline>Reset</Btn>
          </div>
        </div>
      </Card>
    </Rail>
  );
}

// 📅 BOOKING
function BookingContent() {
  const requests = [
    { from: "The Staple Venue", event: "Fri Night Showcase", fee: "$2,400", status: "Pending" },
    { from: "Broad Promoter LLC", event: "Summer Cypher Tour", fee: "$8,500", status: "Pending" },
  ];
  return (
    <Rail>
      {/* Incoming Requests Card */}
      <Card minWidth={280} accent="#00D4FF">
        <Label color="#00D4FF">INCOMING REQUESTS</Label>
        {requests.map((r) => (
          <div key={r.from} style={{ background: "#0A0A1A", border: "1px solid #00D4FF33", borderRadius: 6, padding: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#E8E8FF" }}>{r.from}</span>
              <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 700 }}>{r.fee}</span>
            </div>
            <div style={{ fontSize: 8, color: "#7878AA", marginBottom: 5 }}>{r.event}</div>
            <div style={{ display: "flex", gap: 4 }}>
              <Btn color="#00FF88">✓ Accept</Btn>
              <Btn color="#FF4444" outline>✕ Decline</Btn>
              <Btn color="#00D4FF" outline>💬 Chat</Btn>
            </div>
          </div>
        ))}
        <Row accent="#00D4FF">
          <span style={{ fontSize: 8, color: "#7878AA", flex: 1 }}>Accepted · 5 shows</span>
          <Btn color="#00D4FF" outline>View All</Btn>
        </Row>
        <Row accent="#9B59FF">
          <span style={{ fontSize: 8, color: "#7878AA", flex: 1 }}>Declined · 2</span>
          <Btn color="#9B59FF" outline>View All</Btn>
        </Row>
      </Card>

      {/* Calendar Card */}
      <Card minWidth={230} accent="#9B59FF">
        <Label color="#9B59FF">CALENDAR &amp; AVAILABILITY</Label>
        <div style={{ background: "#0A0A1A", border: "1px solid #9B59FF33", borderRadius: 6, padding: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: "#9B59FF", fontWeight: 800, marginBottom: 4 }}>UPCOMING SHOWS</div>
          {[["Aug 3", "Venue: The Dome", "#00D4FF"], ["Aug 10", "Tour: Miami Leg 1", "#FF6B1A"], ["Aug 18", "Cypher Championship", "#FFD700"]].map(([d, e, c]) => (
            <Row key={d as string} accent="#9B59FF">
              <span style={{ fontSize: 8, color: c as string, fontWeight: 800, minWidth: 36 }}>{d as string}</span>
              <span style={{ fontSize: 8, color: "#E8E8FF" }}>{e as string}</span>
            </Row>
          ))}
        </div>
        <Label color="#7878AA">BLACKOUT DATES</Label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["Aug 5-6", "Aug 22", "Sep 1"].map((d) => (
            <span key={d} style={{ fontSize: 7, color: "#FF4444", background: "#FF444422", border: "1px solid #FF444444", borderRadius: 3, padding: "2px 6px" }}>{d}</span>
          ))}
        </div>
      </Card>

      {/* Contracts Card */}
      <Card minWidth={220} accent="#FFD700">
        <Label color="#FFD700">CONTRACTS</Label>
        {[["Summer Tour Leg 1", "Signed", "$8,500 deposit due"], ["Friday Showcase", "Pending", "Awaiting venue sig."]].map(([n, s, note]) => (
          <div key={n as string} style={{ background: "#0A0A1A", border: "1px solid #FFD70033", borderRadius: 5, padding: 7, marginBottom: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#FFD700", marginBottom: 1 }}>{n as string}</div>
            <div style={{ fontSize: 7, color: s === "Signed" ? "#00FF88" : "#FF6B1A", fontWeight: 700, marginBottom: 2 }}>{s as string}</div>
            <div style={{ fontSize: 7, color: "#7878AA" }}>{note as string}</div>
          </div>
        ))}
      </Card>

      {/* Communication + Travel Card */}
      <Card minWidth={220} accent="#FF6B1A">
        <Label color="#FF6B1A">BOOKER COMMUNICATION</Label>
        {[["Venue Chat", "The Dome · 2 unread", "#FF6B1A"], ["Promoter Chat", "LLC · 1 unread", "#9B59FF"]].map(([t, s, c]) => (
          <Row key={t as string} accent="#FF6B1A">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: "#E8E8FF", fontWeight: 700 }}>{t as string}</div>
              <div style={{ fontSize: 7, color: "#7878AA" }}>{s as string}</div>
            </div>
            <Btn color={c as string} outline>Open</Btn>
          </Row>
        ))}
        <Label color="#7878AA">TRAVEL</Label>
        {[["✈️ Flights", "#00D4FF"], ["🏨 Hotel", "#9B59FF"], ["🗺 Maps", "#FFD700"]].map(([ic, col]) => (
          <Row key={ic as string} accent="#7878AA">
            <span style={{ fontSize: 12 }}>{ic as string}</span>
            <span style={{ fontSize: 8, color: col as string, flex: 1, fontWeight: 700 }}>{(ic as string).slice(3)}</span>
            <Btn color={col as string} outline>View</Btn>
          </Row>
        ))}
      </Card>
    </Rail>
  );
}

// 💼 SPONSOR HUB
function SponsorHubContent() {
  const sponsors = [
    { name: "Lawtigers", status: "Active", revenue: "$4,200", renewal: "Sep 15" },
    { name: "Coca-Cola", status: "Active", revenue: "$12,000", renewal: "Oct 1" },
    { name: "Chipdust", status: "Pending", revenue: "$3,500", renewal: "—" },
    { name: "Brothers Apparel", status: "Renewal Due", revenue: "$6,800", renewal: "Aug 20" },
  ];
  return (
    <Rail>
      {/* Active Sponsors */}
      <Card minWidth={280} accent="#FFD700">
        <Label color="#FFD700">ACTIVE SPONSORS</Label>
        {sponsors.map((s) => (
          <div key={s.name} style={{ background: "#0A0A1A", border: `1px solid #FFD70033`, borderRadius: 6, padding: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#E8E8FF" }}>{s.name}</span>
              <span style={{ fontSize: 8, color: s.status === "Active" ? "#00FF88" : s.status === "Renewal Due" ? "#FF6B1A" : "#FFD700", fontWeight: 700 }}>{s.status}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 8, color: "#00FF88" }}>{s.revenue}</span>
              <span style={{ fontSize: 7, color: "#7878AA" }}>Renews {s.renewal}</span>
            </div>
          </div>
        ))}
        <Btn color="#FFD700">+ Find New Sponsors</Btn>
      </Card>

      {/* Campaign Performance */}
      <Card minWidth={240} accent="#00D4FF">
        <Label color="#00D4FF">CAMPAIGN PERFORMANCE</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          <StatBox label="Impressions" value="847K" color="#00D4FF" />
          <StatBox label="Engagements" value="24.3K" color="#9B59FF" />
          <StatBox label="Clicks" value="8,204" color="#FFD700" />
          <StatBox label="Conversions" value="612" color="#00FF88" />
        </div>
        <Label color="#7878AA">REVENUE FROM SPONSORS</Label>
        <div style={{ color: "#FFD700" }}>
          <BarChart bars={[3200, 4100, 5500, 3800, 7200, 6100, 8400, 12000]} />
        </div>
        <div style={{ fontSize: 7, color: "#7878AA", textAlign: "right", marginTop: 2 }}>Jan → Aug</div>
      </Card>

      {/* Deliverables + Messaging */}
      <Card minWidth={230} accent="#FF6B1A">
        <Label color="#FF6B1A">DELIVERABLES</Label>
        {[["Coca-Cola Post", "Story posts x3", "Due Aug 5", true], ["Lawtigers Mention", "Shoutout in 2 lives", "Due Aug 9", false]].map(([b, d, due, done]) => (
          <Row key={b as string} accent="#FF6B1A">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: "#E8E8FF", fontWeight: 700 }}>{b as string}</div>
              <div style={{ fontSize: 7, color: "#7878AA" }}>{d as string} · {due as string}</div>
            </div>
            <span style={{ fontSize: 9, color: done ? "#00FF88" : "#FF6B1A" }}>{done ? "✓" : "○"}</span>
          </Row>
        ))}
        <Label color="#9B59FF">SPONSOR MESSAGING</Label>
        {["Coca-Cola Brand Team", "Lawtigers Legal"].map((name) => (
          <Row key={name} accent="#9B59FF">
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>{name}</span>
            <Btn color="#9B59FF" outline>Chat</Btn>
          </Row>
        ))}
        <Label color="#FFD700">BRAND APPROVALS</Label>
        <Btn color="#FFD700">📋 Review Queue (3)</Btn>
      </Card>
    </Rail>
  );
}

// 🎵 MEDIA LOCKER
function MediaLockerContent() {
  const categories = [
    { icon: "🎵", label: "Songs", count: 48, color: "#9B59FF" },
    { icon: "🎬", label: "Videos", count: 12, color: "#FF6B1A" },
    { icon: "💿", label: "Albums", count: 3, color: "#00D4FF" },
    { icon: "📸", label: "Photos", count: 140, color: "#FFD700" },
    { icon: "🖼", label: "Promo", count: 28, color: "#FF2DAA" },
    { icon: "📄", label: "Press Kit", count: 5, color: "#00FF88" },
  ];
  return (
    <Rail>
      {/* Category Grid */}
      <Card minWidth={260} accent="#9B59FF">
        <Label color="#9B59FF">MEDIA LIBRARY</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {categories.map((c) => (
            <div key={c.label} style={{ background: "#0A0A1A", border: `1px solid ${c.color}33`, borderRadius: 6, padding: 8, textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{c.icon}</div>
              <div style={{ fontSize: 7, color: c.color, fontWeight: 800 }}>{c.label}</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#E8E8FF" }}>{c.count}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <Btn color="#9B59FF">+ Upload</Btn>
          <Btn color="#FF6B1A" outline>↗ Share</Btn>
        </div>
      </Card>

      {/* Recent Songs */}
      <Card minWidth={240} accent="#FF6B1A">
        <Label color="#FF6B1A">RECENT SONGS</Label>
        {[["Hustle & Flow", "4:18", "48K streams", "#00FF88"], ["Vice City Nights", "3:45", "22K streams", "#9B59FF"], ["Crown Me", "3:12", "35K streams", "#FFD700"]].map(([t, d, s, c]) => (
          <Row key={t as string} accent="#FF6B1A">
            <div style={{ width: 28, height: 28, borderRadius: 4, background: "#9B59FF33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🎵</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, color: "#E8E8FF", fontWeight: 700 }}>{t as string}</div>
              <div style={{ fontSize: 7, color: c as string }}>{s as string} · {d as string}</div>
            </div>
            <Btn color="#FF6B1A" outline>▶</Btn>
          </Row>
        ))}
      </Card>

      {/* Press Kit + Downloads */}
      <Card minWidth={200} accent="#00FF88">
        <Label color="#00FF88">PRESS KIT</Label>
        {["Bio (Short)", "Bio (Full)", "High-Res Photos (ZIP)", "One-Sheet PDF", "EPK PDF"].map((f) => (
          <Row key={f} accent="#00FF88">
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>📎 {f}</span>
            <Btn color="#00FF88" outline>⬇</Btn>
          </Row>
        ))}
        <Label color="#00D4FF">UPLOAD URL</Label>
        <div style={{ background: "#0A0A1A", border: "1px solid #00D4FF33", borderRadius: 5, padding: 6, fontSize: 8, color: "#7878AA" }}>
          Drop a Spotify / YouTube / SoundCloud link…
        </div>
        <Btn color="#00D4FF">Import</Btn>
      </Card>
    </Rail>
  );
}

// 🌟 YOPHO DRAWER (shared — performer + fan share same component, text adapts)
function YoPhoContent({ roleLabel = "PERFORMER" }: { roleLabel?: string }) {
  return (
    <Rail>
      {/* YoPho Card Preview */}
      <Card minWidth={140} accent="#00D4FF">
        <Label color="#00D4FF">YOPHO CARD</Label>
        <div style={{ background: "linear-gradient(135deg,#1A0A2A,#0A0A2A)", borderRadius: 8, padding: 10, border: "2px solid #00D4FF66", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 60, height: 75, borderRadius: 6, background: "linear-gradient(135deg,#FF6B1A,#9B59FF)", marginBottom: 2 }} />
          <div style={{ fontSize: 10, fontWeight: 800, color: "#00D4FF", textAlign: "center" }}>Marshall Dickens</div>
          <div style={{ fontSize: 7, color: "#7878AA", textAlign: "center" }}>{roleLabel}</div>
          <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 14 }}>
            {[4, 8, 6, 12, 9, 5, 10, 7].map((h, i) => <div key={i} style={{ width: 2, height: h, background: "#00D4FF", borderRadius: 1 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          <Btn color="#FF2DAA">Share</Btn>
          <Btn color="#00D4FF" outline>QR</Btn>
        </div>
      </Card>

      {/* Motion Cards & Backgrounds */}
      <Card minWidth={200} accent="#FF2DAA">
        <Label color="#FF2DAA">MOTION CARDS &amp; BACKGROUNDS</Label>
        {[["Recording Studio", "#9B59FF"], ["Cyberpunk City", "#00D4FF"], ["Minimalist Loft", "#7878AA"], ["EDM Festival", "#FF6B1A"]].map(([b, c]) => (
          <Row key={b as string} accent="#FF2DAA">
            <div style={{ width: 28, height: 18, borderRadius: 3, background: `${c as string}33`, border: `1px solid ${c as string}44`, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>{b as string}</span>
            <Btn color={c as string} outline>Use</Btn>
          </Row>
        ))}
        <Label color="#9B59FF">EFFECTS &amp; ANIMATIONS</Label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["Neon Glow", "Confetti", "Smoke", "Wings", "Fire"].map((e) => <Btn key={e} color="#9B59FF" outline>{e}</Btn>)}
        </div>
      </Card>

      {/* Vibe + Scenes */}
      <Card minWidth={200} accent="#9B59FF">
        <Label color="#9B59FF">MY VIBE</Label>
        <div style={{ background: "#9B59FF22", border: "1px solid #9B59FF44", borderRadius: 5, padding: 7, marginBottom: 6 }}>
          {["ADVENTUROUS", "CREATIVE", "TECH-OPTIMIST"].map((v, i) => (
            <div key={v} style={{ fontSize: 11, fontWeight: 800, color: ["#9B59FF", "#00D4FF", "#FF6B1A"][i], letterSpacing: 1 }}>{v}</div>
          ))}
        </div>
        <Label color="#7878AA">SCENES</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {["Live Show", "Studio", "On Tour", "Red Carpet"].map((s) => (
            <div key={s} style={{ background: "#0A0A1A", border: "1px solid #9B59FF33", borderRadius: 4, padding: 5, textAlign: "center", fontSize: 7, color: "#9B59FF", cursor: "pointer" }}>{s}</div>
          ))}
        </div>
        <Btn color="#FF2DAA">💾 Save Certified Template</Btn>
      </Card>

      {/* Analytics */}
      <Card minWidth={180} accent="#FFD700">
        <Label color="#FFD700">YOPHO ANALYTICS</Label>
        <StatBox label="Card Views" value="12.4K" color="#FFD700" />
        <StatBox label="Shares" value="847" color="#FF2DAA" />
        <StatBox label="QR Scans" value="203" color="#00D4FF" />
        <div style={{ color: "#FFD700", marginTop: 4 }}>
          <BarChart bars={[40, 55, 48, 70, 65, 80, 92, 75]} />
        </div>
      </Card>
    </Rail>
  );
}

// 📊 ANALYTICS DRAWER
type RevPeriod = "today" | "week" | "month" | "year" | "5yr" | "lifetime";
function AnalyticsContent() {
  const [period, setPeriod] = useState<RevPeriod>("month");

  const periodData: Record<RevPeriod, { label: string; rev: string; bars: number[] }> = {
    today: { label: "Today", rev: "$1,840", bars: [20, 40, 60, 30, 80, 50, 90, 70, 100, 85] },
    week: { label: "This Week", rev: "$12.4K", bars: [60, 40, 80, 50, 70, 90, 75, 85, 65, 95] },
    month: { label: "This Month", rev: "$184K", bars: [30, 50, 70, 40, 90, 60, 80, 100, 75, 85] },
    year: { label: "This Year", rev: "$1.84M", bars: [20, 40, 50, 60, 80, 70, 90, 85, 95, 100] },
    "5yr": { label: "Last 5 Years", rev: "$6.2M", bars: [15, 30, 50, 70, 100] },
    lifetime: { label: "Lifetime", rev: "$8.1M", bars: [5, 15, 30, 50, 80, 100] },
  };

  const pd = periodData[period];

  const revCategories = [
    { label: "Tickets", value: "38%", color: "#FF6B1A" },
    { label: "Tips", value: "22%", color: "#00FF88" },
    { label: "Merch", value: "18%", color: "#9B59FF" },
    { label: "Sponsors", value: "12%", color: "#FFD700" },
    { label: "Booking", value: "6%", color: "#00D4FF" },
    { label: "Other", value: "4%", color: "#7878AA" },
  ];

  return (
    <Rail>
      {/* Revenue Overview Card */}
      <Card minWidth={300} accent="#00FF88">
        <Label color="#00FF88">REVENUE OVERVIEW</Label>
        {/* Period selector */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
          {(Object.keys(periodData) as RevPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              style={{ padding: "2px 7px", background: period === p ? "#00FF88" : "#0A0A1A", border: `1px solid ${period === p ? "#00FF88" : "#1E1E45"}`, borderRadius: 4, color: period === p ? "#000" : "#7878AA", fontSize: 8, fontWeight: 800, cursor: "pointer" }}
            >
              {periodData[p].label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#00FF88", marginBottom: 4 }}>{pd.rev}</div>
        <div style={{ fontSize: 8, color: "#7878AA", marginBottom: 8 }}>Revenue · {pd.label}</div>
        <div style={{ color: "#00FF88" }}>
          <BarChart bars={pd.bars} height={44} />
        </div>
      </Card>

      {/* Revenue Breakdown */}
      <Card minWidth={230} accent="#FFD700">
        <Label color="#FFD700">REVENUE BY SOURCE</Label>
        {revCategories.map((c) => (
          <div key={c.label} style={{ marginBottom: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 2 }}>
              <span style={{ color: "#E8E8FF" }}>{c.label}</span>
              <span style={{ color: c.color, fontWeight: 800 }}>{c.value}</span>
            </div>
            <div style={{ height: 3, background: "#1A1A40", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: c.value, background: c.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </Card>

      {/* Audience Card */}
      <Card minWidth={230} accent="#00D4FF">
        <Label color="#00D4FF">AUDIENCE</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 6 }}>
          <StatBox label="New Followers" value="+4,231" color="#00D4FF" />
          <StatBox label="Avg Attendance" value="8.6K" color="#9B59FF" />
          <StatBox label="Watch Time" value="184K hrs" color="#FFD700" />
          <StatBox label="Countries" value="47" color="#FF6B1A" />
        </div>
        <Label color="#7878AA">TOP CITIES</Label>
        {[["Atlanta, GA", "#00D4FF"], ["Miami, FL", "#9B59FF"], ["New York, NY", "#FF6B1A"]].map(([c, col]) => (
          <Row key={c as string} accent="#00D4FF">
            <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>● {c as string}</span>
            <span style={{ fontSize: 8, color: col as string, fontWeight: 700 }}>Top 3</span>
          </Row>
        ))}
      </Card>

      {/* Performance Card */}
      <Card minWidth={220} accent="#9B59FF">
        <Label color="#9B59FF">PERFORMANCE</Label>
        <StatBox label="Ranking Move" value="↑ #14 → #8" color="#00FF88" />
        <div style={{ height: 6 }} />
        <StatBox label="XP This Month" value="+24,850" color="#9B59FF" />
        <div style={{ height: 6 }} />
        <Label color="#FFD700">COMPETITION WINS</Label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["🏆 Cypher Champ", "🥇 Battle S4", "⭐ Top Streamer"].map((a) => (
            <span key={a} style={{ fontSize: 7, color: "#FFD700", background: "#FFD70022", border: "1px solid #FFD70044", borderRadius: 3, padding: "2px 5px" }}>{a}</span>
          ))}
        </div>
        <Label color="#00D4FF">BEST CONTENT</Label>
        {[["Hustle & Flow (Video)", "57M"], ["Crown Me (Battle)", "8.2M"], ["Live Concert Aug 1", "12K viewers"]].map(([t, v]) => (
          <Row key={t as string} accent="#00D4FF">
            <span style={{ fontSize: 7, color: "#E8E8FF", flex: 1 }}>{t as string}</span>
            <span style={{ fontSize: 7, color: "#00D4FF", fontWeight: 800 }}>{v as string}</span>
          </Row>
        ))}
      </Card>
    </Rail>
  );
}

// ─════════════════════════════════════════════════════════════════════════════
//  FAN DRAWER CONTENTS
// ═════════════════════════════════════════════════════════════════════════════

// 👤 AVATAR INVENTORY
function AvatarContent() {
  const categories = [
    { section: "APPEARANCE", items: ["💇 Hair", "🎩 Hats", "👓 Glasses", "👕 Shirts", "👖 Pants", "👟 Shoes"], color: "#00D4FF" },
    { section: "ACCESSORIES", items: ["⛓ Chains", "⌚ Watches", "💎 Earrings", "💍 Rings", "📿 Bracelets"], color: "#FF6B1A" },
    { section: "PROPS", items: ["🎤 Mics", "🪧 Signs", "🕯 Glow Sticks", "🥤 Drinks", "📷 Cameras"], color: "#9B59FF" },
    { section: "EFFECTS", items: ["✨ Aura", "🪶 Wings", "🔥 Fire", "💨 Smoke", "⚡ Lightning", "🎉 Confetti"], color: "#FF2DAA" },
    { section: "ANIMATIONS", items: ["💃 Dance Packs", "🚶 Walk Styles", "😄 Emotes", "🧍 Idle Poses"], color: "#FFD700" },
  ];
  return (
    <Rail>
      {categories.map((cat) => (
        <Card key={cat.section} minWidth={190} accent={cat.color}>
          <Label color={cat.color}>{cat.section}</Label>
          {cat.items.map((item) => (
            <Row key={item} accent={cat.color}>
              <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>{item}</span>
              <Btn color={cat.color} outline>Equip</Btn>
            </Row>
          ))}
          <Btn color={cat.color}>+ Get More</Btn>
        </Card>
      ))}
    </Rail>
  );
}

// 🎁 PRIZE VAULT
function PrizeVaultContent() {
  const digital = [
    { name: "Exclusive YoPho Frame", from: "Cypher S4 Win", status: "Claimed" },
    { name: "Diamond Avatar Effect", from: "Battle Reward", status: "New" },
    { name: "Playlist Skin: Rocket", from: "Fan Contest", status: "Claimed" },
  ];
  const physical = [
    { name: "Signed Merch Bundle", from: "Monthly Idol", tracking: "FedEx #4821" },
    { name: 'Beats Headphones', from: "Sponsor Giveaway", tracking: "Awaiting Ship" },
  ];
  return (
    <Rail>
      <Card minWidth={260} accent="#FF6B1A">
        <Label color="#FF6B1A">DIGITAL PRIZES</Label>
        {digital.map((p) => (
          <div key={p.name} style={{ background: "#0A0A1A", border: `1px solid #FF6B1A33`, borderRadius: 6, padding: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: "#E8E8FF" }}>{p.name}</span>
              <span style={{ fontSize: 7, color: p.status === "New" ? "#00FF88" : "#7878AA", fontWeight: 700 }}>{p.status}</span>
            </div>
            <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 4 }}>From: {p.from}</div>
            {p.status === "New" && <Btn color="#00FF88">Claim Now</Btn>}
          </div>
        ))}
      </Card>
      <Card minWidth={250} accent="#9B59FF">
        <Label color="#9B59FF">PHYSICAL PRIZES</Label>
        {physical.map((p) => (
          <div key={p.name} style={{ background: "#0A0A1A", border: "1px solid #9B59FF33", borderRadius: 6, padding: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#E8E8FF", marginBottom: 1 }}>{p.name}</div>
            <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 1 }}>From: {p.from}</div>
            <div style={{ fontSize: 7, color: "#9B59FF", fontWeight: 700 }}>{p.tracking}</div>
          </div>
        ))}
        <Label color="#FFD700">COUPONS &amp; DISCOUNTS</Label>
        {["20% off Merch Store", "Free Ticket Upgrade"].map((c) => (
          <Row key={c} accent="#FFD700">
            <span style={{ fontSize: 8, color: "#FFD700", flex: 1 }}>🏷 {c}</span>
            <Btn color="#FFD700" outline>Use</Btn>
          </Row>
        ))}
      </Card>
    </Rail>
  );
}

// ❤️ FAVORITES
function FavoritesContent() {
  const cats = [
    { label: "Artists", items: ["MarcelID ✓", "Wave Theory", "Jay Paul S.", "Big Ace"], color: "#FF2DAA", icon: "🎤" },
    { label: "Songs", items: ["Hustle & Flow", "Crown Me", "Vice City Nights", "Rally Up"], color: "#FF6B1A", icon: "🎵" },
    { label: "Battles", items: ["Season 4 Finals", "Cypher Champ R3", "Monday Stage #12"], color: "#9B59FF", icon: "⚔️" },
    { label: "Concerts", items: ["World Concert: MarcelID Aug 2025", "Mini Concert: Wave Theory", "Dance Party: DJ Ralph"], color: "#00D4FF", icon: "🎪" },
  ];
  return (
    <Rail>
      {cats.map((cat) => (
        <Card key={cat.label} minWidth={200} accent={cat.color}>
          <Label color={cat.color}>{cat.icon} {cat.label}</Label>
          {cat.items.map((item) => (
            <Row key={item} accent={cat.color}>
              <span style={{ fontSize: 8, color: "#E8E8FF", flex: 1 }}>{item}</span>
              <Btn color={cat.color} outline>♥</Btn>
            </Row>
          ))}
        </Card>
      ))}
    </Rail>
  );
}

// 📈 FAN STATS
type FanPeriod = "today" | "week" | "month" | "year" | "lifetime";
function FanStatsContent() {
  const [period, setPeriod] = useState<FanPeriod>("month");
  const periodLabels: Record<FanPeriod, string> = { today: "Today", week: "This Week", month: "This Month", year: "This Year", lifetime: "Lifetime" };

  const spendingCats = [
    { label: "Tickets", value: "$142", color: "#FF6B1A" },
    { label: "Merch", value: "$88", color: "#9B59FF" },
    { label: "Avatar Items", value: "$54", color: "#00D4FF" },
    { label: "YoPho Items", value: "$22", color: "#FF2DAA" },
    { label: "Tips", value: "$64", color: "#00FF88" },
    { label: "Giveaways", value: "$18", color: "#FFD700" },
  ];

  return (
    <Rail>
      {/* Activity Card */}
      <Card minWidth={250} accent="#9B59FF">
        <Label color="#9B59FF">ACTIVITY</Label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
          {(Object.keys(periodLabels) as FanPeriod[]).map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} style={{ padding: "2px 6px", background: period === p ? "#9B59FF" : "#0A0A1A", border: `1px solid ${period === p ? "#9B59FF" : "#1E1E45"}`, borderRadius: 4, color: period === p ? "#fff" : "#7878AA", fontSize: 8, fontWeight: 800, cursor: "pointer" }}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          <StatBox label="Hours Watched" value="84 hrs" color="#9B59FF" />
          <StatBox label="Tips Sent" value="23" color="#00FF88" />
          <StatBox label="Battles Joined" value="8" color="#FF6B1A" />
          <StatBox label="Concerts" value="5" color="#00D4FF" />
        </div>
      </Card>

      {/* Progress Card */}
      <Card minWidth={220} accent="#00D4FF">
        <Label color="#00D4FF">PROGRESS</Label>
        <StatBox label="Total XP" value="12,450" color="#9B59FF" />
        <div style={{ height: 4 }} />
        <div style={{ fontSize: 8, color: "#7878AA", marginBottom: 2 }}>LEVEL 87 — 50% to 88</div>
        <div style={{ height: 6, background: "#1A1A40", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg,#9B59FF,#00D4FF)", borderRadius: 6 }} />
        </div>
        <Label color="#FFD700">ACHIEVEMENTS</Label>
        {["🏆 Top Fan 2025", "🎯 100 Battles Watched", "💎 Diamond Supporter", "⭐ Super Fan"].map((a) => (
          <div key={a} style={{ fontSize: 8, color: "#FFD700", padding: "2px 0" }}>{a}</div>
        ))}
        <Label color="#00FF88">STREAKS</Label>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>🔥 28 Day Streak</div>
      </Card>

      {/* Spending Card */}
      <Card minWidth={220} accent="#FF6B1A">
        <Label color="#FF6B1A">SPENDING · {periodLabels[period]}</Label>
        {spendingCats.map((c) => (
          <div key={c.label} style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 1 }}>
              <span style={{ color: "#E8E8FF" }}>{c.label}</span>
              <span style={{ color: c.color, fontWeight: 800 }}>{c.value}</span>
            </div>
            <div style={{ height: 2, background: "#1A1A40", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: c.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </Card>
    </Rail>
  );
}

// ─── Drawer content router ────────────────────────────────────────────────────

function DrawerContent({ id }: { id: DrawerId }) {
  switch (id) {
    // Performer drawers
    case "live_control": return <LiveControlContent />;
    case "booking": return <BookingContent />;
    case "sponsor": return <SponsorHubContent />;
    case "media_locker": return <MediaLockerContent />;
    case "yopho": return <YoPhoContent roleLabel="PERFORMER" />;
    case "analytics": return <AnalyticsContent />;

    // Fan drawers
    case "avatar": return <AvatarContent />;
    case "prize_vault": return <PrizeVaultContent />;
    case "favorites": return <FavoritesContent />;
    case "fan_stats": return <FanStatsContent />;

    // Demo / prototype drawers (matches original 5-drawer prototype)
    case "playlist": return <PlaylistDemo />;
    case "messenger": return <MessengerDemo />;
    case "demo_sponsor": return <SponsorHubContent />;
    case "demo_analytics": return <AnalyticsContent />;
    case "demo_yopho": return <YoPhoContent roleLabel="TMI MEMBER" />;

    default: return <LoadingSlot label={`${id} drawer`} />;
  }
}

// ─── Demo drawers (prototype 5-drawer content) ────────────────────────────────

function PlaylistDemo() {
  const waveH = [50, 70, 60, 80, 65, 75, 55, 85, 60, 70];
  const playlists = [
    ["Top Charts Indie", "80 tracks", "Spotify", "#00FF88"],
    ["UFO Beats", "80 tracks", "TMI", "#9B59FF"],
    ["Chill Mix", "80 tracks", "Own", "#00D4FF"],
    ["Hustle & Flow", "14 tracks", "MarcelID", "#FF6B1A"],
  ];
  return (
    <Rail>
      <Card minWidth={230} accent="#FF6B1A">
        <Label color="#FF6B1A">NOW PLAYING</Label>
        <div style={{ background: "#0A0A1A", border: "1px solid #1E1E45", borderRadius: 6, padding: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FF6B1A22", border: "1px solid #FF6B1A44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎵</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#FF6B1A" }}>Hustle &amp; Flow</div>
              <div style={{ fontSize: 7, color: "#7878AA" }}>MarcelID · 2:34 / 4:18</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            {waveH.map((h, i) => <div key={i} style={{ width: 3, height: h * 0.16, background: "#FF6B1A", borderRadius: 1 }} />)}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 6, fontSize: 12 }}>⏮ ▶ ⏭</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Btn color="#FF6B1A">+ Add</Btn><Btn color="#00D4FF">↗ Share</Btn><Btn color="#9B59FF">📺 Cast</Btn>
        </div>
      </Card>
      <Card minWidth={240} accent="#AA2DFF">
        <Label color="#AA2DFF">PLAYLIST LIBRARY</Label>
        {playlists.map(([n, t, s, c]) => (
          <Row key={n as string} accent="#AA2DFF">
            <span style={{ fontSize: 8, fontWeight: 800, color: c as string, flex: 1 }}>▶ {n as string}</span>
            <span style={{ fontSize: 7, color: "#7878AA", whiteSpace: "nowrap" }}>{t as string} · {s as string}</span>
          </Row>
        ))}
      </Card>
      <Card minWidth={180} accent="#FFD700">
        <Label color="#FFD700">EQUALIZER 2026</Label>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
          {[40, 60, 45, 80, 65, 55, 70, 50, 75, 60].map((h, i) => <div key={i} style={{ flex: 1, height: h * 0.32, background: "#FFD700", borderRadius: "2px 2px 0 0" }} />)}
        </div>
        <div style={{ fontSize: 7, color: "#7878AA", textAlign: "center", marginTop: 4 }}>Bass · Mid · Treble · Air</div>
      </Card>
    </Rail>
  );
}

function MessengerDemo() {
  return (
    <Rail>
      <Card minWidth={260} accent="#00D4FF">
        <Label color="#00D4FF">① COMMUNICATION &amp; ACTIVITY HUB</Label>
        {[["Julius", "🦦", "Yo you catch that set?", "1h", 2], ["Wave Theory", "🎸", "Rehearsal at 9PM", "3h", 5], ["Cypher Crew", "🎤", "Battle Friday", "2h", 0]].map(([n, ic, msg, t, u]) => (
          <Row key={n as string} accent="#00D4FF">
            <span style={{ fontSize: 14 }}>{ic as string}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: "#E8E8FF" }}>{n as string}</div>
              <div style={{ fontSize: 7, color: "#7878AA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg as string}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <span style={{ fontSize: 7, color: "#7878AA" }}>{t as string}</span>
              {(u as number) > 0 && <span style={{ background: "#FF6B1A", color: "#fff", borderRadius: 10, fontSize: 7, padding: "1px 5px", fontWeight: 800 }}>{u as number}</span>}
            </div>
          </Row>
        ))}
      </Card>
      <Card minWidth={240} accent="#FF6B1A">
        <Label color="#00D4FF">③ ACTIVE CALLS</Label>
        <div style={{ background: "#0D0D24", border: "1px solid #1E1E45", borderRadius: 6, padding: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>📹</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 8, fontWeight: 800, color: "#00D4FF" }}>Marshall Dickens</div><div style={{ fontSize: 7, color: "#7878AA" }}>Video · Active</div></div>
          <Btn color="#FF4444">✕</Btn>
        </div>
        <Label color="#7878AA">⑤ INVITATIONS</Label>
        <div style={{ background: "#0D0D24", border: "1px solid #FF6B1A44", borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 2 }}>Sarah invited you →</div>
          <div style={{ fontSize: 8, fontWeight: 800, color: "#FF6B1A", marginBottom: 6 }}>🎮 Invite to Lobby</div>
          <div style={{ display: "flex", gap: 4 }}><Btn color="#00FF88">✓ Join</Btn><Btn color="#FF4444" outline>✕ Decline</Btn></div>
        </div>
      </Card>
      <Card minWidth={320} maxHeight={400} accent="#00D4FF">
        <Label color="#00D4FF">OPEN MESSENGER</Label>
        <MessagingCanister compact height={280} />
      </Card>
    </Rail>
  );
}

// ─── Dock button ─────────────────────────────────────────────────────────────

function DockButton({ drawer, active, onClick }: { drawer: DrawerDef; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "7px 12px",
        background: active ? `${drawer.accent}18` : "transparent",
        border: `1px solid ${active ? drawer.accent : "rgba(255,255,255,0.07)"}`,
        borderRadius: 7,
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{drawer.icon}</span>
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: active ? drawer.accent : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
        {drawer.label}
      </span>
      {active && (
        <span style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, background: drawer.accent, borderRadius: 2, boxShadow: `0 0 6px ${drawer.accent}` }} />
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface TMIRoleDrawerDockProps {
  /** performer = 6 performer drawers · fan = 5 fan drawers · demo = original 5 prototype drawers */
  role?: DrawerRole;
  /** Extra style on the dock container */
  style?: CSSProperties;
  /** Label shown left of dock buttons */
  dockLabel?: string;
}

export default function TMIRoleDrawerDock({ role = "demo", style, dockLabel }: TMIRoleDrawerDockProps) {
  const [activeId, setActiveId] = useState<DrawerId | null>(null);
  const [drawerSize, setDrawerSize] = useState<DrawerSize>("default");

  const drawers: DrawerDef[] = role === "performer" ? PERFORMER_DRAWERS : role === "fan" ? FAN_DRAWERS : DEMO_DRAWERS;

  const toggle = (id: DrawerId) => {
    setActiveId((prev) => {
      if (prev === id) return null;
      setDrawerSize("default"); // reset size when switching drawers
      return id;
    });
  };

  const activeDef = drawers.find((d) => d.id === activeId) ?? null;
  const height = DRAWER_HEIGHTS[drawerSize];

  const label = dockLabel ?? (role === "performer" ? "PERFORMER" : role === "fan" ? "FAN" : "DRAWERS");

  return (
    <>
      {/* Overlays */}
      {drawers.map((d) => (
        <UniversalDrawerBase
          key={d.id}
          open={activeId === d.id}
          animationId={d.animation}
          title={d.title}
          subtitle={d.subtitle}
          accentColor={d.accent}
          contentKey={d.id}
          onClose={() => setActiveId(null)}
          mode="overlay"
          overlayHeight={height}
          ariaLabel={`${d.label} drawer`}
        >
          {/* Size controls inside drawer */}
          <SizeBar size={drawerSize} setSize={setDrawerSize} accent={d.accent} />
          {/* Drawer content */}
          <DrawerContent id={d.id} />
        </UniversalDrawerBase>
      ))}

      {/* Dock bar */}
      <div
        role="toolbar"
        aria-label="Drawer dock"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 60,
          background: "rgba(5,5,16,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${activeDef ? `${activeDef.accent}40` : "rgba(255,255,255,0.07)"}`,
          boxShadow: activeDef ? `0 -4px 24px ${activeDef.accent}22` : "0 -4px 16px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "5px 12px",
          transition: "border-color 0.25s, box-shadow 0.25s",
          ...style,
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginRight: 8, whiteSpace: "nowrap", userSelect: "none" }}>
          {label}
        </div>
        <div style={{ display: "flex", gap: 3, flex: 1, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {drawers.map((d) => (
            <DockButton key={d.id} drawer={d} active={activeId === d.id} onClick={() => toggle(d.id)} />
          ))}
        </div>
        {activeDef && (
          <div style={{ fontSize: 8, fontWeight: 800, color: activeDef.accent, letterSpacing: "0.08em", marginLeft: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
            {activeDef.label} OPEN ↓
          </div>
        )}
      </div>
    </>
  );
}
