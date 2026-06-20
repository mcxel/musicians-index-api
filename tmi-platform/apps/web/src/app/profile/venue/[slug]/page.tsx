import Link from "next/link";
import ProfileShell from "@/components/profile/ProfileShell";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import MemoryWall from "@/components/media/MemoryWall";

interface Props {
  params: { slug: string };
}

interface SeedVenue {
  displayName: string;
  tagline: string;
  isVerified: boolean;
  city: string;
  capacity: number;
  genres: string[];
  showsThisMonth: number;
  isLive: boolean;
  activeRooms: number;
}

const SEED_VENUES: Record<string, SeedVenue> = {
  "cypher-arena": {
    displayName: "Cypher Arena",
    tagline: "TMI's premiere battle rap and cypher venue. Season 1 flagship.",
    isVerified: true,
    city: "Atlanta, GA",
    capacity: 2500,
    genres: ["Hip-Hop", "Battle Rap", "Cypher"],
    showsThisMonth: 12,
    isLive: true,
    activeRooms: 3,
  },
  "thunder-world": {
    displayName: "Thunder World",
    tagline: "High-energy arena. Home of the weekly beat championship.",
    isVerified: true,
    city: "Los Angeles, CA",
    capacity: 5000,
    genres: ["Trap", "EDM", "Hip-Hop"],
    showsThisMonth: 8,
    isLive: false,
    activeRooms: 1,
  },
  "the-underground": {
    displayName: "The Underground",
    tagline: "Intimate live sessions, open mics, and producer showcases.",
    isVerified: false,
    city: "New York, NY",
    capacity: 400,
    genres: ["Jazz", "R&B", "Soul", "Hip-Hop"],
    showsThisMonth: 20,
    isLive: false,
    activeRooms: 0,
  },
};

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Rule 20 — no plausible-looking fabricated numbers for venues outside the
// 3 explicit curated entries above. city/capacity/genres/showsThisMonth were
// previously hash-derived from the slug (e.g. "capacity: 300 + hash%4700"),
// which is exactly the fake-Diamond-tier bug class found on the fan profile.
// Honest defaults until a real Venue registry/DB record backs this slug.
function seedVenue(slug: string): SeedVenue {
  if (SEED_VENUES[slug]) return SEED_VENUES[slug]!;
  return {
    displayName: titleCase(slug),
    tagline: `Live music venue on The Musician's Index.`,
    isVerified: false,
    city: "Not set",
    capacity: 0,
    genres: [],
    showsThisMonth: 0,
    isLive: false,
    activeRooms: 0,
  };
}

const GREEN  = "#22c55e";
const CYAN   = "#00FFFF";
const GOLD   = "#FFD700";
const PURPLE = "#AA2DFF";

export default function VenueProfilePage({ params }: Props) {
  const venue = seedVenue(params.slug);

  return (
    <ProfileShell
      role="venue"
      displayName={venue.displayName}
      slug={params.slug}
      tagline={venue.tagline}
      isVerified={venue.isVerified}
    >
      {/* Live badge */}
      {venue.isLive && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(34,197,94,0.12)", border: `1px solid ${GREEN}55`,
          borderRadius: 999, padding: "5px 14px", marginBottom: 12,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, display: "inline-block", boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Live Now — {venue.activeRooms} Active Room{venue.activeRooms !== 1 ? "s" : ""}
          </span>
          <Link href="/rooms" style={{ fontSize: 10, color: CYAN, fontWeight: 700, textDecoration: "none", marginLeft: 6 }}>Join →</Link>
        </div>
      )}

      {/* Info row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "3px 10px", background: "rgba(255,255,255,0.05)", borderRadius: 20 }}>
          📍 {venue.city}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "3px 10px", background: "rgba(255,255,255,0.05)", borderRadius: 20 }}>
          👥 {venue.capacity.toLocaleString()} capacity
        </span>
      </div>

      {/* Genre chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {venue.genres.map((g) => (
          <span key={g} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: GREEN, background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.22)", borderRadius: 4, padding: "2px 8px",
          }}>{g}</span>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Shows / Month", value: venue.showsThisMonth.toString(), color: GREEN },
          { label: "Live Rooms",    value: venue.activeRooms.toString(),    color: CYAN },
          { label: "Capacity",      value: venue.capacity.toLocaleString(), color: GOLD },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "12px 10px", borderRadius: 10, textAlign: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Link href="/rooms" style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: `rgba(34,197,94,0.1)`, border: `1px solid ${GREEN}44`, color: GREEN, textDecoration: "none" }}>
          🎵 Join Room
        </Link>
        <Link href="/tickets" style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: `rgba(255,215,0,0.1)`, border: `1px solid ${GOLD}44`, color: GOLD, textDecoration: "none" }}>
          🎟️ Get Tickets
        </Link>
        <Link href="/booking" style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: `rgba(170,45,255,0.1)`, border: `1px solid ${PURPLE}44`, color: PURPLE, textDecoration: "none" }}>
          📅 Book Venue
        </Link>
        <Link href={`/messages/new?recipientId=${params.slug}&name=${encodeURIComponent(venue.displayName)}`} style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: `rgba(0,255,255,0.1)`, border: `1px solid ${CYAN}44`, color: CYAN, textDecoration: "none" }}>
          💬 Contact
        </Link>
      </div>

      {/* Booking CTA */}
      <div style={{ padding: "16px 20px", borderRadius: 10, border: `1px solid ${GREEN}22`, background: `rgba(34,197,94,0.04)` }}>
        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: GREEN, textTransform: "uppercase", margin: "0 0 8px" }}>
          Book This Venue
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
          Host your next live show, battle, or release event at {venue.displayName}.
        </p>
        <Link href="/booking" style={{
          fontSize: 8, fontWeight: 800, color: GREEN,
          letterSpacing: "0.12em", textTransform: "uppercase",
          textDecoration: "none", padding: "6px 16px",
          borderRadius: 6, border: `1px solid ${GREEN}40`, background: `${GREEN}0c`,
        }}>
          Request Booking →
        </Link>
      </div>

      <UniversalMediaPanel
        slug={params.slug}
        displayName={venue.displayName}
        role="venue"
        isLive={venue.isLive}
        accentColor={GREEN}
      />

      <div style={{ padding: "0 24px 16px" }}>
        <MemoryWall accentColor={GREEN} title={`${venue.displayName} — Memory Wall`} entityId={params.slug} entityType="venue" />
      </div>
    </ProfileShell>
  );
}
