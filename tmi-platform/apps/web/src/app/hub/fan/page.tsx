'use client';
import { useEffect, useState } from 'react';
import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import { HubBackNav } from '@/components/nav/HubBackNav';
import FanHubShell from "@/components/fan/FanHubShell";
import FanRewardsRail from "@/components/fan/FanRewardsRail";
import FanSocialRail from "@/components/fan/FanSocialRail";
import FanWalletRail from "@/components/fan/FanWalletRail";
import Link from "next/link";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import { TIER_COLORS, TIER_LABELS } from "@/lib/performance/FanJudgeReputationEngine";
import AvatarMiniDisplay from "@/components/canisters/AvatarMiniDisplay";
import MemoryWall from "@/components/media/MemoryWall";
import FriendsList from "@/components/social/FriendsList";
import { InventoryPanel } from "@/components/InventoryPanel";
import CollapsibleCanister from "@/components/canisters/CollapsibleCanister";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { listFollowingForUser } from "@/lib/social/FollowEngine";
import type { Friend } from "@/components/social/FriendsList";
import MonitorSatelliteSystem from "@/components/canisters/MonitorSatelliteSystem";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import InboxPanel from "@/components/messaging/InboxPanel";
import RecentlyVisitedRail from "@/components/presence/RecentlyVisitedRail";
import { useWatchSession } from "@/lib/presence/WatchSessionContext";
import HeadquartersCommunicationDock from "@/components/headquarters/HeadquartersCommunicationDock";
import { useTmiSession } from "@/hooks/SessionContext";

const MAGAZINE_ARTICLES = [
  { title: "Nova Cipher: The 8-Streak Story",  route: "/magazine/articles/nova-cipher-rise",  thumb: "🎤" },
  { title: "TMI Season 2 Preview",             route: "/magazine/articles/season-2-preview",  thumb: "📰" },
  { title: "Cypher Culture Deep Dive",         route: "/magazine/articles/cypher-culture",    thumb: "🎧" },
  { title: "AI in Live Music — New Era",        route: "/magazine/articles/ai-in-live-music", thumb: "🤖" },
];

const BACKSTAGE_UNLOCKS = [
  { label: "Rehearsal Footage — Nova Cipher",  locked: false, route: "/backstage/nova-cipher-rehearsal" },
  { label: "Meet & Greet Access",              locked: false, route: "/backstage/meet-greet"            },
  { label: "Producer Session Replay",          locked: true,  route: "/backstage/producer-session"      },
  { label: "Season 2 First Look",              locked: true,  route: "/backstage/season-2-first-look"   },
];

const UPCOMING_SHOWS = [
  { label: "Monday Night Stage",     time: "Tonight · 9:00 PM ET", route: "/shows/monday-night-stage", accent: "#06b6d4" },
  { label: "Monthly Idol",           time: "This Week",            route: "/shows/monthly-idol",       accent: "#a78bfa" },
  { label: "Today\'s Shows",          time: "Now Streaming",        route: "/shows/today",              accent: "#f59e0b" },
];

const CYPHER_WATCHLIST: Array<{ title: string; status: "live" | "soon" | "replay"; viewers: number | null; route: string }> = [
  { title: "Open Cypher",                 status: "live",   viewers: null, route: "/cypher/live"       },
  { title: "Cypher Stage",                status: "soon",   viewers: null, route: "/cypher/stage"      },
  { title: "Cypher Lobby Wall",           status: "replay", viewers: null, route: "/cypher/lobby-wall" },
];

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
}

export default function FanHubPage() {
  const { totalXp, walletCredits, currentLevel } = useGamificationEngine();
  const [featuredLive, setFeaturedLive] = useState<FeaturedLive | null>(null);
  const { current: nowPlaying } = useWatchSession();

  // Real authenticated user — this page was previously hardcoded to "demo-fan"
  // everywhere regardless of who was actually logged in, meaning every fan
  // saw the exact same hub. useTmiSession() already fetches /api/auth/me and
  // is mounted globally; "guest_user" is its own built-in unauthenticated
  // fallback, not a new fabrication.
  const { userId: fanId, userName: fanDisplayName } = useTmiSession();

  // Real follow relationships (FollowEngine) mapped through PerformerRegistry
  // for display data — replaces a hardcoded friends={[]} that never showed
  // anyone real regardless of who the fan actually followed.
  const followingFriends: Friend[] = listFollowingForUser(fanId)
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

  // Real GlobalLiveSessionRegistry data via /api/live/go — not the static
  // PERFORMER_REGISTRY.isLive seed flag, which never reflects an actual broadcast.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        const top = data.sessions?.[0];
        if (cancelled) return;
        if (!top) { setFeaturedLive(null); return; }
        const profile = getPerformerById(top.userId);
        setFeaturedLive({
          name: profile?.name ?? top.displayName,
          liveRoomRoute: profile?.liveRoomRoute ?? `/live/rooms/${top.roomId}`,
          introVideoUrl: profile?.introVideoUrl,
          motionPosterUrl: profile?.motionPosterUrl,
          profileImageUrl: profile?.profileImageUrl ?? top.avatarUrl ?? undefined,
          audienceCount: top.viewerCount,
        });
      } catch {
        if (!cancelled) setFeaturedLive(null);
      }
    };
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", color: "#e2e8f0", minHeight: "100vh" }}>

      {/* Persona switcher bar */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,45,170,0.12)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <HubBackNav accentColor="#FF2DAA" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#FF2DAA', textTransform: 'uppercase' }}>Fan Hub</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/arena" style={{ padding: "8px 16px", background: "linear-gradient(135deg,#FF2DAA22,#FF2DAA08)", border: "1px solid #FF2DAA50", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.12em" }}>
            🏟️ ENTER ARENA
          </Link>
          <PersonaSwitcher currentRole="fan" compact />
        </div>
      </div>

      {/* Primary Hub Shell — live stage, avatar, reactions, tip, playlist, HUD.
          tier/tagline are still hardcoded — useTmiSession()'s economyState is a
          local default, not real subscription-tier data from /api/auth/me;
          fixing that means extending the globally-shared SessionContext
          (used platform-wide), which is its own separate task, not a one-file fix. */}
      <FanHubShell
        fanSlug={fanId}
        displayName={fanDisplayName}
        tier="free"
        tagline="Live network member"
        startingPoints={totalXp}
      />

      {/* Extended Hub Sections */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* ════ Fan Hub Command Layer — Live Discovery | Memory Wall hero | Active
            Utility. Locked 2026-06-19 by Marcel Dickens: the front face must
            answer "what's live", "who can I return to", "what's playing", and
            "what have I attended/saved" without leaving the page. Replaces the
            old Watch/Recently-Visited/Profile/Canister-stack sections — same
            real components, arranged around one center of gravity instead of
            scattered equally-weighted sections. ════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr) minmax(240px, 320px)', gap: 16, marginTop: 32, marginBottom: 32, alignItems: 'start' }}>

          {/* ── LEFT — Live Discovery rail ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0f0f1a', border: '1px solid #FF2DAA33', borderRadius: 12, padding: 14 }}>
              <SectionLabel>🔴 Live Now</SectionLabel>
              {featuredLive ? (
                <Link href={featuredLive.liveRoomRoute} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    {featuredLive.profileImageUrl && <img src={featuredLive.profileImageUrl} alt={featuredLive.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #FF2DAA66' }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{featuredLive.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>👁 {featuredLive.audienceCount.toLocaleString()} watching</div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '8px 0' }}>Nobody&apos;s live right now — check back soon.</div>
              )}
              <Link href="/live/lobby" style={{ display: 'block', textAlign: 'center', fontSize: 9, fontWeight: 800, color: '#FF2DAA', textDecoration: 'none', marginTop: 8, letterSpacing: '0.08em' }}>BROWSE ALL LIVE →</Link>
            </div>

            <div style={{ background: '#0f0f1a', border: '1px solid #00FFFF33', borderRadius: 12, padding: 14 }}>
              <SectionLabel>Friends Live</SectionLabel>
              {followingFriends.filter((f) => f.isLive).length === 0 ? (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>None of your favorites are live right now.</div>
              ) : (
                followingFriends.filter((f) => f.isLive).map((f) => (
                  <Link key={f.id} href={f.liveRoomId ? `/live/rooms/${f.liveRoomId}?from=lobby-wall` : `/performers/${f.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 11, color: '#fff' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 5px #E63000', flexShrink: 0 }} />
                      {f.name}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div style={{ background: '#0f0f1a', border: '1px solid #FFD70033', borderRadius: 12, padding: 14 }}>
              <SectionLabel>Recently Visited</SectionLabel>
              <RecentlyVisitedRail />
            </div>

            <div style={{ background: '#0f0f1a', border: '1px solid #00FFFF33', borderRadius: 12, padding: 14 }}>
              <SectionLabel>Favorite Performers</SectionLabel>
              <FriendsList
                friends={followingFriends}
                accent="#00FFFF"
                compact
                showInviteButton
                onInvite={() => { window.location.href = "/messages/new?subject=invite"; }}
                emptyAllLabel="No favorite performers added yet."
                emptyOnlineLabel="No favorite performers online right now."
                addActionLabel="+ Add Performer"
                addActionHref="/performers"
              />
            </div>
          </div>

          {/* ── CENTER — Memory Wall hero. Front and visible, not a collapsed
              canister — this is the page's identity, per Marcel's directive that
              a fan's photos/clips/memories should never require a click to find. ── */}
          <div style={{ background: 'linear-gradient(160deg, rgba(255,215,0,0.05), #0f0f1a)', border: '1px solid #FFD70044', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#FFD700', marginBottom: 4 }}>🖼️ MEMORY WALL</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Your entertainment history — shows attended, clips saved, moments captured.</div>
            <MemoryWall accentColor="#FFD700" title="" entityId={fanId} entityType="fan" />
          </div>

          {/* ── RIGHT — Active Utility: now playing, messages, upcoming shows ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0f0f1a', border: '1px solid #FF2DAA33', borderRadius: 12, padding: 14 }}>
              <SectionLabel>Now Playing</SectionLabel>
              {nowPlaying ? (
                <Link href={`/live/rooms/${nowPlaying.roomId}?from=lobby-wall`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{nowPlaying.title}</div>
                  <div style={{ fontSize: 10, color: nowPlaying.accentColor }}>▶ Return to Show</div>
                </Link>
              ) : (
                <PlaylistArtifact artifactId={`${fanId}-playlist`} skin="submarine" title="My Playlist" />
              )}
            </div>

            <CollapsibleCanister icon="💬" label="Messages" accentColor="#00FFFF" defaultOpen>
              <InboxPanel currentUser={{ userId: fanId, displayName: fanDisplayName, avatarUrl: "", role: "fan" }} />
            </CollapsibleCanister>

            <div style={{ background: '#0f0f1a', border: '1px solid #AA2DFF33', borderRadius: 12, padding: 14 }}>
              <SectionLabel>Profile</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <AvatarMiniDisplay size={40} showLabel />
                <Link href="/avatar" style={{ fontSize: 9, fontWeight: 800, color: '#AA2DFF', textDecoration: 'none' }}>🧬 AVATAR →</Link>
              </div>
            </div>

            <CollapsibleCanister icon="🎒" label="Inventory" accentColor="#AA2DFF">
              <InventoryPanel />
            </CollapsibleCanister>
          </div>
        </div>

        {/* Camera / audio monitor — secondary to the command layer above, not
            part of the front-face acceptance criteria, but real working
            functionality (self-capture to Memory Wall, audio toggle, lobby
            browse, ad slot) that shouldn't be deleted just to make room. */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Camera &amp; Audio</SectionLabel>
          <MonitorSatelliteSystem
            mainLabel={featuredLive?.name ?? "TMI Live World"}
            isLive={Boolean(featuredLive)}
            liveRoomRoute={featuredLive?.liveRoomRoute}
            introVideoUrl={featuredLive?.introVideoUrl}
            motionPosterUrl={featuredLive?.motionPosterUrl}
            staticImageUrl={featuredLive?.profileImageUrl ?? "/images/tmi-placeholder.jpg"}
            audienceCount={featuredLive?.audienceCount}
            accentColor="#FF2DAA"
            adZone="hub-fan"
          />
        </section>

        {/* Show Countdowns */}
        <section style={{ marginBottom: 32, marginTop: 32 }}>
          <SectionLabel>Upcoming Shows</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {UPCOMING_SHOWS.map(show => (
              <Link key={show.label} href={show.route} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f0f1a", border: `1px solid ${show.accent}44`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: show.accent }}>{show.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{show.time}</div>
                  <div style={{ fontSize: 11, color: show.accent, marginTop: 8, fontWeight: 600 }}>Set Reminder →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Season Pass Progress */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Season Pass</SectionLabel>
          <div style={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: 14, padding: "24px", color: "#94a3b8" }}>
            <div style={{ fontSize: 12, marginBottom: 8 }}>Season pass activity is not available on this surface yet.</div>
            <Link href="/season-pass" style={{ fontSize: 11, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Open Season Pass →</Link>
          </div>
        </section>

        {/* Collectible Showcase */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Collectibles</SectionLabel>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ width: 220, background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>No collectibles earned yet.</div>
            </div>
            <Link href="/collectibles" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ width: 140, background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px 14px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>+</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>View All</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Active Quests */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Active Quests</SectionLabel>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>No active quests available yet.</div>
          </div>
        </section>

        {/* Cypher Watchlist */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Cypher Watchlist</SectionLabel>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {CYPHER_WATCHLIST.map(cypher => (
              <Link key={cypher.title} href={cypher.route} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: 220, background: "#0f0f1a", border: cypher.status === "live" ? "1px solid #ef444466" : "1px solid #1e1e3a", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: cypher.status === "live" ? "#ef4444" : cypher.status === "soon" ? "#f59e0b" : "#64748b", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
                    {cypher.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{cypher.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {typeof cypher.viewers === "number" ? `${cypher.viewers.toLocaleString()} viewers` : "Viewer count available in room"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Performer Favorites + Vote History */}
        <FanSocialRail
          followedArtists={followingFriends.map((f) => ({ slug: f.slug, displayName: f.name }))}
          votedBattles={[]}
          fanSlug={fanId}
        />

        {/* Magazine Wall */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Magazine Wall</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {MAGAZINE_ARTICLES.map(article => (
              <Link key={article.title} href={article.route} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{article.thumb}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{article.title}</div>
                  <div style={{ fontSize: 11, color: "#06b6d4", marginTop: 8 }}>Read →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Backstage Unlocks */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Backstage Unlocks</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BACKSTAGE_UNLOCKS.map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f0f1a", border: `1px solid ${item.locked ? "#1e1e3a" : "#06b6d444"}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.locked ? "🔒" : "🎬"}</span>
                  <span style={{ fontSize: 13, color: item.locked ? "#475569" : "#e2e8f0" }}>{item.label}</span>
                </div>
                {!item.locked ? (
                  <Link href={item.route} style={{ fontSize: 12, color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>Watch →</Link>
                ) : (
                  <span style={{ fontSize: 11, color: "#64748b" }}>Gold+ required</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Judge Reputation — FanJudgeReputationEngine has the same gap as the
            messaging system (PlatformCertificationLedger.md): it's a real
            engine but stores in an in-memory Map with no API route exposing
            it to client components, so it can't be called from here yet.
            Previously this showed a fabricated "TRUSTED" tier with invented
            34 votes/71%/streak numbers for every fan regardless of real
            activity. Showing the engine's own real zero-state default
            (getJudgeProfile's fallback: ROOKIE, 0 votes, 0 streak) instead
            of fake numbers, until a /api/judge/profile route exists. */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Judge Reputation</SectionLabel>
          <div style={{ background: "#0f0f1a", border: "1px solid #FFD70033", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 40 }}>⚖️</div>
              <div>
                <div style={{ fontSize: 12, color: TIER_COLORS["ROOKIE"], fontWeight: 800, letterSpacing: 2 }}>
                  {TIER_LABELS["ROOKIE"]}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Cast your first battle vote to start building reputation.</div>
              </div>
              <Link href="/battles/judge" style={{ marginLeft: "auto", fontSize: 10, color: "#FFD700", textDecoration: "none", border: "1px solid #FFD70033", borderRadius: 6, padding: "6px 12px", fontWeight: 700 }}>
                JUDGE LEADERBOARD →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              {[
                { label: "Votes Cast",  val: "0",  color: "#00FFFF" },
                { label: "Accuracy",    val: "—",  color: "#00FF88" },
                { label: "Streak",      val: "0",  color: "#FFD700" },
                { label: "Best Streak", val: "0",  color: "#FF2DAA" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "#07071a", borderRadius: 10, padding: "12px 14px", border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.val}</div>
                  <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginTop: 2 }}>{stat.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Loyalty Rewards */}
        <FanRewardsRail badges={[]} rewards={[]} currentStreak={0} totalVotesCast={0} fanSlug={fanId} />

        {/* Wallet */}
        <FanWalletRail tipBalance={walletCredits / 100} voteCredits={currentLevel.level * 3} transactions={[]} fanSlug={fanId} />

      </div>

      <HeadquartersCommunicationDock
        currentUser={{
          userId: fanId,
          displayName: fanDisplayName,
          role: "fan",
        }}
        accentColor="#FF2DAA"
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
      {children}
    </div>
  );
}
