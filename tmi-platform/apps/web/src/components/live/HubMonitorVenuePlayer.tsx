"use client";

/**
 * Monitor B — BOH house viewport of the SAME canonical room (UVR inside player only).
 * Lounge rooms: group/room view, no avatar stadium fill.
 * Audience count = real humans from /api/live/audience (Rule 20 — no bot inflation).
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { hubMonitorUvrProps, isLoungeRoomId, resolveHubMonitorViewport } from "@/lib/live/canonicalWorldViewport";
import HubVenueHudDrawer from "@/components/live/HubVenueHudDrawer";
import { useWorldScenePlanStore } from "@/lib/world/worldScenePlanStore";
import { useGoLiveBootstrapStore } from "@/lib/live/goLiveBootstrapStore";
import {
  getStageSnapshot,
  markIntermissionAdOpportunity,
  subscribeStage,
} from "@/lib/live/StageLifecycleEngine";
import { resolveCurtainAdCampaign } from "@/lib/presentation/CurtainRuntimeManager";
import { countHumanAttendance } from "@/lib/venues/venuePresenceMetrics";

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
  const scenePlan = useWorldScenePlanStore((s) => s.plans[roomId] ?? null);
  const [watching, setWatching] = useState(0);
  const [intermission, setIntermission] = useState(
    () => getStageSnapshot().state === "INTERMISSION",
  );
  const [breakBoard, setBreakBoard] = useState<{
    name: string;
    href: string;
    house: boolean;
  } | null>(null);
  const lounge = isLoungeRoomId(roomId);
  const BOH = resolveHubMonitorViewport("B", {
    zone: scenePlan?.canonicalZone ?? (lounge ? "LOUNGE_SIDE_ROOM" : undefined),
  });

  const uvrProps = hubMonitorUvrProps("B", roomId, {
    instantEmptyStage: true,
    forceStadiumFill: false,
    zone: lounge ? "LOUNGE_SIDE_ROOM" : undefined,
    scenePlan,
  });

  useEffect(() => {
    if (!roomId) return;
    useGoLiveBootstrapStore.getState().markVenueReady(true);
    useGoLiveBootstrapStore.getState().markHudReady(true);
  }, [roomId]);

  useEffect(() => {
    return subscribeStage((s) => {
      const onBreak = s.state === "INTERMISSION";
      setIntermission(onBreak);
      if (onBreak) {
        const campaign = resolveCurtainAdCampaign("curtain-ad-rail");
        setBreakBoard({
          name: campaign.advertiserName,
          href: campaign.creativeUrl,
          house: campaign.isHousePromotion,
        });
        markIntermissionAdOpportunity({
          played: true,
          campaignId: campaign.campaignId,
        });
      } else {
        setBreakBoard(null);
      }
    });
  }, []);

  // Real human occupancy whenever a room is bound (host OR watcher) — not gated on isLivePublished.
  useEffect(() => {
    if (!roomId) {
      setWatching(0);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/live/audience?venue=${encodeURIComponent(roomId)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          activeMembers?: Array<{ role?: string; displayName?: string; active?: boolean }>;
        };
        const members = Array.isArray(data.activeMembers) ? data.activeMembers : [];
        const humans = countHumanAttendance(members);
        if (!cancelled) {
          setWatching(humans);
          window.dispatchEvent(
            new CustomEvent("tmi:watch-audience-count", {
              detail: { roomId, viewers: humans },
            }),
          );
        }
      } catch {
        /* honest empty */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [roomId]);

  if (!roomId) {
    return <HubMonitorIdle label="Stage ready — press GO LIVE" />;
  }

  const safeUvrProps = uvrProps
    ? {
        ...uvrProps,
        instantEmptyStage: true,
        forceStadiumFill: false,
      }
    : null;

  return (
    <div
      data-hub-monitor-venue-player="true"
      data-canonical-viewport={BOH.role}
      data-canonical-zone={BOH.zone}
      data-audience-scene-view={BOH.audienceSceneView}
      data-lounge-avatars={lounge ? "false" : undefined}
      data-view-mode={scenePlan?.viewMode ?? "FREE_ROAM_3D"}
      data-spatial-units={scenePlan?.spatialMap.units ?? "ft"}
      data-spatial-area-sqft={scenePlan?.spatialMap.floor.areaSqFt}
      data-intermission={intermission ? "true" : "false"}
      data-audience-watching={watching}
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
        {intermission ? (
          <span
            style={{
              background: "rgba(255,215,0,0.2)",
              color: "#FFD700",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            INTERMISSION
          </span>
        ) : isLivePublished ? (
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
        <span
          data-audience-count="true"
          style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800 }}
        >
          {watching} watching
        </span>
      </div>

      <HubVenueHudDrawer roomId={roomId} watching={watching} isLivePublished={isLivePublished} />

      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {safeUvrProps ? <UniversalVenueRenderer {...safeUvrProps} /> : null}
      </div>

      {intermission && breakBoard ? (
        <div
          data-intermission-break-board="true"
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 36,
            zIndex: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(5,5,16,0.92)",
            border: breakBoard.house
              ? "1px solid rgba(255,215,0,0.4)"
              : "1px solid rgba(0,255,136,0.45)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
            INTERMISSION · BREAK BOARD
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 4 }}>
            {breakBoard.name}
          </div>
          <a
            href={breakBoard.href}
            style={{ fontSize: 9, color: "#00FFFF", fontWeight: 700 }}
            onClick={() => markIntermissionAdOpportunity({ completed: true })}
          >
            {breakBoard.house ? "Open promo / advertise" : "Open sponsor"} →
          </a>
        </div>
      ) : null}
    </div>
  );
}
