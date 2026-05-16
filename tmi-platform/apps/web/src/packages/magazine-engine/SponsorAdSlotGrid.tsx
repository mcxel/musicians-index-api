"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
/**
 * SponsorAdSlotGrid
 *
 * Sponsor and advertiser ad slots — pulls from the sponsor registry.
 * Every slot routes to the sponsor's page.
 * Confetti/glitter optional on featured slots.
 */

import Link from "next/link";

export type SponsorAdSlot = {
  id: string;
  sponsorName: string;
  tagline: string;
  logoUrl?: string;
  href: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "free";
  type: "banner" | "card" | "chip" | "fullstrip";
  gifted?: boolean;
  giveawayActive?: boolean;
  giveawayLabel?: string;
};

const FALLBACK_SPONSOR_SLOTS: SponsorAdSlot[] = [
  {
    id: "sponsor-prime-wave",
    sponsorName: "Prime Wave",
    tagline: "Stream everywhere, win anywhere.",
    href: "/sponsors/prime-wave",
    tier: "platinum",
    type: "card",
    gifted: true,
    giveawayActive: true,
    giveawayLabel: "🎁 Free 3-Month Stream Pass",
  },
  {
    id: "sponsor-berntout",
    sponsorName: "BerntoutGlobal",
    tagline: "Your performance, our platform.",
    href: "/sponsors/berntoutglobal",
    tier: "platinum",
    type: "card",
  },
  {
    id: "sponsor-beat-labs",
    sponsorName: "Beat Labs",
    tagline: "Pro beats for every genre.",
    href: "/sponsors/beat-labs",
    tier: "gold",
    type: "card",
    gifted: true,
    giveawayActive: true,
    giveawayLabel: "🎶 Free Beat Pack",
  },
  {
    id: "sponsor-artist-gear",
    sponsorName: "Artist Gear Co.",
    tagline: "Gear up for your next performance.",
    href: "/sponsors/artist-gear",
    tier: "gold",
    type: "card",
  },
  {
    id: "sponsor-cypher-pass",
    sponsorName: "Cypher Pass",
    tagline: "Unlock all cypher events.",
    href: "/sponsors/cypher-pass",
    tier: "silver",
    type: "chip",
  },
  {
    id: "sponsor-nft-vault",
    sponsorName: "NFT Vault",
    tagline: "Own your music as NFT.",
    href: "/sponsors/nft-vault",
    tier: "silver",
    type: "chip",
  },
];

const TIER_STYLE: Record<string, string> = {
  platinum: "border-purple-400 bg-purple-900/40",
  gold: "border-yellow-400 bg-yellow-900/30",
  silver: "border-slate-400 bg-slate-800/40",
  bronze: "border-orange-400 bg-orange-900/30",
  free: "border-white/20 bg-white/5",
};

const TIER_BADGE: Record<string, string> = {
  platinum: "bg-purple-600",
  gold: "bg-yellow-600",
  silver: "bg-slate-600",
  bronze: "bg-orange-700",
  free: "bg-slate-700",
};

export type SponsorAdSlotGridProps = {
  slots?: SponsorAdSlot[];
  title?: string;
  columns?: 2 | 3 | 4;
  "data-testid"?: string;
};

export default function SponsorAdSlotGrid({
  slots = FALLBACK_SPONSOR_SLOTS,
  title = "TMI Sponsors & Partners",
  columns = 3,
  "data-testid": testId,
}: SponsorAdSlotGridProps) {
  const colMap = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <section
      className="sponsor-ad-slot-grid"
      data-testid={testId ?? "sponsor-ad-slot-grid"}
      aria-label={title}
    >
      <h2 className="sponsor-grid__title mb-3 text-base font-black text-white/80">{title}</h2>
      <div className={`grid gap-3 ${colMap[columns]}`}>
        {slots.map((slot) => (
          <Link
            key={slot.id}
            href={slot.href}
            className={`sponsor-card group relative overflow-hidden rounded-lg border p-3 transition hover:scale-[1.01] hover:brightness-110 ${TIER_STYLE[slot.tier]}`}
            data-testid={`sponsor-slot-${slot.id}`}
            data-tier={slot.tier}
          >
            {/* Tier badge */}
            <span
              className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white ${TIER_BADGE[slot.tier]}`}
            >
              {slot.tier}
            </span>

            {slot.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <ImageSlotWrapper imageId="img-4mf4mk" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            )}

            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
              {slot.sponsorName}
            </h3>
            <p className="text-xs text-white/60">{slot.tagline}</p>

            {/* Giveaway / gifted surprise strip */}
            {slot.giveawayActive && slot.giveawayLabel && (
              <div className="mt-2 rounded-md bg-emerald-700/80 px-2 py-1 text-[10px] font-bold text-white">
                {slot.giveawayLabel}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
