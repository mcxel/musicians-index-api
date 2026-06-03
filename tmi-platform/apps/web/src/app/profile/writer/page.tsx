'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#00FFFF', fuchsia: '#FF2DAA', gold: '#FFD700', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };
interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }

export default function WriterProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' }).then(r => r.json()).then((d: Session) => { setSession(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;
  const name = session?.user?.displayName ?? session?.user?.email?.split('@')[0] ?? 'Writer';
  const ACTIONS = [
    { label: 'Write Article', icon: '✍', href: '/articles/write',      color: C.accent  },
    { label: 'My Articles',   icon: '📰', href: '/articles/writer',     color: C.fuchsia },
    { label: 'Magazine',      icon: '📖', href: '/magazine',            color: C.gold    },
    { label: 'Editorial',     icon: '🗞', href: '/editorial',           color: C.purple  },
    { label: 'Analytics',     icon: '📊', href: '/dashboard/writer',    color: C.green   },
    { label: 'Artist Profiles', icon: '🎤', href: '/artist',            color: C.accent  },
    { label: 'News',          icon: '📡', href: '/home/2',              color: C.fuchsia },
    { label: 'Messages',      icon: '💬', href: '/messages',            color: C.accent  },
  ];
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #050815, #00141a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(0,229,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.accent}44`, flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.accent, fontWeight: 800, marginBottom: 4 }}>WRITER / EDITORIAL</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{name}</h1>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{session?.tier ?? 'FREE'}</span>
              <Link href="/articles/write" style={{ fontSize: 11, color: C.accent, textDecoration: 'none' }}>Write New Article →</Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[{ label: 'Articles Written', value: '0', icon: '📰', color: C.accent }, { label: 'Total Views', value: '0', icon: '👁', color: C.gold }, { label: 'Comments', value: '0', icon: '💬', color: C.fuchsia }, { label: 'Featured', value: '0', icon: '⭐', color: C.purple }].map(s => (
            <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1.5, marginTop: 3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>EDITORIAL TOOLS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {ACTIONS.map(a => (<Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}><div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center' }}><div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div><div style={{ fontSize: 11, fontWeight: 700, color: a.color }}>{a.label}</div></div></Link>))}
        </div>
      </div>
    </div>
  );
}
