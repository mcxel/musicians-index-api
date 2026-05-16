"use client";

/**
 * Home5MonthlyContestBoard.tsx
 * Section E — MONTHLY CONTEST
 * Visual sponsor logo cards: 10 local + 10 major.
 * Prize pools, reward types, entry rules in visual card format.
 */

import Link from "next/link";

interface SponsorCard {
  id: string;
  name: string;
  tier: "local" | "major";
  prizePool: number;
  rewardType: string;
  entryRule: string;
  color: string;
  logo?: string;
}

const FALLBACK_SPONSORS: SponsorCard[] = [
  // 10 Local Sponsors
  { id: "ls1", name: "City Records", tier: "local", prizePool: 500, rewardType: "Merch Pack", entryRule: "3 battle wins", color: "#FF2DAA", logo: "/sponsors/local-1.png" },
  { id: "ls2", name: "Street Beats", tier: "local", prizePool: 300, rewardType: "Studio Time", entryRule: "5 cypher entries", color: "#AA2DFF", logo: "/sponsors/local-2.png" },
  { id: "ls3", name: "Hood Vibes", tier: "local", prizePool: 400, rewardType: "Cash Prize", entryRule: "2 battles + 3 votes", color: "#00FFFF", logo: "/sponsors/local-3.png" },
  { id: "ls4", name: "Block Ave", tier: "local", prizePool: 350, rewardType: "Gear Pack", entryRule: "Any battle win", color: "#00FF88", logo: "/sponsors/local-4.png" },
  { id: "ls5", name: "Unsigned Heat", tier: "local", prizePool: 250, rewardType: "Feature Slot", entryRule: "Open cypher entry", color: "#FF6B35", logo: "/sponsors/local-5.png" },
  { id: "ls6", name: "Raw Talent Co", tier: "local", prizePool: 450, rewardType: "Promo Package", entryRule: "3 community votes", color: "#FF2DAA", logo: "/sponsors/local-6.png" },
  { id: "ls7", name: "Eastside Sounds", tier: "local", prizePool: 275, rewardType: "Merch + XP", entryRule: "1 cypher + 1 battle", color: "#FFD700", logo: "/sponsors/local-7.png" },
  { id: "ls8", name: "Uptown Beats", tier: "local", prizePool: 325, rewardType: "Collab Slot", entryRule: "5 community votes", color: "#AA2DFF", logo: "/sponsors/local-8.png" },
  { id: "ls9", name: "Downtown Vibes", tier: "local", prizePool: 200, rewardType: "Badge Pack", entryRule: "Any submission", color: "#00FFFF", logo: "/sponsors/local-9.png" },
  { id: "ls10", name: "Studio Block", tier: "local", prizePool: 380, rewardType: "Recording Session", entryRule: "2 battle wins", color: "#00FF88", logo: "/sponsors/local-10.png" },
  // 10 Major Sponsors
  { id: "ms1", name: "BeatMax Pro", tier: "major", prizePool: 5000, rewardType: "Cash + Contract", entryRule: "Top 10 qualifier", color: "#FFD700", logo: "/sponsors/sponsor-1.png" },
  { id: "ms2", name: "SoundWave Corp", tier: "major", prizePool: 3500, rewardType: "Label Deal", entryRule: "5 battle wins", color: "#FF6B35", logo: "/sponsors/sponsor-2.png" },
  { id: "ms3", name: "Neon Audio", tier: "major", prizePool: 4000, rewardType: "Tour Support", entryRule: "Monthly top 5", color: "#00FFFF", logo: "/sponsors/sponsor-3.png" },
  { id: "ms4", name: "VaultX Music", tier: "major", prizePool: 2500, rewardType: "Distribution Deal", entryRule: "100 community votes", color: "#AA2DFF", logo: "/sponsors/sponsor-4.png" },
  { id: "ms5", name: "GoldStrike Ent", tier: "major", prizePool: 6000, rewardType: "$6k Prize Pool", entryRule: "Qualifier + invite", color: "#FFD700", logo: "/sponsors/sponsor-5.png" },
  { id: "ms6", name: "Arena Live", tier: "major", prizePool: 3000, rewardType: "Live Show Slot", entryRule: "Any top 20 rank", color: "#FF2DAA", logo: "/sponsors/sponsor-6.png" },
  { id: "ms7", name: "Boost Records", tier: "major", prizePool: 4500, rewardType: "EP Funding", entryRule: "Monthly qualifier", color: "#00FF88", logo: "/sponsors/sponsor-7.png" },
  { id: "ms8", name: "HypeNet", tier: "major", prizePool: 2000, rewardType: "Social Promo", entryRule: "Open submission", color: "#FF6B35", logo: "/sponsors/sponsor-8.png" },
  { id: "ms9", name: "StageFront", tier: "major", prizePool: 7500, rewardType: "Festival Slot", entryRule: "Monthly champion only", color: "#FFD700", logo: "/sponsors/sponsor-9.png" },
  { id: "ms10", name: "DropZone", tier: "major", prizePool: 3200, rewardType: "Streaming Push", entryRule: "10 battle wins", color: "#AA2DFF", logo: "/sponsors/sponsor-10.png" },
];

function SponsorCard({ sponsor }: { sponsor: SponsorCard }) {
  return (
    <div
      style={{
        border: `1px solid ${sponsor.color}44`,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${sponsor.color}10 0%, rgba(5,5,16,0.97) 100%)`,
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: 44,
          background: sponsor.logo
            ? `url(${sponsor.logo}) center/contain no-repeat`
            : `${sponsor.color}1a`,
          borderRadius: 6,
          border: `1px solid ${sponsor.color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: sponsor.color,
          letterSpacing: "0.08em",
        }}
      >
        {!sponsor.logo && sponsor.name.slice(0, 6).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{sponsor.name}</div>

      {/* Prize */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: sponsor.color,
          fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
          letterSpacing: "0.06em",
        }}
      >
        ${sponsor.prizePool.toLocaleString()}
      </div>

      {/* Reward type */}
      <div
        style={{
          background: `${sponsor.color}18`,
          border: `1px solid ${sponsor.color}33`,
          borderRadius: 5,
          padding: "3px 7px",
          fontSize: 9,
          fontWeight: 700,
          color: sponsor.color,
          letterSpacing: "0.06em",
        }}
      >
        {sponsor.rewardType.toUpperCase()}
      </div>

      {/* Entry rule */}
      <div style={{ fontSize: 10, opacity: 0.6, lineHeight: 1.4 }}>
        {sponsor.entryRule}
      </div>
    </div>
  );
}

export default function Home5MonthlyContestBoard() {
  const sponsors = FALLBACK_SPONSORS;
  const localSponsors = sponsors.filter((s) => s.tier === "local");
  const majorSponsors = sponsors.filter((s) => s.tier === "major");

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FFD700",
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
        >
          MONTHLY CONTEST
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>20 sponsors competing for you</span>
        <Link
          href="/contests"
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#FFD700",
            textDecoration: "none",
            opacity: 0.8,
          }}
        >
          View All →
        </Link>
      </div>

      {/* Major Sponsors */}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#FFD700", opacity: 0.7 }}>
          MAJOR SPONSORS — Top Prizes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 8,
          }}
        >
          {majorSponsors.map((s) => (
            <SponsorCard key={s.id} sponsor={s} />
          ))}
        </div>
      </div>

      {/* Local Sponsors */}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#FF2DAA", opacity: 0.7 }}>
          LOCAL SPONSORS — Community Prizes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 8,
          }}
        >
          {localSponsors.map((s) => (
            <SponsorCard key={s.id} sponsor={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
