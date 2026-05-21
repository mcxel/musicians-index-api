/**
 * season/[seasonId]/page.tsx
 * Repo: apps/web/src/app/contest/season/[seasonId]/page.tsx
 * Action: CREATE | Wave: W4
 */
import type { Metadata } from 'next';

interface SeasonPageProps {
  params: { seasonId: string };
}

export async function generateMetadata({ params }: SeasonPageProps): Promise<Metadata> {
  return { title: `Season ${params.seasonId} | Contest | TMI` };
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  // TODO: const season = await fetch(`/api/contest/seasons/${params.seasonId}`).then(r => r.json());

  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Contest
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Season {params.seasonId}</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Details, contestants, sponsors, and results for this contest season.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            ['Status', 'Upcoming'],
            ['Registration Opens', 'August 8'],
            ['Local Sponsors Needed', '10'],
            ['Major Sponsors Needed', '10'],
          ].map(([label, val]) => (
            <div key={String(label)} style={{ padding: '16px 20px', background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* TODO: render ContestDiscoveryGrid with entries for this season */}
        <div style={{ padding: '40px', textAlign: 'center', background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14 }}>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>
            Wire to GET /api/contest/seasons/{params.seasonId} for full season data.
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <a href={`/contest/season/${params.seasonId}/archive`} style={{ fontSize: 13, color: '#00e5ff', textDecoration: 'none' }}>
            View season archive →
          </a>
        </div>
      </div>
    </main>
  );
}
