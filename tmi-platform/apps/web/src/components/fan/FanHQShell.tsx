"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import { useTmiSession } from "@/hooks/SessionContext";
import { useWatchSession } from "@/lib/presence/WatchSessionContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { listFollowingForUser } from "@/lib/social/FollowEngine";
import type { Friend as FriendType } from "@/components/social/FriendsList";
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';
import AudienceScene from "@/components/live/AudienceScene";
import MasterControlDock from "@/components/shell/MasterControlDock";

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

export default function FanHQShell({ fanId, fanDisplayName: _fanDisplayName }: Readonly<FanHQShellProps>) {
  const router = useRouter();
  const { totalXp, walletCredits, currentLevel } = useGamificationEngine();
  const { stopWatching } = useWatchSession();
  const { economyState: _economyState } = useTmiSession();
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

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"stage" | "chat" | "rooms" | "friends">("stage");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const mainRoute = previewItem?.route ?? featuredLive?.liveRoomRoute ?? "/live/lobby";
  const mainCount = previewItem?.viewerCount ?? featuredLive?.audienceCount;
  const isLive = previewItem?.isLive ?? Boolean(featuredLive);

  // ─── MOBILE LAYOUT ────────────────────────────────────────────────────────
  if (isMobile) {
    const MOBILE_TAB_HEIGHT = 56;
    const MOBILE_HEADER_HEIGHT = 48;

    const mobileTabItems: { id: typeof mobileTab; icon: string; label: string }[] = [
      { id: "stage",   icon: "📺", label: "LIVE" },
      { id: "chat",    icon: "💬", label: "CHAT" },
      { id: "rooms",   icon: "🔊", label: "ROOMS" },
      { id: "friends", icon: "👥", label: "FRIENDS" },
    ];

    return (
      <div style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #050510 0%, #07071a 100%)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}>
        {/* Mobile header */}
        <div style={{
          height: MOBILE_HEADER_HEIGHT,
          flexShrink: 0,
          background: "rgba(5,5,16,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          zIndex: 60,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>T</div>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>TMI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/notifications" style={{ position: "relative", fontSize: 16, textDecoration: "none" }}>
              <span>🔔</span>
              <span style={{ position: "absolute", top: -3, right: -5, background: "#FF4444", color: "#fff", fontSize: 7, fontWeight: 900, borderRadius: "50%", width: 11, height: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </Link>
            <Link href="/messages" style={{ position: "relative", fontSize: 16, textDecoration: "none" }}>
              <span>✉</span>
              <span style={{ position: "absolute", top: -3, right: -5, background: "#FF4444", color: "#fff", fontSize: 7, fontWeight: 900, borderRadius: "50%", width: 11, height: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>12</span>
            </Link>
            <Link href={`/profile/fan/${fanId}`} style={{ textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#5b217a,#301042)", border: "1.5px solid #FF2DAA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
            </Link>
          </div>
        </div>

        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: MOBILE_TAB_HEIGHT,
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        }}>
          {/* ─── STAGE TAB ─── */}
          {mobileTab === "stage" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 16:9 video monitor */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#010308", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/boardroom_live.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                {isLive && (
                  <span style={{ position: "absolute", top: 8, left: 8, background: "#FF2DAA", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.06em" }}>● LIVE</span>
                )}
                {mainCount != null && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 4 }}>👁 {mainCount.toLocaleString()}</span>
                )}
                <Link href={mainRoute} style={{
                  position: "absolute", bottom: 8, left: 8, right: 8, background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
                  border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 900, padding: "8px",
                  textAlign: "center", textDecoration: "none", display: "block",
                }}>
                  JOIN LIVE ROOM
                </Link>
              </div>

              {/* Now playing bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: 20 }}>🎵</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hustle &amp; Flow</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>MarcelD • 2:34 / 4:18</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/playlist" style={{ textDecoration: "none", fontSize: 16 }}>⏭</Link>
                </div>
              </div>

              {/* XP / stats strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { label: "XP", value: totalXp.toLocaleString(), color: "#AA2DFF" },
                  { label: "LEVEL", value: currentLevel.level.toString(), color: "#FFD700" },
                  { label: "COINS", value: walletCredits, color: "#00FFFF" },
                ].map((stat) => (
                  <div key={stat.label} style={{ padding: "10px 6px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "12px 14px" }}>
                {[
                  { label: "LIVE LOBBY", icon: "🌐", href: "/live/lobby" },
                  { label: "DISCOVER", icon: "🧭", href: "/live/lobby" },
                  { label: "MEMORY WALL", icon: "📸", href: "/memories" },
                  { label: "INVENTORY", icon: "🎒", href: "/inventory" },
                  { label: "STORE", icon: "🛍", href: "/store" },
                  { label: "REWARDS", icon: "🎁", href: "/rewards" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, textDecoration: "none", color: "#fff",
                  }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.05em" }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ─── CHAT TAB ─── */}
          {mobileTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: `calc(100dvh - ${MOBILE_HEADER_HEIGHT + MOBILE_TAB_HEIGHT}px)` }}>
              {/* Chat header */}
              <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA" }}>🔥 Thunder Dome</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>👁 12,847</span>
              </div>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "QueenV", text: "THIS IS FIRE 🔥🔥🔥" },
                  { name: "BeatKing", text: "MarcelD never misses! 💯" },
                  { name: "LoyalFan23", text: "The energy is crazy!!! ⚡⚡" },
                  { name: "DJStorm", text: "Dropping that new beat next!" },
                  { name: "RealMC", text: "Who's in the lobby? 👀" },
                  { name: "StarGirl", text: "I sent a gift! 💎🎁" },
                ].map((msg) => (
                  <div key={msg.name} style={{ display: "flex", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>👤</div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 900, color: "#FF8FBE" }}>{msg.name} </span>
                      <span style={{ fontSize: 11, color: "#fff" }}>{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat input */}
              <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8, background: "rgba(5,5,16,0.9)" }}>
                <input placeholder="Type a message..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, color: "#fff", padding: "8px 14px", fontSize: 13, outline: "none" }} />
                <button style={{ background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", borderRadius: 20, color: "#fff", fontSize: 13, padding: "0 14px", cursor: "pointer" }}>↑</button>
              </div>
            </div>
          )}

          {/* ─── ROOMS TAB ─── */}
          {mobileTab === "rooms" && (
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>LIVE ROOMS</div>
              {[
                { name: "Cypher Circle", genre: "Hip-Hop", count: 4231, live: true },
                { name: "Beat Battle Arena", genre: "Rap", count: 2156, live: true },
                { name: "World Dance Party", genre: "EDM", count: 8742, live: true },
                { name: "R&B Lounge", genre: "R&B", count: 1204, live: true },
                { name: "Gospel Sunday", genre: "Gospel", count: 890, live: false },
              ].map((room) => (
                <Link key={room.name} href="/live/lobby" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, textDecoration: "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{room.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{room.genre}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    {room.live && <span style={{ background: "#FF2DAA", color: "#fff", fontSize: 8, fontWeight: 900, padding: "1px 6px", borderRadius: 4 }}>LIVE</span>}
                    <span style={{ fontSize: 10, color: "#FF2DAA", fontWeight: 900 }}>👁 {room.count.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
              <Link href="/live/lobby" style={{ textAlign: "center", padding: "12px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 12, textDecoration: "none", color: "#00FFFF", fontSize: 11, fontWeight: 900 }}>
                VIEW ALL ROOMS
              </Link>
            </div>
          )}

          {/* ─── FRIENDS TAB ─── */}
          {mobileTab === "friends" && (
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>FRIENDS ONLINE</div>
              {followingFriends.length > 0 ? followingFriends.map((fr) => (
                <Link key={fr.id} href={`/profile/performer/${fr.slug}`} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, textDecoration: "none",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{fr.name}</div>
                    <div style={{ fontSize: 9, color: fr.isLive ? "#00FF88" : "rgba(255,255,255,0.4)", marginTop: 2 }}>{fr.isLive ? "● LIVE NOW" : "Online"}</div>
                  </div>
                  {fr.isLive && <span style={{ background: "#FF2DAA", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 4 }}>LIVE</span>}
                </Link>
              )) : (
                <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
                  No friends online yet.<br />
                  <Link href="/live/lobby" style={{ color: "#00FFFF", textDecoration: "none" }}>Discover performers to follow →</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile bottom tab bar */}
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: MOBILE_TAB_HEIGHT,
          background: "rgba(5,5,16,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          zIndex: 100,
          // iOS safe area
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          {mobileTabItems.map((tab) => {
            const active = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileTab(tab.id)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  cursor: "pointer",
                  color: active ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                  borderTop: active ? "2px solid #FF2DAA" : "2px solid transparent",
                  transition: "color 150ms",
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.05em" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── DESKTOP LAYOUT (unchanged below) ────────────────────────────────────
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
              const TAB_HREFS: Record<string, string> = { HOME: "/home/1", DISCOVER: "/live/lobby", "LIVE NOW": "/live" };
              const href = TAB_HREFS[tab] ?? `/${tab.toLowerCase()}`;
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
              <span>🔔</span>
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
              <span>✉</span>
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
                      {["🧢", "🕶", "🧥", "👟"].map((eq) => (
                        <span key={eq} style={{ width: 18, height: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{eq}</span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/avatar-center")}
                    style={{
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
                    ].map((item) => (
                      <div key={item.title} style={{ height: 60, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 4 }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{item.title}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push("/memories")}
                    style={{
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
              ].map((msg) => (
                <div key={msg.name} style={{ display: "flex", gap: 6, alignItems: "start", fontSize: 9 }}>
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

      {/* Bottom unified controller dock — MasterControlDock is the single
          canonical bottom bar (Now Playing + nav row + Leave Room/Mic/Cam/
          Raise Hand/Emotes/Enter Stage). Previously this shell also rendered
          its own separate, less-complete copy of the same bar in-flow above
          this mount point — a real stacked-duplicate bug — with dead
          (handler-less) Leave Room/Mic/Cam/Enter Stage buttons. Removed;
          this is now the only bottom dock, wired to real state below. */}
      <MasterControlDock
        role="fan"
        onLeaveRoom={() => router.push(mainRoute)}
        onEnterStage={() => router.push(mainRoute)}
      />
    </div>
  );
}
