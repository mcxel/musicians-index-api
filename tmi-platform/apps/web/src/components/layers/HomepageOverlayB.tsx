"use client";

/**
 * HomepageOverlayB.tsx
 * Layer 6 — Major artifact overlays.
 * Crown badges, stars, winner frames, featured promo badges.
 * Non-interactive (pointer-events: none on parent from MagazinePageShell).
 */

interface ArtifactItem {
  type: "crown" | "star" | "winner-frame" | "featured-badge" | "trophy" | "fire";
  x: string;
  y: string;
  size?: number;
  color?: string;
  opacity?: number;
}

interface HomepageOverlayBProps {
  items: ArtifactItem[];
}

function CrownSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32" fill="none">
      <path
        d="M2 28L8 12L16 20L20 6L24 20L32 12L38 28Z"
        fill={color}
        opacity={0.9}
      />
      <rect x="2" y="28" width="36" height="4" rx="2" fill={color} opacity={0.7} />
      <circle cx="20" cy="6" r="2.5" fill={color} />
      <circle cx="8" cy="12" r="2" fill={color} />
      <circle cx="32" cy="12" r="2" fill={color} />
    </svg>
  );
}

function StarSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.4 9H22L16 13.4L18.4 20.4L12 16L5.6 20.4L8 13.4L2 9H9.6L12 2Z"
        fill={color}
        opacity={0.85}
      />
    </svg>
  );
}

function TrophySVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2H18V10C18 14 15 16 12 16C9 16 6 14 6 10V2Z"
        fill={color}
        opacity={0.9}
      />
      <path d="M4 4H6V10H4C3 10 2 9 2 8V6C2 4.9 2.9 4 4 4Z" fill={color} opacity={0.7} />
      <path d="M18 4H20C21.1 4 22 4.9 22 6V8C22 9 21 10 20 10H18V4Z" fill={color} opacity={0.7} />
      <rect x="11" y="16" width="2" height="4" fill={color} opacity={0.8} />
      <rect x="8" y="20" width="8" height="2" rx="1" fill={color} opacity={0.8} />
    </svg>
  );
}

function FireSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 14 6 14 9C14 11.2 12.8 12 12 12C11.2 12 10 11.2 10 9C10 6 12 2 12 2Z"
        fill={color}
        opacity={0.9}
      />
      <path
        d="M6 14C6 10 9 8 9 8C9 8 8 11 10 13C11 14 11 15 10.5 16C9.5 17.5 8 17 8 17C6.8 16.5 6 15.3 6 14Z"
        fill={color}
        opacity={0.7}
      />
      <path
        d="M8 14C8 10.7 12 7 12 7C12 7 11 10 13 12C14.2 13.2 14.5 15 13.5 17C12.7 18.5 12 20 12 20C12 20 8 18.5 8 14Z"
        fill={color}
        opacity={0.85}
      />
    </svg>
  );
}

function WinnerFrameSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Corner ornaments */}
      <path d="M4 4L20 4L20 8L8 8L8 20L4 20Z" fill={color} opacity={0.8} />
      <path d="M76 4L60 4L60 8L72 8L72 20L76 20Z" fill={color} opacity={0.8} />
      <path d="M4 76L20 76L20 72L8 72L8 60L4 60Z" fill={color} opacity={0.8} />
      <path d="M76 76L60 76L60 72L72 72L72 60L76 60Z" fill={color} opacity={0.8} />
      {/* Top label band */}
      <rect x="22" y="0" width="36" height="6" rx="1" fill={color} opacity={0.6} />
    </svg>
  );
}

function FeaturedBadgeSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size * 2.5} height={size} viewBox="0 0 100 40" fill="none">
      <rect x="0" y="0" width="100" height="40" rx="4" fill={color} opacity={0.15} />
      <rect x="0" y="0" width="100" height="40" rx="4" stroke={color} strokeWidth="1.5" opacity={0.6} />
      <text x="50" y="26" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold" fontFamily="'Bebas Neue', Impact, sans-serif" letterSpacing="2">
        FEATURED
      </text>
    </svg>
  );
}

export default function HomepageOverlayB({ items }: HomepageOverlayBProps) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {items.map((item, i) => {
        const size = item.size ?? 36;
        const color = item.color ?? "#FFD700";
        const opacity = item.opacity ?? 0.75;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              opacity,
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          >
            {item.type === "crown" && <CrownSVG size={size} color={color} />}
            {item.type === "star" && <StarSVG size={size} color={color} />}
            {item.type === "trophy" && <TrophySVG size={size} color={color} />}
            {item.type === "fire" && <FireSVG size={size} color={color} />}
            {item.type === "winner-frame" && <WinnerFrameSVG size={size} color={color} />}
            {item.type === "featured-badge" && <FeaturedBadgeSVG size={size} color={color} />}
          </div>
        );
      })}
    </div>
  );
}
