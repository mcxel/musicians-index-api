"use client";

/**
 * RotatingSpotlight
 *
 * Generic rotating highlight panel for homepage sections.
 * Pulls items from the rotation engine using the supplied key,
 * shows a dot-pager, and renders each item using an optional
 * custom render function or the default card layout.
 */

import Link from "next/link";
import { useHomepageRotation } from "@/hooks/useHomepageRotation";
import type { RotationKey } from "@/lib/homepageRotationEngine";

interface SpotlightItem {
  id?: string;
  title?: string;
  label?: string;
  name?: string;
  meta?: string;
  href?: string;
  badge?: string;
  status?: string;
  plays?: string;
  value?: string;
  category?: string;
  viewers?: number;
  type?: string;
  curator?: string;
  capacity?: number;
  [key: string]: unknown;
}

interface RotatingSpotlightProps {
  rotationKey: RotationKey;
  heading: string;
  accentColor?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

function getLabel(item: SpotlightItem): string {
  return item.title ?? item.label ?? item.name ?? "—";
}

function getMeta(item: SpotlightItem): string {
  if (item.meta) return item.meta;
  if (item.plays) return `${item.plays} plays`;
  if (item.viewers != null && item.viewers > 0) return `${item.viewers.toLocaleString()} viewers`;
  if (item.value) return item.value;
  if (item.curator) return `by ${item.curator}`;
  if (item.capacity) return `Cap: ${item.capacity.toLocaleString()}`;
  return "";
}

function getBadge(item: SpotlightItem): string {
  if (item.badge) return item.badge;
  if (item.status) return item.status;
  if (item.category) return item.category;
  if (item.type) return item.type.toUpperCase();
  return "";
}

export default function RotatingSpotlight({
  rotationKey,
  heading,
  accentColor = "#00FFFF",
  viewAllHref,
  viewAllLabel = "View All",
}: RotatingSpotlightProps) {
  const { items, pageIndex, totalPages, next, prev } = useHomepageRotation<SpotlightItem>(rotationKey);

  return (
    <section style={{
      borderRadius: 12,
      border: `1px solid ${accentColor}30`,
      background: "rgba(0,0,0,0.5)",
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: accentColor, textTransform: "uppercase" }}>
          {heading}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Dot pager */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={prev} style={{ background: "none", border: "none", color: accentColor, fontSize: 10, cursor: "pointer", opacity: 0.6 }}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === pageIndex ? accentColor : "rgba(255,255,255,0.2)", display: "inline-block" }} />
              ))}
              <button onClick={next} style={{ background: "none", border: "none", color: accentColor, fontSize: 10, cursor: "pointer", opacity: 0.6 }}>›</button>
            </div>
          )}
          {viewAllHref && (
            <Link href={viewAllHref} style={{ fontSize: 9, fontWeight: 800, color: accentColor, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {viewAllLabel}
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, idx) => {
          const label = getLabel(item);
          const meta  = getMeta(item);
          const badge = getBadge(item);
          const card = (
            <div
              key={item.id ?? idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                background: `${accentColor}08`,
                border: `1px solid ${accentColor}20`,
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{label}</p>
                {meta && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{meta}</p>}
              </div>
              {badge && (
                <span style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: accentColor, border: `1px solid ${accentColor}40`, borderRadius: 3, padding: "2px 5px", flexShrink: 0 }}>
                  {badge}
                </span>
              )}
            </div>
          );
          if (item.href) {
            return (
              <Link key={item.id ?? idx} href={item.href as string} style={{ textDecoration: "none" }}>
                {card}
              </Link>
            );
          }
          return card;
        })}
      </div>
    </section>
  );
}
