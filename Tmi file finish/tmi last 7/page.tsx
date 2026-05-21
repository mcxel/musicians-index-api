/**
 * leaderboard/page.tsx
 * Repo: apps/web/src/app/contest/leaderboard/page.tsx
 * Action: CREATE | Wave: W4
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Leaderboard | Contest | TMI' };

export default function LeaderboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ffd700', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Contest
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Leaderboard</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Current standings for the active contest season.
        </p>
        {/* TODO: import ScoreboardOverlay and fetch GET /api/contest/leaderboard */}
        <div style={{
          padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,.3)',
          background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <p>Contest season opens August 8. Standings appear here once the season begins.</p>
        </div>
      </div>
    </main>
  );
}
