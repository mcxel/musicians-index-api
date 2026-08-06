"use client";

/**
 * TMIDrawerDock — Role-aware, fully expandable overlay drawer system.
 *
 * PERFORMER drawers (6):
 *   🎤 Live Control  · 📅 Booking  · 💼 Sponsor  · 🎵 Media Locker
 *   🌟 YoPho         · 📊 Analytics
 *
 * FAN drawers (5):
 *   👤 Avatar Inventory  · 🎁 Prize Vault  · ❤️ Favorites
 *   🌟 YoPho             · 📈 Fan Stats
 *
 * PROTOTYPE drawers (always visible, role-agnostic for demos):
 *   🎵 Playlist  · 💬 Messenger  · 🤝 Sponsors  · 📊 Analytics  · 👤 YoPho
 *
 * Features:
 *   - Minimize (default) → Expand → Fullscreen per drawer
 *   - Each drawer unique open/close animation
 *   - Horizontally pannable canister cards (slide left/right)
 *   - Vertically scrollable within each card (up/down)
 *   - Cool motion / digital glow on every active element
 *
 * Classification rules (per AGENTS.md + owner voice notes 2026-07-31):
 *   → DRAWERS: workspaces where users manage ongoing information
 *   → QUICK PANELS: fast single-action items (lobbies, live wall, notifications, friends)
 *   → Lobbies get a PANEL — NEVER a drawer (except Avatar Fan Lobby on performer's account)
 *   → Live Wall gets a PANEL — not a drawer
 */

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CSSProperties } from "react";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import type { DrawerAnimationId } from "@/lib/drawers/DrawerAnimationProfile";

// ─── Lazy-load heavy canisters ──────────────────────────────────────────────

const MessagingCanister = dynamic(
  () => import("@/components/canisters/MessagingCanister"),
  { ssr: false, loading: () => <ContentLoading label="Loading Messenger…" /> },
);

// ─── Types ─────────────────────────────────────────────────────────────────

type DrawerId = "playlist" | "messenger" | "sponsor" | "analytics" | "yopho";

interface DrawerDef {
  id: DrawerId;
  icon: string;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  animation: DrawerAnimationId;
}

const DRAWERS: DrawerDef[] = [
  {
    id: "playlist",
    icon: "🎵",
    label: "PLAYLIST",
    title: "🎵 PLAYLIST DRAWER",
    subtitle: "Now playing · Library · Cast",
    accent: "#FF6B1A",
    animation: "vinyl_flip",
  },
  {
    id: "messenger",
    icon: "💬",
    label: "MESSAGES",
    title: "💬 MESSENGER DRAWER",
    subtitle: "Threads · Calls · Invitations",
    accent: "#00D4FF",
    animation: "mechanical",
  },
  {
    id: "sponsor",
    icon: "🤝",
    label: "SPONSORS",
    title: "🤝 SPONSOR DRAWER",
    subtitle: "Placements · Engagement · Gift Drop",
    accent: "#FFD700",
    animation: "fold",
  },
  {
    id: "analytics",
    icon: "📊",
    label: "ANALYTICS",
    title: "📊 ANALYTICS DRAWER",
    subtitle: "Revenue · Viewers · Fan Club · Streams",
    accent: "#9B59FF",
    animation: "command_lift",
  },
  {
    id: "yopho",
    icon: "👤",
    label: "YOPHO",
    title: "👤 YOPHO IDENTITY CREATOR",
    subtitle: "Avatar · Vibe · Background · Template",
    accent: "#FF2DAA",
    animation: "hologram",
  },
];

// ─── Shared loading fallback ────────────────────────────────────────────────

function ContentLoading({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.3)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

// ─── Horizontal canister rail ───────────────────────────────────────────────
// Cards slide left/right; each card scrolls vertically inside.

function CanisterRail({
  gap = 10,
  children,
  style,
}: {
  gap?: number;
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap,
        overflowX: "auto",
        overflowY: "visible",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x mandatory",
        padding: "0 16px 8px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CanisterCard({
  minWidth = 220,
  maxHeight = 360,
  accent,
  children,
}: {
  minWidth?: number;
  maxHeight?: number;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        scrollSnapAlign: "start",
        flexShrink: 0,
        minWidth,
        maxHeight,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#0D0D24",
        border: `1px solid ${accent}33`,
        borderRadius: 8,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

// ─── Helper sub-components ──────────────────────────────────────────────────

function SectionLabel({ children, color = "#7878AA" }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.12em",
        color,
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function MiniRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 0",
        borderBottom: "1px solid #1A1A3A",
      }}
    >
      {children}
    </div>
  );
}

function SmallBtn({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        padding: "3px 9px",
        fontSize: 8,
        fontWeight: 800,
        border: "none",
        borderRadius: 3,
        background: color,
        color: "#fff",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function WaveBar({ heights, color }: { heights: number[]; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h * 0.16,
            background: color,
            borderRadius: 1,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ─── Drawer contents ────────────────────────────────────────────────────────

// 1. PLAYLIST DRAWER
function PlaylistContent() {
  const waveHeights = [50, 70, 60, 80, 65, 75, 55, 85, 60, 70];
  const eqHeights = [40, 60, 45, 80, 65, 55, 70, 50, 75, 60];
  const playlists = [
    { name: "Top Charts Indie", tracks: "80 tracks", src: "Spotify", color: "#00FF88" },
    { name: "UFO Beats", tracks: "80 tracks", src: "TMI", color: "#9B59FF" },
    { name: "Chill Mix", tracks: "80 tracks", src: "Own", color: "#00D4FF" },
    { name: "Hustle & Flow", tracks: "14 tracks", src: "MarcelID", color: "#FF6B1A" },
  ];

  return (
    <CanisterRail>
      {/* Now Playing Card */}
      <CanisterCard minWidth={230} accent="#FF6B1A">
        <SectionLabel color="#FF6B1A">NOW PLAYING</SectionLabel>
        <div
          style={{
            background: "#0A0A1A",
            border: "1px solid #1E1E45",
            borderRadius: 6,
            padding: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#FF6B1A22",
                border: "1px solid #FF6B1A44",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🎵
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#FF6B1A" }}>Hustle &amp; Flow</div>
              <div style={{ fontSize: 7, color: "#7878AA" }}>MarcelID · 2:34 / 4:18</div>
            </div>
          </div>
          <WaveBar heights={waveHeights} color="#FF6B1A" />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 6, fontSize: 12 }}>
            ⏮ ▶ ⏭
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          <SmallBtn color="#FF6B1A">+ Add</SmallBtn>
          <SmallBtn color="#00D4FF">↗ Share</SmallBtn>
          <SmallBtn color="#9B59FF">📺 Cast</SmallBtn>
        </div>
      </CanisterCard>

      {/* Playlist Library Card */}
      <CanisterCard minWidth={240} accent="#AA2DFF">
        <SectionLabel color="#AA2DFF">PLAYLIST LIBRARY</SectionLabel>
        {playlists.map((p) => (
          <MiniRow key={p.name}>
            <span style={{ fontSize: 8, fontWeight: 800, color: p.color, flex: 1 }}>▶ {p.name}</span>
            <span style={{ fontSize: 7, color: "#7878AA", marginLeft: "auto", whiteSpace: "nowrap" }}>
              {p.tracks} · {p.src}
            </span>
          </MiniRow>
        ))}
      </CanisterCard>

      {/* Equalizer Card */}
      <CanisterCard minWidth={180} accent="#FFD700">
        <SectionLabel color="#FFD700">EQUALIZER 2026</SectionLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32, padding: "0 4px" }}>
          {eqHeights.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h * 0.32,
                background: "#FFD700",
                borderRadius: "2px 2px 0 0",
                opacity: 0.85,
                transition: "height 0.3s ease",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 7, color: "#7878AA", textAlign: "center", marginTop: 4 }}>
          Bass · Mid · Treble · Air
        </div>
      </CanisterCard>
    </CanisterRail>
  );
}

// 2. MESSENGER DRAWER
function MessengerContent() {
  const threads = [
    { name: "Julius", msg: "Yo you catch that set?", icon: "🦦", time: "1h ago", unread: 2 },
    { name: "Wave Theory (Band)", msg: "Rehearsal at 9PM", icon: "🎸", time: "3h ago", unread: 5 },
    { name: "Cypher Crew", msg: "Battle Friday", icon: "🎤", time: "2h ago", unread: 0 },
  ];

  return (
    <CanisterRail>
      {/* Threads Card */}
      <CanisterCard minWidth={260} accent="#00D4FF">
        <SectionLabel color="#00D4FF">① COMMUNICATION &amp; ACTIVITY HUB</SectionLabel>
        {threads.map((t) => (
          <MiniRow key={t.name}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: "#E8E8FF" }}>{t.name}</div>
              <div style={{ fontSize: 7, color: "#7878AA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.msg}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 7, color: "#7878AA" }}>{t.time}</span>
              {t.unread > 0 && (
                <span
                  style={{
                    background: "#FF6B1A",
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 7,
                    padding: "1px 5px",
                    fontWeight: 800,
                  }}
                >
                  {t.unread}
                </span>
              )}
            </div>
          </MiniRow>
        ))}
      </CanisterCard>

      {/* Active Calls Card */}
      <CanisterCard minWidth={220} accent="#FF6B1A">
        <SectionLabel color="#00D4FF">③ ACTIVE CALLS</SectionLabel>
        <div
          style={{
            background: "#0D0D24",
            border: "1px solid #1E1E45",
            borderRadius: 6,
            padding: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 20 }}>📹</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#00D4FF" }}>Marshall Dickens</div>
            <div style={{ fontSize: 7, color: "#7878AA" }}>Video · Active</div>
          </div>
          <SmallBtn color="#FF4444">✕</SmallBtn>
        </div>
        <SectionLabel color="#7878AA">⑤ INVITATIONS</SectionLabel>
        <div
          style={{
            background: "#0D0D24",
            border: "1px solid #FF6B1A44",
            borderRadius: 6,
            padding: 8,
          }}
        >
          <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 2 }}>Sarah invited you →</div>
          <div style={{ fontSize: 8, fontWeight: 800, color: "#FF6B1A", marginBottom: 6 }}>🎮 Invite to Lobby</div>
          <div style={{ display: "flex", gap: 4 }}>
            <SmallBtn color="#00FF88">✓ Join</SmallBtn>
            <SmallBtn color="#FF4444">✕ Decline</SmallBtn>
          </div>
        </div>
      </CanisterCard>

      {/* Full Messaging Canister Card */}
      <CanisterCard minWidth={320} maxHeight={400} accent="#00D4FF">
        <SectionLabel color="#00D4FF">OPEN MESSENGER</SectionLabel>
        <MessagingCanister compact height={300} />
      </CanisterCard>
    </CanisterRail>
  );
}

// 3. SPONSOR DRAWER
function SponsorContent() {
  const sponsors = [
    { name: "Lawtigers", action: "●", color: "#FF6B1A" },
    { name: "Coca-Cola", action: "+", color: "#00D4FF" },
    { name: "Chipdust", action: "▼", color: "#9B59FF" },
    { name: "Brothers", action: "▼", color: "#FFD700" },
  ];

  return (
    <CanisterRail>
      {/* Sponsored Preview Card */}
      <CanisterCard minWidth={240} accent="#FFD700">
        <SectionLabel color="#FFD700">SPONSORED CONTENT</SectionLabel>
        <div
          style={{
            background: "#0A0A1A",
            border: "1px solid #1E1E45",
            borderRadius: 6,
            padding: 8,
            aspectRatio: "16 / 10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: 4,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>🎵</div>
            <div style={{ fontSize: 8, color: "#FF6B1A", fontWeight: 800 }}>Hustle &amp; Flow</div>
            <div style={{ fontSize: 7, color: "#7878AA" }}>Live · Sponsored</div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#FF6B1A22",
              border: "1px solid #FF6B1A44",
              borderRadius: 3,
              padding: "1px 5px",
              fontSize: 7,
              color: "#FF6B1A",
              fontWeight: 800,
            }}
          >
            SPONSORED
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 4,
              border: "2px solid #FF69B4",
              background: "#FF69B422",
              textAlign: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#FF69B4",
              cursor: "pointer",
            }}
          >
            ▶ GO LIVE
          </div>
          <div
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #00D4FF",
              background: "#00D4FF11",
              textAlign: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#00D4FF",
              cursor: "pointer",
            }}
          >
            ◉ PREVIEW
          </div>
        </div>
      </CanisterCard>

      {/* Sponsor Canister Card */}
      <CanisterCard minWidth={200} accent="#FFD700">
        <SectionLabel color="#FFD700">SPONSOR CANISTER</SectionLabel>
        {sponsors.map((s) => (
          <MiniRow key={s.name}>
            <span style={{ fontSize: 8, fontWeight: 800, color: s.color, flex: 1 }}>{s.name}</span>
            <span style={{ fontSize: 8, color: s.color }}>{s.action} P</span>
          </MiniRow>
        ))}
        <SectionLabel color="#7878AA" >ENGAGEMENT CANISTER</SectionLabel>
        <div
          style={{
            background: "#FF6B1A",
            borderRadius: 4,
            padding: "6px 12px",
            textAlign: "center",
            fontSize: 9,
            fontWeight: 800,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          🎁 GIFT DROP
        </div>
      </CanisterCard>
    </CanisterRail>
  );
}

// 4. ANALYTICS DRAWER
function AnalyticsContent() {
  const engagementBars = [40, 50, 55, 65, 45, 70, 60, 80, 55, 75, 85, 65];
  const tierBars = [
    { label: "Free", color: "#7878AA", h: 30 },
    { label: "Pro", color: "#9B59FF", h: 75 },
    { label: "Diamond", color: "#FFD700", h: 55 },
  ];
  const stats = [
    { label: "Revenue", value: "$1.84M", color: "#FF6B1A" },
    { label: "Peak Viewers", value: "12.8K", color: "#00D4FF" },
    { label: "Fan Club", value: "65%", color: "#9B59FF" },
    { label: "Streams 30d", value: "57M", color: "#00FF88" },
  ];

  return (
    <CanisterRail>
      {/* Stats Grid Card */}
      <CanisterCard minWidth={250} accent="#9B59FF">
        <SectionLabel color="#9B59FF">KEY METRICS</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#0A0A1A",
                border: "1px solid #1E1E45",
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </CanisterCard>

      {/* Charts Card */}
      <CanisterCard minWidth={240} accent="#00D4FF">
        <SectionLabel color="#00D4FF">PERFORMER ENGAGEMENT</SectionLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 36 }}>
          {engagementBars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h * 0.36,
                background: "#00D4FF",
                borderRadius: "2px 2px 0 0",
                opacity: 0.75,
              }}
            />
          ))}
        </div>
        <div style={{ height: 4 }} />
        <SectionLabel color="#7878AA">FAN CLUB TIER DISTRIBUTION</SectionLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 28 }}>
          {tierBars.map((t) => (
            <div key={t.label} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: t.h * 0.28,
                  background: t.color,
                  borderRadius: "2px 2px 0 0",
                  opacity: 0.85,
                }}
              />
              <div style={{ fontSize: 7, color: t.color, marginTop: 2 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </CanisterCard>

      {/* Billboard Rankings Card */}
      <CanisterCard minWidth={200} accent="#FF6B1A">
        <SectionLabel color="#FF6B1A">BILLBOARD RANKINGS</SectionLabel>
        {[
          { rank: 1, name: "Live Perf.", streams: "57M" },
          { rank: 2, name: "Jay Paul S.", streams: "57M" },
          { rank: 3, name: "Big Ace", streams: "1.3B" },
        ].map((r) => (
          <MiniRow key={r.rank}>
            <span style={{ fontSize: 9, fontWeight: 900, color: "#FF6B1A", minWidth: 14 }}>{r.rank}</span>
            <span style={{ fontSize: 8, color: "#7878AA", flex: 1 }}>{r.name}</span>
            <span style={{ fontSize: 8, color: "#FFD700" }}>{r.streams}</span>
          </MiniRow>
        ))}
      </CanisterCard>
    </CanisterRail>
  );
}

// 5. YOPHO IDENTITY CREATOR
function YoPhoContent() {
  const avatarItems = ["Pose · Formal", "Outfit · Cyberpunk Jacket", "Gear · Watch", "Hair · Short Fade"];
  const vibeItems = ["Dynamic Vibe Tags", "Font Style · Neon", "Mottos Panel", "QR Code Link"];
  const tiers = [
    { name: "Free", desc: "1 model, basic colors" },
    { name: "Pro", desc: "Multi-image, custom colors" },
    { name: "Diamond", desc: "Full AI, animated borders" },
  ];
  const backgrounds = ["Recording Studio", "Cyberpunk City", "Minimalist Loft", "EDM Festival"];
  const ybars = [20, 35, 25, 40, 30];

  return (
    <CanisterRail>
      {/* YoPho Card Preview */}
      <CanisterCard minWidth={120} accent="#00D4FF">
        <SectionLabel color="#00D4FF">YOPHO CARD</SectionLabel>
        <div
          style={{
            background: "#0A0A1A",
            border: "1px solid #00D4FF44",
            borderRadius: 8,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              background: "#12121E",
              borderRadius: 6,
              height: 64,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>😊</div>
              <div style={{ fontSize: 7, color: "#00D4FF", fontWeight: 800 }}>YOPHO CARD</div>
              <div style={{ fontSize: 6, color: "#7878AA" }}>Marshall Dickens</div>
            </div>
          </div>
          <div style={{ fontSize: 7, color: "#FF69B4", fontWeight: 800 }}>ADVENTUROUS</div>
          <div style={{ fontSize: 6, color: "#7878AA", textAlign: "center" }}>CREATIVE TECH-OPTIMIST</div>
          <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
            {ybars.map((h, i) => (
              <div
                key={i}
                style={{ width: 4, height: h * 0.3, background: "#00D4FF", borderRadius: 2 }}
              />
            ))}
          </div>
        </div>
      </CanisterCard>

      {/* Avatar Customizer Card */}
      <CanisterCard minWidth={200} accent="#9B59FF">
        <SectionLabel color="#9B59FF">AVATAR CUSTOMIZER</SectionLabel>
        {avatarItems.map((item) => (
          <MiniRow key={item}>
            <span style={{ fontSize: 7, color: "#7878AA", flex: 1 }}>{item}</span>
            <span style={{ fontSize: 8, color: "#00D4FF" }}>◉</span>
          </MiniRow>
        ))}
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {["⬛", "🔵", "🟡", "🟠", "⚫"].map((c) => (
            <div
              key={c}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#1A1A3A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </CanisterCard>

      {/* Vibe & Text Card */}
      <CanisterCard minWidth={200} accent="#FF69B4">
        <SectionLabel color="#FF69B4">MY VIBE &amp; TEXT</SectionLabel>
        {vibeItems.map((item) => (
          <MiniRow key={item}>
            <span style={{ fontSize: 7, color: "#7878AA" }}>{item}</span>
          </MiniRow>
        ))}
        <SectionLabel color="#7878AA">SUBSCRIPTION TIERS</SectionLabel>
        {tiers.map((t) => (
          <MiniRow key={t.name}>
            <span style={{ fontSize: 8, fontWeight: 800, color: "#FFD700" }}>{t.name}</span>
            <span style={{ fontSize: 7, color: "#7878AA", marginLeft: "auto" }}>{t.desc}</span>
          </MiniRow>
        ))}
      </CanisterCard>

      {/* Background & Environment Card */}
      <CanisterCard minWidth={200} accent="#00D4FF">
        <SectionLabel color="#00D4FF">BACKGROUND &amp; ENVIRONMENT</SectionLabel>
        {backgrounds.map((b) => (
          <MiniRow key={b}>
            <span style={{ fontSize: 7, color: "#7878AA", flex: 1 }}>{b}</span>
            <span style={{ fontSize: 8, color: "#9B59FF" }}>◉</span>
          </MiniRow>
        ))}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 7, color: "#7878AA", marginBottom: 3 }}>Color-Way Engine:</div>
          <div
            style={{
              height: 8,
              background: "linear-gradient(90deg,#FF6B1A,#FFD700,#00FF88,#00D4FF,#9B59FF)",
              borderRadius: 4,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            border: "1px solid #00D4FF",
            borderRadius: 4,
            padding: "6px 10px",
            textAlign: "center",
            fontSize: 8,
            fontWeight: 800,
            color: "#00D4FF",
            cursor: "pointer",
          }}
        >
          SAVE CERTIFIED TEMPLATE
        </div>
      </CanisterCard>
    </CanisterRail>
  );
}

// ─── Drawer content router ──────────────────────────────────────────────────

function DrawerContent({ id }: { id: DrawerId }) {
  switch (id) {
    case "playlist":
      return <PlaylistContent />;
    case "messenger":
      return <MessengerContent />;
    case "sponsor":
      return <SponsorContent />;
    case "analytics":
      return <AnalyticsContent />;
    case "yopho":
      return <YoPhoContent />;
    default:
      return null;
  }
}

// ─── Dock button ────────────────────────────────────────────────────────────

function DockButton({
  drawer,
  active,
  onClick,
}: {
  drawer: DrawerDef;
  active: boolean;
  onClick: () => void;
}) {
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
        padding: "8px 14px",
        background: active ? `${drawer.accent}18` : "transparent",
        border: `1px solid ${active ? drawer.accent : "rgba(255,255,255,0.07)"}`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, position: "relative" }}>
        {drawer.icon}
        {active && (
          <span
            style={{
              position: "absolute",
              bottom: -2,
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: drawer.accent,
              boxShadow: `0 0 6px ${drawer.accent}`,
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: active ? drawer.accent : "rgba(255,255,255,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        {drawer.label}
      </span>
    </button>
  );
}

// ─── Main exported component ────────────────────────────────────────────────

export interface TMIDrawerDockProps {
  /** Label shown left of the button row */
  dockLabel?: string;
  /** Extra style on the dock bar container */
  style?: CSSProperties;
  /** Drawers to show. Defaults to all 5. */
  drawerIds?: DrawerId[];
}

export default function TMIDrawerDock({
  dockLabel = "DRAWERS",
  style,
  drawerIds,
}: TMIDrawerDockProps) {
  const [activeId, setActiveId] = useState<DrawerId | null>(null);

  const toggle = (id: DrawerId) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const visibleDrawers = drawerIds
    ? DRAWERS.filter((d) => drawerIds.includes(d.id))
    : DRAWERS;

  const activeDef = visibleDrawers.find((d) => d.id === activeId) ?? null;

  return (
    <>
      {/* Drawer overlays — rendered via UniversalDrawerBase (fixed bottom) */}
      {visibleDrawers.map((d) => (
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
          overlayHeight="min(72vh, 600px)"
          ariaLabel={`${d.label} drawer`}
        >
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
          boxShadow: activeDef
            ? `0 -4px 24px ${activeDef.accent}22`
            : "0 -4px 16px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "6px 12px",
          transition: "border-color 0.25s, box-shadow 0.25s",
          ...style,
        }}
      >
        {/* Left label */}
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
            marginRight: 8,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {dockLabel}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 4,
            flex: 1,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {visibleDrawers.map((d) => (
            <DockButton
              key={d.id}
              drawer={d}
              active={activeId === d.id}
              onClick={() => toggle(d.id)}
            />
          ))}
        </div>

        {/* Active drawer label */}
        {activeDef && (
          <div
            style={{
              fontSize: 8,
              fontWeight: 800,
              color: activeDef.accent,
              letterSpacing: "0.1em",
              marginLeft: 8,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {activeDef.label} OPEN ↓
          </div>
        )}
      </div>
    </>
  );
}
