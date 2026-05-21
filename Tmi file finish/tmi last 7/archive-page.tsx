/**
 * season/[seasonId]/archive/page.tsx
 * Repo: apps/web/src/app/contest/season/[seasonId]/archive/page.tsx
 * Action: CREATE | Wave: W4
 */
import type { Metadata } from 'next';

interface ArchivePageProps {
  params: { seasonId: string };
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  return { title: `Season ${params.seasonId} Archive | Contest | TMI` };
}

export default async function SeasonArchivePage({ params }: ArchivePageProps) {
  // TODO: const archive = await fetch(`/api/contest/seasons/${params.seasonId}/archive`).then(r => r.json());

  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <a href={`/contest/season/${params.seasonId}`} style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          ← Back to Season {params.seasonId}
        </a>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#00e5ff', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Archive
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>
          Season {params.seasonId} — Results
        </h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Winners, highlights, and complete results from this season.
        </p>

        {/* Winners section */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,215,0,.15)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffd700', margin: '0 0 16px' }}>🏆 Winners</h2>
          {/* TODO: render WinnerRevealPanel in replay mode with season winners */}
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>
            Wire to GET /api/contest/seasons/{params.seasonId}/winners for winner data.
          </p>
        </div>

        {/* Past entries section */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>All Participants</h2>
          {/* TODO: render ContestDiscoveryGrid with archived entries */}
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>
            Wire to GET /api/contest/seasons/{params.seasonId}/entries for participant data.
          </p>
        </div>
      </div>
    </main>
  );
}
