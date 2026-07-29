/**
 * LobbyDiscoveryCard — Brady Bunch tile for Live Lobby Walls.
 * Neon conic-gradient rim (GPU-safe CSS). Poster by default; low-res preview only when focused.
 * Never opens WebRTC for discovery tiles.
 */

"use client";

import { isoCountryToFlag, type LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";

export interface LobbyDiscoveryCardProps {
  record: LiveDiscoveryRecord;
  focused?: boolean;
  highlighted?: boolean;
  onJoin: (record: LiveDiscoveryRecord) => void;
}

const PLACEHOLDER =
  "linear-gradient(145deg, rgba(10,6,20,0.95), rgba(5,5,16,0.98) 40%, rgba(170,45,255,0.15))";

export default function LobbyDiscoveryCard({
  record,
  focused = false,
  highlighted = false,
  onJoin,
}: LobbyDiscoveryCardProps) {
  const flag = isoCountryToFlag(record.countryCode);
  const showLowRes =
    focused && record.previewMode === "low_res" && Boolean(record.previewUrl);
  const poster = record.posterUrl;

  return (
    <button
      type="button"
      onClick={() => onJoin(record)}
      aria-label={`Join ${record.title} live — ${record.humanViewerCount} watching`}
      style={{
        position: "relative",
        flex: "0 0 auto",
        width: 168,
        height: 210,
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
      {/* Spinning neon rim — rotate transform (GPU compositing), mask keeps frame only */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40%",
          background: `conic-gradient(${record.accentColor}, #FF2DAA, #FFD700, #AA2DFF, #00FFFF, ${record.accentColor})`,
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
          background: PLACEHOLDER,
          border: "1px solid rgba(255,255,255,0.08)",
          zIndex: 2,
        }}
      >
        {showLowRes ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={record.previewUrl!}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "contrast(1.05) saturate(1.1)",
            }}
          />
        ) : poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              opacity: 0.5,
            }}
          >
            📡
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
            background: "#E63000",
            color: "#fff",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          ● LIVE
        </div>

        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 14,
            lineHeight: 1,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
          }}
          title={record.countryCode === "ZZ" ? "Worldwide" : record.countryCode}
        >
          {flag}
        </div>

        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
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
            {record.title}
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
            {record.hostName}
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
              color: "#00FFFF",
            }}
          >
            <span style={{ textTransform: "uppercase", opacity: 0.85 }}>
              {record.category.replace(/_/g, " ")}
            </span>
            <span style={{ color: "#00FF88" }}>
              👤 {record.humanViewerCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
