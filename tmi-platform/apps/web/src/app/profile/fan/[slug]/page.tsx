import Link from "next/link";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import HighFidelityAvatar from "@/components/avatar/HighFidelityAvatar";
import TmiProfileLobby from "@/components/profile/TmiProfileLobby";
import SocialDock from "@/components/social/SocialDock";
import TrackUploadPanel from "@/components/social/TrackUploadPanel";
import MemoryWall from "@/components/media/MemoryWall";
import TieredAdSlot from "@/components/ads/TieredAdSlot";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";
import { prisma } from "@/lib/prisma";
// ── Rule 15 Canisters ──────────────────────────────────────────────────────────
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import AvatarCreationCenter from "@/components/canisters/AvatarCreationCenter";
import { AvatarWorkspaceCanister } from "@/components/canisters/AvatarWorkspaceCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import { PublicLobbyCanister } from "@/components/canisters/PublicLobbyCanister";
import { LiveLobbyWallCanister } from "@/components/canisters/LiveLobbyWallCanister";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const FAN_TIERS: Record<string, { label: string; color: string; bg: string }> = {
  diamond:  { label: "💎 DIAMOND", color: "#5CE1E6", bg: "rgba(92,225,230,0.08)" },
  platinum: { label: "🏆 PLATINUM", color: "#E5E4E2", bg: "rgba(229,228,226,0.08)" },
  gold:     { label: "🥇 GOLD",    color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  silver:   { label: "🥈 SILVER",  color: "#C0C0C0", bg: "rgba(192,192,192,0.08)" },
  ruby:     { label: "💍 RUBY",    color: "#E0115F", bg: "rgba(224,17,95,0.08)" },
  pro:      { label: "⚡ PRO",     color: "#AA2DFF", bg: "rgba(170,45,255,0.08)" },
  free:     { label: "🎵 FREE",    color: "#00FF88", bg: "rgba(0,255,136,0.06)" },
};

// Real fan lookup — replaces a hash-of-the-slug generator that fabricated
// tier, points, rooms-visited, tips-given, and genres for every profile,
// meaning the "Diamond" badge shown to users never reflected an actual
// subscription. user IDs are truncated to 8 chars as slugs elsewhere on the
// platform (see sessionUserId() in api/live/go) — match on that prefix.
async function getFanData(slug: string) {
  const user = await prisma.user.findFirst({
    where: { id: { startsWith: slug } },
    include: { userProfile: true, userStats: true, fanProfile: true },
  }).catch(() => null);

  if (!user) {
    return {
      displayName: titleCase(slug),
      avatarUrl: null as string | null,
      tier: "free",
      points: 0,
      favGenres: [] as string[],
      roomsVisited: 0,
      tipsGiven: 0,
      joinedWeeksAgo: 0,
      found: false,
    };
  }

  const joinedMs = Date.now() - user.userCreatedAt.getTime();
  return {
    displayName: user.userProfile?.displayName ?? user.displayName ?? user.name ?? titleCase(slug),
    avatarUrl: user.userProfile?.avatarUrl ?? null,
    tier: user.tier.toLowerCase(),
    points: user.userStats?.xp ?? 0,
    favGenres: user.fanProfile?.favoriteGenres ?? [],
    // No real per-fan room-attendance counter or tip-given total exists yet
    // (ParticipationLedger tracks generic point-earning actions, not these
    // specific metrics) — honest zero rather than the previous fabrication.
    roomsVisited: 0,
    tipsGiven: 0,
    joinedWeeksAgo: Math.max(0, Math.floor(joinedMs / (7 * 24 * 60 * 60 * 1000))),
    found: true,
  };
}

export default async function FanProfilePage({ params }: Props) {
  const fan = await getFanData(params.slug);
  const tierConfig = FAN_TIERS[fan.tier] ?? FAN_TIERS.free!;

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", paddingBottom: 80 }}>
      {/* Back nav */}
      <div style={{ padding: "20px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← HOME
        </Link>
      </div>

      {/* Header */}
      <div style={{ padding: "24px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar */}
          <HighFidelityAvatar
            imageUrl={fan.avatarUrl ?? undefined}
            name={fan.displayName}
            size={72}
            tierColor={tierConfig.color}
            showCreateCTA
          />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
              {fan.displayName}
            </h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                color: tierConfig.color, background: tierConfig.bg,
                border: `1px solid ${tierConfig.color}44`, borderRadius: 4, padding: "2px 8px",
              }}>
                {tierConfig.label}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                FAN · Joined {fan.joinedWeeksAgo}w ago
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero row — media panel (the actual point of the page) + a side rail
          for stats/genres/actions, instead of forcing everything into one
          narrow 600px column with huge empty margins on a wide screen. */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 24 }}>
        <div>
          {/* Video panel */}
          <UniversalMediaPanel
            slug={params.slug}
            displayName={fan.displayName}
            role="fan"
            accentColor="#FFD700"
          />

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Link
              href={`/messages/new?recipientId=${params.slug}&name=${encodeURIComponent(fan.displayName)}`}
              style={{
                padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800,
                background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)",
                color: "#00FFFF", textDecoration: "none", letterSpacing: "0.05em",
              }}
            >
              💬 Message
            </Link>
            <Link
              href={`/video/rooms/new?inviteId=${params.slug}&name=${encodeURIComponent(fan.displayName)}`}
              style={{
                padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800,
                background: "rgba(170,45,255,0.1)", border: "1px solid rgba(170,45,255,0.3)",
                color: "#AA2DFF", textDecoration: "none", letterSpacing: "0.05em",
              }}
            >
              🎥 Video Chat
            </Link>
            <Link
              href="/rooms/world-dance-party"
              style={{
                padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800,
                background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)",
                color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.05em",
              }}
            >
              🎵 Join Room
            </Link>
          </div>

          {/* Ad slot — free/pro tier users see this between actions and social */}
          <div style={{ marginTop: 16 }}>
            <TieredAdSlot
              tier={fan.tier === "diamond" ? "diamond" : fan.tier === "gold" ? "gold-platinum" : fan.tier === "pro" ? "pro-bronze" : "free"}
              placement="in-content"
              height={80}
            />
          </div>

          {/* Social dock */}
          <div style={{ marginTop: 16 }}>
            <SocialDock
              profile={{ id: params.slug, name: fan.displayName, role: "Fan", isOnline: true }}
              accentColor={tierConfig.color}
            />
          </div>
        </div>

        {/* Side rail — stats + genres, the metadata that shouldn't compete with the media panel for the hero spot */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "TMI Points", value: fan.points.toLocaleString(), color: "#00FFFF" },
              { label: "Rooms Visited", value: fan.roomsVisited.toString(), color: "#FF2DAA" },
              { label: "Tips Given", value: fan.tipsGiven.toString(), color: "#FFD700" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "14px 12px", borderRadius: 10, textAlign: "center",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
              Favourite Genres
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {fan.favGenres.length === 0 ? (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Not set yet</span>
              ) : fan.favGenres.map((g) => (
                <span
                  key={g}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary modules — playlist, Memory Wall, messaging, profile lobby */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Playlist */}
        <div style={{ padding: "0 0 16px" }}>
          <TrackUploadPanel
            playlistName={`${fan.displayName} — Favorites`}
            accentColor={tierConfig.color}
          />
        </div>

        {/* Memory Wall */}
        <div style={{ padding: "0 0 16px" }}>
          <MemoryWall accentColor={tierConfig.color} title={`${fan.displayName} — Memory Wall`} entityId={params.slug} entityType="fan" />
        </div>

        {/* Ad slot below memory wall — free/pro only */}
        <div style={{ padding: "0 24px 16px" }}>
          <TieredAdSlot
            tier={fan.tier === "diamond" ? "diamond" : fan.tier === "gold" ? "gold-platinum" : fan.tier === "pro" ? "pro-bronze" : "free"}
            placement="leaderboard"
            height={70}
          />
        </div>

        {/* Omni-Presence: Messages + Video Chat + Audio */}
        <OmniPresenceEngine slug={params.slug} displayName={fan.displayName} defaultTab="messages" />

        {/* Profile Lobby */}
        <TmiProfileLobby
          slug={params.slug}
          displayName={fan.displayName}
          role="fan"
          accentColor={tierConfig.color}
        />

        {/* ── Rule 15 Canister Section ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
          {/* Playlist */}
          <PlaylistCanister
            entityId={params.slug}
            entityName={fan.displayName}
            accentColor={tierConfig.color}
            isOwner={false}
          />
          {/* Avatar Creation Center */}
          <AvatarCreationCenter accentColor={tierConfig.color} />
          {/* Avatar Workspace */}
          <AvatarWorkspaceCanister accentColor={tierConfig.color} />
          {/* Inventory */}
          <InventoryCanister accentColor="#FF6B35" />
          {/* Public Lobby */}
          <PublicLobbyCanister
            entityId={params.slug}
            entityName={fan.displayName}
            accentColor="#00FF88"
          />
          {/* Live Lobby Wall */}
          <LiveLobbyWallCanister accentColor={tierConfig.color} maxRooms={6} />
        </div>
      </div>
    </main>
  );
}
