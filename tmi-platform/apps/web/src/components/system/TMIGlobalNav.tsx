'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface SessionState {
  authenticated: boolean;
  user?: { id?: string; role?: string; tier?: string };
}

const ROLE_COLOR: Record<string, string> = {
  superadmin: '#FF2DAA',
  admin:      '#FF2DAA',
  artist:     '#FFD700',
  performer:  '#00FFFF',
  fan:        '#AA2DFF',
  venue:      '#FF6B35',
  promoter:   '#00FF88',
  advertiser: '#5CE1E6',
  sponsor:    '#FFD700',
  default:    '#ffffff',
};

const ROLE_PROFILE: Record<string, string> = {
  artist:    '/profile/artist',
  performer: '/profile/performer',
  fan:       '/profile/fan',
  venue:     '/profile/venue',
  promoter:  '/profile/promoter',
  advertiser:'/profile/advertiser',
  sponsor:   '/profile/sponsor',
  admin:     '/admin/overview',
  superadmin:'/admin/overview',
};

const NAV_ITEMS = [
  { label: '🏠', title: 'Home',       href: '/home/1'          },
  { label: '📰', title: 'Magazine',   href: '/home/2'          },
  { label: '⚔️',  title: 'Battles',   href: '/battles'         },
  { label: '🎥', title: 'Live Lobby', href: '/live/lobby'      },
  { label: '🎤', title: 'Performers', href: '/performers'      },
];

const LIVE_ROLES = new Set(['artist', 'performer', 'admin', 'superadmin', 'venue']);

export default function TMIGlobalNav() {
  const router   = useRouter();
  const pathname = usePathname() ?? '';

  const [session, setSession]   = useState<SessionState | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchSession = useCallback(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then((data: SessionState) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => {
    fetchSession();

    // Re-check session after go-live / end-broadcast events
    const refresh = () => fetchSession();
    window.addEventListener('tmi:golive',        refresh);
    window.addEventListener('tmi:endbroadcast',  refresh);
    window.addEventListener('tmi:session_change', refresh);
    return () => {
      window.removeEventListener('tmi:golive',        refresh);
      window.removeEventListener('tmi:endbroadcast',  refresh);
      window.removeEventListener('tmi:session_change', refresh);
    };
  }, [fetchSession]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setSession({ authenticated: false });
      window.dispatchEvent(new CustomEvent('tmi:session_change'));
      router.push('/home/1');
    } catch {
      setLoggingOut(false);
    }
  }

  const isAuthenticated = session?.authenticated === true;
  const user            = session?.user;
  const role            = (user?.role ?? 'default').toLowerCase();
  const userId          = user?.id ?? '';
  const userInitial     = userId.charAt(0).toUpperCase() || '?';
  const roleColor       = ROLE_COLOR[role] ?? ROLE_COLOR.default!;
  const profileBase     = ROLE_PROFILE[role] ?? '/profile';
  const profileHref     = isAuthenticated ? `${profileBase}/${userId}` : '/auth/signin';
  const canGoLive       = isAuthenticated && LIVE_ROLES.has(role);

  return (
    <nav
      style={{
        position:  'fixed',
        bottom:    16,
        left:      '50%',
        transform: 'translateX(-50%)',
        zIndex:    99999,
        display:   'flex',
        gap:       5,
        alignItems: 'center',
        background: 'rgba(5,3,16,0.94)',
        backdropFilter: 'blur(20px)',
        border:    '1px solid rgba(0,255,255,0.16)',
        borderRadius: 40,
        padding:   '5px 10px',
        boxShadow: '0 0 30px rgba(0,255,255,0.10), 0 4px 24px rgba(0,0,0,0.7)',
        maxWidth:  'calc(100vw - 32px)',
        flexWrap:  'nowrap',
        overflowX: 'auto',
      }}
      aria-label="Global navigation"
    >
      {/* ── User avatar / profile link ────────────────────────────────── */}
      {isAuthenticated ? (
        <button
          title={`My Profile (${role})`}
          onClick={() => router.push(profileHref)}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            border:   `2px solid ${roleColor}`,
            background: `${roleColor}22`,
            cursor:   'pointer',
            fontSize: 12, fontWeight: 900, color: roleColor,
            display:  'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 10px ${roleColor}44`,
            transition: 'all 0.2s',
          }}
        >
          {userInitial}
        </button>
      ) : (
        <button
          title="Sign In"
          onClick={() => router.push('/auth/signin')}
          style={{
            padding: '0 12px', height: 34, borderRadius: 20, flexShrink: 0,
            border:   '1.5px solid #FFD700',
            background: 'rgba(255,215,0,0.1)',
            cursor:   'pointer', fontSize: 9, fontWeight: 900,
            color:    '#FFD700', letterSpacing: '0.1em', textTransform: 'uppercase',
            display:  'flex', alignItems: 'center', whiteSpace: 'nowrap',
          }}
        >
          SIGN IN
        </button>
      )}

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* ── Core nav items ─────────────────────────────────────────────── */}
      {NAV_ITEMS.map(({ label, title, href }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <button
            key={href}
            title={title}
            onClick={() => router.push(href)}
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              border:     active ? '1.5px solid #00FFFF' : '1.5px solid transparent',
              background: active ? 'rgba(0,255,255,0.14)' : 'transparent',
              cursor:     'pointer', fontSize: 15,
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow:  active ? '0 0 10px rgba(0,255,255,0.28)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* ── Go Live (performers / artists only) ───────────────────────── */}
      {canGoLive && (
        <button
          title="Go Live"
          onClick={() => router.push('/live/go')}
          style={{
            padding: '0 12px', height: 34, borderRadius: 20, flexShrink: 0,
            border:     pathname.startsWith('/live/go')
              ? '1.5px solid #FF2DAA'
              : '1.5px solid rgba(255,45,170,0.5)',
            background: pathname.startsWith('/live/go')
              ? 'rgba(255,45,170,0.22)'
              : 'rgba(255,45,170,0.1)',
            cursor:     'pointer', fontSize: 10, fontWeight: 900,
            color:      '#FF2DAA', letterSpacing: '0.08em',
            display:    'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            boxShadow:  pathname.startsWith('/live/go') ? '0 0 12px rgba(255,45,170,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', display: 'inline-block' }} />
          LIVE
        </button>
      )}

      {/* ── Submit CTA ─────────────────────────────────────────────────── */}
      <button
        title="Submit Your Work"
        onClick={() => router.push('/submit')}
        style={{
          padding:    '0 12px', height: 34, borderRadius: 20, flexShrink: 0,
          border:     '1.5px solid #FF2DAA',
          background: pathname.startsWith('/submit')
            ? 'rgba(255,45,170,0.22)' : 'rgba(255,45,170,0.1)',
          cursor:     'pointer', fontSize: 10, fontWeight: 900, color: '#FF2DAA',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          display:    'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
      >
        + SUBMIT
      </button>

      {/* ── Logout (only when logged in) ───────────────────────────────── */}
      {isAuthenticated && (
        <button
          title="Log Out"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            border:     '1.5px solid rgba(255,255,255,0.18)',
            background: 'transparent',
            cursor:     loggingOut ? 'not-allowed' : 'pointer',
            fontSize:   11, color: 'rgba(255,255,255,0.45)',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            opacity:    loggingOut ? 0.5 : 1,
          }}
        >
          ⏻
        </button>
      )}

      {/* ── Hard reset ────────────────────────────────────────────────── */}
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
      <button
        title="Home"
        onClick={() => router.push('/home/1')}
        style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          border:     '1.5px solid rgba(255,215,0,0.45)',
          background: 'rgba(255,215,0,0.08)',
          cursor:     'pointer', fontSize: 13, fontWeight: 900, color: '#FFD700',
          display:    'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ↺
      </button>
    </nav>
  );
}
