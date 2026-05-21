/**
 * sponsors/page.tsx
 * Repo: apps/web/src/app/contest/sponsors/page.tsx
 * Action: CREATE | Wave: W4
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sponsors | Contest | TMI' };

const SPONSOR_TIERS = [
  { tier: 'Local Bronze',  price: '$50/season',     type: 'local'  },
  { tier: 'Local Silver',  price: '$100/season',    type: 'local'  },
  { tier: 'Local Gold',    price: '$250/season',    type: 'local'  },
  { tier: 'Major Bronze',  price: '$1,000/season',  type: 'major'  },
  { tier: 'Major Silver',  price: '$5,000/season',  type: 'major'  },
  { tier: 'Major Gold',    price: '$10,000/season', type: 'major'  },
  { tier: 'Title Sponsor', price: '$25,000+',       type: 'title'  },
];

const TYPE_COLORS: Record<string, string> = {
  local: '#00e5ff',
  major: '#ffd700',
  title: '#ff6b1a',
};

export default function SponsorsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Contest
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Become a Sponsor</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Back the next generation of talent. Artists need 10 local + 10 major sponsors to qualify.
          Your name and logo appear on their profile and during live events.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 40 }}>
          {SPONSOR_TIERS.map(({ tier, price, type }) => (
            <div
              key={tier}
              style={{
                padding: '20px',
                background: '#0d1117',
                border: `1px solid ${TYPE_COLORS[type]}33`,
                borderRadius: 12,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: TYPE_COLORS[type] }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLORS[type], letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {type}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{tier}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: TYPE_COLORS[type] }}>{price}</div>
            </div>
          ))}
        </div>

        {/* TODO: import SponsorContestPanel and SponsorInvitePanel once components/sponsor/ is placed */}
        <div style={{
          padding: '32px', textAlign: 'center',
          background: '#0d1117', border: '1px solid rgba(255,107,26,.2)', borderRadius: 14,
        }}>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
            Log in to browse artists and back them as a sponsor.
          </p>
        </div>
      </div>
    </main>
  );
}
