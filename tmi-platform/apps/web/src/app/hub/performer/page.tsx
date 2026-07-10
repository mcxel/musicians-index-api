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
import { getLatestEditorialArticles } from "@/lib/editorial/NewsArticleModel";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
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
  { href: "/avatar",            label: "Avatar"       },
  { href: "/performer/profile", label: "Profile"      },
  { href: "/battles",           label: "Battles"      },
  { href: "/battles/new",       label: "Challenge"    },
  { href: "/cypher/stage",      label: "Cypher"       },
  { href: "/beat-vault",        label: "Beat Vault"   },
  { href: "/nft/mint",          label: "Mint NFT"     },
  { href: "/messages",          label: "Messages"     },
  { href: "/settings",          label: "Settings"     },
];

const PERFORMER_LEFT_RAIL_ACTIONS = [
  { id: "camera",        icon: "🎥", label: "Camera" },
  { id: "audio",         icon: "🎚️", label: "Audio" },
  { id: "playlist",      icon: "🎵", label: "Playlist" },
  { id: "video-shuffle", icon: "🎬", label: "Shuffle" },
  { id: "radio",         icon: "📻", label: "Radio" },
  { id: "memory",        icon: "🖼️", label: "Memory" },
  { id: "yopho",         icon: "✨", label: "Yopho" },
  { id: "upload",        icon: "⬆️", label: "Upload" },
];

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
  const magazineFeatures = getLatestEditorialArticles(3);
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

  const hubContent = (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
      <DesktopAtmosphereRails />

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
            <Link href="/performer/studio" style={{ padding: "9px 20px", borderRadius: 9, background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em", boxShadow: "0 0 20px rgba(170,45,255,0.35)" }}>
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

        {/* Visual-first hero row: monitor first, details later. */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "18px auto 8px", padding: "0 24px" }}>
          <BezelFrame variant="performer" innerPadding={18}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 10 }}>🎬 MAIN BROADCAST MONITOR</div>
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
                <div style={{ display: "grid", gap: 10, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
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
                  <Link href="/performer/studio" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em" }}>GO LIVE</Link>
                  <Link href="/messages" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.28)", color: "#00FFFF", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>MESSAGE</Link>
                  <Link href="/playlists" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.28)", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>PLAYLIST</Link>
                  <Link href="/avatar" style={{ textDecoration: "none", borderRadius: 9, padding: "10px 8px", textAlign: "center", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.28)", color: "#AA2DFF", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>AVATAR</Link>
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
                  <Link href="/performer/studio" style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", borderRadius: 8, fontWeight: 900, fontSize: 10, textDecoration: "none", textAlign: "center", letterSpacing: "0.1em" }}>🔴 GO LIVE TO ARENA</Link>
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
              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>📅 BOOKING DESK</div>
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
              </BezelFrame>

              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>💬 FAN MESSAGES</div>
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
              </BezelFrame>
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
              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 800 }}>🛒 MERCH WALL</div>
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
              </BezelFrame>

              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>🤝 SPONSOR WALL</div>
                  <Link href="/hub/sponsor" style={{ fontSize: 9, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>ADD SPONSOR →</Link>
                </div>
                <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" accentColor="#AA2DFF" label="SPONSOR SLOT" style={{ minHeight: 140 }} />
              </BezelFrame>
            </div>

            {/* Memory Wall + Magazine Features */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF6B35", fontWeight: 800 }}>🎞️ MEMORY WALL</div>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Videos · Photos · Audio</span>
                </div>
                <MemoryWall accentColor="#FF6B35" title="" entityId={userId} entityType="performer" />
                <Link href="/fan/theater" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FF6B35", textDecoration: "none", fontWeight: 700 }}>View all memories →</Link>
              </BezelFrame>

              <BezelFrame variant="performer" innerPadding={20}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800 }}>📰 MAGAZINE FEATURES</div>
                  <Link href="/magazine" style={{ fontSize: 9, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>READ ALL →</Link>
                </div>
                {magazineFeatures.length === 0 ? (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No articles published yet.</div>
                ) : magazineFeatures.map((a) => (
                  <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, lineHeight: 1.3 }}>{a.headline}</div>
                    <div style={{ fontSize: 9, color: "#FFD700" }}>{a.category}</div>
                  </Link>
                ))}
              </BezelFrame>
            </div>

          </div>
        </div>

        <ActionCanister
          actions={PERFORMER_LEFT_RAIL_ACTIONS}
          side="left"
          initialCollapsed={false}
          containerStyle={{
            top: 250,
            transform: 'none',
            left: 'max(10px, calc((100vw - 1300px) / 2 - 82px))',
          }}
        />
        <ActionCanister
          actions={PERFORMER_RIGHT_RAIL_ACTIONS}
          side="right"
          initialCollapsed={false}
          containerStyle={{
            top: 250,
            transform: 'none',
            right: 'max(10px, calc((100vw - 1300px) / 2 - 82px))',
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
