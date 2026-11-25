"use client";

/**
 * LEVEL 1 — YoPho Quick Card Panel
 * Anchors to focused monitor context. Fast card ops only — not the compositor.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  getActiveYoPhoLivingProject,
  listYoPhoLivingProjects,
  setActiveYoPhoLivingProject,
} from "@/lib/yopho/living/YoPhoLivingProjectStore";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import YoPhoLivingStage from "./YoPhoLivingStage";

export default function YoPhoQuickCardPanel({
  monitorFocus = "A",
}: {
  monitorFocus?: "A" | "B";
}) {
  const [tick, setTick] = useState(0);
  const projects = useMemo(() => listYoPhoLivingProjects(), [tick]);
  const active = useMemo(() => getActiveYoPhoLivingProject(), [tick]);
  const idx = Math.max(0, projects.findIndex((p) => p.projectId === active?.projectId));

  const selectOffset = (delta: number) => {
    if (!projects.length) return;
    const next = projects[(idx + delta + projects.length) % projects.length];
    if (next) {
      setActiveYoPhoLivingProject(next.projectId);
      setTick((n) => n + 1);
    }
  };

  return (
    <div
      data-yopho-quick-card="1"
      data-monitor-focus={monitorFocus}
      style={{
        border: "1px solid rgba(255,45,170,0.4)",
        borderRadius: 12,
        padding: 10,
        background: "linear-gradient(180deg, rgba(20,8,24,0.95), rgba(5,5,16,0.96))",
        color: "#fff",
        minWidth: 220,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#FF2DAA", marginBottom: 8 }}>
        YOPHO QUICK CARD · MONITOR {monitorFocus}
      </div>
      {active ? (
        <YoPhoLivingStage project={active} compact playing />
      ) : (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: 16 }}>No active card yet.</div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => selectOffset(-1)} style={btn}>◀ PREV</button>
        <button type="button" onClick={() => selectOffset(1)} style={btn}>NEXT ▶</button>
        <button
          type="button"
          onClick={() => {
            if (active) setActiveYoPhoLivingProject(active.projectId);
            setTick((n) => n + 1);
          }}
          style={btn}
        >
          SET ACTIVE
        </button>
      </div>
      <button
        type="button"
        onClick={() => presentCanonicalWorkspace("yopho", "DRAWER")}
        style={{ ...btn, width: "100%", marginTop: 8, borderColor: "#00FFFF", color: "#00FFFF" }}
      >
        OPEN YOPHO →
      </button>
    </div>
  );
}

const btn: CSSProperties = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 9,
  fontWeight: 800,
  cursor: "pointer",
};
