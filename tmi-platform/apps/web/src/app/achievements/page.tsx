import Link from 'next/link';
import { ACHIEVEMENT_REGISTRY } from '@/lib/xp/achievementRegistry';
import type { AchievementCategory } from '@/lib/xp/achievementRegistry';

const RARITY_CONFIG: Record<AchievementCategory, { label: string; color: string; bg: string; border: string }> = {
  activity:  { label: 'ACTIVITY',  color: '#00FFFF', bg: 'rgba(0,255,255,0.06)',   border: 'rgba(0,255,255,0.2)'   },
  social:    { label: 'SOCIAL',    color: '#00FF88', bg: 'rgba(0,255,136,0.06)',   border: 'rgba(0,255,136,0.2)'   },
  commerce:  { label: 'COMMERCE',  color: '#FFD700', bg: 'rgba(255,215,0,0.06)',   border: 'rgba(255,215,0,0.2)'   },
  milestone: { label: 'MILESTONE', color: '#AA2DFF', bg: 'rgba(170,45,255,0.06)', border: 'rgba(170,45,255,0.2)'  },
  exclusive: { label: 'EXCLUSIVE', color: '#FF2DAA', bg: 'rgba(255,45,170,0.06)', border: 'rgba(255,45,170,0.2)'  },
};

const CATEGORIES: AchievementCategory[] = ['activity', 'social', 'commerce', 'milestone', 'exclusive'];

const VISIBLE = ACHIEVEMENT_REGISTRY.filter((a) => !a.secret);
const DEMO_UNLOCKED = new Set(['first_login', 'first_room', 'first_vote', 'first_comment', 'profile_complete']);

export const metadata = { title: 'Achievements | TMI' };

export default function AchievementsPage() {
  const earned      = VISIBLE.filter((a) => DEMO_UNLOCKED.has(a.id));
  const totalPoints = earned.reduce((sum, a) => sum + a.xpBonus, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80, fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 0' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <Link href="/xp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← XP</Link>
          <Link href="/leaderboard" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Leaderboard</Link>
        </div>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.3em', color: '#FFD700', marginBottom: 6 }}>TMI</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, margin: 0 }}>Achievements</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Earn achievements by participating on The Musician&apos;s Index.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Earned',       value: `${earned.length} / ${VISIBLE.length}`, color: '#00FF88' },
            { label: 'XP Bonus',     value: totalPoints.toLocaleString() + ' XP',   color: '#FFD700' },
            { label: 'Categories',   value: CATEGORIES.length.toString(),            color: '#00FFFF' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            <span>Progress</span>
            <span>{Math.round((earned.length / VISIBLE.length) * 100)}% complete</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(earned.length / VISIBLE.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00FFFF, #AA2DFF)',
                borderRadius: 99,
                boxShadow: '0 0 8px rgba(0,255,255,0.5)',
              }}
            />
          </div>
        </div>

        {/* Achievements by category */}
        {CATEGORIES.map((cat) => {
          const items = VISIBLE.filter((a) => a.category === cat);
          if (items.length === 0) return null;
          const cfg = RARITY_CONFIG[cat];
          return (
            <div key={cat} style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: cfg.color }}>
                  {cfg.label}
                </div>
                <div style={{ flex: 1, height: 1, background: `${cfg.color}22` }} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
                  {items.filter((a) => DEMO_UNLOCKED.has(a.id)).length}/{items.length}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {items.map((ach) => {
                  const unlocked = DEMO_UNLOCKED.has(ach.id);
                  return (
                    <div
                      key={ach.id}
                      style={{
                        position: 'relative',
                        background:  unlocked ? cfg.bg : 'rgba(255,255,255,0.015)',
                        border:      `1px solid ${unlocked ? cfg.border : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: 12,
                        padding:     '16px',
                        opacity:     unlocked ? 1 : 0.5,
                      }}
                    >
                      {!unlocked && (
                        <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 12 }}>🔒</div>
                      )}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 28, flexShrink: 0 }}>{ach.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: unlocked ? cfg.color : 'rgba(255,255,255,0.4)', marginBottom: 3 }}>
                            {ach.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, marginBottom: 6 }}>
                            {ach.description}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#FFD700' }}>+{ach.xpBonus} XP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <Link href="/xp" style={{ padding: '11px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', textDecoration: 'none' }}>
            Your XP
          </Link>
          <Link href="/leaderboard" style={{ padding: '11px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.25)', color: '#00FFFF', textDecoration: 'none' }}>
            Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
