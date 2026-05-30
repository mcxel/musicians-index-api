import Link from "next/link";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import HighFidelityAvatar from "@/components/avatar/HighFidelityAvatar";
import TmiProfileLobby from "@/components/profile/TmiProfileLobby";
import SocialDock from "@/components/social/SocialDock";
import TrackUploadPanel from "@/components/social/TrackUploadPanel";
import MemoryWall from "@/components/media/MemoryWall";
import TieredAdSlot from "@/components/ads/TieredAdSlot";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const FAN_TIERS: Record<string, { label: string; color: string; bg: string }> = {
  diamond:  { label: "💎 DIAMOND", color: "#5CE1E6", bg: "rgba(92,225,230,0.08)" },
  gold:     { label: "🥇 GOLD",    color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  pro:      { label: "⚡ PRO",     color: "#AA2DFF", bg: "rgba(170,45,255,0.08)" },
  free:     { label: "🎵 FREE",    color: "#00FF88", bg: "rgba(0,255,136,0.06)" },
};

function seedFanData(slug: string) {
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const tiers = ["diamond", "gold", "pro", "free"];
  const tier = tiers[hash % tiers.length]!;
  const genres = [["Hip-Hop", "R&B"], ["EDM", "Pop"], ["Jazz", "Soul"], ["Trap", "Afrobeats"]];
  const favGenres = genres[hash % genres.length]!;
  return {
    displayName: titleCase(slug),
    tier,
    points: 1200 + (hash % 8800),
    favGenres,
    roomsVisited: 12 + (hash % 88),
    tipsGiven: hash % 24,
    joinedWeeksAgo: 1 + (hash % 52),
  };
}

export default function FanProfilePage({ params }: Props) {
  const fan = seedFanData(params.slug);
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
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar */}
          <HighFidelityAvatar
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

      {/* Stats row */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 24px" }}>
        {/* Video panel */}
        <div style={{ marginBottom: 24 }}>
          <UniversalMediaPanel
            slug={params.slug}
            displayName={fan.displayName}
            role="fan"
            accentColor="#FFD700"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
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

        {/* Fav genres */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
            Favourite Genres
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {fan.favGenres.map((g) => (
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

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        <div style={{ padding: "0 24px 16px" }}>
          <SocialDock
            profile={{ id: params.slug, name: fan.displayName, role: "Fan", isOnline: true }}
            accentColor={tierConfig.color}
          />
        </div>

        {/* Playlist */}
        <div style={{ padding: "0 24px 16px" }}>
          <TrackUploadPanel
            playlistName={`${fan.displayName} — Favorites`}
            accentColor={tierConfig.color}
          />
        </div>

        {/* Memory Wall */}
        <div style={{ padding: "0 24px 16px" }}>
          <MemoryWall accentColor={tierConfig.color} title={`${fan.displayName} — Memory Wall`} />
        </div>

        {/* Ad slot below memory wall — free/pro only */}
        <div style={{ padding: "0 24px 16px" }}>
          <TieredAdSlot
            tier={fan.tier === "diamond" ? "diamond" : fan.tier === "gold" ? "gold-platinum" : fan.tier === "pro" ? "pro-bronze" : "free"}
            placement="leaderboard"
            height={70}
          />
        </div>

        {/* Profile Lobby */}
        <TmiProfileLobby
          slug={params.slug}
          displayName={fan.displayName}
          role="fan"
          accentColor={tierConfig.color}
        />
      </div>
    </main>
  );
}
