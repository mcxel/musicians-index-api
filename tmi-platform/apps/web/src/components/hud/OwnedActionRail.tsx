"use client";

/**
 * Thin edge-mounted owned-collection action rail.
 * Collection grows via chevron pagination — drawer height stays fixed.
 */

import { useMemo, useState } from "react";

export type OwnedActionItem = {
  id: string;
  icon: string;
  label: string;
  owned?: boolean;
  locked?: boolean;
};

export type OwnedActionRailProps = {
  title: string;
  subtitle?: string;
  items: OwnedActionItem[];
  pageSize?: number;
  accent?: string;
  onActivate: (item: OwnedActionItem) => void;
  shopHref?: string;
};

export default function OwnedActionRail({
  title,
  subtitle = "Select an owned action to activate it instantly.",
  items,
  pageSize = 5,
  accent = "#00FFFF",
  onActivate,
  shopHref = "/store",
}: OwnedActionRailProps) {
  const owned = useMemo(
    () => items.filter((i) => i.owned !== false && !i.locked),
    [items],
  );
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(owned.length / pageSize));
  const slice = owned.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div
      data-runtime="owned-action-rail"
      role="region"
      aria-label={title}
      style={{
        display: "grid",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${accent}44`,
        background: "rgba(5,5,16,0.94)",
        backdropFilter: "blur(10px)",
        maxWidth: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            My Owned Actions · {owned.length} available
          </div>
        </div>
        <a
          href={shopHref}
          style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}
        >
          Shop / Explore
        </a>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{subtitle}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          aria-label="Previous owned actions"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          style={chevronStyle(page <= 0)}
        >
          ‹
        </button>
        <div
          style={{
            display: "flex",
            gap: 6,
            flex: 1,
            overflow: "hidden",
            minHeight: 56,
            alignItems: "center",
          }}
        >
          {slice.length === 0 ? (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              No owned actions in this category yet.
            </span>
          ) : (
            slice.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => onActivate(item)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  border: `1px solid ${accent}55`,
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    maxWidth: 46,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))
          )}
        </div>
        <button
          type="button"
          aria-label="Next owned actions"
          disabled={page >= pages - 1}
          onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          style={chevronStyle(page >= pages - 1)}
        >
          ›
        </button>
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
        Page {page + 1}/{pages} · drawer stays thin as collection grows
      </div>
    </div>
  );
}

function chevronStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 40,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    fontSize: 18,
    fontWeight: 900,
  };
}
