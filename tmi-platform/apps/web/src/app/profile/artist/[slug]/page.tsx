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

interface Props {
  params: { slug: string };
}

const KNOWN_ARTISTS: Record<
  string,
  {
    displayName: string;
    tagline: string;
    rank: number;
    isVerified: boolean;
    genres: string[];
    isLive: boolean;
    liveVenueName?: string;
    hasArticle: boolean;
    monthlyListeners: number;
  }
> = {
  "kreach": {
    displayName: "Kreach",
    tagline: "Diamond producer. Multi-genre architect. TMI founding artist.",
    rank: 1,
    isVerified: true,
    genres: ["Hip-Hop", "Trap", "R&B"],
    isLive: false,
    hasArticle: true,
    monthlyListeners: 48200,
  },
  "kg": {
    displayName: "KG",
    tagline: "Diamond producer. Sonic innovator. TMI Season 1.",
    rank: 2,
    isVerified: true,
    genres: ["Hip-Hop", "Soul"],
    isLive: false,
    hasArticle: false,
    monthlyListeners: 32100,
  },
  "savage-guns": {
    displayName: "Savage Guns",
    tagline: "90-day diamond trial artist. Street-certified and chart-bound.",
    rank: 5,
    isVerified: false,
    genres: ["Trap", "Hip-Hop"],
    isLive: false,
    hasArticle: false,
    monthlyListeners: 18900,
  },
};

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedArtist(slug: string) {
  if (KNOWN_ARTISTS[slug]) return KNOWN_ARTISTS[slug]!;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const genrePool = [["Hip-Hop", "R&B"], ["EDM", "Pop"], ["Jazz", "Soul"], ["Trap", "Afrobeats"]];
  return {
    displayName: titleCase(slug),
    tagline: `Independent artist on The Musician's Index.`,
    rank: 20 + (hash % 80),
    isVerified: false,
    genres: genrePool[hash % genrePool.length]!,
    isLive: false,
    hasArticle: false,
    monthlyListeners: 1000 + (hash % 49000),
  };
}

// ─── Artist sponsor seed data ─────────────────────────────────────────────────

const ARTIST_SEED_SPONSORS: Record<string, PerformerSponsor[]> = {
  "kreach": [
    { id: "kr-s1", merchantName: "Infinite Loops",  merchantCategory: "Music Tech",    sponsorClass: "local",  packageLabel: "Local Premium",  monthlyRateCents: 10000, status: "active",  color: "#00FFFF" },
    { id: "kr-s2", merchantName: "AX Audio",         merchantCategory: "Audio Gear",    sponsorClass: "local",  packageLabel: "Local Standard", monthlyRateCents: 5000,  status: "active",  color: "#FF2DAA" },
    { id: "kr-s3", merchantName: "Stage Nova",       merchantCategory: "Apparel",       sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "active",  color: "#AA2DFF" },
    { id: "kr-s4", merchantName: "SoundBlast Media", merchantCategory: "Media",         sponsorClass: "major",  packageLabel: "Major Standard", monthlyRateCents: 35000, status: "active",  color: "#FFD700" },
    { id: "kr-s5", merchantName: "Flex Culture Co",  merchantCategory: "Fashion",       sponsorClass: "major",  packageLabel: "Major Basic",    monthlyRateCents: 15000, status: "active",  color: "#00FF88" },
    { id: "kr-s6", merchantName: "NovaBrew",         merchantCategory: "Beverages",     sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "pending", color: "#FF6B35" },
  ],
  "kg": [
    { id: "kg-s1", merchantName: "SoulBox Studio",  merchantCategory: "Recording",     sponsorClass: "local",  packageLabel: "Local Standard", monthlyRateCents: 5000,  status: "active",  color: "#00FFFF" },
    { id: "kg-s2", merchantName: "GridWave Gear",    merchantCategory: "Music Tech",    sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "active",  color: "#FFD700" },
    { id: "kg-s3", merchantName: "Apex Sound",       merchantCategory: "Audio Gear",    sponsorClass: "major",  packageLabel: "Major Basic",    monthlyRateCents: 15000, status: "pending", color: "#AA2DFF" },
  ],
  "savage-guns": [
    { id: "sg-s1", merchantName: "Street Level",    merchantCategory: "Apparel",       sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "active",  color: "#FF2DAA" },
  ],
};

function seedArtistSponsors(slug: string): PerformerSponsor[] {
  if (ARTIST_SEED_SPONSORS[slug]) return ARTIST_SEED_SPONSORS[slug]!;
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    { id: `${slug}-as1`, merchantName: "Local Partner",  merchantCategory: "Local Business", sponsorClass: "local", packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "active",  color: "#00FFFF" },
    { id: `${slug}-as2`, merchantName: "Brand Co",       merchantCategory: "Retail",          sponsorClass: "local", packageLabel: "Local Standard", monthlyRateCents: 5000,  status: h % 2 === 0 ? "active" : "pending", color: "#FFD700" },
  ];
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
