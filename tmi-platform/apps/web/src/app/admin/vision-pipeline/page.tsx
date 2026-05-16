"use client";

import { useEffect, useState } from "react";
import { getIngestionStats } from "@/lib/vision/AssetIngestionGateway";
import { getDecompositionStats } from "@/lib/vision/VisionDecompositionEngine";
import { getLayerIsolationStats } from "@/lib/vision/LayerIsolationEngine";
import { getGraphBuilderStats } from "@/lib/vision/ReconstructionGraphBuilder";
import { getBinderStats } from "@/lib/vision/RuntimeAuthorityBinder";
import { getRouterStats } from "@/lib/vision/GeneratorAssetRouter";
import { getVisionBridgeStats } from "@/lib/vision/VisionAuthorityBridge";
import { getTelemetrySummary, getCriticalEvents } from "@/lib/vision/VisionTelemetryTracker";
import { getValidatorStats } from "@/lib/vision/ReconstructionValidator";
import type { TelemetryEvent } from "@/lib/vision/VisionTelemetryTracker";

const CYAN    = "#00ffff";
const FUCHSIA = "#ff00ff";
const GOLD    = "#ffd700";
const GREEN   = "#00ff88";
const RED     = "#ff4444";
const PURPLE  = "#9933ff";
const DARK    = "#0a0a1a";
const PANEL   = "#0f0f2a";
const BORDER  = "#1a1a3a";

function StatBlock({
  label, value, color = CYAN, sub,
}: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{
      background: PANEL, border: `1px solid ${BORDER}`,
      borderRadius: 8, padding: "16px 20px", minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace", marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StageRow({ stage, label, color, stats }: { stage: string; label: string; color: string; stats: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 18px", background: PANEL, border: `1px solid ${BORDER}`,
      borderRadius: 8, marginBottom: 8,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: color, display: "flex", alignItems: "center",
        justifyContent: "center", fontWeight: 700, fontSize: 14,
        color: DARK, flexShrink: 0,
      }}>{stage}</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>{stats}</div>
      </div>
    </div>
  );
}

function Chip({ label, value, color = "#aaa" }: { label: string; value: string | number; color?: string }) {
  return (
    <span style={{ fontSize: 12, color: "#777" }}>
      {label}: <span style={{ color, fontFamily: "monospace", fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: RED, error: FUCHSIA, warning: GOLD, info: CYAN,
  };
  return (
    <span style={{
      fontSize: 10, padding: "2px 6px", borderRadius: 4,
      background: colors[severity] ?? "#444", color: DARK,
      fontWeight: 700, textTransform: "uppercase", marginLeft: 6,
    }}>{severity}</span>
  );
}

export default function VisionPipelinePage() {
  const [ingestion, setIngestion] = useState(() => getIngestionStats());
  const [decomp, setDecomp] = useState(() => getDecompositionStats());
  const [isolation, setIsolation] = useState(() => getLayerIsolationStats());
  const [graph, setGraph] = useState(() => getGraphBuilderStats());
  const [binder, setBinder] = useState(() => getBinderStats());
  const [router, setRouter] = useState(() => getRouterStats());
  const [bridge, setBridge] = useState(() => getVisionBridgeStats());
  const [telemetry, setTelemetry] = useState(() => getTelemetrySummary());
  const [criticals, setCriticals] = useState<TelemetryEvent[]>(() => getCriticalEvents());
  const [validator, setValidator] = useState(() => getValidatorStats());

  useEffect(() => {
    const id = setInterval(() => {
      setIngestion(getIngestionStats());
      setDecomp(getDecompositionStats());
      setIsolation(getLayerIsolationStats());
      setGraph(getGraphBuilderStats());
      setBinder(getBinderStats());
      setRouter(getRouterStats());
      setBridge(getVisionBridgeStats());
      setTelemetry(getTelemetrySummary());
      setCriticals(getCriticalEvents());
      setValidator(getValidatorStats());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const queueDepths = router.queueDepths ?? {};
  const topQueues = Object.entries(queueDepths)
    .filter(([, depth]) => depth > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8);

  return (
    <div style={{ background: DARK, minHeight: "100vh", color: "#eee", padding: 32, fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: FUCHSIA, textTransform: "uppercase", letterSpacing: 3 }}>
          TMI Admin — Phase 7+8
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: CYAN, margin: "8px 0 4px" }}>
          Vision Pipeline
        </h1>
        <div style={{ fontSize: 13, color: "#666" }}>
          Stage A→G Authority Pipeline · Phase 8 Universal File Decomposer · Live telemetry
        </div>
      </div>

      {/* Top-level stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatBlock label="Ingested Assets" value={ingestion.total} color={CYAN} />
        <StatBlock label="Decompositions" value={decomp.totalDecompositions} color={CYAN} />
        <StatBlock label="Artifacts" value={decomp.totalArtifacts} color={GOLD} />
        <StatBlock label="Recon Nodes" value={graph.totalNodes} color={GREEN} />
        <StatBlock label="Bound Nodes" value={binder.totalBoundNodes} color={GREEN} />
        <StatBlock label="Routes" value={router.routedCount} color={PURPLE} sub={`${router.rejectedCount} rejected`} />
        <StatBlock label="Validations" value={validator.totalReports} color={validator.failed > 0 ? FUCHSIA : GREEN}
          sub={`${validator.passed} passed · ${validator.failed} failed`} />
        <StatBlock label="Critical Events" value={telemetry.criticalCount} color={telemetry.criticalCount > 0 ? RED : GREEN} />
      </div>

      {/* Pipeline Stages A→G */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: GOLD, marginBottom: 16 }}>Pipeline Stages</h2>

        <StageRow stage="A" label="Ingestion — AssetIngestionGateway" color={CYAN} stats={<>
          <Chip label="Total" value={ingestion.total} color={CYAN} />
          <Chip label="Reconstructable" value={ingestion.reconstructableCount} color={GREEN} />
          <Chip label="Authority Denied" value={ingestion.authorityDenied} color={ingestion.authorityDenied > 0 ? RED : GREEN} />
          <Chip label="Decomposing" value={ingestion.byStage?.decomposing ?? 0} color={GOLD} />
          <Chip label="Complete" value={ingestion.byStage?.complete ?? 0} color={GREEN} />
          <Chip label="Failed" value={ingestion.byStage?.failed ?? 0} color={RED} />
        </>} />

        <StageRow stage="B" label="Decomposition — VisionDecompositionEngine + LayerIsolationEngine" color={GOLD} stats={<>
          <Chip label="Decompositions" value={decomp.totalDecompositions} color={CYAN} />
          <Chip label="Artifacts" value={decomp.totalArtifacts} color={GOLD} />
          <Chip label="Animatable" value={decomp.totalAnimatable} color={GREEN} />
          <Chip label="Isolated Layers" value={isolation.totalLayers} color={CYAN} />
          <Chip label="Face Regions" value={isolation.byCategory?.["face-region"] ?? 0} color={FUCHSIA} />
          <Chip label="Motion Candidates" value={isolation.byCategory?.["motion-candidate"] ?? 0} color={PURPLE} />
          <Chip label="Errors" value={decomp.totalErrors + isolation.totalErrors} color={decomp.totalErrors + isolation.totalErrors > 0 ? RED : GREEN} />
        </>} />

        <StageRow stage="C" label="Reconstruction Graph — ReconstructionGraphBuilder" color={GREEN} stats={<>
          <Chip label="Graphs" value={graph.totalGraphs} color={CYAN} />
          <Chip label="Nodes" value={graph.totalNodes} color={GREEN} />
          <Chip label="Edges" value={graph.totalEdges} color={GOLD} />
          <Chip label="Avatar Parts" value={graph.totalAvatarParts} color={FUCHSIA} />
          <Chip label="Overlays" value={graph.totalOverlayFragments} color={PURPLE} />
          <Chip label="Errors" value={graph.totalErrors} color={graph.totalErrors > 0 ? RED : GREEN} />
        </>} />

        <StageRow stage="D" label="Authority Binding — RuntimeAuthorityBinder" color={PURPLE} stats={<>
          <Chip label="Bindings" value={binder.totalBindings} color={CYAN} />
          <Chip label="Bound" value={binder.totalBoundNodes} color={GREEN} />
          <Chip label="Failed" value={binder.totalFailed} color={binder.totalFailed > 0 ? RED : GREEN} />
          <Chip label="Stale" value={binder.staleCount} color={binder.staleCount > 0 ? GOLD : GREEN} />
          <Chip label="Recovering" value={binder.recoveringCount} color={binder.recoveringCount > 0 ? FUCHSIA : GREEN} />
        </>} />

        <StageRow stage="E" label="Generator Routing — GeneratorAssetRouter" color={FUCHSIA} stats={<>
          <Chip label="Manifests" value={router.totalManifests} color={CYAN} />
          <Chip label="Routed" value={router.routedCount} color={GREEN} />
          <Chip label="Consumed" value={router.consumedCount} color={GOLD} />
          <Chip label="Rejected" value={router.rejectedCount} color={router.rejectedCount > 0 ? RED : GREEN} />
          <Chip label="Stale" value={router.staleCount} color={router.staleCount > 0 ? GOLD : GREEN} />
          <Chip label="Bridge Jobs" value={bridge.total} color={CYAN} />
          <Chip label="Bridge Failed" value={bridge.failed} color={bridge.failed > 0 ? RED : GREEN} />
        </>} />

        <StageRow stage="F" label="Telemetry — VisionTelemetryTracker" color={GOLD} stats={<>
          <Chip label="Total Events" value={telemetry.total} color={CYAN} />
          <Chip label="Unresolved" value={telemetry.unresolved} color={telemetry.unresolved > 0 ? GOLD : GREEN} />
          <Chip label="Critical" value={telemetry.bySeverity?.critical ?? 0} color={telemetry.bySeverity?.critical > 0 ? RED : GREEN} />
          <Chip label="Errors" value={telemetry.bySeverity?.error ?? 0} color={telemetry.bySeverity?.error > 0 ? FUCHSIA : GREEN} />
          <Chip label="Warnings" value={telemetry.bySeverity?.warning ?? 0} color={GOLD} />
        </>} />

        <StageRow stage="G" label="Validation — ReconstructionValidator" color={RED} stats={<>
          <Chip label="Reports" value={validator.totalReports} color={CYAN} />
          <Chip label="Passed" value={validator.passed} color={GREEN} />
          <Chip label="Failed" value={validator.failed} color={validator.failed > 0 ? RED : GREEN} />
          <Chip label="Critical Failure Rate"
            value={`${(validator.criticalFailureRate * 100).toFixed(1)}%`}
            color={validator.criticalFailureRate > 0.1 ? RED : GREEN} />
        </>} />
      </div>

      {/* Generator Queue Depths */}
      {topQueues.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, color: GOLD, marginBottom: 12 }}>Generator Queue Depths</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {topQueues.map(([target, depth]) => (
              <StatBlock key={target} label={target} value={depth as number}
                color={(depth as number) > 10 ? RED : (depth as number) > 5 ? GOLD : GREEN} />
            ))}
          </div>
        </div>
      )}

      {/* Layer Isolation Breakdown */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: GOLD, marginBottom: 12 }}>Isolated Layer Categories</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(isolation.byCategory ?? {}).map(([cat, count]) => (
            <StatBlock key={cat} label={cat} value={count as number}
              color={cat.includes("face") ? FUCHSIA : cat.includes("motion") ? PURPLE : CYAN} />
          ))}
        </div>
      </div>

      {/* Ingestion By Stage */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: GOLD, marginBottom: 12 }}>Ingestion by Stage</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(ingestion.byStage ?? {}).map(([stage, count]) => (
            <StatBlock key={stage} label={stage} value={count as number}
              color={stage === "failed" ? RED : stage === "complete" ? GREEN : GOLD} />
          ))}
        </div>
      </div>

      {/* Telemetry by Stage */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: GOLD, marginBottom: 12 }}>Telemetry by Pipeline Stage</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(telemetry.byStage ?? {}).map(([stage, count]) => (
            <StatBlock key={stage} label={`Stage ${stage}`} value={count as number}
              color={(count as number) > 5 ? RED : GOLD} />
          ))}
        </div>
      </div>

      {/* Critical Events */}
      {criticals.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, color: RED, marginBottom: 12 }}>
            Critical Events ({criticals.length} unresolved)
          </h2>
          <div style={{
            background: PANEL, border: `1px solid ${RED}`, borderRadius: 8,
            overflow: "hidden",
          }}>
            {criticals.slice(0, 10).map(ev => (
              <div key={ev.eventId} style={{
                padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <div style={{
                  fontSize: 11, color: "#666", fontFamily: "monospace",
                  whiteSpace: "nowrap", paddingTop: 2,
                }}>
                  Stage {ev.pipelineStage}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#ddd" }}>
                    {ev.message}
                    <SeverityBadge severity={ev.severity} />
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                    {ev.kind} · {ev.assetId ?? "no asset"} · {new Date(ev.recordedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Telemetry Errors */}
      {telemetry.recentErrors?.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, color: FUCHSIA, marginBottom: 12 }}>Recent Errors (5 min)</h2>
          <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
            {telemetry.recentErrors.slice(0, 8).map(ev => (
              <div key={ev.eventId} style={{
                padding: "10px 16px", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  {ev.pipelineStage}
                </span>
                <span style={{ fontSize: 12, color: "#ccc", flex: 1 }}>{ev.message}</span>
                <SeverityBadge severity={ev.severity} />
                <span style={{ fontSize: 11, color: "#555" }}>
                  {new Date(ev.recordedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16, color: "#444", fontSize: 11 }}>
        Phase 7+8 Vision Pipeline · Refreshes every 3s · Stage A–G + Universal File Decomposer
      </div>
    </div>
  );
}
