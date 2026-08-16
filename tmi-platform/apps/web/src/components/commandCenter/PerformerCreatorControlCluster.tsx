"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

type Props = {
  compact?: boolean;
};

function clusterButtonStyle(active: boolean): CSSProperties {
  return {
    borderRadius: 8,
    border: `1px solid ${active ? "#FF2DAA66" : "rgba(255,255,255,0.14)"}`,
    background: active ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.05)",
    color: active ? "#FFB8E6" : "rgba(255,255,255,0.82)",
    padding: "8px 10px",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

export default function PerformerCreatorControlCluster({ compact = false }: Readonly<Props>) {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  const [fullScreenOn, setFullScreenOn] = useState(false);

  const actions = useMemo(
    () => [
      {
        id: "camera",
        label: cameraOn ? "📷 CAMERA ON" : "📷 CAMERA",
        active: cameraOn,
        onClick: () => setCameraOn((v) => !v),
      },
      {
        id: "mic",
        label: micOn ? "🎤 MIC ON" : "🎤 MIC",
        active: micOn,
        onClick: () => setMicOn((v) => !v),
      },
      {
        id: "live",
        label: liveOn ? "⏹ END LIVE" : "🔴 GO LIVE",
        active: liveOn,
        onClick: () => setLiveOn((v) => !v),
      },
      {
        id: "share-screen",
        label: "🖥 SHARE SCREEN",
        active: false,
        onClick: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("tmi:performer-share-screen"));
          }
        },
      },
      {
        id: "swap",
        label: "🔁 SWAP",
        active: false,
        onClick: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("tmi:performer-camera-swap"));
          }
        },
      },
      {
        id: "fullscreen",
        label: fullScreenOn ? "🗗 EXIT FULL" : "⛶ FULLSCREEN",
        active: fullScreenOn,
        onClick: () => setFullScreenOn((v) => !v),
      },
    ],
    [cameraOn, micOn, liveOn, fullScreenOn],
  );

  return (
    <section
      data-performer-control-cluster
      style={{
        marginTop: compact ? 10 : 14,
        border: "1px solid rgba(255,45,170,0.35)",
        borderRadius: 12,
        padding: compact ? "10px 10px" : "12px 12px",
        background: "linear-gradient(145deg, rgba(18,9,22,0.94), rgba(9,8,18,0.92))",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: "#FF2DAA",
          marginBottom: 10,
        }}
      >
        CREATOR CONTROL CLUSTER
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            style={clusterButtonStyle(action.active)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 8,
          marginTop: 10,
        }}
      >
        <Link
          href="/performer/analytics"
          style={{
            textDecoration: "none",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.86)",
            padding: "8px 10px",
            fontSize: 10,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "0.07em",
          }}
        >
          👥 AUDIENCE
        </Link>
        <Link
          href="/dashboard/performer/earnings"
          style={{
            textDecoration: "none",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.86)",
            padding: "8px 10px",
            fontSize: 10,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "0.07em",
          }}
        >
          💰 REVENUE
        </Link>
        <Link
          href="/wallet"
          style={{
            textDecoration: "none",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.86)",
            padding: "8px 10px",
            fontSize: 10,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "0.07em",
          }}
        >
          🎁 TIPS
        </Link>
      </div>
    </section>
  );
}
