'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XP_LEVELS, getLevelForXP, getProgressToNextLevel, XP_VALUES } from '@/lib/xp/xpEngine';
import { ACHIEVEMENT_REGISTRY } from '@/lib/xp/achievementRegistry';

const DEMO_XP = 3450;

const RECENT_XP_EVENTS = [
  { label: 'Performance Watched',    amount: XP_VALUES.room_attend,      icon: '📡', time: '2m ago'  },
  { label: 'Vote Cast',              amount: XP_VALUES.vote_cast,         icon: '🗳️', time: '5m ago'  },
  { label: 'Comment Posted',         amount: XP_VALUES.comment_posted,    icon: '💬', time: '12m ago' },
  { label: 'Daily Login',            amount: XP_VALUES.login_daily,       icon: '🔥', time: '1h ago'  },
  { label: 'Article Read',           amount: XP_VALUES.article_read,      icon: '📰', time: '2h ago'  },
  { label: 'Fan Club Joined',        amount: XP_VALUES.fan_club_join,     icon: '👑', time: '3h ago'  },
];

const PREVIEW_ACHIEVEMENTS = ACHIEVEMENT_REGISTRY.slice(0, 3);

export default function XPPage() {
  const [userXP] = useState(DEMO_XP);

  const currentLevel = getLevelForXP(userXP);
  const progress     = getProgressToNextLevel(userXP);

  return (
    <main style={{ background: '#050510', minHeight: '100vh', paddingBottom: 80, fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 0' }}>

        {/* Back nav */}
        <Link
          href="/dashboard"
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 12px' }}
        >
          ← Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginTop: 28, marginBottom: 40 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.3em', color: '#00FF88', marginBottom: 6 }}>
            TMI XP SYSTEM
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
            Your XP & Level
          </h1>
        </div>

        {/* Level card */}
        <div
          style={{
            background: `${currentLevel.color}0d`,
            border: `1px solid ${currentLevel.color}44`,
            borderRadius: 18,
            padding: '28px 28px 24px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>{currentLevel.icon}</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>LEVEL {currentLevel.level}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: currentLevel.color }}>{currentLevel.title}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                {userXP.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Total XP</div>
            </div>
          </div>

          {/* Progress bar */}
          {progress.nextLevel && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                <span>{currentLevel.title} ({currentLevel.minXP.toLocaleString()} XP)</span>
                <span>{progress.nextLevel.title} at {progress.nextLevel.minXP.toLocaleString()} XP</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 10, overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    width: `${progress.pct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${currentLevel.color}, ${progress.nextLevel.color})`,
                    borderRadius: 99,
                    transition: 'width 0.8s ease',
                    boxShadow: `0 0 10px ${currentLevel.color}80`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                <span>{progress.current.toLocaleString()} XP into this level</span>
                <span>{(progress.needed - progress.current).toLocaleString()} XP to go</span>
              </div>
            </>
          )}
          {!progress.nextLevel && (
            <div style={{ fontSize: 12, fontWeight: 800, color: currentLevel.color, textAlign: 'center', marginTop: 8 }}>
              MAX LEVEL — TMI Hall of Fame
            </div>
          )}
        </div>

        {/* Recent XP events */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            RECENT ACTIVITY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {RECENT_XP_EVENTS.map((evt) => (
              <div
                key={evt.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{evt.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{evt.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{evt.time}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#00FF88', flexShrink: 0, minWidth: 52, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  +{evt.amount} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All levels ladder */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            ALL LEVELS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {XP_LEVELS.map((lvl) => {
              const isActive = lvl.level === currentLevel.level;
              const isPast   = lvl.level < currentLevel.level;
              return (
                <div
                  key={lvl.level}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px',
                    background: isActive ? `${lvl.color}0d` : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${isActive ? `${lvl.color}44` : isPast ? `${lvl.color}20` : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 18, opacity: isPast || isActive ? 1 : 0.3 }}>{lvl.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 900 : 600, color: isActive ? lvl.color : isPast ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', flex: 1 }}>
                    Lv.{lvl.level} — {lvl.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums' }}>
                    {lvl.minXP.toLocaleString()} XP
                  </span>
                  {isActive && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: lvl.color, background: `${lvl.color}18`, border: `1px solid ${lvl.color}44`, borderRadius: 4, padding: '2px 7px' }}>
                      YOU
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement preview */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
              RECENT UNLOCKS
            </div>
            <Link href="/achievements" style={{ fontSize: 10, color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}>
              View All →
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PREVIEW_ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: `${a.color}0d`,
                  border: `1px solid ${a.color}30`, borderRadius: 10, flex: '1 1 200px',
                }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: a.color }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>+{a.xpBonus} XP bonus</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/achievements" style={{ padding: '11px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.25)', color: '#00FFFF', textDecoration: 'none' }}>
            All Achievements
          </Link>
          <Link href="/leaderboard" style={{ padding: '11px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', textDecoration: 'none' }}>
            Leaderboard
          </Link>
          <Link href="/vote" style={{ padding: '11px 22px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(170,45,255,0.1)', border: '1px solid rgba(170,45,255,0.25)', color: '#AA2DFF', textDecoration: 'none' }}>
            Earn XP — Vote Now
          </Link>
        </div>
      </div>
    </main>
  );
}
