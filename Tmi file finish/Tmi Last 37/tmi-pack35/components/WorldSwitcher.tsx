// apps/web/src/components/hud/WorldSwitcher.tsx
// The [1][2][3][4] navigation between the 4 Home Worlds.
// Used in every top nav across all 4 home pages.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type WorldId = 1 | 2 | 3 | 4;

const WORLDS = [
  { id: 1, label: "MAGAZINE COVER",     href: "/",          emoji: "📰", color: "#FFB800" },
  { id: 2, label: "MAGAZINE DASHBOARD", href: "/editorial", emoji: "🎵", color: "#00E5FF" },
  { id: 3, label: "LIVE WORLD",         href: "/lobby",     emoji: "🔴", color: "#FF2D78" },
  { id: 4, label: "SPONSORS & ADS",     href: "/advertise", emoji: "📢", color: "#FF8C00" },
] as const;

interface Props {
  active?: WorldId;
  showLabels?: boolean;
}

export function WorldSwitcher({ active, showLabels = false }: Props) {
  const path = usePathname();

  const activeWorld = active ?? (
    path === "/" ? 1 :
    path.startsWith("/editorial") || path.startsWith("/magazine") ? 2 :
    path.startsWith("/lobby") || path.startsWith("/live") ? 3 :
    path.startsWith("/advertise") || path.startsWith("/sponsors") ? 4 :
    1
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "rgba(13,5,32,0.8)", borderRadius: 99,
      padding: "4px 8px",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {WORLDS.map(w => {
        const isActive = w.id === activeWorld;
        return (
          <Link
            key={w.id}
            href={w.href}
            title={w.label}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: isActive ? w.color : "rgba(42,20,82,0.8)",
              border: `2px solid ${isActive ? w.color : "rgba(255,255,255,0.1)"}`,
              color: isActive ? "#0D0520" : "#7A5F9A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 14, textDecoration: "none",
              boxShadow: isActive ? `0 0 14px ${w.color}66` : "none",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            {w.id}
          </Link>
        );
      })}
      {showLabels && (
        <span style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 11,
          color: "#7A5F9A", letterSpacing: 1, marginLeft: 8,
        }}>
          {WORLDS.find(w => w.id === activeWorld)?.label}
        </span>
      )}
    </div>
  );
}
