/**
 * leaderboard/page.tsx → apps/web/src/app/contest/leaderboard/page.tsx
 */
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Leaderboard | Contest | TMI' };

export default function LeaderboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ffd700', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Leaderboard</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Current standings for the active contest season.</p>
        {/* TODO: Fetch GET /api/contest/leaderboard and render ScoreboardOverlay or ranked list */}
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <p>Contest season opens August 8. Check back then to see the leaderboard.</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * sponsors/page.tsx → apps/web/src/app/contest/sponsors/page.tsx
 */
export function SponsorsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Sponsor the Contest</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Back the next generation of talent. 10 local + 10 major sponsors qualify an artist.
          You get visibility on their profile and during live events.
        </p>
        {/* TODO: render SponsorPackageTierCard and SponsorContestPanel components */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[['Local Bronze', '$50/season'], ['Local Silver', '$100/season'], ['Local Gold', '$250/season'], ['Major Bronze', '$1,000/season'], ['Major Silver', '$5,000/season'], ['Major Gold', '$10,000/season'], ['Title Sponsor', '$25,000+']].map(([tier, price]) => (
            <div key={tier} style={{ padding: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{tier}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ff6b1a' }}>{price}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * host/page.tsx → apps/web/src/app/contest/host/page.tsx
 */
'use client';
export function HostPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Ray Journey</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Your host for the Grand Platform Contest.</p>
        {/* TODO: Import RayJourneyHost and HostCuePanel once placed in components/host/ */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,107,26,.2)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎙</div>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Ray Journey is ready to host. Wire RayJourneyHost component here.</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * admin/page.tsx → apps/web/src/app/contest/admin/page.tsx
 * Requires: admin/layout.tsx must be placed FIRST (it's the guard)
 */
import type { Metadata as Metadata2 } from 'next';
export const metadata2: Metadata2 = { title: 'Contest Admin | TMI' };

export function AdminPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>Contest Admin</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Manage contestants, sponsors, seasons, and reveals.</p>
        {/* TODO: Fetch queue counts from API and display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[['Contestants Queue', '/contest/admin/contestants', '#ff6b1a'], ['Sponsors Queue', '/contest/admin/sponsors', '#00e5ff'], ['Reveal Controls', '/contest/admin/reveal', '#ffd700'], ['Seasons', '/contest/admin/seasons', '#00c853'], ['Payouts', '/contest/admin/payouts', '#c0c0c0'], ['Audit Log', '/contest/admin/audit', 'rgba(255,255,255,.5)']].map(([label, href, color]) => (
            <a key={String(label)} href={String(href)} style={{ padding: 20, background: '#0d1117', border: `1px solid ${String(color)}33`, borderRadius: 12, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: String(color) }}>{label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Manage →</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * season/[seasonId]/page.tsx → apps/web/src/app/contest/season/[seasonId]/page.tsx
 */
interface SeasonPageProps { params: { seasonId: string }; }
export function SeasonPage({ params }: SeasonPageProps) {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest Season</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Season {params.seasonId}</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Details for this contest season.</p>
        {/* TODO: fetch GET /api/contest/seasons/{seasonId} and render season details */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.3)' }}>Season data loading… wire to /api/contest/seasons/{params.seasonId}</p>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * season/[seasonId]/archive/page.tsx → apps/web/src/app/contest/season/[seasonId]/archive/page.tsx
 */
export function SeasonArchivePage({ params }: SeasonPageProps) {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#00e5ff', margin: '0 0 8px', textTransform: 'uppercase' }}>Archive</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Season {params.seasonId} — Archive</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Winners, highlights, and results from this season.</p>
        {/* TODO: fetch archive data and render past results */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.3)' }}>Archive loading… wire to /api/contest/seasons/{params.seasonId}/archive</p>
        </div>
      </div>
    </main>
  );
}
