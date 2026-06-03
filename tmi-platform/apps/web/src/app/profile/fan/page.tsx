'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#00FFFF', fuchsia: '#FF2DAA', gold: '#FFD700', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };

interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }

const QUICK_ACTIONS = [
  { label: 'Live Rooms',    icon: '🎭', href: '/live/rooms',     color: C.accent  },
  { label: 'Beat Market',   icon: '🎵', href: '/beats',          color: C.fuchsia },
  { label: 'NFT Gallery',   icon: '🖼',  href: '/nft',           color: C.purple  },
  { label: 'Vote Now',      icon: '🗳',  href: '/vote',          color: C.gold    },
  { label: 'Messages',      icon: '💬',  href: '/messages',      color: C.green   },
  { label: 'My Tickets',    icon: '🎟',  href: '/tickets',       color: C.accent  },
  { label: 'Leaderboard',   icon: '🏆',  href: '/rankings',      color: C.gold    },
  { label: 'Rewards',       icon: '🎁',  href: '/rewards',       color: C.fuchsia },
];

export default function FanProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then((d: Session) => { setSession(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;

  const name = session?.user?.displayName ?? session?.user?.email?.split('@')[0] ?? 'Fan';
  const tier = session?.tier ?? 'FREE';

  const TIER_COLORS: Record<string, string> = { DIAMOND: '#00FFFF', GOLD: '#FFD700', PLATINUM: '#E5E4E2', SILVER: '#C0C0C0', BRONZE: '#CD7F32', PRO: '#AA2DFF', FREE: '#666' };
  const tierColor = TIER_COLORS[tier] ?? '#666';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #050815, #0d0d3a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(0,229,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.fuchsia}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.accent}44`, flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.accent, fontWeight: 800, marginBottom: 4 }}>FAN PROFILE</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>{name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 11, color: tierColor, fontWeight: 700, letterSpacing: 2 }}>{tier} MEMBER</span>
              {!session?.authenticated && <Link href="/auth" style={{ fontSize: 11, color: C.fuchsia, textDecoration: 'none', fontWeight: 700 }}>Sign In to unlock all features</Link>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 24px', maxWidth: 900, margin: '0 auto' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'XP Points', value: '0', icon: '⚡', color: C.gold },
            { label: 'Battles Watched', value: '0', icon: '⚔️', color: C.fuchsia },
            { label: 'Tips Sent', value: '$0', icon: '💸', color: C.green },
            { label: 'Badges Earned', value: '0', icon: '🏅', color: C.accent },
          ].map(s => (
            <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, marginTop: 3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>QUICK ACCESS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: a.color, letterSpacing: 0.5 }}>{a.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        {(!session?.authenticated || tier === 'FREE') && (
          <div style={{ background: `linear-gradient(135deg, ${C.fuchsia}22, ${C.accent}11)`, border: `1px solid ${C.fuchsia}44`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Upgrade to Premium</div>
              <div style={{ color: C.dim, fontSize: 13 }}>Unlock all rooms, exclusive emotes, and earn 3× XP on every event.</div>
            </div>
            <Link href="/pricing" style={{ background: C.fuchsia, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade Now</Link>
          </div>
        )}
      </div>
    </div>
  );
}
