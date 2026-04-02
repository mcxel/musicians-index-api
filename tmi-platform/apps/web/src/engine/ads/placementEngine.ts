/**
 * Ad Placement Engine
 * Manages rotating ad slots, sponsor placements, and impression tracking.
 */
import { useEffect, useState, useCallback } from "react";

export interface AdSlot {
  id: string;
  brand: string;
  tagline: string;
  href: string;
  metric: string;
  color: string;
  isCTA?: boolean;
}

export const DEFAULT_AD_SLOTS: AdSlot[] = [
  { id: "amplify", brand: "AMPLIFY RECORDS", tagline: "Discover. Sign. Amplify.", href: "#", metric: "12.4K Impressions", color: "#FF2DAA" },
  { id: "beatlab", brand: "BEATLAB STUDIOS", tagline: "Record, Mix, Master — All In One", href: "#", metric: "8.7K Impressions", color: "#00FFFF" },
  { id: "velocity", brand: "VELOCITY AUDIO", tagline: "Distribution That Moves Fast", href: "#", metric: "6.2K Impressions", color: "#AA2DFF" },
  { id: "nova", brand: "NOVA MEDIA GROUP", tagline: "Your Brand. Our Audience. Global Reach.", href: "#", metric: "15.1K Impressions", color: "#FFD700" },
  { id: "cta", brand: "YOUR BRAND HERE", tagline: "Reach 50,000+ musicians and music professionals", href: "/advertise", metric: "From $99/mo", color: "#2DFFAA", isCTA: true },
];

export interface UseAdRotatorOptions {
  slots?: AdSlot[];
  intervalMs?: number;
}

export function useAdRotator({ slots = DEFAULT_AD_SLOTS, intervalMs = 5000 }: UseAdRotatorOptions = {}) {
  const [current, setCurrent] = useState(0);
  const [impressions, setImpressions] = useState<Record<string, number>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((i) => {
        const next = (i + 1) % slots.length;
        setImpressions((prev) => ({
          ...prev,
          [slots[next].id]: (prev[slots[next].id] ?? 0) + 1,
        }));
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [slots, intervalMs]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(index, slots.length - 1)));
    },
    [slots.length]
  );

  return {
    slot: slots[current],
    current,
    goTo,
    total: slots.length,
    impressions,
  };
}

/**
 * Returns sponsor tier color.
 */
export function getSponsorTierColor(tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE"): string {
  const MAP: Record<string, string> = {
    PLATINUM: "#E0E0FF",
    GOLD: "#FFD700",
    SILVER: "#C0C0C0",
    BRONZE: "#CD7F32",
  };
  return MAP[tier] ?? "#FFFFFF";
}
