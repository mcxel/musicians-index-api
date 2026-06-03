'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#FF2DAA', gold: '#FFD700', cyan: '#00FFFF', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };

interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }

export default function PerformerProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json()).then((d: Session) => { setSession(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;

  const name = session?.user?.displayName ?? session?.user?.email?.split('@')[0] ?? 'Performer';

  const ACTIONS = [
    { label: 'Control Room', icon: '🎙', href: '/hub/performer',     color: C.accent  },
    { label: 'Go Live',      icon: '📡', href: '/live/go-live',      color: '#FF4444' },
    { label: 'Studio',       icon: '🎤', href: '/performer/studio',  color: C.gold    },
    { label: 'Cypher',       icon: '⚡', href: '/live/cypher',       color: C.cyan    },
    { label: 'Battle',       icon: '⚔️', href: '/live/battle',      color: C.accent  },
    { label: 'Bookings',     icon: '📅', href: '/booking',           color: C.purple  },
    { label: 'Analytics',    icon: '📊', href: '/dashboard/performer', color: C.green },
    { label: 'Messages',     icon: '💬', href: '/messages',          color: C.cyan    },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #050815, #1a0d1a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,45,170,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.accent}44`, flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.accent, fontWeight: 800, marginBottom: 4 }}>PERFORMER PROFILE</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{name}</h1>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{session?.tier ?? 'FREE'}</span>
              <Link href={`/performer/studio`} style={{ fontSize: 11, color: C.accent, textDecoration: 'none' }}>Open Studio →</Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Shows Done',    value: '0', icon: '🎭', color: C.accent  },
            { label: 'Battle Wins',   value: '0', icon: '🏆', color: C.gold    },
            { label: 'Total Tips',    value: '$0', icon: '💸', color: C.green  },
            { label: 'XP Rank',       value: '—', icon: '⚡', color: C.cyan   },
          ].map(s => (
            <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, marginTop: 3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>PERFORMER TOOLS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: a.color }}>{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
