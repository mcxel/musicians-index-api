"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GoLiveControlPanel } from "@/components/performer/GoLiveControlPanel";
import UniversalViewportEngine, { type ViewportMode, type ViewportRoomRuntimeState } from "@/components/viewport/UniversalViewportEngine";
import CollapsibleCanister from "@/components/canisters/CollapsibleCanister";
import MemoryWall from "@/components/media/MemoryWall";
import { InventoryPanel } from "@/components/InventoryPanel";
import InboxPanel from "@/components/messaging/InboxPanel";
import AvatarMiniDisplay from "@/components/canisters/AvatarMiniDisplay";
import MonitorSatelliteSystem from "@/components/canisters/MonitorSatelliteSystem";
import { useTmiSession } from "@/hooks/SessionContext";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { listFollowingForUser } from "@/lib/social/FollowEngine";

interface LiveApiSession {
  userId: string;
  displayName: string;
  roomId: string;
  viewerCount: number;
  avatarUrl: string | null;
  category?: string;
  title?: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
}

interface BookingRow {
  bookingId: string;
  venueSlug: string;
  eventDate: string;
  eventType: string;
  status: string;
}

interface HeadquartersV2PreviewProps {
  role: "fan" | "performer";
}

// Fan HQ = Entertainment Mode ("what do I want to watch?") vs Performer HQ =
// Business Mode ("how do I grow and earn today?") — same shell, same visual
// language, different left-rail emphasis so each role sees what they
// actually came here to do, not a generic shared menu.
const FAN_COMMAND_ITEMS = [
  "Live Rooms", "Lobby", "Friends", "Messages", "Playlists",
  "Memory Wall", "Rewards", "Collections", "Magazine", "Settings",
] as const;

const PERFORMER_COMMAND_ITEMS = [
  "Live Rooms", "Media Locker", "Songs", "Videos", "Events",
  "Merch", "Tickets", "Booking Calendar", "Sponsor Wall", "Settings",
] as const;

function tierColor(tier: string | null): string {
  switch (tier) {
    case "DIAMOND": return "#00FFFF";
    case "PLATINUM": return "#E5E4E2";
    case "GOLD": return "#FFD700";
    case "SILVER": return "#C0C0C0";
    case "RUBY": return "#FF2DAA";
    case "PRO": return "#AA2DFF";
    default: return "rgba(255,255,255,0.45)";
  }
}

export default function HeadquartersV2Preview({ role }: HeadquartersV2PreviewProps) {
  const { userId, userName } = useTmiSession();
  const { totalXp, walletCredits } = useGamificationEngine();
  const [sessions, setSessions] = useState<LiveApiSession[]>([]);
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [socialTab, setSocialTab] = useState<"chat" | "room" | "people">("chat");
  const [userTier, setUserTier] = useState<string | null>(null);
  const [leftPodOpen, setLeftPodOpen] = useState(true);
  const [rightPodOpen, setRightPodOpen] = useState(true);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("EMPTY_VENUE");

  const accentColor = role === "fan" ? "#FF2DAA" : "#AA2DFF";
  const stageAccent = role === "fan" ? "#00FFFF" : "#FFD700";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { tier?: string } } | null) => {
        if (!cancelled) setUserTier(d?.user?.tier ?? null);
      })
      .catch(() => {
        if (!cancelled) setUserTier(null);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = (await res.json()) as { sessions?: LiveApiSession[] };
        if (!cancelled) setSessions(data.sessions ?? []);
      } catch {
        if (!cancelled) setSessions([]);
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 10000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking/create")
      .then((r) => r.json())
      .then((d: { requests?: BookingRow[] }) => { if (!cancelled) setBookings(d.requests ?? []); })
      .catch(() => { if (!cancelled) setBookings([]); });
    return () => { cancelled = true; };
  }, []);

  const featuredLive = useMemo(() => {
    if (role === "performer") return sessions.find((s) => s.userId === userId) ?? sessions[0] ?? null;
    return sessions[0] ?? null;
  }, [role, sessions, userId]);

  const followings = useMemo(() => {
    return listFollowingForUser(userId)
      .map((id) => getPerformerById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [userId]);

  const liveFriends = followings.filter((f) => f.isLive);
  const roomRuntimeState: ViewportRoomRuntimeState = featuredLive ? "LIVE" : "IDLE";

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "#fff",
        fontFamily: '"Orbitron", "Rajdhani", "Segoe UI", sans-serif',
        background: "radial-gradient(circle at 12% 0%, rgba(255,45,170,0.22), transparent 36%), radial-gradient(circle at 88% 0%, rgba(0,255,255,0.16), transparent 38%), linear-gradient(180deg, #03040d 0%, #050714 55%, #040511 100%)",
      }}
    >
      <header style={{ position: "sticky", top: 0, zIndex: 70, borderBottom: `1px solid ${accentColor}66`, background: "rgba(4,6,18,0.9)", backdropFilter: "blur(14px)" }}>
        <div style={{ maxWidth: 1560, margin: "0 auto", display: "grid", gridTemplateColumns: "auto auto 1fr auto auto", gap: 14, alignItems: "center", padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", color: accentColor }}>TMI</div>
          <nav style={{ display: "flex", gap: 8, fontSize: 11, fontWeight: 800, flexWrap: "wrap" }}>
            <Link href="/home/1" style={{ color: "#fff", textDecoration: "none" }}>HOME</Link>
            <Link href="/live/lobby" style={{ color: "#fff", textDecoration: "none" }}>DISCOVER</Link>
            <Link href="/live/lobby" style={{ color: "#00ffff", textDecoration: "none" }}>LIVE NOW</Link>
            <Link href="/magazine/1" style={{ color: "#fff", textDecoration: "none" }}>MAGAZINE</Link>
          </nav>
          <input placeholder="Search rooms, creators, venues" style={{ width: "100%", minWidth: 160, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", borderRadius: 999, padding: "8px 12px", fontSize: 11 }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, fontWeight: 800 }}>
            <span style={{ color: "#FF2DAA" }}>💎 {totalXp.toLocaleString()}</span>
            <span style={{ color: "#FFD700" }}>🪙 {walletCredits.toLocaleString()}</span>
            <span style={{ color: "#00FFFF" }}>{sessions.length.toLocaleString()} LIVE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AvatarMiniDisplay size={28} />
            <div style={{ fontSize: 11, fontWeight: 800 }}>{userName || "Guest"}</div>
            {userTier && <span style={{ fontSize: 9, fontWeight: 900, color: tierColor(userTier) }}>{userTier}</span>}
          </div>
        </div>
        <div style={{ maxWidth: 1560, margin: "0 auto", padding: "0 14px 10px" }}>
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, border: `1px solid ${accentColor}66`, background: `${accentColor}1f`, fontSize: 10, letterSpacing: "0.12em", fontWeight: 900, color: accentColor }}>
            HEADQUARTERS V2 PREVIEW MODE
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1560, margin: "0 auto", padding: "14px", display: "grid", gridTemplateColumns: "230px minmax(0,1fr) 320px", gap: 14, minHeight: 640 }}>
        <aside style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(7,10,24,0.88)", padding: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: accentColor, marginBottom: 8 }}>
            {role === "performer" ? "BUSINESS MODE" : "ENTERTAINMENT MODE"}
          </div>
          {(role === "performer" ? PERFORMER_COMMAND_ITEMS : FAN_COMMAND_ITEMS).map((item) => (
            <div key={item} style={{ fontSize: 10, fontWeight: 800, padding: "8px 9px", marginBottom: 6, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>{item}</div>
          ))}
          {role === "performer" && (
            <div style={{ marginTop: 12 }}>
              <GoLiveControlPanel />
            </div>
          )}
          {leftPodOpen && (
            <div style={{ marginTop: 10 }}>
              <InventoryPanel />
              <button type="button" onClick={() => setLeftPodOpen(false)} style={{ marginTop: 6, width: "100%", borderRadius: 8, border: "1px solid rgba(0,255,255,0.4)", background: "transparent", color: "#00FFFF", padding: 6, fontSize: 10 }}>Hide Inventory</button>
            </div>
          )}
        </aside>

        <section style={{ position: "relative", borderRadius: 16, border: `1px solid ${accentColor}66`, background: "rgba(7,10,24,0.92)", overflow: "hidden", padding: 10 }}>
          <div style={{ height: "calc(100% - 10px)", minHeight: 480 }}>
            <UniversalViewportEngine
              role={role}
              accentColor={accentColor}
              stageAccent={stageAccent}
              defaultMode={featuredLive ? "LIVE_VENUE" : "AVATAR_LOBBY"}
              currentSession={featuredLive ?? undefined}
              roomRuntimeState={roomRuntimeState}
              onModeChange={setViewportMode}
            />
          </div>
        </section>

        <aside style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(7,10,24,0.9)", padding: 10, display: "grid", gridTemplateRows: role === "performer" ? "auto auto minmax(0,1fr) auto auto" : "auto auto minmax(0,1fr) auto", gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF" }}>RIGHT SOCIAL TOWER</div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["chat", "room", "people"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setSocialTab(tab)} style={{ flex: 1, borderRadius: 999, border: `1px solid ${socialTab === tab ? "#FF2DAA" : "rgba(255,255,255,0.2)"}`, background: socialTab === tab ? "rgba(255,45,170,0.2)" : "transparent", color: "#fff", fontSize: 10, fontWeight: 900, padding: "6px 4px" }}>{tab}</button>
            ))}
          </div>
          <div style={{ overflow: "auto" }}>
            {socialTab === "chat" && (
              <InboxPanel currentUser={{ userId, displayName: userName || "Guest", role: role === "performer" ? "artist" : "fan", avatarUrl: "" }} />
            )}
            {socialTab === "room" && (
              <div style={{ fontSize: 11 }}>
                {featuredLive ? (
                  <>
                    <div style={{ fontWeight: 800 }}>{featuredLive.displayName}</div>
                    <div style={{ color: "#FFD700" }}>{featuredLive.viewerCount.toLocaleString()} watching</div>
                    <Link href={`/live/rooms/${featuredLive.roomId}`} style={{ color: "#00FFFF" }}>Open Room →</Link>
                  </>
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>No active room selected.</div>
                )}
              </div>
            )}
            {socialTab === "people" && (
              <div style={{ display: "grid", gap: 6 }}>
                {sessions.length === 0 && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>No people in live rooms yet.</div>}
                {sessions.slice(0, 8).map((s) => (
                  <div key={s.userId} style={{ fontSize: 11, display: "flex", justifyContent: "space-between" }}>
                    <span>{s.displayName}</span><span>{s.viewerCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {role === "performer" && (
            <div>
              <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>BOOKING REQUESTS</div>
              {bookings === null ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.58)" }}>Loading…</div>
              ) : bookings.length === 0 ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.58)" }}>No booking requests yet.</div>
              ) : (
                bookings.slice(0, 4).map((b) => (
                  <div key={b.bookingId} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                    <span>{b.venueSlug}</span>
                    <span style={{ color: "#FFD700" }}>{b.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>{role === "performer" ? "AUDIENCE ONLINE" : "FRIENDS ONLINE"}</div>
            {liveFriends.length === 0 ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.58)" }}>No friends currently live.</div>
            ) : (
              liveFriends.slice(0, 6).map((f) => (
                <Link key={f.id} href={f.liveRoomRoute ?? `/performers/${f.slug}`} style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", color: "#fff", fontSize: 10, marginBottom: 4 }}>
                  <span>{f.name}</span><span style={{ color: "#E63000" }}>LIVE</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>

      <section style={{ maxWidth: 1560, margin: "0 auto", padding: "0 14px 46px", display: "grid", gap: 12 }}>
        <CollapsibleCanister icon="🖼️" label="Memory Wall Module" accentColor="#FFD700" defaultOpen={rightPodOpen}>
          <MemoryWall accentColor="#FFD700" title="" entityId={userId} entityType={role} />
        </CollapsibleCanister>

        <CollapsibleCanister icon="📅" label="Booking Module" accentColor="#FFD700" defaultOpen>
          {bookings === null && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.58)" }}>Loading booking data...</div>}
          {bookings !== null && bookings.length === 0 && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.58)" }}>No booking requests available.</div>}
          {(bookings ?? []).slice(0, 10).map((b) => (
            <div key={b.bookingId} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>{b.venueSlug} · {b.eventDate} · {b.eventType}</div>
              <div style={{ color: "#FFD700" }}>{b.status}</div>
            </div>
          ))}
        </CollapsibleCanister>

        {role === "performer" && (
          <CollapsibleCanister icon="👥" label="Performer Audience Pulse Monitor" accentColor="#AA2DFF" defaultOpen>
            <MonitorSatelliteSystem
              mainLabel={featuredLive?.displayName ?? "Performer Audience Pulse"}
              isLive={Boolean(featuredLive)}
              liveRoomRoute={featuredLive ? `/live/rooms/${featuredLive.roomId}` : "/live/lobby"}
              staticImageUrl={featuredLive?.avatarUrl ?? "/images/tmi-placeholder.jpg"}
              audienceCount={featuredLive?.viewerCount ?? 0}
              accentColor="#AA2DFF"
              adZone="preview-performer-hq-v2"
              showAudienceMonitor
            />
          </CollapsibleCanister>
        )}
      </section>
    </main>
  );
}
