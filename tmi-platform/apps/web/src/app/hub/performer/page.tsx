"use client";

import { useEffect, useMemo, useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import Link from "next/link";
import Image from "next/image";
import { HubBackNav } from "@/components/nav/HubBackNav";
import ActionCanister from "@/components/room/ActionCanister";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import TokenBalance from "@/components/hud/TokenBalance";
import MonitorSatelliteSystem from "@/components/canisters/MonitorSatelliteSystem";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import MemoryWall from "@/components/media/MemoryWall";
import MemoryWallPhotoStrip from "@/components/media/MemoryWallPhotoStrip";
import MediaUploadWidget from "@/components/media/MediaUploadWidget";
import { TrackUploader } from "@/lib/submissions/TrackUploader";
import { useTmiSession } from "@/hooks/SessionContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { getLevelForXP, getProgressToNextLevel } from "@/lib/xp/xpEngine";
import { useDrawer } from "@/components/room/DrawerContext";
import { OnboardingMissionDock } from "@/components/onboarding/OnboardingMissionCard";
import { useOnboardingMissions } from "@/components/onboarding/useOnboardingMissions";
import UniversalPlatformShell from "@/components/shell/UniversalPlatformShell";
import { BezelFrame } from '@/components/admin/overseer/AdminDesignSystem';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';

// Contextual side/floating panels imports
import FloatingPanel from "@/components/ui/FloatingPanel";
import MessagesWidget from "@/components/widgets/MessagesWidget";
import BookingsWidget from "@/components/room/BookingsWidget";
import SponsorsWidget from "@/components/widgets/SponsorsWidget";
import LiveRoomsWidget from "@/components/widgets/LiveRoomsWidget";

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

const PERFORMER_MAIN_MENU = [
  { kind: "link",   href: "/submit",             icon: "📤", label: "Submission", sub: "Stream & Win Radio" },
  { kind: "drawer", id: "live-rooms", icon: "🎭", label: "Live Rooms" },
  { kind: "drawer", id: "lobby",      icon: "🌐", label: "Lobby" },
  { kind: "drawer", id: "messages",   icon: "💬", label: "Messages" },
  { kind: "drawer", id: "friends",    icon: "👥", label: "Friends" },
  { kind: "drawer", id: "inventory",  icon: "🎒", label: "Inventory" },
  { kind: "drawer", id: "memory",     icon: "🧠", label: "Memory Wall" },
  { kind: "drawer", id: "playlist",   icon: "🎵", label: "Playlists" },
  { kind: "drawer", id: "yopho",      icon: "✨", label: "Yopho" },
  { kind: "link",   href: "/rewards",          icon: "⭐", label: "Rewards" },
  { kind: "link",   href: "/store",            icon: "🛒", label: "Store" },
  { kind: "drawer", id: "settings",   icon: "⚙️", label: "Settings" },
] as const;

const PERFORMER_RIGHT_RAIL_ACTIONS = [
  { id: "sponsors", icon: "🤝", label: "Sponsors" },
  { id: "bookings", icon: "📅", label: "Bookings" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "upload",   icon: "⬆️", label: "Upload" },
  { id: "playlist", icon: "🎵", label: "Playlist" },
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
  const [liveStatus, setLiveStatus] = useState<PerformerLiveStatus>({ isLive: false, audienceCount: 0, recentAudienceEntries: [], audienceCountries: [] });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { userId, userName } = useTmiSession();
  const { missions: onboardingMissions, dismiss: dismissMission } = useOnboardingMissions();
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [rightRailOpen, setRightRailOpen] = useState(true);
  const [monitorMinimized, setMonitorMinimized] = useState(false);

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
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative", paddingLeft: SIDEBAR_WIDTH, paddingBottom: "100px" }}>
      <DesktopAtmosphereRails />

      <NeonWaveUnderlay colorA="#AA2DFF" colorB="#FF2DAA" colorC="#00FFFF" opacity={0.08} zIndex={0} />

      {/* ══ PERSISTENT LEFT SIDEBAR ══ */}
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

        {/* Real user card */}
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

      {/* Upgrade flash banner */}
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

      {/* Main Broadcast Monitor Area */}
      <div style={{ position: "relative", zIndex: 1, margin: "18px 0 8px", padding: "0 20px" }}>
        <BezelFrame variant="performer" innerPadding={18}>
          <div style={{ display: "grid", gridTemplateColumns: `minmax(0, 1fr)${rightRailOpen ? " 320px" : ""}`, gap: 18, alignItems: "start", transition: "grid-template-columns 0.28s ease" }}>
            <div style={{ position: "relative", maxWidth: "100%", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>🎬 MAIN BROADCAST MONITOR</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setMonitorMinimized((v) => !v)}
                    style={{ background: "none", border: "1px solid rgba(170,45,255,0.28)", borderRadius: 6, color: "rgba(170,45,255,0.7)", fontSize: 10, fontWeight: 800, padding: "3px 8px", cursor: "pointer", letterSpacing: "0.08em" }}
                    title={monitorMinimized ? "Restore monitor" : "Minimize monitor"}
                  >
                    {monitorMinimized ? "▲ RESTORE" : "▼ MIN"}
                  </button>
                  <button
                    onClick={() => setRightRailOpen((v) => !v)}
                    style={{ background: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 6, color: "rgba(0,255,255,0.6)", fontSize: 10, fontWeight: 800, padding: "3px 8px", cursor: "pointer", letterSpacing: "0.08em" }}
                    title={rightRailOpen ? "Collapse right panel" : "Expand right panel"}
                  >
                    {rightRailOpen ? "⟩⟩" : "⟨⟨"}
                  </button>
                </div>
              </div>
              {!monitorMinimized ? (
                <>
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
                </>
              ) : (
                <button
                  onClick={() => setMonitorMinimized(false)}
                  style={{
                    width: "100%",
                    padding: "22px 0",
                    background: "rgba(170,45,255,0.06)",
                    border: "1px dashed rgba(170,45,255,0.28)",
                    borderRadius: 10,
                    color: "rgba(170,45,255,0.6)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  ▲ BROADCAST MONITOR — CLICK TO RESTORE
                </button>
              )}
            </div>

            {rightRailOpen && (
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
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{performerIdentity?.name || userName || "Performer"}</div>
                      <div style={{ fontSize: 10, color: "#AA2DFF", marginTop: 4 }}>{performerIdentity?.category || "Genre Not Selected"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    <button onClick={() => toggleDrawer("bookings")} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>📅 BOOKINGS</button>
                    <button onClick={() => toggleDrawer("messages")} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>💬 CHAT</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </BezelFrame>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
        {/* Sleek Contextual Dashboard Information Hub (Rules/Stats only, no dense blocks) */}
        <PerformerHubDashboard performerId={userId} displayName={userName || "Your Profile"} />
      </div>

      {/* ─── TRANSIENT CONTEXTUAL FLOATING PANELS (REPLACES RAW DRAWERS & STATIC WIDGETS) ─── */}
      <FloatingPanel
        isOpen={activeDrawer === "bookings"}
        onClose={() => toggleDrawer("bookings")}
        title="Booking Desk"
        icon="📅"
        accentColor="#FFD700"
        position="right"
      >
        <BookingsWidget />
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "messages"}
        onClose={() => toggleDrawer("messages")}
        title="Fan Messages"
        icon="💬"
        accentColor="#FF2DAA"
        position="right"
      >
        <MessagesWidget />
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "upload"}
        onClose={() => toggleDrawer("upload")}
        title="Creator Upload Center"
        icon="📤"
        accentColor="#AA2DFF"
        position="right"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {uploadNotice && (
            <div style={{ fontSize: 11, color: "#00FF88", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.24)", borderRadius: 8, padding: "8px 10px" }}>
              {uploadNotice}
            </div>
          )}
          <MediaUploadWidget
            mediaType="song"
            ownerId={userId}
            ownerName={userName || "Performer"}
            ownerRole="performer"
            accentColor="#AA2DFF"
            onSuccess={(result) => {
              if (result.ok) setUploadNotice(`Uploaded "${result.title}" successfully.`);
            }}
            onError={(err) => setUploadNotice(`Upload failed: ${err}`)}
          />
          <TrackUploader
            submissionType="track"
            submitterId={userId}
            onSubmissionSuccess={(submissionId) => setUploadNotice(`Submission received. ID: ${submissionId}`)}
          />
        </div>
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "playlist"}
        onClose={() => toggleDrawer("playlist")}
        title="Playlist Manager"
        icon="🎵"
        accentColor="#FF2DAA"
        position="right"
      >
        <PlaylistArtifact artifactId={`${userId}-playlist`} skin="submarine" title="Performer Playlist" />
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "memory"}
        onClose={() => toggleDrawer("memory")}
        title="Memory Wall"
        icon="🧠"
        accentColor="#FFD700"
        position="left"
      >
        <MemoryWall accentColor="#FFD700" title="Memory Wall" entityId={userId} entityType="performer" />
        <div style={{ marginTop: 12 }}>
          <MemoryWallPhotoStrip entityId={userId} entityType="performer" accentColor="#FF2DAA" />
        </div>
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "sponsors"}
        onClose={() => toggleDrawer("sponsors")}
        title="Sponsors & Partners"
        icon="🤝"
        accentColor="#AA2DFF"
        position="right"
      >
        <SponsorsWidget />
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "live-rooms"}
        onClose={() => toggleDrawer("live-rooms")}
        title="Live Rooms"
        icon="🎭"
        accentColor="#00FFFF"
        position="left"
      >
        <LiveRoomsWidget />
      </FloatingPanel>

      <FloatingPanel
        isOpen={activeDrawer === "yopho"}
        onClose={() => toggleDrawer("yopho")}
        title="Yopho Identity Canvas"
        icon="✨"
        accentColor="#FF2DAA"
        position="left"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA", marginBottom: 6 }}>YOUR CREATIVE CANVAS</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              Customize and update your visual persona cards and covers.
            </div>
            <div style={{ marginTop: 12, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 8, height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              YoPho Editor Active
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Right Action Rail */}
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
