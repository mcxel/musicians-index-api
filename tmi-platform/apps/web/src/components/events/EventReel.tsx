'use client';

// TMI Event Reel — universal bottom strip, scrolls RIGHT (opposite to SponsorRail)
// Directive: shows Tonight | Tomorrow | This Weekend | Next Month | 6 Months Out
// One per page, zone prop disambiguates analytics

const SEED_EVENTS = [
  { id: 'e1', label: 'TONIGHT 8PM',     title: 'Monday Night Cypher',      venue: 'Main Arena',       accent: '#FF2DAA' },
  { id: 'e2', label: 'TOMORROW',         title: 'Comedy Showcase',          venue: 'Club Room',        accent: '#FFD700' },
  { id: 'e3', label: 'THIS FRIDAY',      title: 'World Dance Party',        venue: 'Dance Floor',      accent: '#AA2DFF' },
  { id: 'e4', label: 'THIS SATURDAY',    title: 'Beat Producer Battle',     venue: 'Studio Stage',     accent: '#00FFFF' },
  { id: 'e5', label: 'NEXT MONTH',       title: 'July Championship',        venue: 'Championship Arena', accent: '#00FF88' },
  { id: 'e6', label: '6 MONTHS OUT',     title: 'Year-End Awards Night',    venue: 'Grand Stage',      accent: '#FFD700' },
  { id: 'e7', label: 'THIS WEEKEND',     title: 'Hip-Hop Showcase',         venue: 'Main Arena',       accent: '#FF2DAA' },
  { id: 'e8', label: 'NEXT WEEK',        title: 'Freestyle Friday',         venue: 'Cypher Arena',     accent: '#AA2DFF' },
];

interface EventReelProps {
  zone: string;
  events?: typeof SEED_EVENTS;
}

export default function EventReel({ zone: _zone, events = SEED_EVENTS }: EventReelProps) {
  const list = [...events, ...events]; // duplicate for seamless loop

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        background: 'rgba(5,5,16,0.92)',
        borderTop: '1px solid rgba(255,215,0,0.15)',
        padding: '5px 0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <style>{`
        @keyframes eventReelScroll {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
      `}</style>
      <div
        style={{
          display: 'inline-flex',
          gap: 0,
          animation: 'eventReelScroll 55s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        {list.map((ev, i) => (
          <div
            key={`${ev.id}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 20px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              style={{
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: '0.15em',
                color: ev.accent,
                fontFamily: "'Inter', sans-serif",
                textTransform: 'uppercase',
              }}
            >
              {ev.label}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {ev.title}
            </span>
            <span
              style={{
                fontSize: 8,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              · {ev.venue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
