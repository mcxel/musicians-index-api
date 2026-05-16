import type { Metadata } from 'next';
import Link from 'next/link';
import { ARTIST_SEED } from '@/lib/artists/artistSeed';
import PerformerGoLiveButton from '@/components/performer/PerformerGoLiveButton';
import {
  closeAndDeriveSession,
  type PerformerBridgeDelta,
} from '@/lib/performer/PerformerAnalyticsBridge';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} — Performer Dashboard | TMI` };
}

function sp(val: string | string[] | undefined): string | null {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val[0] ?? null;
  return null;
}

const STAT_DEFS = [
  { label: 'Followers',     icon: '👥', color: '#FF2DAA' },
  { label: 'Total Earned',  icon: '💵', color: '#00FF88' },
  { label: 'Room Plays',    icon: '🎙️', color: '#00FFFF' },
  { label: 'Tips Received', icon: '💸', color: '#AA2DFF' },
  { label: 'Live Sessions', icon: '🔴', color: '#FF9500' },
  { label: 'Heat Score',    icon: '🔥', color: '#FFD700' },
] as const;

export default async function PerformerSlugDashboardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const raw = searchParams ? await searchParams : {};
  const returnedFrom = sp(raw['returnedFrom']);
  const sid = sp(raw['sid']);

  // Read analytics delta once — bridge closes session, derives stats, clears record atomically
  let delta: PerformerBridgeDelta | null = null;
  if (returnedFrom && sid) {
    delta = await closeAndDeriveSession(sid);
  }

  const performer = ARTIST_SEED.find((a) => a.id === slug);
  const displayName = performer?.name ?? slug;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>

      {/* Analytics delta panel — shown once after returning from a live session */}
      {delta && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,45,170,0.08), rgba(0,255,255,0.04))',
            border: '1px solid rgba(255,45,170,0.35)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#FF2DAA' }}>
                SESSION ANALYTICS — ROOM {(returnedFrom ?? '').toUpperCase()}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 8, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>
                DEV ONLY · in-memory
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 10,
            }}>
              {[
                { label: 'Duration',     value: `${Math.round(delta.durationMs / 1000)}s`,     icon: '⏱️', color: '#00FFFF' },
                { label: 'Fans Seated',  value: String(delta.fansSeated),                      icon: '🪑', color: '#FF2DAA' },
                { label: 'Reactions',    value: String(delta.reactions),                       icon: '⚡', color: '#AA2DFF' },
                { label: 'Emotes',       value: String(delta.emotes),                          icon: '🎭', color: '#FF9500' },
                { label: 'Chat',         value: String(delta.chat),                            icon: '💬', color: '#00FFFF' },
                { label: 'Tips',         value: String(delta.tips),                            icon: '💸', color: '#00FF88' },
                { label: 'Tip Revenue',  value: `$${(delta.tipAmountCents / 100).toFixed(2)}`, icon: '💵', color: '#FFD700' },
                { label: 'Heat Score',   value: String(delta.heatScore),                       icon: '🔥', color: '#FF9500' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${s.color}20`,
                  borderRadius: 10,
                  padding: '12px 12px',
                }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dashboard header */}
      <section style={{
        padding: '36px 24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Link
            href={`/performers/${slug}`}
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            ← Performer Profile
          </Link>
          <div style={{ marginLeft: 'auto' }}>
            <PerformerGoLiveButton performerSlug={slug} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56,
            background: 'radial-gradient(circle, #FF2DAA40, transparent)',
            border: '2px solid #FF2DAA40',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>🎤</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FF2DAA', fontWeight: 800, marginBottom: 4 }}>
              PERFORMER DASHBOARD
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{displayName}</h1>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              Season 1 · Active · DEV SESSION
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '28px 24px 0',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10,
      }}>
        {STAT_DEFS.map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${s.color}20`,
            borderRadius: 10, padding: '14px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>—</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Quick links + session log */}
      <section style={{
        maxWidth: 900, margin: '24px auto 0', padding: '0 24px',
        display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 14 }}>
            QUICK ACTIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Performer Article', href: `/performers/${slug}/article`, color: '#FF2DAA' },
              { label: 'Performer Lobby',   href: `/performers/${slug}/lobby`,   color: '#00FFFF' },
              { label: 'Performer Memory',  href: `/performers/${slug}/memory`,  color: '#AA2DFF' },
              { label: 'Artist Profile',    href: `/artists/${slug}`,            color: '#00FF88' },
              { label: 'Artist Dashboard',  href: '/artists/dashboard',          color: '#FFD700' },
            ].map((l) => (
              <Link
                key={l.label} href={l.href}
                style={{
                  textDecoration: 'none', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${l.color}15`,
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{l.label}</span>
                <span style={{ fontSize: 12, color: l.color }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 14 }}>
            SESSION LOG
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '14px',
            fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8,
          }}>
            {delta
              ? `Last session: room ${returnedFrom} · ${Math.round(delta.durationMs / 1000)}s · ${delta.fansSeated} fans · heat ${delta.heatScore}`
              : 'No session data — go live to populate analytics.'}
          </div>
        </div>
      </section>

    </main>
  );
}
