"use client";

import Link from "next/link";
import { getCreativeProductionHealthSnapshot } from "@/lib/ai-visuals/CreativeProductionHealthEngine";
import { getVisualQueueDiagnosticsSnapshot } from "@/lib/ai-visuals/VisualQueueDiagnosticsEngine";

export default function AdminVisualCommandSummaryCard() {
  const health = getCreativeProductionHealthSnapshot();
  const queue = getVisualQueueDiagnosticsSnapshot();

  const metrics = [
    { label: "Queued", value: queue.summary.queued, color: "#FFD700" },
    { label: "Active", value: queue.summary.active, color: "#00FFFF" },
    { label: "Failed", value: queue.summary.failed, color: "#FF2DAA" },
    { label: "Completed", value: queue.summary.completed, color: "#00FF88" },
    { label: "Coverage", value: `${health.coveragePercent}%`, color: "#FFFFFF" },
    { label: "Motion Ready", value: `${health.motionReadyPercent}%`, color: "#AA2DFF" },
    { label: "Placeholder Leaks", value: health.placeholderLeaks, color: "#FF9500" },
  ];

  return (
    <Link
      href="/admin/visual-command"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        border: "1px solid rgba(0,255,255,0.22)",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(0,255,255,0.08), rgba(255,45,170,0.08))",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "#00FFFF", fontWeight: 800 }}>Visual Command Window</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", marginTop: 4 }}>Live creative production visibility</div>
        </div>
        <div style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>Open →</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{metric.label}</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: metric.color }}>{metric.value}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}
