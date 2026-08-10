"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { YoPhoPortraitBlueprint, YoPhoPortraitOverlayEffectId } from "@/lib/yopho/YoPhoPortraitEngine";
import { clonePortraitBlueprint } from "@/lib/yopho/YoPhoPortraitEngine";
import {
  YOPHO_PORTRAIT_CONTROLS,
  applyPortraitControl,
  getActiveOverlayParams,
  getPortraitControl,
  patchOverlayParams,
  resetPreviewEffects,
} from "@/lib/yopho/YoPhoPortraitEffectCatalog";
import YoPhoPortraitStageCanvas from "./YoPhoPortraitStageCanvas";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function stageLabel(title: string, sub: string) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: CYAN }}>{title}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export interface YoPhoTripleStageStudioProps {
  master: YoPhoPortraitBlueprint;
  onMasterChange: (next: YoPhoPortraitBlueprint) => void;
  onSaveEdition?: (bp: YoPhoPortraitBlueprint) => void;
  storageKey?: string;
}

export default function YoPhoTripleStageStudio({
  master,
  onMasterChange,
  onSaveEdition,
  storageKey = "tmi_yopho_triple_stage",
}: YoPhoTripleStageStudioProps) {
  const [preview, setPreview] = useState<YoPhoPortraitBlueprint>(() => clonePortraitBlueprint(master));
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [timelineSec, setTimelineSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopTimeline, setLoopTimeline] = useState(true);
  const [compareHold, setCompareHold] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const undoStack = useRef<YoPhoPortraitBlueprint[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef<number | null>(null);

  const durationSec = preview.previewDurationSec ?? master.previewDurationSec ?? 6;

  useEffect(() => {
    setPreview(clonePortraitBlueprint(master));
  }, [master.id, master.updatedAt]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTick.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTick.current != null) {
        const delta = (ts - lastTick.current) / 1000;
        setTimelineSec((t) => {
          let next = t + delta;
          if (next >= durationSec) {
            if (loopTimeline) next = next % durationSec;
            else {
              setIsPlaying(false);
              return durationSec;
            }
          }
          return next;
        });
      }
      lastTick.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, durationSec, loopTimeline]);

  const selectedOverlayId = useMemo((): YoPhoPortraitOverlayEffectId | null => {
    const def = selectedControlId ? getPortraitControl(selectedControlId) : null;
    return def?.overlayId ?? null;
  }, [selectedControlId]);

  const activeParams = useMemo(() => {
    if (!selectedOverlayId) return null;
    return getActiveOverlayParams(preview, selectedOverlayId);
  }, [preview, selectedOverlayId]);

  const pushUndo = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-24), clonePortraitBlueprint(master)];
  }, [master]);

  const handleControlClick = (controlId: string) => {
    const def = getPortraitControl(controlId);
    if (!def) return;
    if (def.status === "coming_soon") {
      setStatusLine(`${def.label} — coming soon (not wired).`);
      setSelectedControlId(controlId);
      if (controlId === "ai_magic") {
        setAiMessage("AI Magic preview is not connected yet. No generative pipeline on this build.");
      }
      return;
    }
    setSelectedControlId(controlId);
    setAiMessage(null);
    const next = applyPortraitControl(preview, controlId);
    setPreview(next);
    setStatusLine(`${def.label} applied to preview stage.`);
    if (!isPlaying) setIsPlaying(true);
  };

  const patchSelectedParams = (partial: Parameters<typeof patchOverlayParams>[2]) => {
    if (!selectedOverlayId) return;
    setPreview((p) => patchOverlayParams(p, selectedOverlayId, partial));
  };

  const handleResetPreview = () => {
    setPreview(resetPreviewEffects(clonePortraitBlueprint(master)));
    setTimelineSec(0);
    setStatusLine("Preview reset to master (effects cleared).");
  };

  const handleApplyToMaster = () => {
    pushUndo();
    const applied = clonePortraitBlueprint(preview);
    onMasterChange(applied);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ master: applied, savedAt: new Date().toISOString() }));
    } catch {
      /* quota */
    }
    onSaveEdition?.(applied);
    setPreview(clonePortraitBlueprint(applied));
    setStatusLine("Applied to master canvas.");
  };

  const handleUndo = () => {
    const prev = undoStack.current.pop();
    if (!prev) {
      setStatusLine("Nothing to undo.");
      return;
    }
    onMasterChange(prev);
    setPreview(clonePortraitBlueprint(prev));
    setStatusLine("Undid last apply.");
  };

  const demoBlueprint = useMemo(() => {
    if (!selectedControlId) return preview;
    const def = getPortraitControl(selectedControlId);
    if (!def || def.status === "coming_soon") return preview;
    return applyPortraitControl(
      { ...preview, portraitEffects: [], mode: "single", isAnimated: false },
      selectedControlId,
    );
  }, [preview, selectedControlId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Timeline */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(5,5,16,0.92)",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${CYAN}`,
            background: `${CYAN}22`,
            color: CYAN,
            fontWeight: 900,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <label style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={loopTimeline} onChange={(e) => setLoopTimeline(e.target.checked)} />
          Loop
        </label>
        <input
          type="range"
          min={0}
          max={durationSec}
          step={0.05}
          value={timelineSec}
          onChange={(e) => {
            setTimelineSec(Number(e.target.value));
            setIsPlaying(false);
          }}
          style={{ flex: "1 1 200px", minWidth: 160 }}
        />
        <span style={{ fontSize: 11, fontWeight: 800, color: GOLD, fontFamily: "monospace" }}>
          {formatTime(timelineSec)} / {formatTime(durationSec)}
        </span>
      </div>

      <div
        data-yopho-triple-grid
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 240px) 1fr 1fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Controls rail */}
        <div
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(8,5,20,0.95)",
            maxHeight: 520,
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: FUCHSIA, marginBottom: 10 }}>
            CREATIVE CONTROLS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {YOPHO_PORTRAIT_CONTROLS.map((c) => {
              const selected = selectedControlId === c.id;
              const soon = c.status === "coming_soon";
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.description}
                  onClick={() => handleControlClick(c.id)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: selected ? `2px solid ${CYAN}` : "1px solid rgba(255,255,255,0.12)",
                    background: soon ? "rgba(255,255,255,0.03)" : selected ? `${CYAN}18` : "rgba(255,255,255,0.04)",
                    color: soon ? "rgba(255,255,255,0.35)" : "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    opacity: soon ? 0.75 : 1,
                  }}
                >
                  {c.label}
                  {soon ? (
                    <span style={{ marginLeft: 6, fontSize: 8, color: GOLD }}>SOON</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Left demo */}
        <div>
          {stageLabel("EFFECT DEMO", "What this control does")}
          <YoPhoPortraitStageCanvas
            blueprint={demoBlueprint}
            height={360}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused={!isPlaying}
          />
        </div>

        {/* Center master */}
        <div>
          {stageLabel("MASTER", "Untouched until Apply")}
          <YoPhoPortraitStageCanvas
            blueprint={master}
            height={360}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused
            suppressOverlays={false}
          />
        </div>

        {/* Right preview */}
        <div
          onPointerDown={() => setCompareHold(true)}
          onPointerUp={() => setCompareHold(false)}
          onPointerLeave={() => setCompareHold(false)}
        >
          {stageLabel("PREVIEW STAGE", "Hold to compare · updates on every click")}
          <YoPhoPortraitStageCanvas
            blueprint={compareHold ? master : preview}
            height={360}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused={!isPlaying}
            suppressOverlays={compareHold}
          />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            {compareHold ? "Showing master (before)" : "Showing preview (with effects)"}
          </div>
        </div>
      </div>

      {/* Params + actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(5,5,16,0.9)",
        }}
      >
        <div>
          {selectedOverlayId && activeParams ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: CYAN, letterSpacing: "0.1em" }}>
                PARAMETERS · {selectedOverlayId.replace(/_/g, " ").toUpperCase()}
              </div>
              {(
                [
                  ["intensity", "Intensity", 0, 100],
                  ["speed", "Speed", 0.25, 2],
                ] as const
              ).map(([key, label, min, max]) => (
                <div key={key}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                    {label}: {activeParams[key].toFixed(key === "speed" ? 2 : 0)}
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={key === "speed" ? 0.05 : 1}
                    value={activeParams[key]}
                    onChange={(e) => patchSelectedParams({ [key]: Number(e.target.value) })}
                    style={{ width: "100%", maxWidth: 420 }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Accent color</div>
                <input
                  type="color"
                  value={activeParams.color}
                  onChange={(e) => patchSelectedParams({ color: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Select an overlay control (Neon, Glitch, Particles, etc.) to expose intensity, speed, and color.
              Mode controls (Double Exposure, Parallax) apply instantly on the preview stage.
            </div>
          )}
          {aiMessage ? (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                border: "1px solid rgba(255,215,0,0.4)",
                color: GOLD,
                fontSize: 11,
              }}
            >
              {aiMessage}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
          <button type="button" onClick={handleResetPreview} style={actionBtn("rgba(255,255,255,0.15)", "#fff")}>
            RESET PREVIEW
          </button>
          <button type="button" onClick={() => setIsPlaying(true)} style={actionBtn(`${CYAN}44`, CYAN)}>
            PREVIEW PLAY
          </button>
          <button type="button" onClick={handleApplyToMaster} style={actionBtn(`${FUCHSIA}55`, FUCHSIA)}>
            APPLY TO MASTER
          </button>
          <button type="button" onClick={handleUndo} style={actionBtn(`${GOLD}33`, GOLD)}>
            UNDO APPLY
          </button>
        </div>
      </div>

      {statusLine ? (
        <div style={{ fontSize: 11, color: CYAN, fontWeight: 700 }}>{statusLine}</div>
      ) : null}
    </div>
  );
}

function actionBtn(bg: string, color: string) {
  return {
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: bg,
    color,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: "pointer",
  } as const;
}
