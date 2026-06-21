"use client";

import { useEffect, useState } from "react";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
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
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import HeadquartersCommunicationDock from "@/components/headquarters/HeadquartersCommunicationDock";
import { useTmiSession } from "@/hooks/SessionContext";
import { getLatestEditorialArticles } from "@/lib/editorial/NewsArticleModel";

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

export default function PerformerHubPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [threads, setThreads]   = useState<MessageThreadRow[] | null>(null);
  const [liveStatus, setLiveStatus] = useState<{ isLive: boolean; audienceCount: number }>({ isLive: false, audienceCount: 0 });
  const { userId, userName } = useTmiSession();
  const magazineFeatures = getLatestEditorialArticles(3);

  useEffect(() => {
    fetch("/api/booking/create")
      .then((r) => r.json())
      .then((d: { requests?: BookingRow[] }) => setBookings(d.requests ?? []))
      .catch(() => setBookings([]));

    fetch("/api/messages", { credentials: "include" })
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
  }, []);

  // Real liveness — this monitor previously hardcoded isLive={false} always,
  // even while the performer was actually broadcasting. Same
  // GlobalLiveSessionRegistry source used by Fan HQ's Live Now panel.
  useEffect(() => {
    let cancelled = false;
    const checkLive = () => {
      fetch('/api/live/go', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: { sessions?: { userId: string; viewerCount: number }[] }) => {
          if (cancelled) return;
          const mine = d.sessions?.find((s) => s.userId === userId);
          setLiveStatus(mine ? { isLive: true, audienceCount: mine.viewerCount } : { isLive: false, audienceCount: 0 });
        })
        .catch(() => { if (!cancelled) setLiveStatus({ isLive: false, audienceCount: 0 }); });
    };
    checkLive();
    const id = setInterval(checkLive, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [userId]);

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
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <PerformerHubDashboard performerId={userId} displayName={userName || "Your Profile"} />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Primary controls stay visible on the main surface (not hidden in canisters). */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(120px, 1fr))", gap: 10 }}>
              {[
                { href: "/performer/studio", label: "Camera", tone: "#00FFFF" },
                { href: "/performer/studio", label: "Audio", tone: "#00E5FF" },
                { href: "/performer/studio", label: "Upload", tone: "#AA2DFF" },
                { href: "/messages", label: "Messaging", tone: "#FF2DAA" },
                { href: "/playlists", label: "Playlist", tone: "#FFD700" },
                { href: "/performer/profile", label: "Memory", tone: "#FF6B35" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    textDecoration: "none",
                    border: `1px solid ${action.tone}55`,
                    background: `${action.tone}12`,
                    color: action.tone,
                    borderRadius: 10,
                    padding: "10px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Live monitor + Backstage / Green Room */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Live monitor */}
              <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>🎥 LIVE MONITOR</div>
                <MonitorSatelliteSystem
                  mainLabel="Main Stage Camera"
                  isLive={liveStatus.isLive}
                  staticImageUrl="/images/tmi-placeholder.jpg"
                  accentColor="#AA2DFF"
                  adZone="hub-performer"
                  showAudienceMonitor
                  audienceCount={liveStatus.audienceCount}
                />

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Link href="/performer/studio" style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", borderRadius: 8, fontWeight: 900, fontSize: 10, textDecoration: "none", textAlign: "center", letterSpacing: "0.1em" }}>🔴 GO LIVE TO ARENA</Link>
                  <Link href="/live/rooms" style={{ flex: 1, padding: "10px", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", borderRadius: 8, fontWeight: 800, fontSize: 10, textDecoration: "none", textAlign: "center" }}>📡 ROOMS</Link>
                </div>
              </div>

              {/* Green Room / Backstage */}
              <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.18)", borderRadius: 16, padding: "20px" }}>
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
              </div>
            </div>

            {/* Booking Desk + Fan Messages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Booking desk */}
              <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, padding: "20px" }}>
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
              </div>

              {/* Fan messages */}
              <div style={{ background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 16, padding: "20px" }}>
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
              </div>
            </div>

            {/* Pop-out canisters — Playlist + Memory Wall (Constitution Rule 15) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CollapsibleCanister icon="🎵" label="Playlist" accentColor="#FF2DAA" defaultOpen>
                <PlaylistArtifact artifactId={`${userId}-playlist`} skin="submarine" title="Performer Playlist" />
              </CollapsibleCanister>
              <CollapsibleCanister icon="🖼️" label="Memory Wall" accentColor="#FFD700" defaultOpen>
                <MemoryWall accentColor="#FFD700" title="Memory Wall" entityId={userId} entityType="performer" />
              </CollapsibleCanister>
            </div>

            {/* Merch Wall + Sponsor Wall */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Merch wall */}
              <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 16, padding: "20px" }}>
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
                {magazineFeatures.length === 0 ? (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No articles published yet.</div>
                ) : magazineFeatures.map((a) => (
                  <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, lineHeight: 1.3 }}>{a.headline}</div>
                    <div style={{ fontSize: 9, color: "#FFD700" }}>{a.category}</div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        <ActionCanister actions={PERFORMER_ACTIONS} />
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
    </RoomContainer>
  );
}
