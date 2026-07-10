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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(255,45,170,0.18), transparent 24%), radial-gradient(circle at 70% 0%, rgba(0,255,255,0.14), transparent 24%), linear-gradient(180deg, #050510 0%, #07071a 45%, #050510 100%)", color: "#e2e8f0", paddingBottom: 56 }}>
      <DesktopAtmosphereRails />
      <div style={{ position: "sticky", top: 0, zIndex: 30, borderBottom: "1px solid rgba(255,255,255,0.08)", background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px" }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: "#FF2DAA", letterSpacing: "0.18em", textTransform: "uppercase" }}>TMI</div>
          <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em" }}>
            <Link href="/home/1" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
            <Link href="/live/lobby" style={{ color: "#fff", textDecoration: "none" }}>Discover</Link>
            <Link href="/hub/fan" style={{ color: "#FF2DAA", textDecoration: "none" }}>Live Now</Link>
            <Link href="/magazine/1" style={{ color: "#fff", textDecoration: "none" }}>Magazine</Link>
            <Link href="/marketplace" style={{ color: "#fff", textDecoration: "none" }}>Marketplace</Link>
            <Link href="/arena" style={{ color: "#fff", textDecoration: "none" }}>Arena</Link>
          </nav>
          <div style={{ flex: 1, minWidth: 160, margin: "0 12px" }}>
            <input placeholder="Search rooms, performers, venues..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, color: "#fff", padding: "8px 14px", fontSize: 12 }} />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, fontWeight: 800 }}>
            <span style={{ color: "#FFD700" }}>{currentLevel.level} LVL</span>
            <span style={{ color: "#00FFFF" }}>{totalXp.toLocaleString()} XP</span>
            <span style={{ color: "#FF2DAA" }}>{walletCredits.toLocaleString()} CR</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 330px", gap: 14, alignItems: "start" }}>
          <BezelFrame variant="fan" innerPadding={14} outerStyle={{ position: "sticky", top: 74, maxHeight: "calc(100vh - 90px)", overflow: "auto" }}>
            <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Operations Rail</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["Live Rooms", "/live/lobby"],
                ["Avatar", "/avatar"],
                ["Lobby", "/live/lobby/fans"],
                ["Messages", "/messages"],
                ["Friends", "/friends"],
                ["Inventory", "/inventory"],
                ["Memory Wall", "/memory"],
                ["Playlists", "/playlists"],
                ["Camera", "/camera"],
                ["Rewards", "/rewards"],
                ["Store", "/store"],
                ["Settings", "/settings"],
              ].map(([label, href]) => (
                <Link key={label} href={href} style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, fontWeight: 800 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <AvatarMiniDisplay
                size={48}
                fallback={
                  <Link
                    href="/avatar/create"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      textDecoration: "none",
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: "1px dashed rgba(170,45,255,0.4)",
                      background: "rgba(170,45,255,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 20 }}>🧬</div>
                    <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>
                      Create Avatar
                    </div>
                  </Link>
                }
                showLabel
              />
            </div>
          </BezelFrame>

          <section style={{ display: "grid", gap: 14 }}>
            <MonitorSatelliteSystem
              mainLabel={mainLabel}
              isLive={isLive}
              liveRoomRoute={mainRoute}
              introVideoUrl={featuredLive?.introVideoUrl}
              motionPosterUrl={featuredLive?.motionPosterUrl}
              staticImageUrl={mainImage}
              audienceCount={mainCount}
              accentColor="#FF2DAA"
              adZone="fan-hq"
              viewerTier={tier === "free" ? "FREE" : tier === "pro-RUBY" ? "PRO" : tier === "gold-platinum" ? "GOLD" : "DIAMOND"}
              showAudienceMonitor={false}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <BezelFrame variant="fan" innerPadding={14} outerStyle={{ minHeight: 260 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", fontWeight: 900, color: "#00FFFF", textTransform: "uppercase", marginBottom: 10 }}>My Stuff</div>
                <InventoryPanel />
              </BezelFrame>
              <BezelFrame variant="fan" innerPadding={14} outerStyle={{ minHeight: 260 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", fontWeight: 900, color: "#FFD700", textTransform: "uppercase", marginBottom: 10 }}>My Memories</div>
                <MemoryWall accentColor="#FFD700" title="" entityId={fanId} entityType="fan" />
              </BezelFrame>
            </div>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA", textTransform: "uppercase" }}>Fan Discovery Dock</div>
                <Link href="/live/lobby" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 10, fontWeight: 800 }}>Open Lobby →</Link>
              </div>
              <DiscoveryDockPanel role="fan" compact={false} />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 10 }}>Playlist / Radio Room</div>
              <PlaylistArtifact artifactId={`${fanId}-playlist`} skin="submarine" title="Now Playing" />
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>
                  From My Memories
                </div>
                <MemoryWallPhotoStrip entityId={fanId} entityType="fan" accentColor="#AA2DFF" />
              </div>
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 10 }}>Friends / Groups</div>
              <FriendsList
                friends={followingFriends}
                accent="#00FFFF"
                compact={false}
                showInviteButton
                onInvite={() => { router.push("/messages/new?subject=invite"); }}
                emptyAllLabel="No favorite performers added yet."
                emptyOnlineLabel="No favorite performers online right now."
                addActionLabel="+ Add Performer"
                addActionHref="/performers"
              />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 10 }}>Recent Captures</div>
              <RecentlyVisitedRail />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 10 }}>Video Messages / Calls</div>
              <InboxPanel currentUser={{ userId: fanId, displayName: fanDisplayName, role: "fan", avatarUrl: "" }} />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase", marginBottom: 10 }}>Rewards / Store / Inventory</div>
              <FanRewardsRail badges={[]} rewards={[]} currentStreak={0} totalVotesCast={0} fanSlug={fanId} />
              <div style={{ marginTop: 12 }}>
                <FanWalletRail tipBalance={walletCredits / 100} voteCredits={currentLevel.level * 3} transactions={[]} fanSlug={fanId} />
              </div>
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 10 }}>Recommended Rooms</div>
              {liveFriends.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {liveFriends.slice(0, 4).map((friend) => (
                    <Link key={friend.id} href={friend.liveRoomId ? `/live/rooms/${friend.liveRoomId}` : `/performers/${friend.slug}`} style={{ textDecoration: "none", color: "#fff", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                      {friend.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>No live rooms right now.</div>
              )}
            </BezelFrame>
          </section>

          <aside style={{ display: "grid", gap: 14, position: "sticky", top: 74 }}>
            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA", textTransform: "uppercase" }}>Chat / Room / People</div>
                <Link href="/messages" style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, textDecoration: "none" }}>Open Messages</Link>
              </div>
              <FanSocialRail fanSlug={fanId} />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 10 }}>Communication Dock</div>
              <HeadquartersCommunicationDock
                currentUser={{ userId: fanId, displayName: fanDisplayName, role: "fan" }}
                inviteCandidates={followingFriends.map((friend) => ({ userId: friend.id, displayName: friend.name }))}
                accentColor="#FF2DAA"
              />
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase", marginBottom: 10 }}>Now Playing</div>
              {nowPlaying ? (
                <Link href={`/live/rooms/${nowPlaying.roomId}?from=lobby-wall`} style={{ color: "#fff", textDecoration: "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{nowPlaying.title}</div>
                  <div style={{ fontSize: 10, color: "#00FFFF" }}>Return to Show</div>
                </Link>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>No playlist tracks yet.</div>
              )}
            </BezelFrame>

            <BezelFrame variant="fan" innerPadding={14}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 10 }}>Fan Mood</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                {[
                  { label: "Following", value: followingFriends.length },
                  { label: "Live", value: liveFriends.length },
                  { label: "XP", value: totalXp.toLocaleString() },
                  { label: "Tier", value: tier },
                ].map((item) => (
                  <div key={item.label} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </BezelFrame>
          </aside>
        </div>
      </div>
    </div>
  );
}
