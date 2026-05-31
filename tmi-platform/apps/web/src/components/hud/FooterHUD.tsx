"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/hud/NotificationBell";

const NAV = [
  { href: "/home/1",        label: "HOME",     icon: "🏠" },
  { href: "/rooms",         label: "ROOMS",    icon: "🎭" },
  { href: "/battles/live",  label: "BATTLES",  icon: "⚔️" },
  { href: "/cyphers",       label: "CYPHERS",  icon: "🎤" },
  { href: "/magazine",      label: "MAG",      icon: "📰" },
];

export default function FooterHUD() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 56,
      background: "rgba(5,5,16,0.96)",
      borderTop: "1px solid rgba(255,45,170,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 100,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      {NAV.map(item => {
        const active = !!pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              textDecoration: "none", padding: "4px 10px", borderRadius: 8,
              color: active ? "#FF2DAA" : "rgba(255,255,255,0.35)",
              transition: "color 0.15s",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
              color: active ? "#FF2DAA" : "rgba(255,255,255,0.3)",
            }}>
              {item.label}
            </span>
            {active && (
              <span style={{
                position: "absolute", bottom: 2, width: 4, height: 4,
                borderRadius: "50%", background: "#FF2DAA",
              }} />
            )}
          </Link>
        );
      })}

      {/* Notification bell */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px" }}>
        <NotificationBell />
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)" }}>
          ALERTS
        </span>
      </div>
    </nav>
  );
}
