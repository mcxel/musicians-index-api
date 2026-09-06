"use client";

/**
 * MagazineNavBar — home page-dot strip + account zone.
 * Slice 1A: account zone uses UniversalAccountIdentityControl (same authority
 * as GlobalTmiHeader). Prefer mounting GlobalTmiHeader from home/layout;
 * this file remains for any residual mounts that still need page dots.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UniversalAccountIdentityControl from "@/components/account/UniversalAccountIdentityControl";

const HOME_PAGE_TABS = [
  { href: "/home/1",   label: "1"   },
  { href: "/home/1-2", label: "1-2" },
  { href: "/home/2",   label: "2"   },
  { href: "/home/3",   label: "3"   },
  { href: "/home/4",   label: "4"   },
  { href: "/home/5",   label: "5"   },
];

export default function MagazineNavBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<{
    authenticated: boolean;
    user?: { id?: string; name?: string; role?: string; avatarUrl?: string | null };
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then(d => setSession(d))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const isAuth = session?.authenticated === true;
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.id?.slice(0, 8) ||
    'Account';
  const avatarUrl = session?.user?.avatarUrl ?? null;

  return (
    <>
      <style>{`
        /*
         * --tmi-nav-h is consumed by residual fixed-nav consumers.
         * Mobile: row1 (44px) + row2 (36px) = 80px.
         * Desktop (>=640px): single-row 48px — row2 is absolutely positioned
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

        .tmi-nav-row1 {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          position: relative;
          z-index: 2;
        }

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
            z-index: 3;
          }
        }

        .tmi-nav-tab {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px;
          text-decoration: none;
          flex-shrink: 0;
          border: none;
          background: transparent;
          padding: 0;
        }
        .tmi-nav-dot {
          display: block;
          border-radius: 999px;
          pointer-events: none;
          transition: width 220ms ease, background 150ms ease, box-shadow 150ms ease;
        }
        .tmi-nav-tab[data-active="true"] .tmi-nav-dot {
          width: 20px; height: 6px;
          background: #00e5ff;
          box-shadow: 0 0 8px rgba(0,229,255,0.7);
        }
        .tmi-nav-tab[data-active="false"] .tmi-nav-dot {
          width: 6px; height: 6px;
          background: rgba(255,255,255,0.28);
        }
        .tmi-nav-tab[data-active="false"]:hover .tmi-nav-dot {
          background: rgba(255,255,255,0.65);
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
        <div className="tmi-nav-row1">
          <Link
            href="/home/1"
            style={{ color: "#00e5ff", fontWeight: 900, fontSize: 15, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase", flexShrink: 0 }}
          >
            TMI
          </Link>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {isAuth ? (
              <UniversalAccountIdentityControl
                fallbackDisplayName={displayName}
                fallbackAvatarUrl={avatarUrl}
                compact
              />
            ) : (
              <>
                <Link href="/auth"   className="tmi-auth-btn tmi-auth-login">LOGIN</Link>
                <Link href="/signup" className="tmi-auth-btn tmi-auth-signup">SIGN UP</Link>
              </>
            )}
          </div>
        </div>

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
              >
                <span className="tmi-nav-dot" />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
