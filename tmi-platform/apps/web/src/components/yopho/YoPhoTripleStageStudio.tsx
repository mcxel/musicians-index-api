"use client";

/**
 * YoPho Triple-Stage Studio — Master (center) + Preview + Preview 2.
 * Multi-image / dimensional z-layers gated by tier capacity (YoPhoImageCapacity).
 * Filters apply to preview first; Apply to Master commits. No fake stock images.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
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
import { getYoPhoImageCapacity } from "@/lib/yopho/YoPhoImageCapacity";
import {
  addStackLayer,
  bringLayerToFront,
  countStackLayers,
  getLayerById,
  listStackLayers,
  nudgeLayerPosition,
  nudgeLayerScale,
  removeStackLayer,
  reorderStackLayer,
  resetLayerTransform,
  sendLayerToBack,
  setActiveLayerImage,
  YOPHO_NUDGE_SCALE_STEP,
  YOPHO_NUDGE_XY_STEP,
} from "@/lib/yopho/YoPhoLayerStack";
import YoPhoPortraitStageCanvas from "./YoPhoPortraitStageCanvas";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
/** Green = positive / confirm nudge direction; red = opposite */
const GREEN = "#00FF88";
const RED = "#FF4466";

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
  /** Membership tier or BAND role — drives image/layer capacity */
  tierOrRole?: string;
}

export default function YoPhoTripleStageStudio({
  master,
  onMasterChange,
  onSaveEdition,
  storageKey = "tmi_yopho_triple_stage",
  tierOrRole = "FREE",
}: YoPhoTripleStageStudioProps) {
  const capacity = useMemo(() => getYoPhoImageCapacity(tierOrRole), [tierOrRole]);
  const [preview, setPreview] = useState<YoPhoPortraitBlueprint>(() => clonePortraitBlueprint(master));
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string>(master.primaryLayer.id);
  const [timelineSec, setTimelineSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopTimeline, setLoopTimeline] = useState(true);
  const [compareHold, setCompareHold] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const undoStack = useRef<YoPhoPortraitBlueprint[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const durationSec = preview.previewDurationSec ?? master.previewDurationSec ?? 6;
  const stackLayers = useMemo(() => listStackLayers(preview), [preview]);
  const activeLayer = useMemo(
    () => getLayerById(preview, activeLayerId) ?? preview.primaryLayer,
    [preview, activeLayerId],
  );

  useEffect(() => {
    setPreview(clonePortraitBlueprint(master));
    setActiveLayerId((prev) => {
      const ids = new Set([master.primaryLayer.id, ...master.secondaryLayers.map((l) => l.id)]);
      return ids.has(prev) ? prev : master.primaryLayer.id;
    });
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
      setStatusLine(`${def.label} — Coming Soon (not wired).`);
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
    setStatusLine(`${def.label} → Preview / Preview 2 (not on Master until Apply).`);
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
    setStatusLine("Applied to Master (center working card).");
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

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChosen = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatusLine("Choose a real image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    const next = setActiveLayerImage(preview, activeLayerId, url, file.name);
    setPreview(next);
    setStatusLine(`Image set on active layer — Apply to Master to commit.`);
  };

  const handleAddLayer = () => {
    const next = addStackLayer(preview, capacity.maxImages);
    if (!next) {
      setStatusLine(`Layer limit reached (${capacity.maxImages}). Upgrade to add more.`);
      return;
    }
    setPreview(next);
    const added = listStackLayers(next).at(-1);
    if (added) setActiveLayerId(added.id);
    setStatusLine("Empty layer added — Put your image here.");
  };

  const nudgeActive = (dx: number, dy: number) => {
    setPreview((p) => nudgeLayerPosition(p, activeLayerId, dx, dy));
    setStatusLine("Layer moved — Apply to Master to commit.");
  };

  const scaleActive = (dScale: number) => {
    setPreview((p) => nudgeLayerScale(p, activeLayerId, dScale));
    setStatusLine("Layer scaled — Apply to Master to commit.");
  };

  const resetActiveTransform = () => {
    setPreview((p) => resetLayerTransform(p, activeLayerId));
    setStatusLine("Layer position/scale reset — Apply to Master to commit.");
  };

  const effectPreviewBlueprint = useMemo(() => {
    if (!selectedControlId) return preview;
    const def = getPortraitControl(selectedControlId);
    if (!def || def.status === "coming_soon") return preview;
    return applyPortraitControl(preview, selectedControlId);
  }, [preview, selectedControlId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          onFileChosen(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {/* Capacity + dimensional layer strip */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: FUCHSIA }}>
            LAYERS · Z-DEPTH · {capacity.tierKey}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {countStackLayers(preview)} / {capacity.maxImages} images
          </span>
          <button type="button" onClick={onPickImage} style={chipBtn(CYAN)}>
            UPLOAD TO ACTIVE LAYER
          </button>
          {capacity.multiImageEnabled ? (
            <button type="button" onClick={handleAddLayer} style={chipBtn(GOLD)}>
              + ADD LAYER
            </button>
          ) : (
            <Link href={capacity.upgradeHref} style={{ ...chipBtn(GOLD), textDecoration: "none" }}>
              UPGRADE FOR MULTI-LAYER
            </Link>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...stackLayers].reverse().map((ref, frontIndex) => {
            const selected = ref.id === activeLayerId;
            const empty = !ref.layer.imageUrl?.trim();
            const multi = stackLayers.length > 1;
            return (
              <div
                key={ref.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: selected ? `1px solid ${CYAN}` : "1px solid rgba(255,255,255,0.1)",
                  background: selected ? `${CYAN}14` : "rgba(255,255,255,0.03)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveLayerId(ref.id)}
                  style={{
                    flex: 1,
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  z{ref.layer.zIndex} · {empty ? "Put your image here" : ref.layer.label}{" "}
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    (
                    {multi
                      ? frontIndex === 0
                        ? "front"
                        : frontIndex === stackLayers.length - 1
                          ? "back"
                          : "mid"
                      : "solo"}
                    )
                  </span>
                </button>
                {multi ? (
                  <>
                    <button
                      type="button"
                      title="Bring forward"
                      onClick={() => setPreview(reorderStackLayer(preview, ref.id, "forward"))}
                      style={{ ...tinyBtn, color: GREEN, borderColor: `${GREEN}66` }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      title="Send back"
                      onClick={() => setPreview(reorderStackLayer(preview, ref.id, "back"))}
                      style={{ ...tinyBtn, color: RED, borderColor: `${RED}66` }}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      title="Bring to front"
                      onClick={() => setPreview(bringLayerToFront(preview, ref.id))}
                      style={{ ...tinyBtn, color: GREEN, borderColor: `${GREEN}66` }}
                    >
                      ⇈
                    </button>
                    <button
                      type="button"
                      title="Send to back"
                      onClick={() => setPreview(sendLayerToBack(preview, ref.id))}
                      style={{ ...tinyBtn, color: RED, borderColor: `${RED}66` }}
                    >
                      ⇊
                    </button>
                  </>
                ) : null}
                {capacity.maxImages > 1 && stackLayers.length > 1 ? (
                  <button
                    type="button"
                    title="Remove layer"
                    onClick={() => {
                      const next = removeStackLayer(preview, ref.id);
                      setPreview(next);
                      setActiveLayerId(next.primaryLayer.id);
                    }}
                    style={{ ...tinyBtn, color: RED }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            );
          })}
          {!capacity.multiImageEnabled ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
              FREE = one image — still reposition / scale below. Upgrade unlocks multi-layer z-depth
              (car in front of person).
            </div>
          ) : null}
          {countStackLayers(preview) >= capacity.maxImages && capacity.multiImageEnabled ? (
            <div style={{ fontSize: 10, color: GOLD }}>
              At capacity.{" "}
              <Link href={capacity.upgradeHref} style={{ color: CYAN, fontWeight: 800 }}>
                Upgrade to add more images
              </Link>
            </div>
          ) : null}
        </div>

        {/* Active-layer positioning pad — X/Y + z-order + scale */}
        <div
          data-yopho-position-pad
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${CYAN}33`,
            background: "rgba(0,255,255,0.04)",
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: CYAN }}>
              POSITION · ACTIVE LAYER
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              {activeLayer.label || "Layer"} · x{activeLayer.xOffset} y{activeLayer.yOffset} · ×
              {activeLayer.scale.toFixed(2)}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              Green = + / Front · Red = − / Back · Free drag = Coming Soon
            </div>
          </div>

          {/* D-pad: left/right + up/down */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "28px 28px 28px",
              gridTemplateRows: "28px 28px 28px",
              gap: 4,
              placeItems: "center",
            }}
            aria-label="Nudge layer on canvas"
          >
            <span />
            <button
              type="button"
              title="Nudge up"
              onClick={() => nudgeActive(0, -YOPHO_NUDGE_XY_STEP)}
              style={padBtn(GREEN)}
            >
              ↑
            </button>
            <span />
            <button
              type="button"
              title="Nudge left"
              onClick={() => nudgeActive(-YOPHO_NUDGE_XY_STEP, 0)}
              style={padBtn(RED)}
            >
              ←
            </button>
            <button
              type="button"
              title="Reset position & scale"
              onClick={resetActiveTransform}
              style={{ ...padBtn("rgba(255,255,255,0.55)"), fontSize: 8 }}
            >
              ●
            </button>
            <button
              type="button"
              title="Nudge right"
              onClick={() => nudgeActive(YOPHO_NUDGE_XY_STEP, 0)}
              style={padBtn(GREEN)}
            >
              →
            </button>
            <span />
            <button
              type="button"
              title="Nudge down"
              onClick={() => nudgeActive(0, YOPHO_NUDGE_XY_STEP)}
              style={padBtn(RED)}
            >
              ↓
            </button>
            <span />
          </div>

          {/* Depth / z-order for multi-layer; still show Front/Back affordance when multi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
              DEPTH
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                title="Bring forward"
                disabled={stackLayers.length < 2}
                onClick={() => {
                  setPreview((p) => reorderStackLayer(p, activeLayerId, "forward"));
                  setStatusLine("Brought forward — Apply to Master to commit.");
                }}
                style={{
                  ...padBtn(GREEN),
                  opacity: stackLayers.length < 2 ? 0.35 : 1,
                  cursor: stackLayers.length < 2 ? "not-allowed" : "pointer",
                }}
              >
                Front
              </button>
              <button
                type="button"
                title="Send back"
                disabled={stackLayers.length < 2}
                onClick={() => {
                  setPreview((p) => reorderStackLayer(p, activeLayerId, "back"));
                  setStatusLine("Sent back — Apply to Master to commit.");
                }}
                style={{
                  ...padBtn(RED),
                  opacity: stackLayers.length < 2 ? 0.35 : 1,
                  cursor: stackLayers.length < 2 ? "not-allowed" : "pointer",
                }}
              >
                Back
              </button>
            </div>
          </div>

          {/* Scale */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
              SCALE
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                title="Scale up"
                onClick={() => scaleActive(YOPHO_NUDGE_SCALE_STEP)}
                style={padBtn(GREEN)}
              >
                +
              </button>
              <button
                type="button"
                title="Scale down"
                onClick={() => scaleActive(-YOPHO_NUDGE_SCALE_STEP)}
                style={padBtn(RED)}
              >
                −
              </button>
            </div>
          </div>
        </div>
      </div>

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
          gridTemplateColumns: "minmax(180px, 220px) 1fr 1.15fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
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
            FILTERS & EFFECTS
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8, lineHeight: 1.4 }}>
            Click → live on Preview / Preview 2. Master unchanged until Apply.
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
                  {soon ? <span style={{ marginLeft: 6, fontSize: 8, color: GOLD }}>SOON</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview — effect path */}
        <div>
          {stageLabel("PREVIEW", "Effect on full stack · click a filter")}
          <YoPhoPortraitStageCanvas
            blueprint={effectPreviewBlueprint}
            height={360}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused={!isPlaying}
            emptyLabel="Preview"
          />
        </div>

        {/* Center working card — live layer stack + transforms; filter overlays stay on Preview panes until Apply */}
        <div>
          {stageLabel("WORKING CARD", "Live layout · Put your image here · Apply commits to Master")}
          <YoPhoPortraitStageCanvas
            blueprint={preview}
            height={380}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused
            suppressOverlays
            emptyLabel="Put your image here"
          />
          <button type="button" onClick={onPickImage} style={{ ...chipBtn(FUCHSIA), marginTop: 8, width: "100%" }}>
            SET IMAGE ON ACTIVE LAYER
          </button>
        </div>

        {/* Preview 2 — compare */}
        <div
          onPointerDown={() => setCompareHold(true)}
          onPointerUp={() => setCompareHold(false)}
          onPointerLeave={() => setCompareHold(false)}
        >
          {stageLabel("PREVIEW 2", "Hold = master before · release = pending effects")}
          <YoPhoPortraitStageCanvas
            blueprint={compareHold ? master : preview}
            height={360}
            interactive={false}
            timelineSec={timelineSec}
            playbackPaused={!isPlaying}
            suppressOverlays={compareHold}
            emptyLabel="Preview 2"
          />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            {compareHold ? "Showing Master (before)" : "Showing pending preview stack"}
          </div>
        </div>
      </div>

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
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Nudge the active layer (←→↑↓ + Front/Back + scale). Filters preview on side panes; Apply to
              Master commits the center card. Free drag = Coming Soon. 60s/70s Era = Coming Soon.
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

function chipBtn(color: string): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 6,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

const tinyBtn: CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  borderRadius: 4,
  fontSize: 10,
  width: 26,
  height: 24,
  cursor: "pointer",
};

function padBtn(color: string): CSSProperties {
  return {
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 6,
    border: `1px solid ${color}88`,
    background: `${color}22`,
    color,
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1,
  };
}
