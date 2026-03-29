// Header — Slice 0 placeholder
// Platform-wide top navigation header, dark theme, PDF-style
// Magazine-first nav: Magazine link is primary CTA
// "Stations" naming enforced (not "Channels")
// Interactive nav wired in Slice 1 (Design system)

import Link from "next/link";

export interface HeaderProps {
  className?: string;
  "data-testid"?: string;
}

interface NavLink {
  label: string;
  href: string;
  primary?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Magazine", href: "/magazine", primary: true },
  { label: "Stations", href: "/stations" },
  { label: "Live", href: "/live" },
  { label: "Contests", href: "/contests" },
  { label: "Artists", href: "/artists" },
];

export default function Header({ className, "data-testid": testId }: HeaderProps) {
  return (
    <header
      className={className}
      data-testid={testId ?? "platform-header"}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#ff6b35",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          aria-label="The Musician's Index — Home"
        >
          TMI
        </Link>

        {/* Primary nav */}
        <nav
          aria-label="Primary navigation"
          style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}
        >
          {NAV_LINKS.map(({ label, href, primary }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 13,
                fontWeight: primary ? 700 : 500,
                color: primary ? "#ff6b35" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: 6,
                transition: "color 0.15s, background 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth actions — placeholder, wired in Slice 1 */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
          aria-label="Account actions"
        >
          <Link
            href="/auth"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
              padding: "6px 12px",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=signup"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0a0a0f",
              background: "#ff6b35",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 6,
            }}
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
