"use client";

// BroadcastOpportunityFeed — fills idle wall space with real platform
// opportunities (Rule 12 tier 2: internal platform promotion). Every entry
// routes to a real destination — no fake events, no fabricated counts.
//
// Renders as a continuously scrolling ticker (digital bulletin board): every
// opportunity flows past one after another in a single strip, not one item
// at a time with a hard swap.
const OPPORTUNITIES: Array<{ icon: string; label: string; desc: string; href: string }> = [
  { icon: '🎤', label: 'Go Live',              desc: 'Start a broadcast and claim the wall',      href: '/live/go' },
  { icon: '⚔️', label: 'Enter a Battle',        desc: 'Head-to-head on the main stage',            href: '/battles' },
  { icon: '🎵', label: 'Submit Your Music',     desc: 'Get into rotation and editorial review',    href: '/submit' },
  { icon: '📰', label: 'Read the Magazine',     desc: 'News, battles, and editorials',             href: '/home/2' },
  { icon: '🎥', label: 'Browse Live Rooms',     desc: 'See every open room in the lobby',          href: '/live/lobby' },
  { icon: '🏆', label: 'Check the Rankings',    desc: 'Who holds the crown right now',             href: '/rankings' },
  { icon: '🤝', label: 'Sponsor an Artist',     desc: 'Fund prizes and back rising talent',        href: '/sponsors/advertise' },
];

function OpportunityChip({ item }: { item: (typeof OPPORTUNITIES)[number] }) {
  return (
    <a
      href={item.href}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        border: '1px solid rgba(0,255,255,0.35)',
        background: 'linear-gradient(120deg, rgba(0,255,255,0.08), rgba(170,45,255,0.08))',
        padding: '10px 16px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', color: 'rgba(0,255,255,0.8)' }}>OPPORTUNITY</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
          {item.label} <span style={{ fontWeight: 500, color: 'rgba(235,235,255,0.6)' }}>— {item.desc}</span>
        </span>
      </div>
    </a>
  );
}

export function BroadcastOpportunityFeed({ speedSeconds = 32 }: { speedSeconds?: number }) {
  // Duplicate the list once so the marquee can loop seamlessly at -50% translateX.
  const looped = [...OPPORTUNITIES, ...OPPORTUNITIES];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      <style>{`
        @keyframes tmiOpportunityScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tmi-opportunity-track:hover { animation-play-state: paused; }
      `}</style>
      <div
        className="tmi-opportunity-track"
        style={{
          display: 'flex',
          gap: 10,
          width: 'max-content',
          animation: `tmiOpportunityScroll ${speedSeconds}s linear infinite`,
        }}
      >
        {looped.map((item, i) => (
          <OpportunityChip key={`${item.href}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default BroadcastOpportunityFeed;
