"use client";

/**
 * Protected YoPho branding footer — TMI × YoPho + QR to interactive card/profile.
 * Occupies 8–12% bottom safe area; creator content must not cover this band.
 */

import type { CSSProperties } from "react";
import type { YoPhoBrandingFooterConfig } from "@/lib/yopho/YoPhoCardDocument";
import { interactiveCardPath } from "@/lib/yopho/YoPhoCardRegistry";

interface Props {
  cardId?: string | null;
  profilePath?: string | null;
  config?: Partial<YoPhoBrandingFooterConfig>;
  /** Show dashed safe-area guide (editor only) */
  showSafeGuide?: boolean;
  heightPct?: number;
  style?: CSSProperties;
}

/** Deterministic SVG QR-style glyph (same approach as ticket print — no external lib). */
function YoPhoQrGlyph({ value, size = 36 }: { value: string; size?: number }) {
  const cells = 11;
  const cell = Math.max(1, Math.floor(size / cells));
  const grid: boolean[][] = Array.from({ length: cells }, (_, row) =>
    Array.from({ length: cells }, (_, col) => {
      const code = value.charCodeAt((row * cells + col) % Math.max(1, value.length));
      return (code + row * 3 + col * 7) % 2 === 0;
    }),
  );
  const finder: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      finder.push([i, j]);
      finder.push([cells - 3 + i, j]);
      finder.push([i, cells - 3 + j]);
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", borderRadius: 3, flexShrink: 0 }}
      aria-label="QR link to YoPho card"
    >
      <rect width={size} height={size} fill="#fff" />
      {grid.map((row, r) =>
        row.map((on, c) => {
          const isFinder = finder.some(([fr, fc]) => fr === r && fc === c);
          return on || isFinder ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell - 0.5}
              height={cell - 0.5}
              fill={isFinder ? "#050510" : "#1a1030"}
            />
          ) : null;
        }),
      )}
    </svg>
  );
}

export function resolveYoPhoQrTarget(opts: {
  cardId?: string | null;
  profilePath?: string | null;
  qrTarget?: "card" | "profile";
}): string {
  if (opts.qrTarget === "profile" && opts.profilePath) return opts.profilePath;
  if (opts.cardId) return interactiveCardPath(opts.cardId);
  if (opts.profilePath) return opts.profilePath;
  return "/yopho/card";
}

export default function YoPhoBrandingFooter({
  cardId,
  profilePath,
  config,
  showSafeGuide = false,
  heightPct,
  style,
}: Props) {
  const enabled = config?.enabled !== false;
  if (!enabled) return null;

  const pct = Math.min(0.12, Math.max(0.08, heightPct ?? config?.heightPct ?? 0.1));
  const label = config?.label ?? "TMI × YoPho";
  const showQr = config?.showQr !== false;
  const qrTarget = config?.qrTarget ?? "card";
  const target = resolveYoPhoQrTarget({ cardId, profilePath, qrTarget });

  return (
    <>
      {showSafeGuide ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${pct * 100}%`,
            borderTop: "1px dashed rgba(0,229,255,0.55)",
            background: "rgba(0,229,255,0.06)",
            zIndex: 98,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: 6,
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "rgba(0,229,255,0.75)",
            }}
          >
            SAFE · FOOTER {Math.round(pct * 100)}%
          </span>
        </div>
      ) : null}

      <div
        data-yopho-branding-footer="protected"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          height: `${pct * 100}%`,
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "4px 10px",
          background: "linear-gradient(180deg, transparent 0%, rgba(5,5,16,0.92) 28%, #050510 100%)",
          borderTop: "1px solid rgba(255,215,0,0.25)",
          pointerEvents: "none",
          ...style,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "#FFD700",
              textShadow: "0 0 8px rgba(255,215,0,0.35)",
            }}
          >
            {label}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {config?.rarity ? (
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  color: config.rarity === "RARE" ? "#FF2DAA" : "rgba(255,255,255,0.55)",
                  border: `1px solid ${config.rarity === "RARE" ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.2)"}`,
                  borderRadius: 999,
                  padding: "1px 6px",
                }}
              >
                {config.rarity}
              </span>
            ) : null}
            {config?.showEditionBadge !== false && config?.editionBadge ? (
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#00E5FF",
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {config.editionBadge}
              </span>
            ) : null}
          </div>
          <span
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 180,
            }}
          >
            {target}
          </span>
        </div>
        {showQr ? <YoPhoQrGlyph value={target} size={34} /> : null}
      </div>
    </>
  );
}
