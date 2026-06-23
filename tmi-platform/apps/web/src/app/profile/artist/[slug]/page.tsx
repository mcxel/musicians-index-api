import Link from "next/link";
import { profileToArticleRoute } from "@/lib/editorial/editorialRoutingResolver";
import TmiProfileLobby from "@/components/profile/TmiProfileLobby";
import ArtistWorldShell from "@/components/artist/ArtistWorldShell";
import GoLiveBanner from "@/components/profile/GoLiveBanner";
import ProfilePlaylistSection from "@/components/profile/ProfilePlaylistSection";
import PerformerVideoPanel from "@/components/media/PerformerVideoPanel";
import PerformerSponsorShelf, {
  type PerformerSponsor,
} from "@/components/performer/PerformerSponsorShelf";
import type { SponsorSlot } from "@/components/performer/DynamicRadialAura";
import ViralShareButton from "@/components/share/ViralShareButton";
import MemoryWall from "@/components/media/MemoryWall";
import TieredAdSlot from "@/components/ads/TieredAdSlot";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";

interface Props {
  params: { slug: string };
}

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Rule 1 (Upload Pipeline): a registered performer's real identity must come
// from PerformerRegistry, not a generic title-cased shell. Only synthesize a
// blank "independent artist" seed when no registry entry exists yet.
function seedArtist(slug: string) {
  const registered = getPerformerBySlug(slug);
  if (registered) {
    return {
      displayName: registered.name,
      tagline: `${registered.category} artist on The Musician's Index.`,
      rank: registered.rank,
      isVerified: registered.achievementIds.length > 0,
      genres: [registered.category] as string[],
      isLive: registered.isLive,
      liveVenueName: registered.isLive ? registered.roomId : undefined,
      hasArticle: registered.articleIds.length > 0,
      monthlyListeners: registered.fanCount,
    };
  }
  return {
    displayName: titleCase(slug),
    tagline: `Independent artist on The Musician's Index.`,
    rank: 0,
    isVerified: false,
    genres: [] as string[],
    isLive: false,
    liveVenueName: undefined,
    hasArticle: false,
    monthlyListeners: 0,
  };
}

function seedArtistSponsors(slug: string): PerformerSponsor[] {
  return [];
}

function buildArtistAuraSlots(sponsors: PerformerSponsor[]): SponsorSlot[] {
  return sponsors
    .filter((s) => s.status === "active")
    .slice(0, 8)
    .map((s) => ({ id: s.id, label: s.merchantName, color: s.color }));
}

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

export default function ArtistProfilePage({ params }: Props) {
  const artist = seedArtist(params.slug);
  const articleRoute = artist.hasArticle ? profileToArticleRoute("artist", params.slug) : undefined;
  const artistSponsors = seedArtistSponsors(params.slug);
  const auraSlots = buildArtistAuraSlots(artistSponsors);

  return (
    <ArtistWorldShell
      displayName={artist.displayName}
      slug={params.slug}
      tagline={artist.tagline}
      rank={artist.rank}
      isVerified={artist.isVerified}
      articleRoute={articleRoute}
      sponsorAura={auraSlots}
      sponsorSection={
        <PerformerSponsorShelf
          performerSlug={params.slug}
          performerName={artist.displayName}
          tier="free"
          sponsors={artistSponsors}
        />
      }
    >
      {/* Go Live banner — shows only to profile owner when not live */}
      <GoLiveBanner profileSlug={params.slug} hasStreamed={artist.isLive} />

      {/* Live badge */}
      {artist.isLive && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(255,45,170,0.12)", border: `1px solid ${FUCHSIA}55`,
          borderRadius: 999, padding: "5px 14px", marginBottom: 12,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: FUCHSIA, display: "inline-block", boxShadow: `0 0 8px ${FUCHSIA}` }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: FUCHSIA, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Live Now — {artist.liveVenueName ?? "On Stage"}
          </span>
          <Link href="/live/stages" style={{ fontSize: 10, color: CYAN, fontWeight: 700, textDecoration: "none", marginLeft: 6 }}>Watch →</Link>
        </div>
      )}

      {/* Genre chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {artist.genres.map((g) => (
          <span key={g} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: CYAN, background: "rgba(0,255,255,0.08)",
            border: "1px solid rgba(0,255,255,0.22)", borderRadius: 4, padding: "2px 8px",
          }}>{g}</span>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: CYAN }}>{artist.monthlyListeners.toLocaleString()}</div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Monthly Listeners</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: GOLD }}>#{artist.rank}</div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>TMI Rank</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ViralShareButton
          playlistId={`${params.slug}-artist-spotlight`}
          curatorId={params.slug}
          playlistTitle={`${artist.displayName} Artist Spotlight`}
          sharePath={`/profile/artist/${encodeURIComponent(params.slug)}`}
        />
        <Link
          href={`/messages/new?recipientId=${params.slug}&name=${encodeURIComponent(artist.displayName)}`}
          style={{
            padding: "8px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800,
            background: "rgba(0,255,255,0.1)", border: `1px solid rgba(0,255,255,0.3)`,
            color: CYAN, textDecoration: "none", letterSpacing: "0.05em",
          }}
        >
          💬 Message
        </Link>
        <Link
          href="/booking"
          style={{
            padding: "8px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800,
            background: "rgba(255,215,0,0.1)", border: `1px solid rgba(255,215,0,0.3)`,
            color: GOLD, textDecoration: "none", letterSpacing: "0.05em",
          }}
        >
          📅 Book
        </Link>
        <Link
          href="/rooms/world-dance-party"
          style={{
            padding: "8px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800,
            background: "rgba(255,45,170,0.1)", border: `1px solid rgba(255,45,170,0.3)`,
            color: FUCHSIA, textDecoration: "none", letterSpacing: "0.05em",
          }}
        >
          🎵 Join Room
        </Link>
      </div>

      {/* Video & Media panel — live stream + past performances */}
      <PerformerVideoPanel
        slug={params.slug}
        displayName={artist.displayName}
        isLive={artist.isLive}
        liveRoomId={artist.isLive ? `artist-${params.slug}` : undefined}
        accentColor={CYAN}
        role="artist"
      />

      {/* Playlist — owner can add/reorder tracks; visitors see read-only */}
      <ProfilePlaylistSection profileSlug={params.slug} />

      {/* Memory Wall — photos, videos, audio, moments */}
      <div style={{ padding: "0 24px 16px" }}>
        <MemoryWall accentColor={CYAN} title={`${artist.displayName} — Memory Wall`} entityId={params.slug} entityType="artist" />
      </div>

      {/* Ad slot — free visitors see this */}
      <div style={{ padding: "0 24px 16px" }}>
        <TieredAdSlot tier="free" placement="artist-profile-bottom" height={70} />
      </div>

      {/* Omni-Presence: Messages + Video Chat + Audio + Live Routing */}
      <div style={{ padding: "0 24px 24px" }}>
        <OmniPresenceEngine slug={params.slug} displayName={artist.displayName} defaultTab="messages" />
      </div>

      {/* Profile Lobby */}
      <TmiProfileLobby
        slug={params.slug}
        displayName={artist.displayName}
        role="artist"
        accentColor={CYAN}
      />
    </ArtistWorldShell>
  );
}
