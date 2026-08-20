"use client";

/**
 * Monitor B — BOH house viewport of the SAME canonical room (UVR inside player only).
 * Lounge rooms: group/room view, no avatar stadium fill.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { hubMonitorUvrProps, isLoungeRoomId, resolveHubMonitorViewport } from "@/lib/live/canonicalWorldViewport";
import HubVenueHudDrawer from "@/components/live/HubVenueHudDrawer";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false, loading: () => <HubMonitorIdle label="Loading venue…" /> },
);

function HubMonitorIdle({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "radial-gradient(circle at 50% 28%, rgba(170,45,255,0.1), #010308 72%)",
      }}
    >
      <span style={{ fontSize: 24, opacity: 0.35 }}>🎭</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.42)",
          textTransform: "uppercase",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function HubMonitorVenuePlayer({ roomId }: { roomId: string }) {
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const [watching, setWatching] = useState(0);
  const lounge = isLoungeRoomId(roomId);
  const BOH = resolveHubMonitorViewport("B", { zone: lounge ? "LOUNGE_SIDE_ROOM" : undefined });

  const uvrProps = hubMonitorUvrProps("B", roomId, {
    instantEmptyStage: !isLivePublished,
    forceStadiumFill: lounge ? false : isLivePublished,
    zone: lounge ? "LOUNGE_SIDE_ROOM" : undefined,
  });

  useEffect(() => {
    if (!isLivePublished) {
      setWatching(0);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          sessions?: Array<{ roomId: string; viewerCount: number }>;
        };
        const session = data.sessions?.find((s) => s.roomId === roomId);
        if (!cancelled) setWatching(session?.viewerCount ?? 0);
      } catch {
        /* honest empty */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isLivePublished, roomId]);

  if (!roomId) {
    return <HubMonitorIdle label="Stage ready — press GO LIVE" />;
  }

  return (
    <div
      data-hub-monitor-venue-player="true"
      data-canonical-viewport={BOH.role}
      data-canonical-zone={BOH.zone}
      data-audience-scene-view={BOH.audienceSceneView}
      data-lounge-avatars={lounge ? "false" : undefined}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#010308" }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 6,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            background: "rgba(170,45,255,0.15)",
            color: "#AA2DFF",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.12em",
          }}
        >
          {BOH.shortLabel} · {lounge ? "ROOM" : "HOUSE"}
        </span>
        {isLivePublished ? (
          <span
            style={{
              background: "#FF2020",
              color: "#fff",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            ● LIVE
          </span>
        ) : (
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.55)",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            {lounge ? "LOUNGE READY" : "STAGE READY"}
          </span>
        )}
        <span style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800 }}>
          {watching} watching
        </span>
      </div>

      <HubVenueHudDrawer roomId={roomId} watching={watching} isLivePublished={isLivePublished} />

      <div style={{ position: "absolute", inset: 0 }}>
        {uvrProps ? <UniversalVenueRenderer {...uvrProps} /> : null}
      </div>
    </div>
  );
}
