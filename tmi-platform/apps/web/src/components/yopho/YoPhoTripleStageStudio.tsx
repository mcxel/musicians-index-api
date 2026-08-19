"use client";

/**
 * YoPho Triple-Stage Studio — Master Composite + Source Only + Active Ingredient.
 *
 * LAYOUT SPEC:
 *   PREVIEW 1: SOURCE IMAGE ONLY
 *   PREVIEW 2: SELECTED EFFECT / INGREDIENT ONLY
 *   PREVIEW 3: LIVE MASTER COMPOSITE (continuous animation loop)
 *   CONTROLLER: Position / Scale / Rotate / Depth / Opacity / Timeline directly under Preview 3
 *   DOCK: Fixed-height internally scrollable Layer Inspector Dock (Layers | FX | Style | Color | Motion)
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type {
  YoPhoPortraitBlueprint,
  YoPhoPortraitOverlayEffectId,
  BlendMode,
} from "@/lib/yopho/YoPhoPortraitEngine";
import { clonePortraitBlueprint } from "@/lib/yopho/YoPhoPortraitEngine";
import {
  YOPHO_PORTRAIT_CONTROLS,
  applyPortraitControl,
  getActiveOverlayParams,
  getPortraitControl,
  patchOverlayParams,
} from "@/lib/yopho/YoPhoPortraitEffectCatalog";
import { getYoPhoImageCapacity } from "@/lib/yopho/YoPhoImageCapacity";
import { downscaleImageFile } from "@/lib/yopho/downscaleImageFile";
import {
  addStackLayer,
  bringLayerToFront,
  countStackLayers,
  getLayerById,
  listStackLayers,
  nudgeLayerPosition,
  nudgeLayerScale,
  nudgeLayerRotation,
  removeStackLayer,
  reorderStackLayer,
  resetLayerTransform,
  sendLayerToBack,
  setActiveLayerImage,
  updateLayerById,
  YOPHO_NUDGE_ROTATION_STEP,
  YOPHO_NUDGE_SCALE_STEP,
  YOPHO_NUDGE_XY_STEP,
} from "@/lib/yopho/YoPhoLayerStack";
import {
  YOPHO_STUDIO_STYLE_PRESETS,
  type YoPhoStudioStyleId,
} from "@/lib/yopho/YoPhoStudioStylePresets";
import YoPhoPortraitStageCanvas from "./YoPhoPortraitStageCanvas";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

const STAGE_CANVAS_HEIGHT = "clamp(180px, 30vh, 320px)";
const MASTER_CANVAS_HEIGHT = "clamp(240px, 42vh, 440px)";

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function stageLabel(title: string, sub: string, badge?: string) {
  return (
    <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: CYAN }}>{title}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sub}</div>
      </div>
      {badge ? (
        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${CYAN}22`, color: CYAN, border: `1px solid ${CYAN}55` }}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export interface YoPhoTripleStageStudioProps {
  master: YoPhoPortraitBlueprint;
  onMasterChange: (next: YoPhoPortraitBlueprint) => void;
  onSaveEdition?: (bp: YoPhoPortraitBlueprint) => void;
  storageKey?: string;
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
  const [selectedControlId, setSelectedControlId] = useState<string | null>("smoke");
  const [activeLayerId, setActiveLayerId] = useState<string>(master.primaryLayer.id);
  const [activeTab, setActiveTab] = useState<"layers" | "fx" | "style" | "color" | "motion">("layers");
  const [dockExpanded, setDockExpanded] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timelineSec, setTimelineSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loopTimeline, setLoopTimeline] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  // Undo / Redo stacks
  const undoStack = useRef<YoPhoPortraitBlueprint[]>([]);
  const redoStack = useRef<YoPhoPortraitBlueprint[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Continuous animation loop ticker
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTick.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTick.current != null) {
        const delta = ((ts - lastTick.current) / 1000) * motionSpeed;
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
  }, [isPlaying, durationSec, loopTimeline, motionSpeed]);

  const selectedOverlayId = useMemo((): YoPhoPortraitOverlayEffectId | null => {
    const def = selectedControlId ? getPortraitControl(selectedControlId) : null;
    return def?.overlayId ?? null;
  }, [selectedControlId]);

  const activeParams = useMemo(() => {
    if (!selectedOverlayId) return null;
    return getActiveOverlayParams(preview, selectedOverlayId);
  }, [preview, selectedOverlayId]);

  const pushUndo = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-24), clonePortraitBlueprint(preview)];
    redoStack.current = [];
  }, [preview]);

  const handleUndo = () => {
    if (undoStack.current.length === 0) {
      setStatusLine("Nothing to undo.");
      return;
    }
    const prev = undoStack.current.pop()!;
    redoStack.current.push(clonePortraitBlueprint(preview));
    setPreview(clonePortraitBlueprint(prev));
    setStatusLine("Undid last change.");
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) {
      setStatusLine("Nothing to redo.");
      return;
    }
    const next = redoStack.current.pop()!;
    undoStack.current.push(clonePortraitBlueprint(preview));
    setPreview(clonePortraitBlueprint(next));
    setStatusLine("Redid change.");
  };

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChosen = async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatusLine("Choose a valid image file.");
      return;
    }
    setStatusLine("Preparing image…");
    const { blob } = await downscaleImageFile(file);
    pushUndo();
    const url = URL.createObjectURL(blob);
    const next = setActiveLayerImage(preview, activeLayerId, url, file.name);
    setPreview(next);
    onMasterChange(next);
    setStatusLine(`Image loaded into layer: ${file.name}`);
  };

  const handleControlClick = (controlId: string) => {
    const def = getPortraitControl(controlId);
    if (!def) return;
    pushUndo();
    setSelectedControlId(controlId);
    const next = applyPortraitControl(preview, controlId);
    setPreview(next);
    setStatusLine(`Applied effect: ${def.label}`);
    if (!isPlaying) setIsPlaying(true);
  };

  const patchSelectedParams = (partial: Parameters<typeof patchOverlayParams>[2]) => {
    if (!selectedOverlayId) return;
    setPreview((p) => patchOverlayParams(p, selectedOverlayId, partial));
  };

  const handleApplyStylePreset = (styleId: YoPhoStudioStyleId) => {
    const preset = YOPHO_STUDIO_STYLE_PRESETS.find((s) => s.id === styleId);
    if (!preset) return;
    pushUndo();
    const next = clonePortraitBlueprint(preview);
    if (preset.compositionHint) next.mode = preset.compositionHint;
    if (preset.objectMaskHint) next.objectMask = preset.objectMaskHint;
    if (preset.textureHint) next.texturePreset = preset.textureHint;
    if (preset.accentHint) {
      next.colorPalette = {
        primaryAccent: preset.accentHint,
        secondaryAccent: preset.accentHint,
        ambientGlow: preset.accentHint,
      };
    }
    setPreview(next);
    onMasterChange(next);
    setStatusLine(`Style applied: ${preset.label}`);
  };

  const handleAddLayerItem = (kind: string) => {
    pushUndo();
    setShowAddModal(false);
    const next = addStackLayer(preview, capacity.maxImages);
    if (!next) {
      setStatusLine(`Layer limit reached (${capacity.maxImages}). Upgrade for unlimited layers.`);
      return;
    }
    setPreview(next);
    const added = listStackLayers(next).at(-1);
    if (added) {
      setActiveLayerId(added.id);
      const label = `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${added.layer.zIndex}`;
      setPreview((p) => updateLayerById(p, added.id, { label }));
    }
    if (kind === "photo") {
      onPickImage();
    } else {
      setStatusLine(`New ${kind} layer created.`);
    }
  };

  const handleStartOver = () => {
    if (typeof window !== "undefined" && !window.confirm("Start over? This will reset all layers and effects to initial state.")) {
      return;
    }
    pushUndo();
    const fresh = clonePortraitBlueprint(master);
    fresh.portraitEffects = [];
    setPreview(fresh);
    onMasterChange(fresh);
    setStatusLine("Project reset to initial state.");
  };

  const nudgeActive = (dx: number, dy: number) => {
    if (activeLayer.locked) {
      setStatusLine("Layer is locked. Unlock to move.");
      return;
    }
    setPreview((p) => nudgeLayerPosition(p, activeLayerId, dx, dy));
  };

  const scaleActive = (dScale: number) => {
    if (activeLayer.locked) {
      setStatusLine("Layer is locked. Unlock to scale.");
      return;
    }
    setPreview((p) => nudgeLayerScale(p, activeLayerId, dScale));
  };

  const rotateActive = (dRotation: number) => {
    if (activeLayer.locked) {
      setStatusLine("Layer is locked. Unlock to rotate.");
      return;
    }
    setPreview((p) => nudgeLayerRotation(p, activeLayerId, dRotation));
  };

  const resetActiveTransform = () => {
    pushUndo();
    setPreview((p) => resetLayerTransform(p, activeLayerId));
    setStatusLine("Reset transform for active layer.");
  };

  // PREVIEW 1: SOURCE IMAGE ONLY (no pending effects/overlays)
  const sourceOnlyBlueprint = useMemo(() => {
    const bp = clonePortraitBlueprint(preview);
    bp.portraitEffects = [];
    return bp;
  }, [preview]);

  // PREVIEW 2: ACTIVE INGREDIENT ONLY (isolated effect or isolated layer)
  const activeIngredientBlueprint = useMemo(() => {
    const bp = clonePortraitBlueprint(preview);
    if (selectedControlId) {
      const def = getPortraitControl(selectedControlId);
      if (def && def.status !== "coming_soon") {
        return applyPortraitControl(bp, selectedControlId);
      }
    }
    return bp;
  }, [preview, selectedControlId]);

  // PREVIEW 1: SOURCE ONLY
  const preview1Stage = (
    <div>
      {stageLabel("PREVIEW 1", "Source image only", "SOURCE")}
      <div
        onClick={() => {
          if (!activeLayer.imageUrl) onPickImage();
        }}
        style={{ cursor: !activeLayer.imageUrl ? "pointer" : "default" }}
      >
        <YoPhoPortraitStageCanvas
          blueprint={sourceOnlyBlueprint}
          height={isMobile ? "clamp(150px, 22vh, 220px)" : STAGE_CANVAS_HEIGHT}
          interactive={false}
          timelineSec={timelineSec}
          playbackPaused={true}
          suppressOverlays={true}
          emptyLabel="Tap to upload image"
        />
      </div>
    </div>
  );

  // PREVIEW 2: ACTIVE INGREDIENT ONLY
  const preview2Stage = (
    <div>
      {stageLabel("PREVIEW 2", "Active effect / ingredient isolated", selectedControlId?.toUpperCase() ?? "INGREDIENT")}
      <YoPhoPortraitStageCanvas
        blueprint={activeIngredientBlueprint}
        height={isMobile ? "clamp(150px, 22vh, 220px)" : STAGE_CANVAS_HEIGHT}
        interactive={false}
        timelineSec={timelineSec}
        playbackPaused={!isPlaying}
        emptyLabel="Select an effect or layer"
      />
    </div>
  );

  // PREVIEW 3: LIVE MASTER COMPOSITE
  const preview3Stage = (
    <div>
      {stageLabel("PREVIEW 3", "Live Master Composite · Continuous animation", "MASTER")}
      <div
        onClick={() => {
          if (!activeLayer.imageUrl) onPickImage();
        }}
        style={{ cursor: !activeLayer.imageUrl ? "pointer" : "default" }}
      >
        <YoPhoPortraitStageCanvas
          blueprint={preview}
          height={isMobile ? "clamp(240px, 44vh, 420px)" : MASTER_CANVAS_HEIGHT}
          interactive={true}
          timelineSec={timelineSec}
          playbackPaused={!isPlaying}
          emptyLabel="Put your image here — Tap to upload"
        />
      </div>
    </div>
  );

  // PRECISION CONTROLLER DIRECTLY UNDER PREVIEW 3
  const precisionControllerBar = (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${CYAN}44`,
        background: "rgba(8,8,24,0.95)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top Header: Active Layer Name & Quick Tools */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: CYAN }}>
            ACTIVE LAYER:
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>
            {activeLayer.label || "Layer"} (z{activeLayer.zIndex})
          </span>
          {activeLayer.locked ? <span style={{ fontSize: 10, color: GOLD }}>🔒 Locked</span> : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button type="button" onClick={handleUndo} title="Undo" style={chipBtn(GOLD)}>
            ↶ UNDO
          </button>
          <button type="button" onClick={handleRedo} title="Redo" style={chipBtn(GOLD)}>
            ↷ REDO
          </button>
          <button type="button" onClick={handleStartOver} title="Start Over" style={chipBtn(RED)}>
            🔄 START OVER
          </button>
          <button type="button" onClick={() => setShowAddModal(true)} style={chipBtn(GREEN)}>
            + ADD LAYER
          </button>
          <button type="button" onClick={onPickImage} style={chipBtn(FUCHSIA)}>
            📷 REPLACE IMAGE
          </button>
        </div>
      </div>

      {/* Controller Nudge & Scale Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {/* Directional Pad */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>POS</span>
          <button type="button" title="Move left" onClick={() => nudgeActive(-YOPHO_NUDGE_XY_STEP, 0)} style={padBtn(RED)}>←</button>
          <button type="button" title="Move up" onClick={() => nudgeActive(0, -YOPHO_NUDGE_XY_STEP)} style={padBtn(GREEN)}>↑</button>
          <button type="button" title="Move down" onClick={() => nudgeActive(0, YOPHO_NUDGE_XY_STEP)} style={padBtn(RED)}>↓</button>
          <button type="button" title="Move right" onClick={() => nudgeActive(YOPHO_NUDGE_XY_STEP, 0)} style={padBtn(GREEN)}>→</button>
          <button type="button" title="Reset transform" onClick={resetActiveTransform} style={{ ...padBtn("rgba(255,255,255,0.5)"), fontSize: 8 }}>●</button>
        </div>

        {/* Scale Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>SCALE</span>
          <button type="button" onClick={() => scaleActive(-YOPHO_NUDGE_SCALE_STEP)} style={padBtn(RED)}>−</button>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.05}
            value={activeLayer.scale}
            onChange={(e) => setPreview((p) => updateLayerById(p, activeLayerId, { scale: Number(e.target.value) }))}
            style={{ width: 80 }}
          />
          <button type="button" onClick={() => scaleActive(YOPHO_NUDGE_SCALE_STEP)} style={padBtn(GREEN)}>+</button>
          <span style={{ fontSize: 9, color: GOLD, minWidth: 32 }}>{activeLayer.scale.toFixed(2)}x</span>
        </div>

        {/* Rotate Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>ROT</span>
          <button type="button" onClick={() => rotateActive(-YOPHO_NUDGE_ROTATION_STEP)} style={padBtn(RED)}>↶</button>
          <button type="button" onClick={() => rotateActive(YOPHO_NUDGE_ROTATION_STEP)} style={padBtn(GREEN)}>↷</button>
          <span style={{ fontSize: 9, color: CYAN, minWidth: 36 }}>{activeLayer.rotation}°</span>
        </div>

        {/* Depth Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>DEPTH</span>
          <button
            type="button"
            onClick={() => setPreview((p) => reorderStackLayer(p, activeLayerId, "forward"))}
            style={padBtn(GREEN)}
            title="Bring forward"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => setPreview((p) => reorderStackLayer(p, activeLayerId, "back"))}
            style={padBtn(RED)}
            title="Send back"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => setPreview((p) => bringLayerToFront(p, activeLayerId))}
            style={padBtn(GREEN)}
            title="Bring to front"
          >
            ⇈
          </button>
          <button
            type="button"
            onClick={() => setPreview((p) => sendLayerToBack(p, activeLayerId))}
            style={padBtn(RED)}
            title="Send to back"
          >
            ⇊
          </button>
        </div>

        {/* Opacity Control */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>OPACITY</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={activeLayer.opacity}
            onChange={(e) => setPreview((p) => updateLayerById(p, activeLayerId, { opacity: Number(e.target.value) }))}
            style={{ width: 80 }}
          />
          <span style={{ fontSize: 9, color: FUCHSIA, minWidth: 32 }}>{Math.round(activeLayer.opacity * 100)}%</span>
        </div>
      </div>

      {/* Timeline Controls & Scrubber */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => {
            setTimelineSec(0);
            setIsPlaying(true);
          }}
          style={chipBtn(GOLD)}
          title="Rewind to start"
        >
          ⏮ REWIND
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          style={chipBtn(CYAN)}
        >
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
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
          style={{ flex: "1 1 180px", minWidth: 120 }}
        />
        <span style={{ fontSize: 10, fontWeight: 800, color: GOLD, fontFamily: "monospace" }}>
          {formatTime(timelineSec)} / {formatTime(durationSec)}
        </span>
        <label style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={loopTimeline} onChange={(e) => setLoopTimeline(e.target.checked)} />
          Loop
        </label>
      </div>
    </div>
  );

  // LAYER INSPECTOR DOCK (MODELED AFTER AFFINITY PHOTO)
  const layerInspectorDock = (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(6,6,18,0.96)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dock Header & Category Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {(["layers", "fx", "style", "color", "motion"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: active ? `1px solid ${CYAN}` : "1px solid transparent",
                  background: active ? `${CYAN}22` : "transparent",
                  color: active ? CYAN : "rgba(255,255,255,0.6)",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setDockExpanded((e) => !e)}
          style={{ ...chipBtn("rgba(255,255,255,0.5)"), fontSize: 9 }}
        >
          {dockExpanded ? "MINIMIZE ─" : "EXPAND ⤢"}
        </button>
      </div>

      {/* Dock Content Body — Fixed height with internal scroll */}
      {dockExpanded && (
        <div
          style={{
            height: isMobile ? 260 : 340,
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* TAB 1: LAYERS */}
          {activeTab === "layers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Opacity & Blend Mode Bar */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Opacity:</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={activeLayer.opacity}
                    onChange={(e) => setPreview((p) => updateLayerById(p, activeLayerId, { opacity: Number(e.target.value) }))}
                    style={{ width: 90 }}
                  />
                  <span style={{ fontSize: 9, color: CYAN, fontWeight: 800 }}>{Math.round(activeLayer.opacity * 100)}%</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Blend:</span>
                  <select
                    value={activeLayer.blendMode}
                    onChange={(e) => setPreview((p) => updateLayerById(p, activeLayerId, { blendMode: e.target.value as BlendMode }))}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 4,
                      fontSize: 10,
                      padding: "2px 6px",
                    }}
                  >
                    {(["normal", "screen", "overlay", "multiply", "color-dodge", "soft-light", "luminosity"] as const).map((b) => (
                      <option key={b} value={b}>
                        {b.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layer Stack Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[...stackLayers].reverse().map((ref) => {
                  const selected = ref.id === activeLayerId;
                  const empty = !ref.layer.imageUrl?.trim();
                  return (
                    <div
                      key={ref.id}
                      onClick={() => setActiveLayerId(ref.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: selected ? `1.5px solid ${CYAN}` : "1px solid rgba(255,255,255,0.1)",
                        background: selected ? `${CYAN}16` : "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                      }}
                    >
                      {/* Thumbnail Placeholder */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: ref.layer.imageUrl ? `url(${ref.layer.imageUrl}) center/cover` : "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        {!ref.layer.imageUrl ? "🖼" : null}
                      </div>

                      {/* Layer Label & Rename Input */}
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={ref.layer.label || `Layer ${ref.layer.zIndex}`}
                          onChange={(e) => setPreview((p) => updateLayerById(p, ref.id, { label: e.target.value }))}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 800,
                            width: "100%",
                          }}
                        />
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
                          z{ref.layer.zIndex} · {empty ? "Empty Image" : "Image Set"}
                        </div>
                      </div>

                      {/* Layer Action Controls */}
                      <button
                        type="button"
                        title={ref.layer.locked ? "Unlock" : "Lock"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview((p) => updateLayerById(p, ref.id, { locked: !ref.layer.locked }));
                        }}
                        style={tinyBtn}
                      >
                        {ref.layer.locked ? "🔒" : "🔓"}
                      </button>

                      {stackLayers.length > 1 && (
                        <button
                          type="button"
                          title="Remove layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = removeStackLayer(preview, ref.id);
                            setPreview(next);
                            setActiveLayerId(next.primaryLayer.id);
                          }}
                          style={{ ...tinyBtn, color: RED }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Rail */}
              <div style={{ display: "flex", gap: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button type="button" onClick={() => setShowAddModal(true)} style={chipBtn(GREEN)}>
                  + ADD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = addStackLayer(preview, capacity.maxImages);
                    if (next) {
                      setPreview(next);
                      const added = listStackLayers(next).at(-1);
                      if (added) setActiveLayerId(added.id);
                    }
                  }}
                  style={chipBtn(CYAN)}
                >
                  DUPLICATE
                </button>
                <button
                  type="button"
                  onClick={() => setPreview((p) => updateLayerById(p, activeLayerId, { locked: !activeLayer.locked }))}
                  style={chipBtn(GOLD)}
                >
                  {activeLayer.locked ? "UNLOCK" : "LOCK"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FX */}
          {activeTab === "fx" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: FUCHSIA, marginBottom: 4 }}>
                OVERLAY EFFECTS & ANIMATIONS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}>
                {YOPHO_PORTRAIT_CONTROLS.map((c) => {
                  const selected = selectedControlId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleControlClick(c.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: selected ? `2px solid ${CYAN}` : "1px solid rgba(255,255,255,0.1)",
                        background: selected ? `${CYAN}22` : "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {activeParams && selectedOverlayId && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: CYAN, marginBottom: 8 }}>
                    {selectedOverlayId.replace(/_/g, " ").toUpperCase()} PARAMETERS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Intensity: {activeParams.intensity}</div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={activeParams.intensity}
                        onChange={(e) => patchSelectedParams({ intensity: Number(e.target.value) })}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Speed: {activeParams.speed.toFixed(2)}x</div>
                      <input
                        type="range"
                        min={0.25}
                        max={2}
                        step={0.05}
                        value={activeParams.speed}
                        onChange={(e) => patchSelectedParams({ speed: Number(e.target.value) })}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STYLE */}
          {activeTab === "style" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: GOLD, marginBottom: 4 }}>
                REUSABLE STYLE PACKS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {YOPHO_STUDIO_STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyStylePreset(preset.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${preset.accentHint ?? CYAN}55`,
                      background: "rgba(255,255,255,0.04)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ color: preset.accentHint ?? CYAN }}>{preset.label}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{preset.tagline}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COLOR */}
          {activeTab === "color" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: CYAN, marginBottom: 4 }}>
                COLOR PALETTE & ACCENTS
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {["#00FFFF", "#FF2DAA", "#FFD700", "#00FF88", "#9D00FF", "#FFFFFF"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      const next = {
                        ...preview,
                        colorPalette: {
                          primaryAccent: hex,
                          secondaryAccent: hex,
                          ambientGlow: hex,
                        },
                      };
                      setPreview(next);
                      onMasterChange(next);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: hex,
                      border: preview.colorPalette.primaryAccent === hex ? "2.5px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MOTION */}
          {activeTab === "motion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: GREEN, marginBottom: 4 }}>
                CONTINUOUS MOTION TIMELINE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Motion Speed:</span>
                <input
                  type="range"
                  min={0.25}
                  max={3.0}
                  step={0.1}
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 10, color: GREEN, fontWeight: 800 }}>{motionSpeed.toFixed(1)}x</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

      {/* ADD LAYER MODAL */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              background: "rgba(10,10,28,0.98)",
              border: `1px solid ${CYAN}`,
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: CYAN, letterSpacing: "0.1em" }}>
                + ADD NEW LAYER ITEM
              </span>
              <button type="button" onClick={() => setShowAddModal(false)} style={tinyBtn}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["📷 Photo", "photo"],
                ["🎥 Video", "video"],
                ["🔤 Text", "text"],
                ["⚡ Effect", "effect"],
                ["🖼 Frame", "frame"],
                ["🌆 Background", "background"],
                ["✨ Prop / Sticker", "prop"],
                ["🏷 Logo", "logo"],
                ["🎆 Particle", "particle"],
                ["🎬 Animation", "animation"],
              ].map(([label, kind]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleAddLayerItem(kind)}
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN YOPHO TRIPLE-STAGE DISPLAY GRID */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {preview1Stage}
            {preview2Stage}
          </div>
          {preview3Stage}
          {precisionControllerBar}
          {layerInspectorDock}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.3fr",
              gap: 12,
              alignItems: "start",
            }}
          >
            {preview1Stage}
            {preview2Stage}
            {preview3Stage}
          </div>
          {precisionControllerBar}
          {layerInspectorDock}
        </div>
      )}

      {statusLine ? (
        <div style={{ fontSize: 10, color: CYAN, fontWeight: 700, textAlign: "center" }}>{statusLine}</div>
      ) : null}
    </div>
  );
}

function chipBtn(color: string): CSSProperties {
  return {
    padding: "5px 9px",
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
  width: 24,
  height: 24,
  cursor: "pointer",
};

function padBtn(color: string): CSSProperties {
  return {
    width: 26,
    height: 26,
    padding: 0,
    borderRadius: 6,
    border: `1px solid ${color}88`,
    background: `${color}22`,
    color,
    fontSize: 11,
    fontWeight: 900,
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1,
  };
}
