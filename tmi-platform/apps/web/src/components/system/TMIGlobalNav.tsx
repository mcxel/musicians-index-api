'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { NotificationEngine } from '@/lib/notifications/NotificationEngine';

interface SessionState {
  authenticated: boolean;
  user?: { id?: string; role?: string; tier?: string; avatarUrl?: string | null };
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

// Dashboard destination per role — never the marketing/homepage carousel
// (/home/1 etc). Mirrors ROLE_HUB_ROUTE in app/signup/page.tsx.
const ROLE_DASHBOARD: Record<string, string> = {
  fan:        '/hub/fan',
  performer:  '/hub/performer',
  artist:     '/hub/artist',
  promoter:   '/hub/promoter',
  advertiser: '/hub/advertiser',
  sponsor:    '/hub/sponsor',
  venue:      '/hub/venue',
  admin:      '/admin/overview',
  superadmin: '/admin/overview',
};

// Icon+label items — same visual language for every role (fan and
// performer alike see the same global dock; role only changes where
// HOME points and whether GO LIVE appears).
const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',      href: '/home/1'     }, // href overridden per-role at render time
  { icon: '🧭', label: 'Discover',  href: '/discover'   },
  { icon: '🔴', label: 'Live Now',  href: '/live'       },
  { icon: '🎪', label: 'Lobby',     href: '/live/lobby' },
  { icon: '🌐', label: 'Explore',   href: '/explore'    },
  { icon: '🔎', label: 'Search',    href: '/search'     },
];

const LIVE_ROLES = new Set(['artist', 'performer', 'admin', 'superadmin', 'venue']);

export default function TMIGlobalNav() {
  const router   = useRouter();
  const pathname = usePathname() ?? '';

  const [session, setSession]   = useState<SessionState | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refresh = () => setUnreadCount(NotificationEngine.getUnreadCount());
    refresh();
    const unsub = NotificationEngine.subscribe(refresh);
    return unsub;
  }, []);

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
  const avatarUrl       = user?.avatarUrl ?? null;
  const roleColor       = ROLE_COLOR[role] ?? ROLE_COLOR.default!;
  const profileBase     = ROLE_PROFILE[role] ?? '/profile';
  const profileHref     = isAuthenticated ? `${profileBase}/${userId}` : '/auth/signin';
  const canGoLive       = isAuthenticated && LIVE_ROLES.has(role);
  const dashboardHref   = isAuthenticated ? (ROLE_DASHBOARD[role] ?? '/hub/fan') : '/home/1';

  return (
    <>
      <style>{`
        .tmi-dock-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: none; border: none; cursor: pointer; flex-shrink: 0; padding: 6px 9px; border-radius: 10px; transition: background 0.15s; }
        .tmi-dock-item:hover { background: rgba(255,255,255,0.05); }
        .tmi-dock-icon { font-size: 17px; line-height: 1; position: relative; }
        .tmi-dock-label { font-size: 8px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.45); white-space: nowrap; }
        .tmi-dock-item[data-active="true"] .tmi-dock-label { color: #00e5ff; }
        .tmi-dock-badge { position: absolute; top: -4px; right: -8px; min-width: 14px; height: 14px; border-radius: 7px; background: #FF2DAA; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; color: #fff; padding: 0 3px; }
        @media (max-width: 720px) { .tmi-dock-label { display: none; } .tmi-dock-item { padding: 6px; } }
      `}</style>
      <nav
        style={{
          position:  'fixed',
          bottom:    0,
          left:      0,
          right:     0,
          zIndex:    99999,
          display:   'flex',
          gap:       2,
          alignItems: 'center',
          background: 'rgba(5,3,16,0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,255,255,0.16)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.7)',
          padding:   '6px 10px',
          overflowX: 'auto',
          flexWrap:  'nowrap',
        }}
        aria-label="Global navigation"
      >
        {/* ── User avatar / profile link ────────────────────────────────── */}
        {isAuthenticated ? (
          <button
            title={`My Profile (${role})`}
            onClick={() => router.push(profileHref)}
            className="tmi-dock-item"
            style={{ padding: '4px 6px' }}
          >
            <span
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border:   `2px solid ${roleColor}`,
                background: avatarUrl ? '#000' : `${roleColor}22`,
                fontSize: 11, fontWeight: 900, color: roleColor,
                display:  'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 10px ${roleColor}44`,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                userInitial
              )}
            </span>
            <span className="tmi-dock-label">Profile</span>
          </button>
        ) : (
          <button title="Sign In" onClick={() => router.push('/auth/signin')} className="tmi-dock-item">
            <span className="tmi-dock-icon" style={{ color: '#FFD700' }}>👤</span>
            <span className="tmi-dock-label" style={{ color: '#FFD700' }}>Sign In</span>
          </button>
        )}

        <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.08)', flexShrink: 0, margin: '0 2px' }} />

        {/* ── Core nav items (Home → dashboard, never the /home/* marketing pages) ── */}
        {NAV_ITEMS.map(({ icon, label, href }) => {
          const targetHref = label === 'Home' ? dashboardHref : href;
          const active = pathname === targetHref || (targetHref !== '/' && pathname.startsWith(targetHref + '/'));
          return (
            <button
              key={label}
              title={label}
              onClick={() => router.push(targetHref)}
              className="tmi-dock-item"
              data-active={String(active)}
            >
              <span className="tmi-dock-icon">{icon}</span>
              <span className="tmi-dock-label">{label}</span>
            </button>
          );
        })}

        {/* ── Notifications (real unread count, never fabricated) ────────── */}
        <button
          title="Notifications"
          onClick={() => router.push('/notifications')}
          className="tmi-dock-item"
          data-active={String(pathname.startsWith('/notifications'))}
        >
          <span className="tmi-dock-icon">
            🔔
            {unreadCount > 0 && <span className="tmi-dock-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </span>
          <span className="tmi-dock-label">Alerts</span>
        </button>

        {/* ── Messages ─────────────────────────────────────────────────── */}
        <button
          title="Messages"
          onClick={() => router.push('/messages')}
          className="tmi-dock-item"
          data-active={String(pathname.startsWith('/messages'))}
        >
          <span className="tmi-dock-icon">✉️</span>
          <span className="tmi-dock-label">Messages</span>
        </button>

        <div style={{ flex: 1, minWidth: 8 }} />

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
            marginLeft: 6,
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
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              border:     '1.5px solid rgba(255,255,255,0.18)',
              background: 'transparent',
              cursor:     loggingOut ? 'not-allowed' : 'pointer',
              fontSize:   11, color: 'rgba(255,255,255,0.45)',
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              opacity:    loggingOut ? 0.5 : 1,
              marginLeft: 6,
            }}
          >
            ⏻
          </button>
        )}
      </nav>
    </>
  );
}
