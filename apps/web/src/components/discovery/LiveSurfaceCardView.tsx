/**
 * LiveSurfaceCardView — shared Lobby Wall / Live Discovery tile.
 * Renders honest LiveSurfaceCard fields only (Rule 20).
 * SELECT ≠ WATCH ≠ JOIN — join only via explicit JOIN control.
 */

"use client";

import { isoCountryToFlag } from "@/lib/discovery/LiveDiscoveryRecord";
import {
  liveSurfaceStateBadge,
  type LiveSurfaceCard,
} from "@/lib/discovery/LiveSurfaceCard";

export interface LiveSurfaceCardViewProps {
  card: LiveSurfaceCard;
  focused?: boolean;
  highlighted?: boolean;
  fillGrid?: boolean;
  onJoin: (card: LiveSurfaceCard) => void;
  onSelect?: (card: LiveSurfaceCard) => void;
  onWatch?: (card: LiveSurfaceCard) => void;
}

function runtimeGlyph(runtimeType: LiveSurfaceCard["runtimeType"]): string {
  switch (runtimeType) {
    case "battle": return "⚔️";
    case "cypher": return "🎤";
    case "challenge": return "🎵";
    case "dance": return "💃";
    case "game": return "🎮";
    case "fan_lobby": return "👥";
    case "concert": return "🏟️";
    case "comedy": return "😂";
    case "dj": return "🎧";
    default: return "📡";
  }
}

export default function LiveSurfaceCardView({
  card,
  focused = false,
  highlighted = false,
  fillGrid = false,
  onJoin,
  onSelect,
  onWatch,
}: LiveSurfaceCardViewProps) {
  const flag = card.country ? isoCountryToFlag(card.country) : null;
  const badge = liveSurfaceStateBadge(card.state);
  const isLive = card.state === "live";
  const accent = card.accentColor ?? "#00FFFF";
  const preview = card.previewMediaUrl;
  const audienceLabel =
    card.audienceCount > 0
      ? `👤 ${card.audienceCount.toLocaleString()}`
      : "No audience yet";

  return (
    <div
      role="group"
      aria-label={`${badge}: ${card.title} — ${audienceLabel}`}
      data-live-surface-card={card.eventId}
      data-runtime-type={card.runtimeType}
      data-mosaic-muted-default="true"
      tabIndex={0}
      onClick={() => (onSelect ? onSelect(card) : undefined)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onSelect) onSelect(card);
        }
      }}
      style={{
        position: "relative",
        flex: fillGrid ? "1 1 auto" : "0 0 auto",
        width: fillGrid ? "100%" : 168,
        height: fillGrid ? 220 : 210,
        padding: 0,
        border: "none",
        borderRadius: 14,
        cursor: "pointer",
        background: "transparent",
        textAlign: "left",
        outline: highlighted ? "2px solid #FFD700" : "none",
        outlineOffset: 2,
        transform: highlighted ? "scale(1.03)" : "scale(1)",
        transition: "transform 180ms ease, outline-color 180ms ease",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40%",
          background: `conic-gradient(${accent}, #FF2DAA, #FFD700, #AA2DFF, #00FFFF, ${accent})`,
          animation: "tmiLobbyRimSpin 3.5s linear infinite",
          opacity: focused || highlighted ? 1 : 0.8,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: 12,
          background: "#050510",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: 12,
          overflow: "hidden",
          background: "#121918",
          border: "1px solid rgba(255,255,255,0.08)",
          zIndex: 2,
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: focused ? "contrast(1.05) saturate(1.1)" : undefined,
            }}
          />
        ) : (
          <div
            data-no-video-preview="true"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "rgba(238,243,239,0.65)",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 22 }}>{runtimeGlyph(card.runtimeType)}</span>
            <span>ROOM LIVE · NO VIDEO PREVIEW</span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,5,16,0.15) 0%, rgba(5,5,16,0.2) 45%, rgba(5,5,16,0.92) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            borderRadius: 4,
            background: isLive ? "#E63000" : "rgba(0,0,0,0.7)",
            color: "#fff",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          {isLive ? "● LIVE" : badge}
        </div>

        {flag && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 14,
              lineHeight: 1,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
            }}
            title={card.country}
          >
            {flag}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 36,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.65)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.subtitle}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 2,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: accent,
            }}
          >
            <span style={{ textTransform: "uppercase", opacity: 0.85 }}>
              {card.runtimeType.replace(/_/g, " ")}
            </span>
            <span style={{ color: card.audienceCount > 0 ? "#00FF88" : "rgba(255,255,255,0.4)" }}>
              {audienceLabel}
            </span>
          </div>
        </div>

        <div
          data-mosaic-actions="SELECT_WATCH_JOIN"
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            bottom: 6,
            display: "flex",
            gap: 4,
            zIndex: 4,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-mosaic-intent="WATCH"
            onClick={(e) => {
              e.stopPropagation();
              if (onWatch) onWatch(card);
              else if (onSelect) onSelect(card);
            }}
            style={{
              flex: 1,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.06em",
              borderRadius: 6,
              border: `1px solid ${accent}88`,
              background: "rgba(5,5,16,0.85)",
              color: accent,
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            WATCH
          </button>
          <button
            type="button"
            data-mosaic-intent="JOIN"
            onClick={(e) => {
              e.stopPropagation();
              onJoin(card);
            }}
            style={{
              flex: 1,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.06em",
              borderRadius: 6,
              border: "1px solid rgba(255,215,0,0.7)",
              background: "rgba(255,215,0,0.18)",
              color: "#FFD700",
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
}
