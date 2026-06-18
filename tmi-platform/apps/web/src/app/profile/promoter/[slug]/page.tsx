import { notFound } from "next/navigation";
import ProfileShell from "@/components/profile/ProfileShell";
import Link from "next/link";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import MemoryWall from "@/components/media/MemoryWall";

interface Props {
  params: { slug: string };
}

interface SeedPromoter {
  displayName: string;
  tagline: string;
  city: string;
  focus: string;
  isVerified: boolean;
  stats: { label: string; value: string }[];
}

const SEED_PROMOTERS: Record<string, SeedPromoter> = {
  "uptown-events": {
    displayName: "Uptown Events",
    tagline: "NYC's premier hip-hop promoter · 200+ events · 500k+ tickets sold",
    city: "New York, NY",
    focus: "Hip-Hop / Rap",
    isVerified: true,
    stats: [
      { label: "Events Promoted", value: "212" },
      { label: "Tickets Sold", value: "512k" },
      { label: "Artists Booked", value: "84" },
      { label: "Avg. Attendance", value: "94%" },
    ],
  },
  "soundcheck-atl": {
    displayName: "Soundcheck ATL",
    tagline: "Atlanta's loudest nights — 3x TMI Promoter of the Month",
    city: "Atlanta, GA",
    focus: "Multi-Genre",
    isVerified: true,
    stats: [
      { label: "Events Promoted", value: "67" },
      { label: "Tickets Sold", value: "94k" },
      { label: "Artists Booked", value: "31" },
      { label: "Avg. Attendance", value: "88%" },
    ],
  },
};

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedPromoter(slug: string): SeedPromoter {
  if (SEED_PROMOTERS[slug]) return SEED_PROMOTERS[slug]!;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cities = ["New York, NY", "Atlanta, GA", "Los Angeles, CA", "Houston, TX", "Chicago, IL", "Miami, FL"];
  const genres = ["Hip-Hop / Rap", "R&B / Soul", "Multi-Genre", "EDM / Electronic", "Trap", "Afrobeats"];
  return {
    displayName: titleCase(slug),
    tagline: "Independent music promoter on The Musician's Index.",
    city: cities[hash % cities.length]!,
    focus: genres[hash % genres.length]!,
    isVerified: false,
    stats: [
      { label: "Events Promoted", value: (10 + (hash % 90)).toString() },
      { label: "Tickets Sold",    value: `${1 + (hash % 99)}k` },
      { label: "Artists Booked",  value: (5 + (hash % 40)).toString() },
      { label: "Avg. Attendance", value: `${70 + (hash % 28)}%` },
    ],
  };
}

const ACCENT = "#00FF88";

export default function PromoterProfilePage({ params }: Props) {
  const promoter = seedPromoter(params.slug);

  return (
    <ProfileShell
      role="promoter"
      displayName={promoter.displayName}
      slug={params.slug}
      tagline={promoter.tagline}
      isVerified={promoter.isVerified}
    >
      {/* Location + focus */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          📍 {promoter.city}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          🎵 {promoter.focus}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
        {promoter.stats.map((s) => (
          <div key={s.label} style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href={`/booking?promoter=${params.slug}`}
          style={{ padding: "10px 20px", background: `linear-gradient(135deg,${ACCENT},#00CCAA)`, borderRadius: 8, color: "#050510", fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textDecoration: "none" }}
        >
          📋 BOOK THIS PROMOTER
        </Link>
        <Link
          href={`/messages?to=${params.slug}`}
          style={{ padding: "10px 20px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, color: ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none" }}
        >
          💌 MESSAGE
        </Link>
        <Link
          href={`/tickets?promoter=${params.slug}`}
          style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none" }}
        >
          🎟️ UPCOMING EVENTS
        </Link>
      </div>

      <UniversalMediaPanel
        slug={params.slug}
        displayName={promoter.displayName}
        role="promoter"
        accentColor={ACCENT}
      />

      <div style={{ padding: "0 24px 16px" }}>
        <MemoryWall accentColor={ACCENT} title={`${promoter.displayName} — Memory Wall`} entityId={params.slug} entityType="promoter" />
      </div>
    </ProfileShell>
  );
}
