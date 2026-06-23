'use client';

/**
 * PerformerSponsorShelf
 * Tier-aware sponsor slot shelf — sales engine, not a dashboard.
 * Every open slot shows earning potential. Every empty dollar is visible.
 * Free tier = 10 local + 10 major = 20 slots. All shown. No truncation.
 */

import Link from 'next/link';
import { useState } from 'react';

// ─── Tier slot table ──────────────────────────────────────────────────────────

const TIER_SLOTS: Record<string, { local: number; major: number; badge: string; color: string }> = {
  free:     { local: 10,  major: 10,  badge: 'FREE',     color: '#888888' },
  pro:      { local: 25,  major: 15,  badge: 'PRO',      color: '#00FFFF' },
  RUBY:   { local: 50,  major: 25,  badge: 'RUBY',   color: '#CD7F32' },
  silver:   { local: 75,  major: 35,  badge: 'SILVER',   color: '#C0C0C0' },
  gold:     { local: 100, major: 50,  badge: 'GOLD',     color: '#FFD700' },
  platinum: { local: 250, major: 100, badge: 'PLATINUM', color: '#E5E4E2' },
  diamond:  { local: 999, major: 500, badge: 'DIAMOND',  color: '#AA2DFF' },
};

const TIER_UPGRADE_NEXT: Record<string, string> = {
  free: 'pro', pro: 'RUBY', RUBY: 'silver',
  silver: 'gold', gold: 'platinum', platinum: 'diamond', diamond: 'diamond',
};

// Realistic monthly earning potential per slot class
const SLOT_EARNING: Record<string, { floor: number; ceiling: number; avg: number }> = {
  local: { floor: 25,   ceiling: 250,   avg: 75   },
  major: { floor: 150,  ceiling: 2000,  avg: 500  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorClass = 'local' | 'major';

export interface PerformerSponsor {
  id: string;
  merchantName: string;
  merchantCategory: string;
  sponsorClass: SponsorClass;
  packageLabel: string;
  monthlyRateCents: number;
  status: 'active' | 'pending' | 'paused';
  color?: string;
  logo?: string;
}

export interface PerformerSponsorShelfProps {
  performerSlug: string;
  performerName: string;
  tier?: string;
  sponsors?: PerformerSponsor[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  active:  '#00FF88',
  pending: '#FFD700',
  paused:  '#666666',
};

function usdDisplay(cents: number): string {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k/mo`;
  return `$${(cents / 100).toFixed(0)}/mo`;
}

function potentialRevenue(count: number, cls: SponsorClass): number {
  return count * (SLOT_EARNING[cls]?.avg ?? 50);
}

// ─── Filled slot ──────────────────────────────────────────────────────────────

function FilledSlot({ sponsor }: { sponsor: PerformerSponsor }) {
  const accent = sponsor.color ?? (sponsor.sponsorClass === 'major' ? '#FFD700' : '#00FFFF');
  const statusColor = STATUS_COLOR[sponsor.status] ?? '#888';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}14, rgba(5,5,16,0.95))`,
      border: `1px solid ${accent}55`,
      borderRadius: 10,
      padding: '13px 14px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: sponsor.status === 'active'
        ? `0 0 18px ${accent}22, inset 0 0 12px ${accent}08`
        : 'none',
    }}>
      {/* Left accent rail */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: accent,
        opacity: sponsor.status === 'active' ? 0.85 : 0.3,
      }} />

      <div style={{ paddingLeft: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sponsor.merchantName}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {sponsor.merchantCategory}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{
              fontSize: 7, fontWeight: 900, color: statusColor,
              border: `1px solid ${statusColor}44`, borderRadius: 4,
              padding: '2px 6px', letterSpacing: '0.1em',
            }}>
              {sponsor.status.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: accent, letterSpacing: '0.02em' }}>
              {usdDisplay(sponsor.monthlyRateCents)}
            </span>
          </div>
        </div>
        <div style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
          color: `${accent}bb`, textTransform: 'uppercase',
        }}>
          {sponsor.packageLabel}
        </div>
      </div>
    </div>
  );
}

// ─── Open (claimable) slot ────────────────────────────────────────────────────

function OpenSlot({
  index,
  sponsorClass,
  performerSlug,
  performerName,
}: {
  index: number;
  sponsorClass: SponsorClass;
  performerSlug: string;
  performerName: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const accent = sponsorClass === 'major' ? '#FFD700' : '#00FFFF';
  const earning = SLOT_EARNING[sponsorClass]!;

  // Claiming a slot is a real, priced action — posts to the real checkout
  // route (which knows this performer's actual price by lineup type) and
  // redirects to a real Stripe Checkout Session, not a generic sponsor hub.
  const claimSlot = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/sponsors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performerSlug, sponsorClass }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === 'not_authenticated') {
        window.location.href = `/auth?next=${encodeURIComponent(`/performers/${performerSlug}`)}`;
        return;
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void claimSlot()}
      disabled={claiming}
      style={{ textDecoration: 'none', display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: claiming ? 'wait' : 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        border: `1.5px dashed ${hovered ? accent : `${accent}33`}`,
        borderRadius: 10,
        padding: '13px 14px',
        background: hovered ? `${accent}0f` : `${accent}04`,
        transition: 'all 0.18s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? `0 0 16px ${accent}22` : 'none',
      }}>
        {/* Pulse dot */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 5, height: 5, borderRadius: '50%',
          background: accent,
          opacity: hovered ? 0.9 : 0.3,
          boxShadow: hovered ? `0 0 6px ${accent}` : 'none',
          transition: 'all 0.18s',
        }} />

        <div>
          {/* Slot label */}
          <div style={{
            fontSize: 8, fontWeight: 900, letterSpacing: '0.16em',
            color: hovered ? accent : `${accent}66`,
            textTransform: 'uppercase',
            marginBottom: 4,
            transition: 'color 0.18s',
          }}>
            OPEN {sponsorClass === 'major' ? 'MAJOR' : 'LOCAL'} SLOT
          </div>

          {/* The money line — biggest text, most visible */}
          <div style={{
            fontSize: 13, fontWeight: 900,
            color: hovered ? '#fff' : 'rgba(255,255,255,0.35)',
            transition: 'color 0.18s',
          }}>
            ~${earning.floor}–${earning.ceiling}
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginLeft: 3 }}>/mo</span>
          </div>

          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            Sponsor {performerName} · avg ${earning.avg}/mo
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: hovered ? '6px 14px' : '5px 10px',
          background: hovered ? accent : 'transparent',
          border: `1px solid ${hovered ? accent : `${accent}44`}`,
          borderRadius: 6,
          fontSize: 9, fontWeight: 900,
          color: hovered ? '#050510' : `${accent}88`,
          whiteSpace: 'nowrap',
          transition: 'all 0.18s',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          {claiming ? 'Processing…' : hovered ? 'Claim Spot →' : 'Available'}
        </div>
      </div>
    </button>
  );
}

// ─── Slot section (local or major) ────────────────────────────────────────────

function SlotSection({
  sponsorClass,
  totalSlots,
  sponsors,
  performerSlug,
  performerName,
  accent,
  label,
}: {
  sponsorClass: SponsorClass;
  totalSlots: number;
  sponsors: PerformerSponsor[];
  performerSlug: string;
  performerName: string;
  accent: string;
  label: string;
}) {
  const usedCount = sponsors.length;
  const openCount = Math.max(0, totalSlots - usedCount);
  const fillPct = totalSlots > 0 ? Math.round((usedCount / totalSlots) * 100) : 0;
  const earning = SLOT_EARNING[sponsorClass]!;
  const openRevPotential = openCount * earning.avg;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, boxShadow: `0 0 6px ${accent}` }} />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>
            {label}
          </span>
          <span style={{
            fontSize: 8, color: 'rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4, padding: '1px 7px',
          }}>
            ${earning.floor}–${earning.ceiling}/mo each
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: usedCount > 0 ? accent : 'rgba(255,255,255,0.25)' }}>
            {usedCount} / {totalSlots}
          </span>
          {openRevPotential > 0 && (
            <span style={{
              fontSize: 8, fontWeight: 800,
              color: '#00FF88',
              background: 'rgba(0,255,136,0.07)',
              border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: 4, padding: '1px 7px',
              letterSpacing: '0.04em',
            }}>
              +${openRevPotential}/mo open
            </span>
          )}
        </div>
      </div>

      {/* Fill bar */}
      <div style={{
        height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2,
        marginBottom: 12, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          width: `${fillPct}%`, height: '100%',
          background: `linear-gradient(90deg, ${accent}, ${accent}77)`,
          borderRadius: 2, transition: 'width 0.7s ease',
          boxShadow: fillPct > 0 ? `0 0 8px ${accent}55` : 'none',
        }} />
        {/* Open portion marker */}
        {fillPct < 100 && openCount > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: `${fillPct}%`, right: 0, height: '100%',
            background: `repeating-linear-gradient(90deg, ${accent}18 0px, ${accent}18 4px, transparent 4px, transparent 8px)`,
          }} />
        )}
      </div>

      {/* Filled sponsor cards */}
      {sponsors.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 8, marginBottom: sponsors.length > 0 && openCount > 0 ? 8 : 0,
        }}>
          {sponsors.map((s) => <FilledSlot key={s.id} sponsor={s} />)}
        </div>
      )}

      {/* ALL open slots — no truncation */}
      {openCount > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 8,
        }}>
          {Array.from({ length: openCount }, (_, i) => (
            <OpenSlot
              key={`open-${sponsorClass}-${i}`}
              index={usedCount + i}
              sponsorClass={sponsorClass}
              performerSlug={performerSlug}
              performerName={performerName}
            />
          ))}
        </div>
      )}

      {totalSlots === 0 && (
        <div style={{ padding: 16, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>
          No {label.toLowerCase()} slots on this tier.
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PerformerSponsorShelf({
  performerSlug,
  performerName,
  tier = 'free',
  sponsors = [],
}: PerformerSponsorShelfProps) {
  const tierKey = tier in TIER_SLOTS ? tier : 'free';
  const slots = TIER_SLOTS[tierKey]!;
  const nextTierKey = TIER_UPGRADE_NEXT[tierKey]!;
  const nextSlots = TIER_SLOTS[nextTierKey];

  const localSponsors  = sponsors.filter((s) => s.sponsorClass === 'local');
  const majorSponsors  = sponsors.filter((s) => s.sponsorClass === 'major');
  const activeCount    = sponsors.filter((s) => s.status === 'active').length;
  const totalUsed      = sponsors.length;
  const totalSlots     = slots.local + slots.major;
  const monthlyRevenue = sponsors
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyRateCents, 0);

  const openLocal = slots.local - localSponsors.length;
  const openMajor = slots.major - majorSponsors.length;
  const potentialOpen =
    potentialRevenue(Math.max(0, openLocal), 'local') +
    potentialRevenue(Math.max(0, openMajor), 'major');
  const potentialFull =
    potentialRevenue(slots.local, 'local') +
    potentialRevenue(slots.major, 'major');

  const tierMeta = TIER_SLOTS[tierKey]!;
  const isMaxTier = tierKey === 'diamond';

  // Calculate upgrade unlock potential
  const nextPotentialFull = nextSlots
    ? potentialRevenue(nextSlots.local, 'local') + potentialRevenue(nextSlots.major, 'major')
    : 0;
  const upgradeUnlockDelta = nextPotentialFull - potentialFull;

  return (
    <section style={{
      marginTop: 24,
      background: 'rgba(5,5,16,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    }}>
      {/* ── Header bar ── */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>🤝</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.24em', color: '#fff', textTransform: 'uppercase' }}>
            Sponsor Spots
          </span>
          <span style={{
            fontSize: 7, fontWeight: 900, letterSpacing: '0.18em',
            color: tierMeta.color, border: `1px solid ${tierMeta.color}55`,
            padding: '2px 8px', borderRadius: 4, background: `${tierMeta.color}10`,
          }}>
            {tierMeta.badge}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            {totalUsed} / {totalSlots} filled
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {monthlyRevenue > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 900, color: '#00FF88',
              background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: 6, padding: '4px 12px',
            }}>
              {usdDisplay(monthlyRevenue)} active
            </span>
          )}
          <Link href="/hub/performer?tab=sponsors" style={{
            fontSize: 8, fontWeight: 900, color: '#FF2DAA',
            border: '1px solid rgba(255,45,170,0.35)', borderRadius: 6,
            padding: '5px 14px', textDecoration: 'none', letterSpacing: '0.1em',
            background: 'rgba(255,45,170,0.06)',
          }}>
            MANAGE →
          </Link>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {[
          {
            label: 'Local Slots',
            value: `${slots.local}`,
            sub: `${localSponsors.length} filled · ${openLocal} open`,
            color: '#00FFFF',
          },
          {
            label: 'Major Slots',
            value: `${slots.major}`,
            sub: `${majorSponsors.length} filled · ${openMajor} open`,
            color: '#FFD700',
          },
          {
            label: 'Active',
            value: `${activeCount}`,
            sub: monthlyRevenue > 0 ? usdDisplay(monthlyRevenue) : 'none earning',
            color: '#00FF88',
          },
          {
            label: 'Open Potential',
            value: potentialOpen > 0 ? `$${potentialOpen.toLocaleString()}` : '—',
            sub: potentialOpen > 0 ? 'available /mo' : 'fully filled',
            color: '#FF2DAA',
          },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            padding: '12px 16px',
            background: i % 2 === 0 ? 'rgba(5,5,16,0.6)' : 'rgba(8,8,20,0.4)',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue potential banner (shown when there are open slots) ── */}
      {potentialOpen > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(0,255,136,0.06), rgba(0,255,136,0.03))',
          borderBottom: '1px solid rgba(0,255,136,0.12)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>💰</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#00FF88' }}>
              ${potentialOpen.toLocaleString()}/mo
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
              sitting unclaimed in your open slots right now
            </span>
          </div>
          <span style={{
            fontSize: 8, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic',
          }}>
            Full capacity = ~${potentialFull.toLocaleString()}/mo
          </span>
        </div>
      )}

      {/* ── Slot sections ── */}
      <div style={{ padding: '22px 20px 4px' }}>
        <SlotSection
          sponsorClass="local"
          totalSlots={slots.local}
          sponsors={localSponsors}
          performerSlug={performerSlug}
          performerName={performerName}
          accent="#00FFFF"
          label="Local Sponsors"
        />
        <SlotSection
          sponsorClass="major"
          totalSlots={slots.major}
          sponsors={majorSponsors}
          performerSlug={performerSlug}
          performerName={performerName}
          accent="#FFD700"
          label="Major Sponsors"
        />
      </div>

      {/* ── Upgrade CTA — shows real dollar unlock ── */}
      {!isMaxTier && nextSlots && (
        <div style={{
          margin: '4px 20px 20px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,215,0,0.03))',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 12, padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#FFD700', letterSpacing: '0.14em' }}>
                UPGRADE TO {nextSlots.badge}
              </span>
              <span style={{
                fontSize: 8, fontWeight: 900, color: '#00FF88',
                background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: 4, padding: '1px 8px',
              }}>
                +${upgradeUnlockDelta.toLocaleString()}/mo potential
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
              Unlock {nextSlots.local} local + {nextSlots.major} major slots
              {' '}· up to ~${nextPotentialFull.toLocaleString()}/mo total capacity
            </div>
          </div>
          <Link href="/season-pass" style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
            color: '#050510', background: 'linear-gradient(90deg, #FFD700, #FF9500)',
            borderRadius: 8, padding: '9px 20px',
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 0 16px rgba(255,215,0,0.3)',
          }}>
            UPGRADE →
          </Link>
        </div>
      )}

      {/* ── What sponsors get ── */}
      <div style={{
        margin: '0 20px 20px',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.18em', marginBottom: 10, textTransform: 'uppercase',
        }}>
          What your sponsors get
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px' }}>
          {[
            ['Logo on this profile page', '#00FFFF'],
            ['Brand in battle overlays', '#FF2DAA'],
            ['Prize pool association', '#FFD700'],
            ['Replay views = free exposure', '#00FF88'],
            ['Live shoutout when active', '#AA2DFF'],
            ['Magazine feature eligibility', '#FF6B35'],
          ].map(([point, dot]) => (
            <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: dot, flexShrink: 0,
                boxShadow: `0 0 4px ${dot}`,
              }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
