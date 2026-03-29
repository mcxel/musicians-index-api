// Footer — Slice 0 placeholder
// Platform-wide footer, dark theme, PDF-style
// "Stations" naming enforced (not "Channels")
// Full link wiring in Slice 1 (Design system)

import Link from "next/link";

export interface FooterProps {
  className?: string;
  "data-testid"?: string;
}

interface FooterSection {
  heading: string;
  links: { label: string; href: string }[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    heading: "Explore",
    links: [
      { label: "Magazine", href: "/magazine" },
      { label: "Articles", href: "/articles" },
      { label: "Stations", href: "/stations" },
      { label: "Live", href: "/live" },
      { label: "Contests", href: "/contests" },
    ],
  },
  {
    heading: "Artists",
    links: [
      { label: "Browse Artists", href: "/artists" },
      { label: "Artist Onboarding", href: "/onboarding/artist" },
      { label: "Artist Dashboard", href: "/dashboard/artist" },
      { label: "Booking", href: "/booking" },
    ],
  },
  {
    heading: "Sponsors",
    links: [
      { label: "Sponsor an Artist", href: "/sponsors" },
      { label: "Advertise", href: "/advertisers" },
      { label: "Local Business", href: "/sponsors/local" },
      { label: "Campaigns", href: "/campaigns" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "About", href: "/about" },
      { label: "Help", href: "/help" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer({ className, "data-testid": testId }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={className}
      data-testid={testId ?? "platform-footer"}
      style={{
        width: "100%",
        background: "#0a0a0f",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        marginTop: "auto",
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "48px 20px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 32,
        }}
      >
        {/* Brand column */}
        <div style={{ gridColumn: "span 1" }}>
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#ff6b35",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              display: "block",
              marginBottom: 8,
            }}
            aria-label="The Musician's Index — Home"
          >
            TMI
          </Link>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 180,
            }}
          >
            The Musician&apos;s Index Magazine — music, stations, live shows, and creator economy.
          </p>
        </div>

        {/* Nav sections */}
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.heading}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 12px",
              }}
            >
              {section.heading}
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {section.links.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            margin: 0,
          }}
        >
          &copy; {year} BerntoutGlobal XXL / The Musician&apos;s Index. All rights reserved.
        </p>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
            margin: 0,
          }}
        >
          Powered by TMI Platform
        </p>
      </div>
    </footer>
  );
}
