"use client";

/**
 * Listen vs Own — hybrid Creator Economy actions.
 * Listen → DSP / audio / streaming profile (distributor world).
 * Own / Support → artist commerce storefront (TMI commerce path).
 * Honest empty when no URL (Rule 20).
 */

import type { CSSProperties } from "react";

export interface ListenVsOwnActionsProps {
  listenUrl?: string | null;
  ownUrl?: string | null;
  accentColor?: string;
  /** Compact inline row for song lists */
  compact?: boolean;
  listenLabel?: string;
  ownLabel?: string;
}

const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textDecoration: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  border: "1px solid transparent",
};

export default function ListenVsOwnActions({
  listenUrl,
  ownUrl,
  accentColor = "#FFD700",
  compact = false,
  listenLabel = "LISTEN",
  ownLabel = "OWN / SUPPORT",
}: ListenVsOwnActionsProps) {
  const ac = accentColor;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: compact ? 6 : 8,
        alignItems: "center",
      }}
    >
      {listenUrl ? (
        <a
          href={listenUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            ...btnBase,
            border: "1px solid rgba(0,255,136,0.45)",
            background: "rgba(0,255,136,0.1)",
            color: "#00FF88",
          }}
        >
          ▶ {listenLabel}
        </a>
      ) : (
        <span
          style={{
            ...btnBase,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "rgba(255,255,255,0.28)",
            cursor: "default",
          }}
          title="No listen link yet — add streaming profile or audio URL"
        >
          ▶ {listenLabel}
        </span>
      )}

      {ownUrl ? (
        <a
          href={ownUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            ...btnBase,
            border: `1px solid ${ac}55`,
            background: `${ac}18`,
            color: ac,
          }}
        >
          🛍️ {ownLabel}
        </a>
      ) : (
        <span
          style={{
            ...btnBase,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "rgba(255,255,255,0.28)",
            cursor: "default",
          }}
          title="No storefront linked yet — connect Store & Commerce"
        >
          🛍️ {ownLabel}
        </span>
      )}
    </div>
  );
}
