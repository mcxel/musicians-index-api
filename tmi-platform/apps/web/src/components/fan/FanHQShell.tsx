"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import { useTmiSession } from "@/hooks/SessionContext";
import { useWatchSession } from "@/lib/presence/WatchSessionContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { listFollowingForUser } from "@/lib/social/FollowEngine";
import FanRewardsRail from "@/components/fan/FanRewardsRail";
import FanSocialRail from "@/components/fan/FanSocialRail";
import FanWalletRail from "@/components/fan/FanWalletRail";
import AvatarMiniDisplay from "@/components/canisters/AvatarMiniDisplay";
import MemoryWall from "@/components/media/MemoryWall";
import MemoryWallPhotoStrip from "@/components/media/MemoryWallPhotoStrip";
import FriendsList from "@/components/social/FriendsList";
import { InventoryPanel } from "@/components/InventoryPanel";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import RecentlyVisitedRail from "@/components/presence/RecentlyVisitedRail";
import MonitorSatelliteSystem from "@/components/canisters/MonitorSatelliteSystem";
import HeadquartersCommunicationDock from "@/components/headquarters/HeadquartersCommunicationDock";
import DiscoveryDockPanel from "@/components/hubs/DiscoveryDockPanel";
import InboxPanel from "@/components/messaging/InboxPanel";
import type { Friend as FriendType } from "@/components/social/FriendsList";
import { BezelFrame } from '@/components/admin/overseer/AdminDesignSystem';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';
import CollapsibleCanister from "@/components/canisters/CollapsibleCanister";
import AudienceScene from "@/components/live/AudienceScene";

interface FeaturedLive {
  name: string;
  liveRoomRoute: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
  profileImageUrl?: string;
  audienceCount: number;
}

interface LiveApiSession {
  userId: string;
  displayName: string;
  roomId: string;
  viewerCount: number;
  avatarUrl: string | null;
  category?: string;
  title?: string;
  accentColor?: string;
}

interface FanHQShellProps {
  fanId: string;
  fanDisplayName: string;
}

export default function FanHQShell({ fanId, fanDisplayName }: FanHQShellProps) {
  const router = useRouter();
  const { totalXp, walletCredits, currentLevel } = useGamificationEngine();
  const { economyState } = useTmiSession();
  const { current: nowPlaying } = useWatchSession();
  const [featuredLive, setFeaturedLive] = useState<FeaturedLive | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    title: string;
    route: string;
    avatar?: string;
    viewerCount?: number;
    isLive?: boolean;
  } | null>(null);
  const [showInventoryPanel, setShowInventoryPanel] = useState(true);
  const [showMemoryWallPanel, setShowMemoryWallPanel] = useState(true);

  const followingFriends: FriendType[] = useMemo(() => {
    return listFollowingForUser(fanId)
      .map((id) => getPerformerById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        role: "PERFORMER",
        isOnline: false,
        isLive: p.isLive,
        liveRoomId: p.isLive ? p.roomId : undefined,
        genre: p.category,
        avatarEmoji: undefined,
      }));
  }, [fanId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        const top = data.sessions?.[0];
        if (cancelled) return;
        if (!top) {
          setFeaturedLive(null);
          setPreviewItem(null);
          return;
        }
        const profile = getPerformerById(top.userId);
        const current = {
          title: profile?.name ?? top.displayName,
          route: profile?.liveRoomRoute ?? `/live/rooms/${top.roomId}`,
          avatar: profile?.profileImageUrl ?? top.avatarUrl ?? undefined,
          viewerCount: top.viewerCount,
          isLive: true,
        };
        setFeaturedLive({
          name: profile?.name ?? top.displayName,
          liveRoomRoute: current.route,
          introVideoUrl: profile?.introVideoUrl,
          motionPosterUrl: profile?.motionPosterUrl,
          profileImageUrl: current.avatar,
          audienceCount: top.viewerCount,
        });
        setPreviewItem((prev) => prev ?? current);
      } catch {
        if (!cancelled) {
          setFeaturedLive(null);
          setPreviewItem(null);
        }
      }
    };
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const mainLabel = previewItem?.title ?? featuredLive?.name ?? "Live Room Preview";
  const mainRoute = previewItem?.route ?? featuredLive?.liveRoomRoute ?? "/live/lobby";
  const mainImage = previewItem?.avatar ?? featuredLive?.profileImageUrl ?? "/images/tmi-placeholder.jpg";
  const mainCount = previewItem?.viewerCount ?? featuredLive?.audienceCount;
  const isLive = previewItem?.isLive ?? Boolean(featuredLive);

  const tier = ["free", "pro-RUBY", "gold-platinum", "diamond"][Math.min(economyState.tierLevel, 3)] as "free" | "pro-RUBY" | "gold-platinum" | "diamond";

  const liveFriends = followingFriends.filter((friend) => friend.isLive);

  return (
    <div style={{
      minHeight: "100vh",
      height: "100vh",
      background: "radial-gradient(circle at top, rgba(255,45,170,0.18), transparent 24%), radial-gradient(circle at 70% 0%, rgba(0,255,255,0.14), transparent 24%), linear-gradient(180deg, #050510 0%, #07071a 45%, #050510 100%)",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      <DesktopAtmosphereRails />
      
      {/* Target Styled Header Bar */}
      <div style={{
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(5, 5, 16, 0.85)",
        backdropFilter: "blur(12px)",
        padding: "8px 20px",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 12,
              color: "#fff",
              boxShadow: "0 0 10px rgba(255, 45, 170, 0.6)"
            }}>
              T
            </div>
            <span style={{ fontWeight: 900, fontSize: 12, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              TMI <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10 }}>- THE MARCEL INITIATIVE</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", gap: 18, fontSize: 10, fontWeight: 900, letterSpacing: "0.08em" }}>
            {["HOME", "DISCOVER", "LIVE NOW", "MAGAZINE", "MARKETPLACE", "ARENA"].map((tab) => {
              const active = tab === "LIVE NOW";
              const href = tab === "HOME" ? "/home/1" : tab === "DISCOVER" ? "/live/lobby" : tab === "LIVE NOW" ? "/hub/fan" : `/${tab.toLowerCase()}`;
              return (
                <Link key={tab} href={href} style={{
                  color: active ? "#FF2DAA" : "#fff",
                  textDecoration: "none",
                  textShadow: active ? "0 0 8px rgba(255, 45, 170, 0.4)" : "none"
                }}>
                  {tab}
                </Link>
              );
            })}
          </nav>

          {/* Search bar */}
          <div style={{ flex: 1, maxWidth: 300 }}>
            <input
              placeholder="Search performers, rooms, people..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#fff",
                padding: "6px 12px",
                fontSize: 11,
                outline: "none"
              }}
            />
          </div>

          {/* Right Metrics & Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Fuchsia Diamond Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 6, padding: "3px 8px" }}>
              <span style={{ color: "#FF2DAA", fontSize: 10 }}>💎</span>
              <span style={{ color: "#FF8FBE", fontSize: 10, fontWeight: 900 }}>12,450</span>
            </div>

            {/* Gold Coin Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6, padding: "3px 8px" }}>
              <span style={{ color: "#FFD700", fontSize: 10 }}>🪙</span>
              <span style={{ color: "#FFEAA3", fontSize: 10, fontWeight: 900 }}>8,670</span>
            </div>

            {/* Bell notification */}
            <div style={{ position: "relative", cursor: "pointer", fontSize: 12 }}>
              🔔
              <span style={{
                position: "absolute",
                top: -4,
                right: -6,
                background: "#FF4444",
                color: "#fff",
                fontSize: 7,
                fontWeight: 900,
                borderRadius: "50%",
                width: 11,
                height: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                12
              </span>
            </div>

            {/* Envelope Message */}
            <div style={{ position: "relative", cursor: "pointer", fontSize: 12 }}>
              ✉
              <span style={{
                position: "absolute",
                top: -4,
                right: -6,
                background: "#FF4444",
                color: "#fff",
                fontSize: 7,
                fontWeight: 900,
                borderRadius: "50%",
                width: 11,
                height: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                2
              </span>
            </div>

            {/* User Profile Card */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: 12 }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5b217a, #301042)",
                border: "1.5px solid #FF2DAA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10
              }}>
                👤
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>MarcelD</span>
                <span style={{
                  fontSize: 7,
                  fontWeight: 900,
                  color: "#FF2DAA",
                  background: "rgba(255,45,170,0.15)",
                  padding: "0.5px 4px",
                  borderRadius: 3,
                  textTransform: "uppercase"
                }}>
                  DIAMOND
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Viewport Layout */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "grid",
        gridTemplateColumns: "230px minmax(0, 1fr) 340px",
        height: "calc(100vh - 45px)",
        maxHeight: "calc(100vh - 45px)",
        overflow: "hidden"
      }}>
        {/* Left-Rail Overlay Sidebar */}
        <div style={{
          background: "rgba(5, 5, 16, 0.45)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "12px 14px",
          height: "100%",
          boxSizing: "border-box"
        }}>
          {/* Main Menu */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
              MAIN MENU
            </div>
            {[
              { label: "LIVE ROOMS", info: "24 Live Now", active: true, href: "/live/lobby" },
              { label: "LOBBY", info: "Avatar World", href: "/live/lobby/fans" },
              { label: "MESSAGES", info: "12 Unread", href: "/messages", hasDot: "red" },
              { label: "FRIENDS", info: "89 Online", href: "/friends", hasDot: "green" },
              { label: "INVENTORY", info: "145 Items", href: "/inventory" },
              { label: "MEMORY WALL", info: "324 Memories", href: "/memories" },
              { label: "PLAYLISTS", info: "42 Playlists", href: "/playlist" },
              { label: "CAMERA", info: "Go Live", href: "/camera" },
              { label: "REWARDS", info: "12,450 Points", href: "/rewards" },
              { label: "STORE", info: "New Items", href: "/store" },
              { label: "SETTINGS", href: "/settings" }
            ].map((item) => (
              <Link key={item.label} href={item.href} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                background: item.active ? "rgba(255, 45, 170, 0.15)" : "transparent",
                border: item.active ? "1px solid rgba(255, 45, 170, 0.3)" : "1px solid transparent",
                color: item.active ? "#FF8FBE" : "#fff",
                transition: "all 200ms ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {item.hasDot && (
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: item.hasDot === "red" ? "#FF4444" : "#00FF88",
                      boxShadow: item.hasDot === "red" ? "0 0 6px #FF4444" : "0 0 6px #00FF88"
                    }} />
                  )}
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.05em" }}>{item.label}</span>
                </div>
                {item.info && (
                  <span style={{
                    fontSize: 7,
                    fontWeight: 900,
                    color: item.active ? "#fff" : "rgba(255,255,255,0.4)",
                    background: item.active ? "#FF2DAA" : "rgba(255,255,255,0.06)",
                    padding: "1px 5px",
                    borderRadius: 4
                  }}>
                    {item.info}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Profile Card at Bottom Left */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 10,
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5b217a, #301042)",
                border: "1.5px solid #FF2DAA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12
              }}>
                👤
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>MarcelD</span>
                <span style={{ fontSize: 7, fontWeight: 800, color: "#AA2DFF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  DIAMOND MEMBER
                </span>
              </div>
            </div>

            {/* Level & XP */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>
                <span>LEVEL 87</span>
                <span style={{ color: "#00FFFF" }}>12,450 / 25,000 XP</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)" }} />
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, textAlign: "center" }}>
              {[
                { label: "Fans", value: "128K" },
                { label: "Following", value: "2,341" },
                { label: "Rooms", value: "842" }
              ].map((m) => (
                <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 2px" }}>
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center 3D Stage / Viewport Canvas */}
        <div style={{
          position: "relative",
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#010308",
          overflow: "hidden"
        }}>
          {/* Main Stage (16:9 Screen) */}
          <div style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Performer Stage Video */}
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/boardroom_live.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }} />
            
            {/* Video Overlays */}
            <div style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              pointerEvents: "none",
              zIndex: 5
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,0,136,0.3)",
                  color: "#FF8FBE",
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 4,
                  textTransform: "uppercase"
                }}>
                  🔥 LIVE NOW
                </span>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  MarcelD Live in Thunder Dome
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                  Hip Hop • 4K Ultra HD
                </span>
              </div>
              
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{
                  background: "rgba(255,215,0,0.2)",
                  border: "1px solid #FFD700",
                  color: "#FFD700",
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 4
                }}>
                  4K ULTRA HD
                </span>
                <span style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 4
                }}>
                  👁 12,847
                </span>
              </div>
            </div>

            {/* Floating Inventory Panel */}
            {showInventoryPanel && (
              <div style={{
                position: "absolute",
                left: 20,
                top: 60,
                width: 250,
                background: "rgba(5, 5, 16, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid #FF2DAA",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(255, 45, 170, 0.2)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>INVENTORY</span>
                  <button onClick={() => setShowInventoryPanel(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11 }}>×</button>
                </div>
                <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {["AVATAR", "WEARABLES", "ITEMS", "EMOTES"].map((t, idx) => (
                      <span key={t} style={{
                        fontSize: 7,
                        fontWeight: 900,
                        color: idx === 0 ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                        background: idx === 0 ? "rgba(255,45,170,0.15)" : "transparent",
                        padding: "2px 6px",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  {/* Character display */}
                  <div style={{ height: 130, background: "rgba(0,0,0,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: 50 }}>👤</span>
                    {/* Equipped items */}
                    <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, display: "flex", justifyContent: "center", gap: 4 }}>
                      {["🧢", "🕶", "🧥", "👟"].map((eq, i) => (
                        <span key={i} style={{ width: 18, height: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{eq}</span>
                      ))}
                    </div>
                  </div>

                  <button style={{
                    background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "6px 12px",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(255, 45, 170, 0.4)"
                  }}>
                    CUSTOMIZE AVATAR
                  </button>
                </div>
              </div>
            )}

            {/* Floating Memory Wall Panel */}
            {showMemoryWallPanel && (
              <div style={{
                position: "absolute",
                right: 20,
                top: 60,
                width: 250,
                background: "rgba(5, 5, 16, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid #AA2DFF",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(170, 45, 255, 0.2)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>MEMORY WALL</span>
                  <button onClick={() => setShowMemoryWallPanel(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11 }}>×</button>
                </div>
                <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {["ALL", "PHOTOS", "VIDEOS", "TICKETS"].map((t, idx) => (
                      <span key={t} style={{
                        fontSize: 7,
                        fontWeight: 900,
                        color: idx === 0 ? "#AA2DFF" : "rgba(255,255,255,0.4)",
                        background: idx === 0 ? "rgba(170,45,255,0.15)" : "transparent",
                        padding: "2px 6px",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  {/* Memory Cards grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      { title: "Thunder Dome", icon: "📸" },
                      { title: "MarcelD Live", icon: "🎥" },
                      { title: "VIP Ticket", icon: "🎫" },
                      { title: "Stage Sweep", icon: "📸" }
                    ].map((item, i) => (
                      <div key={i} style={{ height: 60, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 4 }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{item.title}</span>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    background: "rgba(170, 45, 255, 0.15)",
                    border: "1.5px solid #AA2DFF",
                    borderRadius: 8,
                    color: "#ffe3a3",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "6px 12px",
                    cursor: "pointer"
                  }}>
                    VIEW ALL MEMORIES
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audience Scene (Seated avatars at the bottom) */}
          <div style={{
            height: 140,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
            position: "relative",
            flexShrink: 0
          }}>
            <AudienceScene view="fan" />
          </div>
        </div>

        {/* Right-Rail Overlay Sidebar */}
        <div style={{
          background: "rgba(5, 5, 16, 0.45)",
          backdropFilter: "blur(10px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "12px 14px",
          height: "100%",
          boxSizing: "border-box",
          overflowY: "auto"
        }}>
          {/* Chat Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(0,0,0,0.2)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", padding: 10, flex: 1, minHeight: 0 }}>
            {/* Chat Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 6, gap: 12 }}>
              {["CHAT", "ROOM", "PEOPLE"].map((tab, idx) => (
                <span key={tab} style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: idx === 0 ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  borderBottom: idx === 0 ? "2px solid #FF2DAA" : "none",
                  paddingBottom: 2
                }}>
                  {tab}
                </span>
              ))}
            </div>

            {/* Chat Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
              <span>🔥 Thunder Dome</span>
              <span>👁 12,847 watching</span>
            </div>

            {/* Chat Messages list */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
              {[
                { name: "QueenV", text: "THIS IS FIRE 🔥🔥🔥", time: "just now" },
                { name: "BeatKing", text: "MarcelD never misses! 💯", time: "just now" },
                { name: "LoyalFan23", text: "The energy is crazy!!! ⚡⚡", time: "just now" },
                { name: "DJStorm", text: "Dropping that new beat next!", time: "just now" },
                { name: "RealMC", text: "Who's in the lobby? 👀", time: "just now" },
                { name: "StarGirl", text: "I sent a gift! 💎🎁", time: "just now" },
                { name: "HipHopHead", text: "4K quality is insane!!! 📺", time: "just now" }
              ].map((msg, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "start", fontSize: 9 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8
                  }}>
                    👤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 900, color: "#FF8FBE" }}>{msg.name}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 7 }}>{msg.time}</span>
                    </div>
                    <p style={{ color: "#fff", margin: 0, marginTop: 1 }}>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 6 }}>
              <input
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: 9,
                  outline: "none"
                }}
              />
              <button style={{ background: "transparent", border: "none", fontSize: 10, cursor: "pointer" }}>😊</button>
              <button style={{ background: "transparent", border: "none", fontSize: 10, cursor: "pointer" }}>🚀</button>
            </div>
          </div>

          {/* Rooms Nearby */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>ROOMS NEARBY</span>
              <span style={{ fontSize: 7, color: "#00FFFF", cursor: "pointer" }}>VIEW ALL</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { name: "Cypher Circle", count: "4,231" },
                { name: "Beat Battle Arena", count: "2,156" },
                { name: "World Dance Party", count: "8,742" }
              ].map((rm) => (
                <div key={rm.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#ffe9bb" }}>{rm.name}</span>
                  <span style={{ fontSize: 8, color: "#FF2DAA", fontWeight: 900 }}>• {rm.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Friends Online */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>FRIENDS ONLINE 89</span>
              <span style={{ fontSize: 7, color: "#00FFFF", cursor: "pointer" }}>VIEW ALL</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { name: "JayPaul", status: "In Lobby" },
                { name: "MicahMillion", status: "Watching Live" },
                { name: "ProdigyBeats", status: "In Studio" }
              ].map((fr) => (
                <div key={fr.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#ffe9bb" }}>{fr.name}</span>
                  <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 900 }}>{fr.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom unified controller dock */}
      <div style={{
        background: "linear-gradient(180deg, #150910 0%, #050510 100%)",
        borderTop: "3px solid #b8860b",
        padding: "10px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        boxShadow: "0 -4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,215,0,0.1)",
        zIndex: 50
      }}>
        {/* Left: Now Playing */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.06)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            🎵
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>Hustle &amp; Flow</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>MarcelD • 2:34 / 4:18</div>
          </div>
          {/* Waveform indicator */}
          <div style={{ display: "flex", gap: 2, alignItems: "end", height: 12, marginLeft: 8 }}>
            {[6, 12, 8, 14, 5, 10, 4].map((h, i) => (
              <span key={i} style={{
                width: 2,
                height: h,
                background: "#FF2DAA",
                animation: "pulse 1s infinite alternate"
              }} />
            ))}
          </div>
        </div>

        {/* Center Navigation Icons */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Home", icon: "🏠", href: "/home/1" },
            { label: "Discover", icon: "🧭", href: "/live/lobby" },
            { label: "Live Now", icon: "📹", active: true, href: "/hub/fan" },
            { label: "Lobby", icon: "👥", href: "/live/lobby/fans" },
            { label: "Messages", icon: "✉", count: 12, href: "/messages" },
            { label: "Notifications", icon: "🔔", count: 3, href: "/notifications" }
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{
              position: "relative",
              textDecoration: "none",
              color: item.active ? "#FF2DAA" : "rgba(255,255,255,0.6)",
              fontSize: 14,
              cursor: "pointer"
            }} title={item.label}>
              {item.icon}
              {item.count && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -6,
                  background: "#FF4444",
                  color: "#fff",
                  fontSize: 6,
                  fontWeight: 900,
                  borderRadius: "50%",
                  width: 9,
                  height: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right bounds Action Buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{
            background: "rgba(255,68,68,0.1)",
            border: "1.5px solid #FF4444",
            borderRadius: 8,
            color: "#FF8A8A",
            fontSize: 9,
            fontWeight: 900,
            padding: "5px 12px",
            cursor: "pointer"
          }}>
            LEAVE ROOM
          </button>
          
          <button style={{
            background: "rgba(0,255,136,0.1)",
            border: "1.5px solid #00FF88",
            borderRadius: 8,
            color: "#00FF88",
            fontSize: 9,
            fontWeight: 900,
            padding: "5px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            🎤 MIC ON
          </button>

          <button style={{
            background: "rgba(0,255,136,0.1)",
            border: "1.5px solid #00FF88",
            borderRadius: 8,
            color: "#00FF88",
            fontSize: 9,
            fontWeight: 900,
            padding: "5px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            📹 CAM ON
          </button>

          <button style={{
            background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            padding: "6px 14px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(170, 45, 255, 0.4)"
          }}>
            ENTER STAGE
          </button>
        </div>
      </div>
    </div>
  );
}
