"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Link
            href="/auth"
            className="tmi-nav-auth-login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "4px 12px",
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="tmi-nav-auth-signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(0,229,255,0.5)",
              padding: "4px 12px",
              color: "#00e5ff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(0,229,255,0.08)",
            }}
          >
            Sign Up
          </Link>
        </div>
      </header>
    </>
  );
}
