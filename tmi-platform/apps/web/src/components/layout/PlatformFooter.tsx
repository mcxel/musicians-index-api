import Link from "next/link";

const FOOTER_LINKS = {
  Platform: [
    { label: "Home",         href: "/home/1" },
    { label: "Magazine",     href: "/magazine/1" },
    { label: "Live Rooms",   href: "/live/lobby" },
    { label: "Rankings",     href: "/rankings" },
    { label: "Battles",      href: "/games/battle-stage" },
    { label: "Performers",   href: "/performers" },
  ],
  Join: [
    { label: "Sign Up",         href: "/signup" },
    { label: "Log In",          href: "/login" },
    { label: "Performer Hub",   href: "/hub/performer" },
    { label: "Fan Hub",         href: "/hub/fan" },
    { label: "Venue Booking",   href: "/hub/venue" },
    { label: "Advertise",       href: "/advertising" },
  ],
  Legal: [
    { label: "Privacy Policy",     href: "/privacy" },
    { label: "Terms of Service",   href: "/terms" },
    { label: "Creator Policy",     href: "/creator-policy" },
    { label: "Advertiser Policy",  href: "/advertiser-policy" },
    { label: "Refund Policy",      href: "/refund-policy" },
    { label: "Originality Policy", href: "/originality-policy" },
  ],
  Company: [
    { label: "About TMI",     href: "/about" },
    { label: "Contact",       href: "/contact" },
    { label: "Advertising",   href: "/advertising" },
    { label: "Sponsors",      href: "/sponsors/advertise" },
    { label: "Press",         href: "/contact" },
    { label: "Support",       href: "/support" },
  ],
} as const;

export default function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "rgba(5,3,16,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        marginTop: "auto",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
      aria-label="Site footer"
    >
      {/* Link grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "32px 24px",
        }}
      >
        {(Object.entries(FOOTER_LINKS) as [string, ReadonlyArray<{ label: string; href: string }>][]).map(
          ([section, links]) => (
            <div key={section}>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {section}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.5)",
                        textDecoration: "none",
                        fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "0 24px" }} />

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#00FFFF",
              letterSpacing: "0.08em",
            }}
          >
            TMI
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            © {year} BernoutGlobal LLC · The Musician&apos;s Index · All rights reserved.
          </span>
        </div>

        {/* Policy quick-links — duplicated here for crawlers */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "Privacy",  href: "/privacy" },
            { label: "Terms",    href: "/terms" },
            { label: "Contact",  href: "/contact" },
            { label: "Advertise", href: "/advertising" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 600, letterSpacing: "0.06em" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
