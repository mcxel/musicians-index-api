"use client";

import type { AdminRouteTarget } from "@/lib/adminRouteMap";
import { useEffect, useState } from "react";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";

type AdminMonitorRouterProps = {
  selectedTarget: AdminRouteTarget;
  onOpenFullView: () => void;
};

export default function AdminMonitorRouter({ selectedTarget, onOpenFullView }: AdminMonitorRouterProps) {
  const previewSrc = `${selectedTarget.route}?preview=1`;
  const [artifactTelemetry, setArtifactTelemetry] = useState({
    artifactId: "none",
    scope: "admin-preview",
    state: "idle",
    at: 0,
  });

  useEffect(() => {
    const onFeed = (event: Event) => {
      const detail = (event as CustomEvent<{ artifactId?: string; scope?: string; state?: string; timestamp?: number }>).detail;
      if (detail?.state) {
        setArtifactTelemetry({
          artifactId: detail.artifactId ?? "unknown",
          scope: detail.scope ?? "unknown",
          state: detail.state,
          at: detail.timestamp ?? Date.now(),
        });
      }
    };

    window.addEventListener("tmi:artifact-feed", onFeed);
    return () => window.removeEventListener("tmi:artifact-feed", onFeed);
  }, []);

  return (
    <section
      style={{
        border: "1px solid rgba(250,204,21,0.4)",
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(34,15,54,0.92), rgba(8,8,18,0.95))",
        boxShadow: "0 0 24px rgba(250,204,21,0.12)",
        minHeight: 460,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(250,204,21,0.35)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <strong style={{ color: "#fcd34d", letterSpacing: "0.16em", fontSize: 11 }}>TV SCREEN ROUTER</strong>
        <span style={{ color: "#cbd5e1", fontSize: 12 }}>{selectedTarget.label}</span>
        <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: 11 }}>{selectedTarget.route}</span>
      </header>

      <ArtifactMotionFrame
        artifactId={`admin-preview-${selectedTarget.id}`}
        scope="admin-preview"
        routeTarget={selectedTarget.route}
        featured
        cycleMs={4300}
        data-pdf-source="Tmi PDF's"
        data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
        data-testid={`admin-preview-${selectedTarget.id}`}
        aria-label={`Admin preview card ${selectedTarget.label}`}
        data-fallback-route="/admin"
        style={{ padding: 10 }}
      >
        <iframe
          title={`Admin preview ${selectedTarget.label}`}
          src={previewSrc}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 360,
            border: "1px solid rgba(56,189,248,0.4)",
            borderRadius: 10,
            background: "#020617",
          }}
        />
      </ArtifactMotionFrame>

      <footer
        style={{
          borderTop: "1px solid rgba(56,189,248,0.35)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#93c5fd", fontSize: 11 }}>
          Preview Mode: active · {artifactTelemetry.scope}/{artifactTelemetry.artifactId} · {artifactTelemetry.state}
          {artifactTelemetry.at ? ` · ${new Date(artifactTelemetry.at).toLocaleTimeString()}` : ""}
        </span>
        <button
          type="button"
          onClick={onOpenFullView}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(56,189,248,0.65)",
            background: "rgba(14,116,144,0.25)",
            color: "#e0f2fe",
            letterSpacing: "0.12em",
            fontSize: 10,
            textTransform: "uppercase",
            fontWeight: 700,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Open Full View
        </button>
      </footer>
    </section>
  );
}
