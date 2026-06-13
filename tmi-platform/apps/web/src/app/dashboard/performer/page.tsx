'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActivityTimelineEngine } from '@/lib/timeline/ActivityTimelineEngine';

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

const STATS = [
  { label: 'XP Total',      value: '12,450', icon: '⭐', color: '#FFD700' },
  { label: 'Rank',          value: '#142',   icon: '🏆', color: '#00FFFF' },
  { label: 'Total Streams', value: '8.2K',   icon: '🎧', color: '#FF2DAA' },
  { label: 'Earnings',      value: '$320',   icon: '💵', color: '#00FF88' },
];

const ARENA_ACTIONS = [
  { label: 'BEAT BATTLE',    icon: '⚔️',  href: '/battles',         color: '#FF2DAA', desc: 'Enter ranked battles' },
  { label: 'CYPHER PIT',     icon: '🔥',  href: '/cypher/stage',    color: '#FFD700', desc: 'Join live cyphers' },
  { label: 'GAMES & SHOWS',  icon: '🎮',  href: '/games',           color: '#AA2DFF', desc: 'Challenges + game shows' },
  { label: 'UPLOAD TRACK',   icon: '⬆',   href: '/beats/upload',    color: '#00FFFF', desc: 'Add to your catalog' },
  { label: 'STREAM RADIO',   icon: '📡',  href: '/live/radio',      color: '#00FF88', desc: 'Join Stream & Win' },
  { label: 'NFT LAB',        icon: '🎨',  href: '/nft-lab',         color: '#FF9500', desc: 'Mint tracks as NFTs' },
];

const FREE_SLOTS = [
  { title: 'Pressure Wave', genre: 'Hip-Hop', status: 'active', streams: 412 },
  { title: 'Night Protocol', genre: 'Trap', status: 'pending', streams: 0 },
];

export default function PerformerHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [xp, setXp] = useState(12450);
  const [events, setEvents] = useState<ReturnType<typeof ActivityTimelineEngine.getEvents>>([]);
  const [isJudge, setIsJudge] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const rxIdRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        setUser(data.user);
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  useEffect(() => {
    setEvents(ActivityTimelineEngine.getEvents('current-user'));
    const handler = () => setEvents(ActivityTimelineEngine.getEvents('current-user'));
    window.addEventListener('TMI_TIMELINE_UPDATE', handler);
    return () => window.removeEventListener('TMI_TIMELINE_UPDATE', handler);
  }, []);

  const earnXp = useCallback((amount: number, label: string) => {
    setXp(prev => prev + amount);
    ActivityTimelineEngine.addEvent({ userId: 'current-user', type: 'EVENT_JOINED', label: `✦ ${label}`, xpEarned: amount });
  }, []);

  const fireReaction = useCallback((emoji: string) => {
    const id = ++rxIdRef.current;
    const x = 8 + Math.random() * 82;
    setReactions(prev => [...prev.slice(-8), { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 1500);
  }, []);

  const xpLevel = Math.floor(xp / 1000) + 1;
  const xpProgress = ((xp % 1000) / 1000) * 100;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#00FFFF', fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING PERFORMER STUDIO...</span>
    </div>
  );

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Performer';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes pf-float{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-70px) scale(.2);opacity:0}}
        @keyframes pf-pulse{0%,100%{box-shadow:0 0 4px #00FFFF}50%{box-shadow:0 0 20px #00FFFF,0 0 40px rgba(0,255,255,.2)}}
        @keyframes pf-blink{0%,100%{opacity:1}50%{opacity:0}}
        .pf-float{animation:pf-float 1.5s ease-out forwards}
        .pf-live-border{animation:pf-pulse 2s ease-in-out infinite}
        .pf-blink{animation:pf-blink 1.2s ease-in-out infinite}
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(0,255,255,0.3)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800 }}>PERFORMER STUDIO 🎤</div>
          <div style={{ fontSize: 14, fontWeight: 900, marginTop: 1 }}>{displayName}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid #00FF88', color: '#00FF88', padding: '5px 14px', borderRadius: 20, fontWeight: 900, fontSize: 11 }}>
            ⭐ {xp.toLocaleString()} XP · Lvl {xpLevel}
          </div>
          <button
            onClick={() => { setIsLive(l => !l); if (!isLive) earnXp(50, 'Went live'); }}
            style={{ fontSize: 10, padding: '6px 14px', background: isLive ? 'rgba(255,45,170,0.2)' : 'transparent', border: `1px solid ${isLive ? '#FF2DAA' : 'rgba(0,255,255,0.4)'}`, color: isLive ? '#FF2DAA' : '#00FFFF', borderRadius: 6, cursor: 'pointer', fontWeight: 800, letterSpacing: '0.05em' }}
          >
            {isLive ? '⏹ END SHOW' : '🔴 GO LIVE'}
          </button>
          <button
            onClick={() => setIsJudge(j => !j)}
            style={{ fontSize: 10, padding: '6px 14px', background: isJudge ? 'rgba(255,215,0,0.15)' : 'transparent', border: `1px solid ${isJudge ? '#FFD700' : 'rgba(255,255,255,0.15)'}`, color: isJudge ? '#FFD700' : 'rgba(255,255,255,0.4)', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
          >
            ⚖️ {isJudge ? 'JUDGE: ON' : 'JUDGE: OFF'}
          </button>
          <Link href="/settings" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>⚙️</Link>
        </div>
      </div>

      {/* Go Live Flash Banner */}
      {!isLive && (
        <div style={{ background: 'linear-gradient(90deg,rgba(255,45,170,0.18),rgba(0,255,255,0.1),rgba(255,45,170,0.18))', borderBottom: '1px solid rgba(255,45,170,0.5)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="pf-blink" style={{ fontSize: 16 }}>🔴</span>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>
              GO LIVE AND MAKE MONEY —{' '}
              <span style={{ color: '#FF2DAA' }}>your audience is waiting right now</span>
            </span>
          </div>
          <button
            onClick={() => { setIsLive(true); earnXp(50, 'Went live'); }}
            className="pf-live-border"
            style={{ flexShrink: 0, fontSize: 11, fontWeight: 900, padding: '7px 20px', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            🔴 GO LIVE NOW
          </button>
        </div>
      )}

      {/* XP Bar */}
      <div style={{ background: 'rgba(0,255,255,0.03)', borderBottom: '1px solid rgba(0,255,255,0.08)', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 9, color: '#00FFFF', fontWeight: 700 }}>LVL {xpLevel}</div>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${xpProgress}%`, height: '100%', background: 'linear-gradient(90deg,#00FFFF,#00FF88)', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{xp % 1000}/1000 to lvl {xpLevel + 1}</div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}30`, borderRadius: 10, padding: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live / Green Room */}
          {isLive ? (
            <div className="pf-live-border" style={{ border: '2px solid #00FFFF', borderRadius: 12, overflow: 'hidden', background: '#04000e', position: 'relative', height: 180 }}>
              <div style={{ position: 'absolute', inset: 10, background: 'linear-gradient(to bottom, #0a0020, #050510)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎤</div>
                  <div style={{ fontSize: 13, color: '#00FFFF', fontWeight: 900 }}>{displayName}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>215 viewers · $320 in tips</div>
                </div>
              </div>
              {reactions.map(r => (
                <div key={r.id} className="pf-float" style={{ position: 'absolute', bottom: 20, left: `${r.x}%`, fontSize: 20, pointerEvents: 'none', zIndex: 10 }}>{r.emoji}</div>
              ))}
              <div style={{ position: 'absolute', top: 10, right: 10, background: '#FF2DAA', borderRadius: 4, padding: '3px 10px', fontSize: 9, fontWeight: 800 }}>
                <span className="pf-blink" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#fff', marginRight: 5 }} />ON AIR
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 6 }}>
                {['🔥', '❤️', '⚡', '👑', '🎵'].map(em => (
                  <button key={em} onClick={() => fireReaction(em)} style={{ flex: 1, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, fontSize: 16, cursor: 'pointer', padding: '4px' }}>{em}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(0,255,255,0.03)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#00FFFF' }}>🟢 GREEN ROOM — OFFLINE</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Pre-show lobby. Hit GO LIVE when ready.</div>
                </div>
                <button onClick={() => { setIsLive(true); earnXp(50, 'Went live'); }} style={{ background: '#FF2DAA', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>
                  🔴 GO LIVE NOW
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(0,255,255,0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fans Waiting</div>
                  {['SkyFan94 · Gold', 'MusicLvr22 · Fan', 'BeatHead33 · Silver'].map(f => (
                    <div key={f} style={{ fontSize: 10, padding: '4px 8px', background: 'rgba(0,255,255,0.05)', borderRadius: 4, marginBottom: 4, color: 'rgba(255,255,255,0.7)' }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00FFFF', marginRight: 6 }} />{f}
                    </div>
                  ))}
                  <div style={{ fontSize: 9, color: '#00FFFF', marginTop: 4 }}>+ 847 more waiting...</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,215,0,0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Set List</div>
                  {['Big Moves', 'Night Frequency', 'Sound Pressure'].map((t, i) => (
                    <div key={t} style={{ display: 'flex', gap: 6, fontSize: 10, padding: '4px 0', color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ color: '#FFD700' }}>{i + 1}.</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Arena Submissions */}
          <div style={{ background: 'rgba(255,45,170,0.03)', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, color: '#FF2DAA', margin: 0, fontWeight: 900 }}>Arena Submissions</h2>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,45,170,0.2)', padding: '3px 10px', borderRadius: 10 }}>PERFORMER ONLY</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {ARENA_ACTIONS.map(a => (
                <Link key={a.href} href={a.href} onClick={() => earnXp(10, a.label)} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px', background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: a.color, letterSpacing: '0.08em' }}>{a.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stream & Win Playlist */}
          <div style={{ background: 'rgba(0,255,255,0.03)', border: '1px solid rgba(0,255,255,0.25)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, color: '#00FFFF', margin: 0 }}>Playlist Submissions</h2>
              <span style={{ fontSize: 10, color: '#00FFFF', fontWeight: 700 }}>1 / 2 free slots</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: '50%', height: '100%', background: '#00FFFF' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {FREE_SLOTS.map(s => (
                <div key={s.title} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.genre} · {s.streams} streams</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 900, color: s.status === 'active' ? '#00FF88' : '#FFD700', letterSpacing: '0.15em' }}>{s.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/beats/upload" style={{ flex: 1, background: '#00FFFF', color: '#000', border: 'none', padding: '11px', borderRadius: 6, fontWeight: 900, fontSize: 11, textDecoration: 'none', textAlign: 'center' }}>
                + ADD SONG (FREE)
              </Link>
              <Link href="/subscribe" style={{ flex: 1, background: 'transparent', color: '#FF2DAA', border: '1px solid #FF2DAA', padding: '11px', borderRadius: 6, fontWeight: 900, fontSize: 11, textDecoration: 'none', textAlign: 'center' }}>
                UPGRADE TO RUBY
              </Link>
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Judge availability */}
          <div style={{ background: isJudge ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isJudge ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>⚖️ JUDGE AVAILABILITY</div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 10px' }}>
              Verified performers can judge battles. Earn XP per vote cast.
            </p>
            <button onClick={() => setIsJudge(j => !j)} style={{ width: '100%', background: isJudge ? '#FFD700' : 'transparent', color: isJudge ? '#000' : '#FFD700', border: '1px solid #FFD700', padding: '9px', borderRadius: 6, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
              {isJudge ? '✓ AVAILABLE TO JUDGE' : 'SET AS AVAILABLE'}
            </button>
          </div>

          {/* Revenue */}
          <div style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Revenue</div>
            {[['Today', '$45'], ['This Week', '$320'], ['This Month', '$1,240'], ['All Time', '$3,845']].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ color: '#00FF88', fontWeight: 800 }}>{val}</span>
              </div>
            ))}
            <Link href="/dashboard/artist/earnings" style={{ display: 'block', marginTop: 10, background: '#00FF88', color: '#000', padding: '9px', borderRadius: 6, fontWeight: 900, fontSize: 10, textDecoration: 'none', textAlign: 'center' }}>
              VIEW PAYOUTS
            </Link>
          </div>

          {/* Quick links */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Links</div>
            {[
              { label: '🎤 My Beats', href: '/dashboard/beats', color: '#AA2DFF' },
              { label: '🏆 Rankings', href: '/home/ranking', color: '#FFD700' },
              { label: '📰 Magazine', href: '/magazine', color: '#00FFFF' },
              { label: '🎟 Tickets', href: '/tickets', color: '#FF9500' },
              { label: '💌 Messages', href: '/messages', color: '#FF2DAA' },
              { label: '👤 Profile', href: '/profile', color: '#00FF88' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', padding: '8px 10px', marginBottom: 6, background: `${l.color}08`, border: `1px solid ${l.color}20`, borderRadius: 7, fontSize: 11, fontWeight: 700, color: l.color, textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Activity Timeline */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#00E5FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Recent Activity</div>
            {events.length === 0 ? (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>
                Go live or submit to arenas to earn XP!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {events.slice(0, 8).map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{ev.label}</span>
                    {ev.xpEarned ? <span style={{ color: '#00FF88', fontWeight: 700 }}>+{ev.xpEarned}</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          <Link href="/subscribe" style={{ display: 'block', background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)', color: '#fff', padding: '14px', borderRadius: 12, fontWeight: 900, fontSize: 12, textDecoration: 'none', textAlign: 'center' }}>
            ⚡ UPGRADE TO RUBY PRO<br />
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>Unlimited slots, priority battles, NFT minting</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
