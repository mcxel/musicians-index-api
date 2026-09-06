"use client";

/**
 * GlobalTopNavRail — secondary lobby/discovery destination strip.
 *
 * Slice 1A: identity lives ONLY in GlobalTmiHeader (SHELL-01/02).
 * This rail must never mount a second account circle.
 * Lobby-wall pages outside /home get GlobalTmiHeader via includeHeader.
 * Home surfaces already mount GlobalTmiHeader from home/layout — pass includeHeader={false}.
 */

import Link from "next/link";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";

const NAV_ITEMS = [
  { label: "Magazine", href: "/magazine" },
  { label: "Live", href: "/live/lobby-wall" },
  { label: "Games", href: "/games/lobby-wall" },
  { label: "Battles", href: "/battles/lobby-wall" },
  { label: "Cypher", href: "/cypher/lobby-wall" },
  { label: "Challenges", href: "/challenges/lobby-wall" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
];

export interface GlobalTopNavRailProps {
  /** When true (default), mount canonical GlobalTmiHeader above the strip. */
  includeHeader?: boolean;
}

export default function GlobalTopNavRail({ includeHeader = true }: GlobalTopNavRailProps) {
  return (
    <>
      {includeHeader ? <GlobalTmiHeader /> : null}
      <nav
        aria-label="Lobby discovery destinations"
        data-shell-discovery-strip="true"
        style={{
          position: "sticky",
          top: includeHeader ? 0 : undefined,
          zIndex: 39,
          backdropFilter: "blur(8px)",
          background: "linear-gradient(90deg, rgba(5,5,16,0.94), rgba(12,8,26,0.92))",
          borderBottom: "1px solid rgba(0,255,255,0.3)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "8px 18px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                color: "#ffffff",
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
