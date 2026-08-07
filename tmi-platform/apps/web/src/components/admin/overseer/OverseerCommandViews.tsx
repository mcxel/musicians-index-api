"use client";

/**
 * In-container Overseer center views for Command Switcher.
 * Rule 20: real APIs or honest empty — never Math.random vanity metrics.
 */

import { useEffect, useState, type ReactNode } from "react";
import ObservatoryLiveSwitcher from "@/components/admin/overseer/ObservatoryLiveSwitcher";
import RuntimeCheckPanel from "@/components/admin/overseer/RuntimeCheckPanel";
import ApprovalQueueRail from "@/components/admin/ApprovalQueueRail";
import ArtistAnalyticsPanel from "@/components/admin/ArtistAnalyticsPanel";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";

export type OverseerCenterViewId =
  | "media"
  | "approve-queue"
  | "observatory"
  | "runtime-check"
  | "certification"
  | "global-pulse"
  | "venue-health"
  | "dynamics";

type LiveSnapshot = {
  status: "loading" | "ok" | "empty" | "error";
  sessionCount: number;
};

function useLiveSessionSnapshot(): LiveSnapshot {
  const [snap, setSnap] = useState<LiveSnapshot>({ status: "loading", sessionCount: 0 });

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setSnap({ status: "error", sessionCount: 0 });
          return;
        }
        const data = (await res.json()) as { sessions?: unknown[] };
        const count = data.sessions?.length ?? 0;
        setSnap({ status: count > 0 ? "ok" : "empty", sessionCount: count });
      } catch {
        if (active) setSnap({ status: "error", sessionCount: 0 });
      }
    };
    void poll();
    const id = setInterval(() => void poll(), 12000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return snap;
}

function HonestLiveStatCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        padding: 14,
        background: "#050510",
        color: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 8,
          letterSpacing: "0.28em",
          color: accent,
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        OVERSEER · IN-CONTAINER
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

export function GlobalPulseInContainer() {
  const snap = useLiveSessionSnapshot();

  return (
    <HonestLiveStatCard title="Global Pulse" accent="#AA2DFF">
      {snap.status === "loading" ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Loading live registry…</p>
      ) : null}
      {snap.status === "error" ? (
        <p style={{ fontSize: 12, color: "#FF4444" }}>Unable to load live sessions. Retry shortly.</p>
      ) : null}
      {snap.status === "empty" ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          No active rooms in GlobalLiveSessionRegistry. Pulse stays quiet until sessions go live.
        </p>
      ) : null}
      {snap.status === "ok" ? (
        <div
          style={{
            border: "1px solid rgba(170,45,255,0.35)",
            borderRadius: 10,
            padding: 14,
            background: "rgba(170,45,255,0.08)",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: "#AA2DFF" }}>{snap.sessionCount}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            Active live sessions (registry)
          </div>
        </div>
      ) : null}
    </HonestLiveStatCard>
  );
}

export function VenueHealthInContainer() {
  const snap = useLiveSessionSnapshot();

  return (
    <HonestLiveStatCard title="Venue Health" accent="#00FF88">
      {snap.status === "loading" ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Loading venue telemetry…</p>
      ) : null}
      {snap.status === "error" ? (
        <p style={{ fontSize: 12, color: "#FF4444" }}>Unable to load venue sessions.</p>
      ) : null}
      {snap.status === "empty" ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          No live venues right now. Health panel shows empty until rooms register.
        </p>
      ) : null}
      {snap.status === "ok" ? (
        <div
          style={{
            border: "1px solid rgba(0,255,136,0.35)",
            borderRadius: 10,
            padding: 14,
            background: "rgba(0,255,136,0.08)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>
            REGISTRY HEALTHY
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
            {snap.sessionCount} live room{snap.sessionCount === 1 ? "" : "s"} reporting
          </div>
        </div>
      ) : null}
    </HonestLiveStatCard>
  );
}

export function DynamicsInContainer() {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 10,
        padding: 10,
        background: "#050510",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF" }}>
        DYNAMICS / ANALYTICS
      </div>
      <div style={{ minHeight: 0, overflow: "auto", display: "grid", gap: 10 }}>
        <ArtistAnalyticsPanel />
        <MagazineAnalytics />
      </div>
    </div>
  );
}

export function renderOverseerCenterView(view: OverseerCenterViewId): ReactNode {
  switch (view) {
    case "approve-queue":
      return (
        <div style={{ height: "100%", overflow: "auto", padding: 8, background: "#050510" }}>
          <ApprovalQueueRail />
        </div>
      );
    case "observatory":
      return <ObservatoryLiveSwitcher embedded compact mode="dual" />;
    case "runtime-check":
      return <RuntimeCheckPanel modeLabel="Runtime Check" compact />;
    case "certification":
      return <RuntimeCheckPanel modeLabel="Certification" compact />;
    case "global-pulse":
      return <GlobalPulseInContainer />;
    case "venue-health":
      return <VenueHealthInContainer />;
    case "dynamics":
      return <DynamicsInContainer />;
    case "media":
    default:
      return null;
  }
}
