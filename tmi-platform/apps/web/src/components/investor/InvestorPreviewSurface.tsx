'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  cyan: '#00FFFF',
  fuchsia: '#FF2DAA',
  gold: '#FFD700',
  purple: '#AA2DFF',
  green: '#00FF88',
  dark: '#050510',
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ text, color = C.cyan }: { text: string; color?: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: '0.35em',
        color,
        fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
        fontWeight: 800,
        textTransform: 'uppercase',
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
}

function SectionHeadline({ children, color = '#fff' }: { children: React.ReactNode; color?: string }) {
  return (
    <h2
      style={{
        margin: '0 0 8px',
        fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
        fontSize: 'clamp(26px, 4vw, 44px)',
        letterSpacing: '0.04em',
        color,
        lineHeight: 1.05,
      }}
    >
      {children}
    </h2>
  );
}

function MetricCard({
  label,
  value,
  accent = C.cyan,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent}30`,
        borderRadius: 10,
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: `0 0 18px ${accent}10`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          color: accent,
          fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'clamp(22px, 3vw, 36px)',
          fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
          color: '#fff',
          letterSpacing: '0.05em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SurfaceCard({
  title,
  description,
  route,
  accent = C.cyan,
  badge,
  image,
}: {
  title: string;
  description: string;
  route: string;
  accent?: string;
  badge?: string;
  image?: string;
}) {
  return (
    <Link href={route} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${accent}30` }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${accent}25`,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
      >
        {image && (
          <div
            style={{
              height: 120,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderBottom: `1px solid ${accent}20`,
            }}
          />
        )}
        {!image && (
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
            }}
          />
        )}
        <div style={{ padding: '16px 20px 18px' }}>
          {badge && (
            <div
              style={{
                display: 'inline-block',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: accent,
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                fontWeight: 800,
                border: `1px solid ${accent}40`,
                borderRadius: 4,
                padding: '2px 8px',
                marginBottom: 8,
              }}
            >
              {badge}
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
              fontSize: 18,
              letterSpacing: '0.05em',
              color: '#fff',
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function StatusRow({ label, status }: { label: string; status: 'GREEN' | 'YELLOW' | 'PENDING' }) {
  const color = status === 'GREEN' ? C.green : status === 'YELLOW' ? C.gold : 'rgba(255,255,255,0.3)';
  const dot = status === 'GREEN' ? '●' : status === 'YELLOW' ? '◐' : '○';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          color,
          letterSpacing: '0.15em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{dot}</span>
        {status}
      </span>
    </div>
  );
}

function Divider({ color = C.cyan }: { color?: string }) {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, ${color}40, transparent)`,
        margin: '48px 0',
      }}
    />
  );
}

// ─── Main Surface ────────────────────────────────────────────────────────────

export default function InvestorPreviewSurface() {
  return (
    <div
      style={{
        background: C.dark,
        minHeight: '100vh',
        color: '#fff',
        paddingBottom: 120,
      }}
    >
      {/* ── HERO COVER ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          backgroundImage: 'url(/tmi-curated/home1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          minHeight: 380,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, rgba(5,5,16,0.3) 0%, rgba(5,5,16,0.98) 100%)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'relative',
            maxWidth: 1100,
            margin: '0 auto',
            width: '100%',
            padding: '0 24px 48px',
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.4em',
              color: C.gold,
              fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            INVESTOR PREVIEW · CONFIDENTIAL · MAY 2026
          </div>
          <h1
            style={{
              margin: '0 0 12px',
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
              fontSize: 'clamp(48px, 8vw, 96px)',
              letterSpacing: '0.04em',
              lineHeight: 0.95,
              color: '#fff',
            }}
          >
            The Musician's Index
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              color: 'rgba(255,255,255,0.72)',
              maxWidth: 620,
              lineHeight: 1.55,
              letterSpacing: '0.03em',
            }}
          >
            The world's first live music intelligence platform — ranking artists, powering venues, fueling battles, and monetizing every performance moment in real time.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'SOFT-LAUNCH READY', color: C.green },
              { label: 'STRIPE ENGINE GREEN', color: C.cyan },
              { label: '10 ROUTES LIVE', color: C.gold },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: b.color,
                  border: `1px solid ${b.color}50`,
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                  fontWeight: 800,
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 0' }}>

        {/* ── KEY METRICS ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionLabel text="Platform Metrics · Soft Launch Snapshot" color={C.cyan} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
              marginBottom: 0,
            }}
          >
            <MetricCard label="Live Routes" value="10+" accent={C.cyan} />
            <MetricCard label="Revenue Flows" value="3 Proven" accent={C.green} />
            <MetricCard label="Responsive Targets" value="Mobile · TV" accent={C.gold} />
            <MetricCard label="Venue Capacity" value="Up to 10K" accent={C.purple} />
            <MetricCard label="Battle Formats" value="1v1 · Cypher · Tag" accent={C.fuchsia} />
            <MetricCard label="Magazine Issues" value="Live Feed" accent={C.gold} />
          </div>
        </motion.div>

        <Divider color={C.cyan} />

        {/* ── HOME SURFACES ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionLabel text="Homepage Architecture · 5 Surfaces" color={C.fuchsia} />
          <SectionHeadline color={C.fuchsia}>5 Distinct Revenue-Mapped Surfaces</SectionHeadline>
          <p
            style={{
              margin: '0 0 28px',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            Each homepage surface targets a distinct user segment and monetization vector — from discovery to editorial, live world, sponsor economy, and battle/cypher games.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <SurfaceCard
              title="Home 1 — Discovery & Magazine"
              description="Magazine cover hero, Top 10 DJ and MVP rankings, editorial belt, discovery belt. Primary acquisition surface."
              route="/home/1"
              accent={C.cyan}
              badge="ACQUISITION"
              image="/tmi-curated/home1.jpg"
            />
            <SurfaceCard
              title="Home 2 — Editorial & News Desk"
              description="Breaking news ticker, editorial boards, magazine carousel, article discovery. Media engagement surface."
              route="/home/2"
              accent={C.fuchsia}
              badge="EDITORIAL"
              image="/tmi-curated/mag-35.jpg"
            />
            <SurfaceCard
              title="Home 3 — Live World"
              description="Main lobby preview, venue monitor wall, event calendar strip, host rail, join-now CTA. Live experience gateway."
              route="/home/3"
              accent={C.purple}
              badge="LIVE"
              image="/tmi-curated/venue-14.jpg"
            />
            <SurfaceCard
              title="Home 4 — Sponsor Economy"
              description="Sponsor billboard, analytics board, inventory matrix, deals board, campaign builder. Full B2B advertising surface."
              route="/home/4"
              accent={C.gold}
              badge="REVENUE"
              image="/tmi-curated/venue-22.jpg"
            />
            <SurfaceCard
              title="Home 5 — Battles & Cyphers"
              description="Battle week, cypher rounds, XP ladder, prize vault, season pass, beat marketplace. Competitive economy surface."
              route="/home/5"
              accent={C.fuchsia}
              badge="GAMES"
              image="/tmi-curated/gameshow-31.jpg"
            />
          </div>
        </motion.div>

        <Divider color={C.purple} />

        {/* ── REVENUE ENGINE ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionLabel text="Revenue Architecture" color={C.gold} />
          <SectionHeadline color={C.gold}>Multi-Vector Revenue Engine</SectionHeadline>
          <p
            style={{
              margin: '0 0 28px',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            Stripe-powered financial engine with proven success, duplicate-replay idempotency, and refund rollback flows. Ledger, payout, and receipt systems fully validated.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                title: 'Ticketing & Season Pass',
                description: 'Event tickets, season pass subscriptions, venue access, VIP tiers. Stripe checkout fully wired.',
                route: '/ticketing',
                accent: C.gold,
                badge: 'STRIPE WIRED',
              },
              {
                title: 'Sponsor & Advertiser',
                description: 'Billboard placements, campaign inventory, branded deals. B2B revenue surface with analytics board.',
                route: '/advertise',
                accent: C.cyan,
                badge: 'B2B',
              },
              {
                title: 'Beat Marketplace',
                description: 'Producer beat sales, licensing, exclusive rights. Creator economy revenue layer.',
                route: '/beat-marketplace',
                accent: C.fuchsia,
                badge: 'CREATOR',
              },
              {
                title: 'Battle Prize Vault',
                description: 'Battle entry fees, prize distribution, XP-to-cash conversion, cypher buy-ins.',
                route: '/battles',
                accent: C.purple,
                badge: 'GAMES',
              },
              {
                title: 'NFT & Digital Collectibles',
                description: 'Venue-stamped NFT tickets, artist collectibles, battle trophies on-chain.',
                route: '/nft-marketplace',
                accent: C.green,
                badge: 'WEB3',
              },
              {
                title: 'Wallet & Rewards',
                description: 'Fan wallet, tip economy, reward redemption, creator payouts, affiliate commissions.',
                route: '/wallet',
                accent: C.gold,
                badge: 'LOYALTY',
              },
            ].map((c) => (
              <SurfaceCard key={c.title} {...c} />
            ))}
          </div>
        </motion.div>

        <Divider color={C.gold} />

        {/* ── BOOKING & TICKETING ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionLabel text="Booking & Ticketing Layer" color={C.cyan} />
          <SectionHeadline>Venue Booking + Live Ticketing</SectionHeadline>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 0 }}>
            <SurfaceCard
              title="Venue Booking Engine"
              description="Artist-to-venue direct booking with confirmation flow, contract terms, and calendar locks."
              route="/booking"
              accent={C.cyan}
              badge="BOOKING"
              image="/tmi-curated/venue-18.jpg"
            />
            <SurfaceCard
              title="Live Ticket Sales"
              description="Real-time seat selection, tier pricing, group bookings, early access, and waitlist queues."
              route="/ticketing"
              accent={C.gold}
              badge="TICKETING"
              image="/tmi-curated/venue-10.jpg"
            />
            <SurfaceCard
              title="Live Room Access"
              description="Lobby queue system, seat grid, stage viewport, crowd zones. Full 3D room environment ready."
              route="/live"
              accent={C.purple}
              badge="LIVE ROOM"
              image="/tmi-curated/gameshow-36.jpg"
            />
          </div>
        </motion.div>

        <Divider color={C.fuchsia} />

        {/* ── SPONSOR & ADVERTISER ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SectionLabel text="Sponsor & Advertiser Economy" color={C.fuchsia} />
          <SectionHeadline color={C.fuchsia}>Full B2B Sponsor Platform</SectionHeadline>
          <p
            style={{
              margin: '0 0 28px',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            40+ sponsor brands integrated. Billboard inventory, campaign ROI analytics, venue sponsorships, battle title sponsorships, and rotating digital ad placements.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
            {[
              '/sponsors/aether-tech.svg',
              '/sponsors/hyperbeats.svg',
              '/sponsors/pulse-audio.svg',
              '/sponsors/neon-drip.svg',
              '/sponsors/nextwave.svg',
              '/sponsors/luxora.svg',
              '/sponsors/drift-motors.svg',
              '/sponsors/flare-energy.svg',
              '/sponsors/sonicgrid.svg',
              '/sponsors/volta-energy.svg',
              '/sponsors/gridtech.svg',
              '/sponsors/urbanvibe.svg',
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,45,170,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <ImageSlotWrapper imageId="img-7z8i8" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              </div>
            ))}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,45,170,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
              }}
            >
              +28
            </div>
          </div>
          <Link href="/sponsors" style={{ textDecoration: 'none' }}>
            <div
              style={{
                marginTop: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                letterSpacing: '0.2em',
                color: C.fuchsia,
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                fontWeight: 700,
                border: `1px solid ${C.fuchsia}40`,
                borderRadius: 6,
                padding: '8px 18px',
              }}
            >
              VIEW ALL SPONSORS →
            </div>
          </Link>
        </motion.div>

        <Divider color={C.green} />

        {/* ── LIVE ROOMS & SOCIAL ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionLabel text="Live Rooms · Messaging · Social" color={C.purple} />
          <SectionHeadline color={C.purple}>Real-Time Social & Live Infrastructure</SectionHeadline>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <SurfaceCard
              title="Live Room Engine"
              description="Lobby queue, seat grid, stage viewport, reaction canvas, tip rail, crowd zones. Full 3D venue environment."
              route="/live"
              accent={C.purple}
              badge="REAL-TIME"
            />
            <SurfaceCard
              title="Messaging & Bubbles"
              description="Direct messages, room chat, fan-to-artist bubbles, battle trash talk, cypher chat channels."
              route="/messages"
              accent={C.cyan}
              badge="SOCIAL"
            />
            <SurfaceCard
              title="Feed & Social Graph"
              description="Artist feeds, fan follows, battle recaps, cypher highlights, achievement shares."
              route="/feed"
              accent={C.fuchsia}
              badge="FEED"
            />
            <SurfaceCard
              title="Rewards & Achievements"
              description="XP system, achievement unlocks, fan loyalty badges, battle winner trophies, season crowns."
              route="/rewards"
              accent={C.gold}
              badge="LOYALTY"
            />
          </div>
        </motion.div>

        <Divider color={C.green} />

        {/* ── SOFT-LAUNCH READINESS BOARD ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <SectionLabel text="Soft-Launch Readiness Board" color={C.green} />
          <SectionHeadline color={C.green}>System Truth — May 2026</SectionHeadline>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 32,
              marginTop: 24,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: 12,
                padding: '24px 28px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.green, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", fontWeight: 700, marginBottom: 16 }}>
                INFRASTRUCTURE
              </div>
              <StatusRow label="Core Infrastructure" status="GREEN" />
              <StatusRow label="Route Layer (10 routes)" status="GREEN" />
              <StatusRow label="Responsive Layer (Mobile + TV)" status="GREEN" />
              <StatusRow label="Asset Hydration" status="GREEN" />
              <StatusRow label="TypeScript Compile" status="GREEN" />
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: 12,
                padding: '24px 28px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.gold, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", fontWeight: 700, marginBottom: 16 }}>
                HOMEPAGE SURFACES
              </div>
              <StatusRow label="Home 1 — Magazine & Discovery" status="GREEN" />
              <StatusRow label="Home 2 — Editorial & News" status="GREEN" />
              <StatusRow label="Home 3 — Live World" status="GREEN" />
              <StatusRow label="Home 4 — Sponsor Economy" status="GREEN" />
              <StatusRow label="Home 5 — Battles & Cyphers" status="GREEN" />
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: 12,
                padding: '24px 28px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.cyan, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", fontWeight: 700, marginBottom: 16 }}>
                PLATFORM SYSTEMS
              </div>
              <StatusRow label="Magazine" status="GREEN" />
              <StatusRow label="Games / Battles / Cyphers" status="GREEN" />
              <StatusRow label="Sponsor & Advertiser" status="GREEN" />
              <StatusRow label="Ticketing Engine" status="GREEN" />
              <StatusRow label="Messaging & Social" status="GREEN" />
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: 12,
                padding: '24px 28px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.fuchsia, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", fontWeight: 700, marginBottom: 16 }}>
                FINANCIAL GATES
              </div>
              <StatusRow label="Finance Engine (Stripe)" status="GREEN" />
              <StatusRow label="Success Flow" status="GREEN" />
              <StatusRow label="Refund Rollback" status="GREEN" />
              <StatusRow label="Idempotency / Replay" status="GREEN" />
              <StatusRow label="Stripe Transport (live keys)" status="YELLOW" />
              <StatusRow label="Production Deploy Smoke" status="PENDING" />
            </div>
          </div>
        </motion.div>

        <Divider color={C.cyan} />

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', padding: '20px 0 40px' }}
        >
          <SectionLabel text="Ready for Engagement" color={C.gold} />
          <h2
            style={{
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
              fontSize: 'clamp(32px, 5vw, 56px)',
              letterSpacing: '0.05em',
              color: '#fff',
              margin: '0 0 16px',
            }}
          >
            Join The Musician's Index
          </h2>
          <p
            style={{
              margin: '0 0 32px',
              fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
              color: 'rgba(255,255,255,0.6)',
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Soft-launch ready. Platform proven. Two gates from production.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                  color: '#fff',
                  fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
                  fontSize: 15,
                  letterSpacing: '0.15em',
                  padding: '14px 36px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                GET ACCESS
              </div>
            </Link>
            <Link href="/advertise" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  border: `1px solid ${C.gold}60`,
                  color: C.gold,
                  fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
                  fontSize: 15,
                  letterSpacing: '0.15em',
                  padding: '14px 36px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                SPONSOR / ADVERTISE
              </div>
            </Link>
            <Link href="/booking" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  border: `1px solid rgba(255,255,255,0.2)`,
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
                  fontSize: 15,
                  letterSpacing: '0.15em',
                  padding: '14px 36px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                BOOK A VENUE
              </div>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
