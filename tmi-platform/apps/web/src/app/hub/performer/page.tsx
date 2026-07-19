"use client";

import { useEffect, useMemo, useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import Link from "next/link";
import Image from "next/image";
import { HubBackNav } from "@/components/nav/HubBackNav";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import TipBar from "@/components/hud/TipBar";
import TokenBalance from "@/components/hud/TokenBalance";
import MixtapeShareCard from "@/components/mixtape/MixtapeShareCard";
import MonitorSatelliteSystem from "@/components/canisters/MonitorSatelliteSystem";
import CollapsibleCanister from "@/components/canisters/CollapsibleCanister";
import MemoryWall from "@/components/media/MemoryWall";
import MemoryWallPhotoStrip from "@/components/media/MemoryWallPhotoStrip";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import HeadquartersCommunicationDock from "@/components/headquarters/HeadquartersCommunicationDock";
import OpportunityDockPanel from "@/components/hubs/OpportunityDockPanel";
import RadioJourneyCard from "@/components/radio/RadioJourneyCard";
import { useTmiSession } from "@/hooks/SessionContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { getLevelForXP, getProgressToNextLevel } from "@/lib/xp/xpEngine";
import { useDrawer } from "@/components/room/DrawerContext";
import { OnboardingMissionDock } from "@/components/onboarding/OnboardingMissionCard";
import { useOnboardingMissions } from "@/components/onboarding/useOnboardingMissions";
import UniversalPlatformShell from "@/components/shell/UniversalPlatformShell";
import MediaUploadWidget from "@/components/media/MediaUploadWidget";
import { TrackUploader } from "@/lib/submissions/TrackUploader";
import { BezelFrame } from '@/components/admin/overseer/AdminDesignSystem';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';

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

// Persistent left sidebar — matches the reference blueprint's MAIN MENU list.
// "drawer" items open a real WidgetDrawer panel (same panels the old floating
// ActionCanister rail opened); "link" items route to a real page.
const PERFORMER_MAIN_MENU = [
  { kind: "link",   href: "/submit",             icon: "📤", label: "Submission", sub: "Stream & Win Radio" },
  { kind: "drawer", id: "live-rooms", icon: "🎭", label: "Live Rooms" },
  { kind: "drawer", id: "lobby",      icon: "🌐", label: "Lobby" },
  { kind: "drawer", id: "messages",   icon: "💬", label: "Messages" },
  { kind: "drawer", id: "friends",    icon: "👥", label: "Friends" },
  { kind: "drawer", id: "inventory",  icon: "🎒", label: "Inventory" },
  { kind: "drawer", id: "memory",     icon: "🧠", label: "Memory Wall" },
  { kind: "drawer", id: "magazine",   icon: "📰", label: "Magazine" },
  { kind: "drawer", id: "playlist",   icon: "🎵", label: "Playlists" },
  { kind: "drawer", id: "radio",      icon: "📻", label: "Radio" },
  { kind: "drawer", id: "yopho",      icon: "✨", label: "Yopho" },
  // Camera/Go Live intentionally removed — the global bottom dock
  // (TMIGlobalNav) already has a real "LIVE" quick action on every page.
  { kind: "link",   href: "/rewards",          icon: "⭐", label: "Rewards" },
  { kind: "link",   href: "/store",            icon: "🛒", label: "Store" },
  { kind: "drawer", id: "settings",   icon: "⚙️", label: "Settings" },
] as const;

const PERFORMER_RIGHT_RAIL_ACTIONS = [
  { id: "sponsors", icon: "🤝", label: "Sponsors" },
  { id: "bookings", icon: "📅", label: "Bookings" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "revenue", icon: "💰", label: "Revenue" },
  { id: "merch", icon: "🛒", label: "Merch" },
  { id: "share", icon: "📤", label: "Share" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const OBSERVATORY_ROSE_VIDEO_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

interface BookingRow {
  bookingId: string;
  venueSlug: string;
  eventDate: string;
  eventType: string;
  status: string;
}

interface MessageThreadRow {
  threadId: string;
  participantName: string;
  lastMessageBody: string | null;
}

interface AudienceEntryEvent {
  id: string;
  at: number;
  countryCode: string;
  countryName: string;
  viewerCount: number;
}

interface AudienceCountrySlice {
  countryCode: string;
  countryName: string;
  count: number;
}

interface PerformerLiveStatus {
  isLive: boolean;
  audienceCount: number;
  recentAudienceEntries: AudienceEntryEvent[];
  audienceCountries: AudienceCountrySlice[];
}

export default function PerformerHubPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [threads, setThreads]   = useState<MessageThreadRow[] | null>(null);
  const [liveStatus, setLiveStatus] = useState<PerformerLiveStatus>({ isLive: false, audienceCount: 0, recentAudienceEntries: [], audienceCountries: [] });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { userId, userName } = useTmiSession();
  const { missions: onboardingMissions, dismiss: dismissMission } = useOnboardingMissions();
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { authenticated: false, user: null }))
      .then((d: { authenticated?: boolean; user?: { tier?: string } | null }) => {
        const authed = Boolean(d.authenticated);
        setIsAuthenticated(authed);
        if (authed && d.user?.tier) {
          setUserTier(d.user.tier.toUpperCase());
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/booking/create")
      .then((r) => r.json())
      .then((d: { requests?: BookingRow[] }) => setBookings(d.requests ?? []))
      .catch(() => setBookings([]));

    if (!isAuthenticated) {
      setThreads([]);
      return;
    }

    fetch("/api/messages", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { threads: [] }))
      .then((d: { threads?: { threadId: string; participants: { displayName: string }[]; lastMessage: { body: string } | null }[] }) => {
        const rows = (d.threads ?? []).map((t) => ({
          threadId: t.threadId,
          participantName: t.participants[0]?.displayName ?? "Fan",
          lastMessageBody: t.lastMessage?.body ?? null,
        }));
        setThreads(rows);
      })
      .catch(() => setThreads([]));
  }, [isAuthenticated]);

  // Real liveness — this monitor previously hardcoded isLive={false} always,
  // even while the performer was actually broadcasting. Same
  // GlobalLiveSessionRegistry source used by Fan HQ's Live Now panel.
  useEffect(() => {
    let cancelled = false;
    const checkLive = () => {
      fetch('/api/live/go', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: { sessions?: { userId: string; viewerCount: number; recentAudienceEntries?: AudienceEntryEvent[]; audienceCountries?: AudienceCountrySlice[] }[] }) => {
          if (cancelled) return;
          const mine = d.sessions?.find((s) => s.userId === userId);
          setLiveStatus(
            mine
              ? {
                  isLive: true,
                  audienceCount: mine.viewerCount,
                  recentAudienceEntries: mine.recentAudienceEntries ?? [],
                  audienceCountries: mine.audienceCountries ?? [],
                }
              : { isLive: false, audienceCount: 0, recentAudienceEntries: [], audienceCountries: [] },
          );
        })
        .catch(() => {
          if (!cancelled) {
            setLiveStatus({ isLive: false, audienceCount: 0, recentAudienceEntries: [], audienceCountries: [] });
          }
        });
    };
    checkLive();
    const id = setInterval(checkLive, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [userId]);

  const performerIdentity = useMemo(() => {
    if (!userId) return null;
    return getPerformerById(userId);
  }, [userId]);

  const { activeDrawer, toggleDrawer } = useDrawer();
  const xpProgress = getProgressToNextLevel(performerIdentity?.xp ?? 0);
  const performerLevel = getLevelForXP(performerIdentity?.xp ?? 0).level;

  const SIDEBAR_WIDTH = 220;

  const hubContent = (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative", paddingLeft: SIDEBAR_WIDTH }}>
      <DesktopAtmosphereRails />

      <NeonWaveUnderlay colorA="#AA2DFF" colorB="#FF2DAA" colorC="#00FFFF" opacity={0.08} zIndex={0} />

      {/* ══ PERSISTENT LEFT SIDEBAR — flush against the screen, matches reference blueprint ══ */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 40,
        display: "flex", flexDirection: "column",
        background: "rgba(5,5,16,0.92)", borderRight: "1px solid rgba(170,45,255,0.15)",
        backdropFilter: "blur(16px)", overflowY: "auto",
      }}>
        <div style={{ padding: "16px 14px 6px", fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)" }}>
          MAIN MENU
        </div>
        {PERFORMER_MAIN_MENU.map((item) => {
          const isActive = item.kind === "drawer" && activeDrawer === item.id;
          const inner = (
            <>
              <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: isActive ? 800 : 600, color: isActive ? "#AA2DFF" : "rgba(255,255,255,0.82)" }}>
                  {item.label}
                </div>
                {"sub" in item && item.sub && (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{item.sub}</div>
                )}
              </div>
            </>
          );
          const rowStyle: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 14px", cursor: "pointer", textDecoration: "none",
            background: isActive ? "rgba(170,45,255,0.12)" : "transparent",
            borderLeft: isActive ? "2px solid #AA2DFF" : "2px solid transparent",
          };
          return item.kind === "drawer" ? (
            <button key={item.id} onClick={() => toggleDrawer(item.id)} style={{ ...rowStyle, border: "none", borderLeft: rowStyle.borderLeft, width: "100%", textAlign: "left", background: rowStyle.background }}>
              {inner}
            </button>
          ) : (
            <Link key={item.href} href={item.href} style={rowStyle}>
              {inner}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Real user card — Fans/Likes are real performerIdentity data; no fabricated Following/Rooms counts */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0, position: "relative", overflow: "hidden",
              background: "linear-gradient(135deg, rgba(170,45,255,0.4), rgba(255,45,170,0.4))",
              border: "1.5px solid #AA2DFF",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900,
            }}>
              {performerIdentity?.profileImageUrl ? (
                <Image src={performerIdentity.profileImageUrl} alt={performerIdentity.name} fill sizes="32px" style={{ objectFit: "cover" }} />
              ) : (
                (userName || "P").charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{performerIdentity?.name || userName || "Your Stage"}</div>
              <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 700, letterSpacing: "0.1em" }}>
                {(performerIdentity?.tier || userTier || "FREE").toString().toUpperCase()} MEMBER
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>LEVEL {performerLevel}</span>
            <span style={{ fontSize: 9, color: "#AA2DFF" }}>
              {xpProgress.current.toLocaleString()} / {(xpProgress.current + xpProgress.needed).toLocaleString()} XP
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #AA2DFF, #FF2DAA)", width: `${xpProgress.pct}%`, transition: "width 0.5s" }} />
          </div>
          {performerIdentity && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{performerIdentity.fanCount.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Fans</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{performerIdentity.likes.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Likes</div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Nav bar */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(170,45,255,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto", backdropFilter: "blur(12px)" }}>
          <HubBackNav accentColor="#AA2DFF" fallbackRoute="/hub/performer" />
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

        {/* Upgrade flash banner — shown to FREE performers only */}
        {userTier === "FREE" && !bannerDismissed && (
          <div style={{ position: "relative", zIndex: 3, background: "linear-gradient(90deg, #AA2DFF, #FF2DAA)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>
                🚀 Go PRO for only $1.99/month
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginLeft: 12 }}>
                Go Live · Get Booked · Earn Tips · Get Discovered
              </span>
            </div>
            <Link href="/account/subscription" style={{ padding: "8px 22px", borderRadius: 8, background: "#fff", color: "#AA2DFF", fontSize: 12, fontWeight: 900, textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.25)", flexShrink: 0 }}>
              UPGRADE NOW
            </Link>
            <button onClick={() => setBannerDismissed(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0 }} aria-label="Dismiss">×</button>
          </div>
        )}

        {/* Go Live action strip */}
        <div style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, rgba(170,45,255,0.15), rgba(255,45,170,0.08))", borderBottom: "1px solid rgba(170,45,255,0.15)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#AA2DFF", fontWeight: 800 }}>PERFORMER CONTROL ROOM</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 3 }}>Your Stage <span style={{ color: "#FFD700", fontSize: 13 }}>· Performer Hub</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto", flexWrap: "wrap" }}>
            <Link href="/live/go" style={{ padding: "9px 20px", borderRadius: 9, background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em", boxShadow: "0 0 20px rgba(170,45,255,0.35)" }}>
              🔴 GO LIVE
            </Link>
            <Link href="/battles/new" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              ⚔️ CHALLENGE
            </Link>
            <Link href="/nft/mint" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(0,255,255,0.07)", border: "1px solid rgba(0,255,255,0.22)", color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🎨 MINT NFT
            </Link>
            <Link href="/messages" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.22)", color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              💬 MESSAGES
            </Link>
            <Link href="/messages/new?subject=Join+my+next+live+show" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              👥 INVITE FANS
            </Link>
          </div>
        </div>

        {/* Visual-first hero row: monitor first, details later — flush to the
            viewport, not centered in a fixed-width column (previously
            maxWidth: 1300 left large dead gutters on wide screens). */}
        <div style={{ position: "relative", zIndex: 1, margin: "18px 0 8px", padding: "0 20px" }}>
          <BezelFrame variant="performer" innerPadding={18}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18, alignItems: "start" }}>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 10 }}>🎬 MAIN BROADCAST MONITOR</div>
                {!liveStatus.isLive && (
                  <Link
                    href="/live/go"
                    style={{
                      position: "absolute",
                      top: 34,
                      right: 10,
                      zIndex: 40,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "rgba(8,2,18,0.72)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(230,48,0,0.55)",
                      boxShadow: "0 0 18px rgba(230,48,0,0.4)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E63000", boxShadow: "0 0 10px #E63000, 0 0 4px #E63000" }} />
                    GO LIVE
                  </Link>
                )}
                <MonitorSatelliteSystem
                  mainLabel={performerIdentity?.name ? `${performerIdentity.name} Stage` : "Performer Stage"}
                  isLive={liveStatus.isLive}
                  introVideoUrl={performerIdentity?.introVideoUrl}
                  fallbackVideoUrl={OBSERVATORY_ROSE_VIDEO_URL}
                  leftPipVideoUrl={OBSERVATORY_ROSE_VIDEO_URL}
                  rightPipVideoUrl={OBSERVATORY_ROSE_VIDEO_URL}
                  motionPosterUrl={performerIdentity?.motionPosterUrl}
                  liveRoomRoute={performerIdentity?.liveRoomRoute}
                  staticImageUrl="/images/tmi-placeholder.jpg"
                  accentColor="#AA2DFF"
                  adZone="hub-performer"
                  showAudienceMonitor={liveStatus.isLive}
                  audienceCount={liveStatus.audienceCount}
                  audienceEntryEvents={liveStatus.recentAudienceEntries}
                  audienceCountryDistribution={liveStatus.audienceCountries}
                  showAudiencePulse
                />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 10, border: "1px solid rgba(170,45,255,0.22)", borderRadius: 12, padding: 12, background: "rgba(5,5,16,0.82)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 0 14px rgba(170,45,255,0.14)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        position: "relative",
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid rgba(170,45,255,0.32)",
                        background: "linear-gradient(180deg, rgba(170,45,255,0.18), rgba(0,0,0,0.4))",
                        flexShrink: 0,
                      }}
                    >
                      {performerIdentity?.profileImageUrl ? (
                        <Image
                          src={performerIdentity.profileImageUrl}
                          alt={performerIdentity.name}
                          fill
                          sizes="72px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#AA2DFF", fontSize: 22, fontWeight: 900 }}>
                          {(userName || "P").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#AA2DFF", fontWeight: 800, textTransform: "uppercase" }}>Performer Identity</div>
                      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, color: "#fff" }}>{performerIdentity?.name || userName || "Your Stage"}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
                        {performerIdentity ? `${performerIdentity.category} · ${performerIdentity.tier}` : "Profile sync pending"}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 10, color: liveStatus.isLive ? "#00FFFF" : "rgba(255,255,255,0.55)", fontWeight: 800 }}>
                        {liveStatus.isLive ? "LIVE NOW" : "STANDBY / OFFLINE"}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00E5FF", fontWeight: 800 }}>⚡ QUICK STAGE ACTIONS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Link href="/live/go" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em" }}>GO LIVE</Link>
                  <Link href="/messages" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.28)", color: "#00FFFF", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>MESSAGE</Link>
                  <Link href="/playlist" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.28)", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>PLAYLIST</Link>
                  <Link href="#memory-wall" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.28)", color: "#AA2DFF", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>MEMORY</Link>
                </div>

                <div style={{ border: "1px solid rgba(255,215,0,0.18)", borderRadius: 12, padding: 10, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#FFD700", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>🎵 Active Playlist</div>
                  <PlaylistArtifact artifactId={`${userId}-playlist`} skin="submarine" title="Performer Playlist" />
                </div>

                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Audience</div>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: "#00FFFF" }}>{liveStatus.audienceCount.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{liveStatus.isLive ? "Audience monitor active" : "Audience monitor activates when broadcast goes live"}</div>
                </div>
              </div>
            </div>
          </BezelFrame>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <PerformerHubDashboard performerId={userId} displayName={userName || "Your Profile"} />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Always-visible opportunity dock for battles/cyphers/challenges from live registry */}
            <OpportunityDockPanel performerId={userId} compact={false} />

            {/* Stream & Win status card — renders only when a real radio submission exists */}
            <RadioJourneyCard />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                Production tools moved into left and right rails beside the monitor.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href="/home/1" style={{ textDecoration: "none", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Home</Link>
                <Link href="/live/lobby" style={{ textDecoration: "none", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live</Link>
                <Link href="/messages" style={{ textDecoration: "none", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Messages</Link>
                <Link href="/performer/profile" style={{ textDecoration: "none", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Profile</Link>
              </div>
            </div>

            {/* Upload Center — closes launch blocker: performers now have a visible upload entrypoint in HQ. */}
            <BezelFrame variant="performer" innerPadding={20} outerStyle={{ marginTop: 16 }} id="upload-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>⬆️ CREATOR UPLOAD CENTER</div>
                <Link href="/submit" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>OPEN FULL SUBMIT HUB →</Link>
              </div>

              {uploadNotice && (
                <div style={{ marginBottom: 12, fontSize: 11, color: "#00FF88", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.24)", borderRadius: 8, padding: "8px 10px" }}>
                  {uploadNotice}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <MediaUploadWidget
                  mediaType="song"
                  ownerId={userId}
                  ownerName={userName || "Performer"}
                  ownerRole="performer"
                  accentColor="#AA2DFF"
                  onSuccess={(result) => {
                    if (result.ok) {
                      setUploadNotice(`Uploaded "${result.title}" successfully. Asset ID: ${result.assetId}`);
                    }
                  }}
                  onError={(err) => setUploadNotice(`Upload failed: ${err}`)}
                />

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 12, padding: 14 }}>
                  <TrackUploader
                    submissionType="track"
                    submitterId={userId}
                    onSubmissionSuccess={(submissionId) => {
                      setUploadNotice(`Submission received — it's in review. ID: ${submissionId}`);
                    }}
                  />
                </div>
              </div>
            </BezelFrame>

            {/* Live monitor + Backstage / Green Room */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>🎥 LIVE MONITOR</div>
                <MonitorSatelliteSystem
                  mainLabel="Main Stage Camera"
                  isLive={liveStatus.isLive}
                  staticImageUrl="/images/tmi-placeholder.jpg"
                  accentColor="#AA2DFF"
                  adZone="hub-performer"
                  showAudienceMonitor
                  audienceCount={liveStatus.audienceCount}
                  audienceEntryEvents={liveStatus.recentAudienceEntries}
                  audienceCountryDistribution={liveStatus.audienceCountries}
                  showAudiencePulse
                />

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Link href="/live/go" style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", borderRadius: 8, fontWeight: 900, fontSize: 10, textDecoration: "none", textAlign: "center", letterSpacing: "0.1em" }}>🔴 GO LIVE TO ARENA</Link>
                  <Link href="/live/rooms" style={{ flex: 1, padding: "10px", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", borderRadius: 8, fontWeight: 800, fontSize: 10, textDecoration: "none", textAlign: "center" }}>📡 ROOMS</Link>
                </div>
              </BezelFrame>

              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00E5FF", fontWeight: 800, marginBottom: 12 }}>🎪 BACKSTAGE / GREEN ROOM</div>
                <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Fans waiting in lobby", value: "0", color: "#00FFFF" },
                    { label: "Show starts in", value: "—", color: "#FFD700" },
                    { label: "Set list items", value: "0 tracks", color: "#AA2DFF" },
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
                    <TipBar performerId={userId} performerName={userName || "Your Stage"} accentColor="#00E5FF" compact />
                  </div>
                </div>
              </BezelFrame>
            </div>

            {/* Booking Desk + Fan Messages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <CollapsibleCanister icon="📅" label="Booking Desk" summary={bookings ? `${bookings.length} requests` : undefined} accentColor="#FFD700">
                {bookings === null && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>Loading…</div>
                )}
                {bookings !== null && bookings.length === 0 && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No booking requests yet.</div>
                )}
                {(bookings ?? []).map(b => (
                  <div key={b.bookingId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{b.venueSlug}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{b.eventDate} · {b.eventType}</div>
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 900, color: "#FFD700", background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", padding: "2px 8px", borderRadius: 10, letterSpacing: "0.1em" }}>{b.status.toUpperCase()}</span>
                  </div>
                ))}
                <Link href="/performer/dashboard" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>View all bookings →</Link>
              </CollapsibleCanister>

              <CollapsibleCanister icon="💬" label="Fan Messages" summary={threads ? `${threads.length} threads` : undefined} accentColor="#FF2DAA">
                {threads === null && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>Loading…</div>
                )}
                {threads !== null && threads.length === 0 && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No messages yet.</div>
                )}
                {(threads ?? []).map(m => (
                  <div key={m.threadId} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,45,170,0.2)", border: "1px solid rgba(255,45,170,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🎧</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA" }}>{m.participantName}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{m.lastMessageBody ?? "—"}</div>
                    </div>
                  </div>
                ))}
                <Link href="/messages" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>View all messages →</Link>
              </CollapsibleCanister>
            </div>

            {/* Pop-out canisters — Playlist + Memory Wall (Constitution Rule 15) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CollapsibleCanister icon="🎵" label="Playlist" accentColor="#FF2DAA" defaultOpen>
                <PlaylistArtifact artifactId={`${userId}-playlist`} skin="submarine" title="Performer Playlist" />
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>
                    From the Memory Wall
                  </div>
                  <MemoryWallPhotoStrip entityId={userId} entityType="performer" accentColor="#FF2DAA" />
                </div>
              </CollapsibleCanister>
              <div id="memory-wall">
                <CollapsibleCanister icon="🖼️" label="Memory Wall" accentColor="#FFD700" defaultOpen>
                  <MemoryWall accentColor="#FFD700" title="Memory Wall" entityId={userId} entityType="performer" />
                </CollapsibleCanister>
              </div>
            </div>

            {/* Merch Wall + Sponsor Wall */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <CollapsibleCanister icon="🛒" label="Merch Wall" accentColor="#00FF88">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <Link href="/store" style={{ fontSize: 9, color: "#00FF88", textDecoration: "none", fontWeight: 700 }}>MANAGE →</Link>
                </div>
                {/* Previously 3 invented catalog items ("Crown Tee", "Beat
                    Pack", "NFT Drop") styled as if real, with 0 sold/—
                    price. No per-performer store/inventory API exists yet
                    to list real items — honest empty state instead. */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "16px 0", textAlign: "center" }}>
                  No merch listed yet.
                </div>
                <Link href="/nft" style={{ display: "block", marginTop: 10, padding: "8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", borderRadius: 8, fontSize: 9, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>🎨 MINT NEW NFT</Link>
              </CollapsibleCanister>

              <CollapsibleCanister icon="🤝" label="Sponsor Wall" accentColor="#AA2DFF">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <Link href="/hub/sponsor" style={{ fontSize: 9, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>ADD SPONSOR →</Link>
                </div>
                <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" accentColor="#AA2DFF" label="SPONSOR SLOT" style={{ minHeight: 140 }} />
              </CollapsibleCanister>
            </div>

          </div>
        </div>

        {/* Left action rail replaced by the persistent MAIN MENU sidebar above. */}
        <ActionCanister
          actions={PERFORMER_RIGHT_RAIL_ACTIONS}
          side="right"
          initialCollapsed={false}
          containerStyle={{
            top: 250,
            transform: 'none',
            right: 0,
          }}
        />
        <WidgetDrawer />

        {/* Mixtape share — send beats/tracks as a package */}
        <div style={{ padding: "0 18px 80px" }}>
          <MixtapeShareCard curatorId={userId} curatorName={`${userName || "Your"} Mixtape`} />
        </div>

        <HeadquartersCommunicationDock
          currentUser={{
            userId,
            displayName: userName || "Performer",
            role: "artist",
          }}
          accentColor="#AA2DFF"
        />
      </div>
  );

  return (
    <UniversalPlatformShell
      roomId="performer-hub"
      title="Performer Hub"
      accentColor="#AA2DFF"
      bpm={120}
      centerStage={hubContent}
      assistantLayer={
        <OnboardingMissionDock missions={onboardingMissions} onDismiss={dismissMission} />
      }
    />
  );
}
