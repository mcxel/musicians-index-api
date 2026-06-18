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

  const isAuth   = session?.authenticated === true;
  const role     = (session?.user?.role ?? 'default').toLowerCase();
  const userId   = session?.user?.id ?? '';
  const initial  = userId.charAt(0).toUpperCase() || '?';
  const roleColor = ROLE_COLOR[role] ?? '#00FFFF';
  const profileHref = isAuth ? `${ROLE_PROFILE[role] ?? '/profile'}/${userId}` : '/auth/signin';

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .tmi-nav-text-links { display: none !important; }
          .tmi-nav-auth-signup { display: none !important; }
          .tmi-nav-auth-login  { font-size: 11px !important; padding: 3px 8px !important; }
        }
        .tmi-nav-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          max-width: calc(100vw - 160px);
        }
        .tmi-nav-tabs::-webkit-scrollbar { display: none; }
      `}</style>
      <header
        aria-label="Global navigation"
        style={{
          position: "fixed",
          top: 'var(--tmi-banner-h, 0px)',
          left: 0,
          right: 0,
          zIndex: 59,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background:
            "linear-gradient(90deg, rgba(7,10,24,0.95) 0%, rgba(19,11,38,0.95) 50%, rgba(7,10,24,0.95) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          overflow: "hidden",
        }}
      >
        <Link
          href="/home/1"
          style={{
            color: "#00e5ff",
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: "0.12em",
            textDecoration: "none",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          TMI
        </Link>

        <nav aria-label="Homepage tabs" className="tmi-nav-tabs">
          {HOME_PAGE_TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  border: active
                    ? "1px solid rgba(0,229,255,0.55)"
                    : "1px solid rgba(255,255,255,0.2)",
                  padding: "4px 11px",
                  color: active ? "#00e5ff" : "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: active
                    ? "rgba(0,229,255,0.12)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {isAuth ? (
            <Link
              href={profileHref}
              title="My Account"
              style={{
                width: 34, height: 34, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
                border: `2px solid ${roleColor}`,
                background: `${roleColor}22`,
                color: roleColor,
                fontSize: 13, fontWeight: 900,
                textDecoration: "none",
                boxShadow: `0 0 10px ${roleColor}44`,
              }}
              aria-label="My Account"
            >
              {initial || "👤"}
            </Link>
          ) : (
            <>
              <Link
                href="/auth"
                className="tmi-nav-auth-login"
                style={{
                  display: "inline-flex", alignItems: "center", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.25)", padding: "4px 12px",
                  color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="tmi-nav-auth-signup"
                style={{
                  display: "inline-flex", alignItems: "center", borderRadius: 999,
                  border: "1px solid rgba(0,229,255,0.5)", padding: "4px 12px",
                  color: "#00e5ff", textDecoration: "none", fontSize: 12, fontWeight: 700,
                  background: "rgba(0,229,255,0.08)",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
