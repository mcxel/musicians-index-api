"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HOME_PAGE_TABS = [
  { href: "/home/1",   label: "1"   },
  { href: "/home/1-2", label: "1-2" },
  { href: "/home/2",   label: "2"   },
  { href: "/home/3",   label: "3"   },
  { href: "/home/4",   label: "4"   },
  { href: "/home/5",   label: "5"   },
];

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

const ROLE_COLOR: Record<string, string> = {
  superadmin: '#FF2DAA', admin: '#FF2DAA', artist: '#FFD700',
  performer: '#00FFFF', fan: '#AA2DFF', venue: '#FF6B35',
  promoter: '#00FF88', advertiser: '#5CE1E6', sponsor: '#FFD700',
};

export default function MagazineNavBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ authenticated: boolean; user?: { id?: string; role?: string } } | null>(null);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then(d => setSession(d))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const isAuth    = session?.authenticated === true;
  const role      = (session?.user?.role ?? 'default').toLowerCase();
  const userId    = session?.user?.id ?? '';
  const initial   = userId.charAt(0).toUpperCase() || '?';
  const roleColor = ROLE_COLOR[role] ?? '#00FFFF';
  const profileHref = isAuth ? `${ROLE_PROFILE[role] ?? '/profile'}/${userId}` : '/auth';

  return (
    <>
      <style>{`
        /*
         * --tmi-nav-h is consumed by home/layout.tsx paddingTop.
         * Mobile: row1 (44px) + row2 (36px) = 80px.
         * Desktop (≥640px): single-row 48px — row2 is absolutely positioned
         * centred inside row1 so the header stays 48px tall.
         */
        :root { --tmi-nav-h: 80px; }
        @media (min-width: 640px) { :root { --tmi-nav-h: 48px; } }

        .tmi-nav-root {
          position: fixed;
          top: var(--tmi-banner-h, 0px);
          left: 0; right: 0;
          z-index: 59;
          background: linear-gradient(90deg,rgba(7,10,24,0.96) 0%,rgba(19,11,38,0.96) 50%,rgba(7,10,24,0.96) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* ── Row 1: brand + auth (always visible, never overflow:hidden) ── */
        .tmi-nav-row1 {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          position: relative;
          z-index: 2;
        }

        /* ── Row 2: page-number pagination ── */
        .tmi-nav-row2 {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 12px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tmi-nav-row2::-webkit-scrollbar { display: none; }

        /*
         * ── Desktop ≥640px: collapse to single 48px row ──
         * Row2 is absolutely centred over row1 so it doesn't add height.
         */
        @media (min-width: 640px) {
          .tmi-nav-root  { height: 48px; overflow: visible; }
          .tmi-nav-row1  { height: 48px; }
          .tmi-nav-row2  {
            position: absolute;
            top: 0; left: 50%; transform: translateX(-50%);
            height: 48px;
            border: none;
            background: transparent;
            pointer-events: auto;
            z-index: 1;
          }
        }

        .tmi-nav-tab {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px;
          padding: 0;
          text-decoration: none;
          flex-shrink: 0;
          transition: width 220ms ease, background 150ms ease, opacity 150ms ease,
                      box-shadow 150ms ease;
        }
        .tmi-nav-tab[data-active="true"] {
          width: 20px; height: 6px;
          background: #00e5ff;
          border: none;
          box-shadow: 0 0 8px rgba(0,229,255,0.7);
          opacity: 1;
        }
        .tmi-nav-tab[data-active="false"] {
          width: 6px; height: 6px;
          background: rgba(255,255,255,0.28);
          border: none;
          opacity: 0.7;
        }
        .tmi-nav-tab[data-active="false"]:hover {
          background: rgba(255,255,255,0.6);
          opacity: 1;
        }

        .tmi-auth-btn {
          display: inline-flex; align-items: center;
          border-radius: 999px;
          padding: 5px 13px;
          text-decoration: none;
          font-size: 12px; font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tmi-auth-login  { border: 1px solid rgba(255,255,255,0.3); color: #fff; background: rgba(255,255,255,0.05); }
        .tmi-auth-signup { border: 1px solid rgba(0,229,255,0.55); color: #00e5ff; background: rgba(0,229,255,0.08); }
      `}</style>

      <header className="tmi-nav-root" aria-label="Global navigation">

        {/* ── Row 1: Logo ←→ Auth (NEVER hidden, NEVER overflow clipped) ── */}
        <div className="tmi-nav-row1">
          <Link
            href="/home/1"
            style={{ color: "#00e5ff", fontWeight: 900, fontSize: 15, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase", flexShrink: 0 }}
          >
            TMI
          </Link>

          {/* Auth zone — always visible, always right-aligned */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {isAuth ? (
              <Link
                href={profileHref}
                aria-label="My Account"
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${roleColor}`, background: `${roleColor}22`,
                  color: roleColor, fontSize: 13, fontWeight: 900,
                  textDecoration: "none", flexShrink: 0,
                  boxShadow: `0 0 10px ${roleColor}44`,
                }}
              >
                {initial}
              </Link>
            ) : (
              <>
                <Link href="/auth"   className="tmi-auth-btn tmi-auth-login">Log In</Link>
                <Link href="/signup" className="tmi-auth-btn tmi-auth-signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* ── Row 2: Page navigation (own row on mobile, centred overlay on desktop) ── */}
        <nav className="tmi-nav-row2" aria-label="Homepage sections">
          {HOME_PAGE_TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="tmi-nav-tab"
                data-active={String(active)}
                aria-label={tab.label}
                title={tab.label}
              />
            );
          })}
        </nav>

      </header>
    </>
  );
}
