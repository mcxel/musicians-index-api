'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActivityTimelineEngine } from '@/lib/timeline/ActivityTimelineEngine';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

const XP_ACTIONS = [
  { label: 'Watch a live room', xp: 10, link: '/home/3' },
  { label: 'Vote in a battle', xp: 25, link: '/home/5' },
  { label: 'Share a playlist', xp: 15, link: '/beats' },
  { label: 'Read an article', xp: 5, link: '/magazine' },
  { label: 'Attend a cypher', xp: 30, link: '/cypher/stage' },
];

const QUICK_LINKS = [
  { label: '🎤 Live Rooms', href: '/home/3', color: '#FF2DAA' },
  { label: '⚔️ Battles', href: '/home/5', color: '#FFD700' },
  { label: '📰 Magazine', href: '/magazine', color: '#00FFFF' },
  { label: '🎧 Stream & Win', href: '/live/radio', color: '#00FF88' },
  { label: '🏆 Rankings', href: '/home/ranking', color: '#AA2DFF' },
  { label: '🎟 Tickets', href: '/tickets', color: '#FF8C00' },
  { label: '🧬 Avatar Lobby', href: '/avatar', color: '#AA2DFF' },
  { label: '🛍️ Avatar Store', href: '/avatar/shop', color: '#00FFFF' },
  { label: '🧠 Memory Wall', href: '/avatar/showcase', color: '#FFD700' },
];

export default function FanHubPage() {
  const { totalXp, trackAction } = useGamificationEngine();
  const xp = totalXp;
  const [events, setEvents] = useState<ReturnType<typeof ActivityTimelineEngine.getEvents>>([]);
  const [playlists] = useState([
    { name: 'Late Night Cypher Vibes', tracks: 24, shared: false },
    { name: 'Battle Week Anthems', tracks: 17, shared: false },
  ]);

  useEffect(() => {
    setEvents(ActivityTimelineEngine.getEvents('current-user'));
    const handler = () => setEvents(ActivityTimelineEngine.getEvents('current-user'));
    window.addEventListener('TMI_TIMELINE_UPDATE', handler);
    return () => window.removeEventListener('TMI_TIMELINE_UPDATE', handler);
  }, []);

  const earnXp = (amount: number, label: string) => {
    const actionMap: Record<string, import('@/hooks/useGamificationEngine').GamificationAction> = {
      'Watch a live room': 'JOIN_STAGE',
      'Vote in a battle':  'VOTE_BATTLE',
      'Share a playlist':  'SEND_MESSAGE',
      'Read an article':   'READ_ARTICLE',
      'Attend a cypher':   'JOIN_STAGE',
    };
    trackAction(actionMap[label] ?? 'LOGIN_DAILY');
    ActivityTimelineEngine.addEvent({ userId: 'current-user', type: 'EVENT_JOINED', label: `✦ ${label}`, xpEarned: amount });
  };

  const xpLevel = Math.floor(xp / 1000) + 1;
  const xpProgress = ((xp % 1000) / 1000) * 100;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'rgba(8,14,38,0.98)', borderBottom: '1px solid rgba(255,107,0,0.3)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fan Theater</h1>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>Watch · Vote · Curate · Earn</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/home/3" style={{ background: '#FF2DAA', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 800, textDecoration: 'none', fontSize: 11, letterSpacing: '0.1em' }}>
            ● WATCH LIVE
          </Link>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid #00FF88', padding: '6px 16px', borderRadius: 20, fontWeight: 900, fontSize: 11 }}>
              ⭐ {xp.toLocaleString()} XP
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Level {xpLevel} Fan</div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div style={{ background: 'rgba(0,255,136,0.05)', borderBottom: '1px solid rgba(0,255,136,0.1)', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 10, color: '#00FF88', fontWeight: 700, whiteSpace: 'nowrap' }}>LVL {xpLevel}</div>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${xpProgress}%`, height: '100%', background: 'linear-gradient(90deg, #00FF88, #00FFFF)', borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{xp % 1000} / 1000 XP to next level</div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${link.color}22`, borderRadius: 10, padding: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 15 }}>{link.label.split(' ')[0]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: link.color }}>{link.label.slice(link.label.indexOf(' ') + 1)}</span>
              </Link>
            ))}
          </div>

          {/* Personal Playlists */}
          <div style={{ background: 'rgba(255,107,0,0.03)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, color: '#FF6B00', margin: 0 }}>My Playlists</h2>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Share playlists → earn XP on every listen</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {playlists.map((pl, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 3 }}>{pl.name}</div>
                    <div style={{ fontSize: 10, color: '#00FF88', fontWeight: 700 }}>+15 XP per full listen · {pl.tracks} Tracks</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/live/radio" style={{ background: '#FF6B00', color: '#000', border: 'none', padding: '7px 14px', borderRadius: 4, fontWeight: 900, fontSize: 10, cursor: 'pointer', textDecoration: 'none' }}>▶ PLAY</Link>
                    <button onClick={() => earnXp(15, `Shared playlist: ${pl.name}`)} style={{ background: 'transparent', color: '#FF6B00', border: '1px solid #FF6B00', padding: '7px 12px', borderRadius: 4, fontWeight: 900, fontSize: 10, cursor: 'pointer' }}>🔗 SHARE</button>
                  </div>
                </div>
              ))}
            </div>

            <button style={{ background: 'transparent', border: '1px dashed rgba(255,107,0,0.5)', color: '#FF6B00', padding: '12px', borderRadius: 8, width: '100%', marginTop: 14, fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>
              + CREATE NEW PLAYLIST
            </button>
          </div>

          {/* Earn XP Actions */}
          <div style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 14, color: '#00FF88', margin: '0 0 14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Earn More XP</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {XP_ACTIONS.map((action, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 12 }}>{action.label}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#00FF88', fontSize: 11, fontWeight: 800 }}>+{action.xp} XP</span>
                    <Link href={action.link} onClick={() => earnXp(action.xp, action.label)} style={{ background: '#00FF88', color: '#000', padding: '5px 12px', borderRadius: 4, fontSize: 10, fontWeight: 900, textDecoration: 'none' }}>GO</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stream & Win */}
          <div style={{ background: 'rgba(0,255,255,0.03)', border: '1px solid rgba(0,255,255,0.25)', padding: 20, borderRadius: 12 }}>
            <h3 style={{ fontSize: 13, color: '#00FFFF', margin: '0 0 10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🎧 Stream & Win</h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>
              Earn XP for every track you stream. Full listens earn 10–30 XP. Share playlists to earn bonus points when friends listen.
            </p>
            <Link href="/live/radio" style={{ display: 'block', background: '#00FFFF', color: '#000', padding: '10px', borderRadius: 6, fontWeight: 900, fontSize: 11, textDecoration: 'none', textAlign: 'center', letterSpacing: '0.08em' }}>
              ▶ OPEN RADIO
            </Link>
          </div>

          {/* Activity Timeline */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, borderRadius: 12 }}>
            <h3 style={{ fontSize: 13, color: '#00E5FF', margin: '0 0 12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Activity</h3>
            {events.length === 0 ? (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>
                No activity yet — start earning XP!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {events.slice(0, 8).map((ev) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{ev.label}</span>
                    {ev.xpEarned ? <span style={{ color: '#00FF88', fontWeight: 700 }}>+{ev.xpEarned}</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fan Restrictions Notice */}
          <div style={{ background: 'rgba(255,45,170,0.04)', border: '1px solid rgba(255,45,170,0.2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>FAN ROLE INFO</div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Fans can watch, vote, curate playlists, and earn XP. Battle, cypher, and game submissions are reserved for Performers. <Link href="/onboarding/performer" style={{ color: '#FF2DAA' }}>Upgrade your role →</Link>
            </p>
          </div>

          {/* Upgrade CTA */}
          <Link href="/subscribe" style={{ display: 'block', background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF)', color: '#fff', padding: '16px', borderRadius: 12, fontWeight: 900, fontSize: 13, textDecoration: 'none', textAlign: 'center', letterSpacing: '0.06em' }}>
            ⚡ UPGRADE TO PRO<br/>
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Unlock unlimited features</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
