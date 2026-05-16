"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HubRole = "admin" | "big-ace" | "mc" | "marcel-root" | "justin" | "jay";

type CommandLink = {
  label: string;
  href: string;
  roles?: HubRole[];
  accent?: "gold" | "purple" | "cyan" | "red";
};

const COMMAND_LINKS: CommandLink[] = [
  { label: "Overseer Deck",    href: "/admin/overseer",          accent: "gold" },
  { label: "Revenue",          href: "/admin/billing",           accent: "gold" },
  { label: "Artist Analytics", href: "/admin/artist-analytics",  accent: "gold" },
  { label: "Launch Control",   href: "/admin/launch",            accent: "purple" },
  { label: "Observation",      href: "/admin/observation",       accent: "purple" },
  { label: "Monitors",         href: "/admin/monitors",          accent: "purple" },
  { label: "Routes",           href: "/admin/routes" },
  { label: "Assets",           href: "/admin/assets" },
  { label: "Bots",             href: "/admin/bots",              accent: "cyan", roles: ["admin", "big-ace", "mc", "marcel-root"] },
  { label: "Sentinel Wall",    href: "/admin/safety",            accent: "red",  roles: ["admin", "big-ace", "mc", "marcel-root"] },
  { label: "Profiles",         href: "/admin/profiles" },
  { label: "Audience",         href: "/admin/audience" },
  { label: "Magazine",         href: "/admin/magazine",          accent: "purple", roles: ["admin", "justin", "jay", "marcel-root"] },
  { label: "Live World",       href: "/admin/live-world",        accent: "cyan",   roles: ["admin", "justin", "marcel-root"] },
  { label: "Games",            href: "/admin/games" },
  { label: "Sponsors",         href: "/admin/sponsors",          accent: "gold" },
  { label: "Booking",          href: "/admin/booking",           accent: "gold",   roles: ["admin", "jay", "marcel-root"] },
  { label: "Economy",          href: "/admin/economy",           accent: "gold",   roles: ["admin", "big-ace", "marcel-root"] },
  { label: "Errors",           href: "/admin/errors",            accent: "red",    roles: ["admin", "big-ace", "marcel-root"] },
  { label: "Support",          href: "/admin/support" },
  { label: "Visual Evolution", href: "/admin/visual-evolution",  accent: "purple" },
];

const ACCENT_STYLES: Record<string, React.CSSProperties> = {
  gold:   { borderColor: "rgba(251,191,36,0.55)",  color: "#fde68a",  background: "rgba(251,191,36,0.08)" },
  purple: { borderColor: "rgba(168,85,247,0.5)",   color: "#c4b5fd",  background: "rgba(168,85,247,0.08)" },
  cyan:   { borderColor: "rgba(0,255,255,0.4)",    color: "#99f6e4",  background: "rgba(0,255,255,0.06)" },
  red:    { borderColor: "rgba(239,68,68,0.5)",    color: "#fca5a5",  background: "rgba(239,68,68,0.08)" },
};

type AdminCommandRailProps = {
  hubRole?: HubRole;
};

export default function AdminCommandRail({ hubRole = "admin" }: AdminCommandRailProps) {
  const pathname = usePathname() ?? "";

  const visibleLinks = COMMAND_LINKS.filter(
    (link) => !link.roles || link.roles.includes(hubRole),
  );

  return (
    <aside
      data-admin-rail="command"
      style={{
        border: "1px solid rgba(251,191,36,0.4)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(40,20,5,0.55) 0%, rgba(44,5,69,0.35) 50%, rgba(5,20,40,0.45) 100%)",
        padding: 10,
        overflow: "hidden",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#fcd34d",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(250,204,21,0.4)",
        }}
      >
        Command Rail
      </p>
      <p
        style={{
          margin: "0 0 10px",
          color: "#64748b",
          fontSize: 9,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Hub: {hubRole}
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {["ARM", "SYNC", "BROADCAST"].map((action) => (
          <button
            key={action}
            type="button"
            style={{
              borderRadius: 6,
              border: "1px solid rgba(251,191,36,0.35)",
              background: "rgba(251,191,36,0.09)",
              color: "#fde68a",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        {visibleLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          const accentStyle = link.accent ? ACCENT_STYLES[link.accent] : {};
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                borderRadius: 7,
                border: active
                  ? "1px solid rgba(56,189,248,0.75)"
                  : `1px solid ${(accentStyle.borderColor as string) ?? "rgba(255,255,255,0.12)"}`,
                background: active
                  ? "rgba(14,116,144,0.25)"
                  : (accentStyle.background as string) ?? "rgba(0,0,0,0.35)",
                color: active ? "#e0f2fe" : (accentStyle.color as string) ?? "#cbd5e1",
                padding: "6px 10px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.15s",
                position: "relative",
                paddingRight: 26,
              }}
            >
              {link.label}
              <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", opacity: 0.7 }}>
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
