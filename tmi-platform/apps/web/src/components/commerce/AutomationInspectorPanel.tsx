"use client";

/**
 * AutomationInspectorPanel — last workflow runs (Rule 20: real run data only).
 * Mounts in Commerce Center Settings (or admin surfaces).
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { listAutomationWorkflows } from "@/lib/livingOs/AutomationRegistry";
import {
  listWorkflowRuns,
  type WorkflowRunRecord,
  type WorkflowRunStatus,
} from "@/lib/livingOs/workflowRunStore";
import {
  listRelatedForAsset,
  listRelatedReleaseAssets,
} from "@/lib/livingOs/AssetRelationshipGraph";

export interface AutomationInspectorPanelProps {
  performerId: string;
  accentColor?: string;
}

const STATUS_COLOR: Record<WorkflowRunStatus, string> = {
  Running: "#00FFFF",
  Completed: "#39FF14",
  Failed: "#FF4D6D",
  Retrying: "#FFD700",
};

export default function AutomationInspectorPanel({
  performerId,
  accentColor = "#AA2DFF",
}: AutomationInspectorPanelProps) {
  const ac = accentColor;
  const [runs, setRuns] = useState<WorkflowRunRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRuns(listWorkflowRuns(performerId));
  }, [performerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while a run is in-flight so Inspector shows live step progress
  useEffect(() => {
    const running = runs.some((r) => r.status === "Running" || r.status === "Retrying");
    if (!running) return;
    const id = window.setInterval(() => refresh(), 400);
    return () => window.clearInterval(id);
  }, [runs, refresh]);

  const catalog = listAutomationWorkflows();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac }}>
            AUTOMATION INSPECTOR
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
            Real workflow runs only — never seeded. Catalog status is honest COMING_SOON where unimplemented.
          </p>
        </div>
        <button type="button" onClick={refresh} style={btn(ac)}>
          Refresh
        </button>
      </div>

      <div
        style={{
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${ac}33`,
          background: "rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
          WORKFLOW CATALOG
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {catalog.map((w) => (
            <li
              key={w.id}
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.65)",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>{w.label}</span>
              <span style={{ color: w.status === "ACTIVE" ? "#39FF14" : "rgba(255,255,255,0.35)", fontWeight: 800 }}>
                {w.status === "ACTIVE" ? "ACTIVE" : "COMING SOON"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {runs.length === 0 ? (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${ac}33`,
            background: "rgba(0,0,0,0.28)",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          No workflow runs yet. Launch a release from Release Manager to see history here.
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {runs.map((run) => {
            const open = expanded === run.runId;
            const color = STATUS_COLOR[run.status];
            return (
              <li
                key={run.runId}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${color}44`,
                  background: "rgba(0,0,0,0.25)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : run.runId)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800 }}>{run.workflowId}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {new Date(run.startedAt).toLocaleString()}
                        {run.releaseId ? ` · ${run.releaseId}` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color }}>
                      {run.status.toUpperCase()}
                    </span>
                  </div>
                </button>
                {open ? (
                  <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {run.steps.map((s) => (
                      <div
                        key={s.stepId}
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.55)",
                          display: "grid",
                          gridTemplateColumns: "18px 1fr auto",
                          gap: 6,
                          alignItems: "start",
                          background: s.status === "RUNNING" ? "rgba(0,255,255,0.08)" : "transparent",
                          borderRadius: 4,
                          padding: "2px 4px",
                        }}
                      >
                        <span>{stepGlyph(s.status)}</span>
                        <span>
                          <strong style={{ color: "rgba(255,255,255,0.8)" }}>{s.label}</strong>
                          <span style={{ display: "block", color: "rgba(255,255,255,0.28)", marginTop: 1, fontSize: 8 }}>
                            {s.startedAt ? new Date(s.startedAt).toLocaleTimeString() : "—"}
                            {s.finishedAt ? ` → ${new Date(s.finishedAt).toLocaleTimeString()}` : ""}
                          </span>
                          {s.message ? (
                            <span style={{ display: "block", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                              {s.message}
                            </span>
                          ) : null}
                        </span>
                        <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>
                          {s.status === "COMPLETED"
                            ? "Done"
                            : s.status === "PENDING"
                              ? "Pending"
                              : s.status === "RUNNING"
                                ? "Running"
                                : s.status === "FAILED"
                                  ? "Failed"
                                  : s.status === "SKIPPED"
                                    ? "Skipped"
                                    : s.status}
                        </span>
                      </div>
                    ))}
                    {run.graph.edges.length > 0 ? (
                      <div style={{ marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.45 }}>
                        Assets: {run.graph.edges.map((e) => `${e.kind}:${e.assetId}`).join(" · ")}
                        {(() => {
                          const rel = listRelatedReleaseAssets(run.graph);
                          const yopho = rel.yophoEditionIds[0];
                          if (!yopho) return null;
                          const links = listRelatedForAsset(run.graph, yopho);
                          if (
                            links.albumIds.length === 0 &&
                            links.magazineIds.length === 0 &&
                            links.beatIds.length === 0
                          ) {
                            return null;
                          }
                          return (
                            <span style={{ display: "block", marginTop: 4 }}>
                              YoPho {yopho} related
                              {links.albumIds.length ? ` · album: ${links.albumIds.join(", ")}` : ""}
                              {links.magazineIds.length
                                ? ` · magazine: ${links.magazineIds.join(", ")}`
                                : ""}
                              {links.beatIds.length ? ` · beat: ${links.beatIds.join(", ")}` : ""}
                            </span>
                          );
                        })()}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function stepGlyph(status: string): string {
  if (status === "COMPLETED") return "✓";
  if (status === "FAILED") return "✗";
  if (status === "SKIPPED") return "–";
  if (status === "QUEUED" || status === "RETRYING") return "…";
  if (status === "RUNNING") return "▸";
  return "○";
}

function btn(color: string): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 6,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: 10,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
