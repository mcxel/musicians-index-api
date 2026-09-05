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
import {
  acknowledgeYoPhoBackgroundFirst,
  canApplyYoPhoOwnedEffect,
  canSetYoPhoLayerMedia,
  countYoPhoImageSlots,
  countYoPhoTotalLayers,
  evaluateYoPhoAdd,
  getYoPhoBackgroundLayer,
  getYoPhoImageCapacity,
  hasYoPhoBackgroundFirstAck,
  hasYoPhoBackgroundSet,
  isYoPhoBackgroundLayer,
  YOPHO_BACKGROUND_FIRST_MESSAGE,
  YOPHO_FREE_ALLOWANCE_COPY,
  yoPhoAddKindConsumesImageSlot,
  yoPhoBudgetKindForAddLayer,
  yoPhoImageCapMessage,
  yoPhoTotalLayerCapMessage,
} from "@/lib/yopho/YoPhoImageCapacity";
import { downscaleImageFile } from "@/lib/yopho/downscaleImageFile";
import {
  addStackLayer,
  bringLayerToFront,
  duplicateStackLayer,
  ensureTripleLayerStack,
  getLayerById,
  layerHasVisibleMedia,
  listStackLayers,
  nudgeLayerPosition,
  nudgeLayerScale,
  nudgeLayerRotation,
  removeStackLayer,
  reorderStackLayer,
  resetLayerTransform,
  sendLayerToBack,
  setActiveLayerImage,
  setActiveLayerMedia,
  updateLayerById,
  YOPHO_NUDGE_ROTATION_STEP,
  YOPHO_NUDGE_SCALE_STEP,
  YOPHO_NUDGE_XY_STEP,
} from "@/lib/yopho/YoPhoLayerStack";
import {
  YOPHO_STUDIO_STYLE_PRESETS,
  type YoPhoStudioStyleId,
} from "@/lib/yopho/YoPhoStudioStylePresets";
import {
  claimYoPhoLearningXp,
  loadYoPhoLearningProgress,
  yoPhoLearningPct,
  type YoPhoLearningProgress,
} from "@/lib/yopho/YoPhoLearningTrack";
import {
  copyYoPhoShareLink,
  nativeShareYoPhoCard,
} from "@/lib/yopho/shareYoPhoCard";
import YoPhoPortraitStageCanvas from "./YoPhoPortraitStageCanvas";
import YoPhoMediaModuleComposer from "./YoPhoMediaModuleComposer";
import YoPhoBrandingFooter from "./YoPhoBrandingFooter";
import YoPhoFreeOnboardingGuide, {
  reopenYoPhoFreeGuide,
} from "./YoPhoFreeOnboardingGuide";
import {
  loadCardComposition,
  saveCardComposition,
} from "@/lib/yopho/YoPhoCardComposition";
import { YOPHO_LEARNING_TRACK_TARGET_XP } from "@/lib/xp/XpActionRegistry";

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
  cardRole?: "fan" | "performer";
  userKey?: string;
}

export default function YoPhoTripleStageStudio({
  master,
  onMasterChange,
  onSaveEdition,
  storageKey = "tmi_yopho_triple_stage",
  tierOrRole = "FREE",
  cardRole = "fan",
  userKey = "local",
}: YoPhoTripleStageStudioProps) {
  const capacity = useMemo(() => getYoPhoImageCapacity(tierOrRole), [tierOrRole]);
  const [preview, setPreview] = useState<YoPhoPortraitBlueprint>(() =>
    ensureTripleLayerStack(clonePortraitBlueprint(master)),
  );
  const [selectedControlId, setSelectedControlId] = useState<string | null>("smoke");
  const [activeLayerId, setActiveLayerId] = useState<string>(master.primaryLayer.id);
  const [activeTab, setActiveTab] = useState<"layers" | "fx" | "style" | "color" | "motion" | "media">("layers");
  const [dockExpanded, setDockExpanded] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timelineSec, setTimelineSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loopTimeline, setLoopTimeline] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [showUpgradeCta, setShowUpgradeCta] = useState(false);
  const [cardComp, setCardComp] = useState(() => loadCardComposition(cardRole, userKey));
  const [learningProgress, setLearningProgress] = useState<YoPhoLearningProgress | null>(null);
  const [guideForceOpen, setGuideForceOpen] = useState(false);
  const [shareCardId, setShareCardId] = useState<string | null>(null);
  const [bgFirstAcked, setBgFirstAcked] = useState(false);

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

  useEffect(() => {
    setLearningProgress(loadYoPhoLearningProgress());
    setBgFirstAcked(hasYoPhoBackgroundFirstAck());
  }, []);

  const durationSec = preview.previewDurationSec ?? master.previewDurationSec ?? 6;
  const stackLayers = useMemo(() => listStackLayers(preview), [preview]);
  const backgroundReady = useMemo(() => hasYoPhoBackgroundSet(preview), [preview]);
  const softGateOpen = !backgroundReady && !bgFirstAcked;
  const activeLayer = useMemo(
    () => getLayerById(preview, activeLayerId) ?? preview.primaryLayer,
    [preview, activeLayerId],
  );

  useEffect(() => {
    const normalized = ensureTripleLayerStack(clonePortraitBlueprint(master));
    setPreview(normalized);
    setActiveLayerId((prev) => {
      const ids = new Set([normalized.primaryLayer.id, ...normalized.secondaryLayers.map((l) => l.id)]);
      if (ids.has(prev)) return prev;
      // Prefer empty background slot so Free users start correctly.
      const bg = getYoPhoBackgroundLayer(normalized);
      if (bg && !layerHasVisibleMedia(bg)) return bg.id;
      return bg?.id ?? normalized.primaryLayer.id;
    });
    if (
      normalized.secondaryLayers.length !== master.secondaryLayers.length ||
      normalized.primaryLayer.id !== master.primaryLayer.id
    ) {
      onMasterChange(normalized);
    }
  }, [master.id, master.updatedAt]);

  useEffect(() => {
    setCardComp(loadCardComposition(cardRole, userKey));
  }, [cardRole, userKey]);

  const claimLearning = useCallback(async (key: Parameters<typeof claimYoPhoLearningXp>[0]) => {
    const result = await claimYoPhoLearningXp(key);
    setLearningProgress(result.progress);
    if (result.granted > 0) {
      setStatusLine(`+${result.granted} learning XP · ${key.replace(/^yopho_/, "").replace(/_/g, " ")}`);
    } else if (result.reason === "unauthenticated") {
      setStatusLine("Progress saved locally. Sign in to earn durable learning XP.");
    }
    return result;
  }, []);

  const pendingPickLayerId = useRef<string | null>(null);

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

  const commitPreview = useCallback(
    (next: YoPhoPortraitBlueprint) => {
      setPreview(next);
      onMasterChange(next);
    },
    [onMasterChange],
  );

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

  const onPickImage = (opts?: { layerId?: string; blueprint?: YoPhoPortraitBlueprint }) => {
    const bp = opts?.blueprint ?? preview;
    const targetId = opts?.layerId ?? activeLayerId;
    const gate = canSetYoPhoLayerMedia(bp, targetId, { allowSkipAck: true });
    if (!gate.ok) {
      setShowUpgradeCta(false);
      setStatusLine(gate.message);
      const bg = getYoPhoBackgroundLayer(bp);
      if (bg) setActiveLayerId(bg.id);
      return;
    }
    pendingPickLayerId.current = targetId;
    fileInputRef.current?.click();
  };

  const onFileChosen = async (file: File | null) => {
    if (!file) {
      setStatusLine("No file selected.");
      return;
    }
    const targetId = pendingPickLayerId.current ?? activeLayerId;
    pendingPickLayerId.current = null;
    const gate = canSetYoPhoLayerMedia(preview, targetId, { allowSkipAck: true });
    if (!gate.ok) {
      setStatusLine(gate.message);
      return;
    }
    const targetLayer = getLayerById(preview, targetId) ?? activeLayer;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) {
      setStatusLine("Choose a valid image or video file.");
      return;
    }
    setStatusLine(isVideo ? "Preparing video layer…" : "Preparing image…");
    pushUndo();
    const wasBackground = isYoPhoBackgroundLayer(preview, targetId);
    let next: YoPhoPortraitBlueprint;
    if (isVideo) {
      const url = URL.createObjectURL(file);
      next = setActiveLayerMedia(preview, targetId, {
        videoUrl: url,
        mediaMode: "animated",
        label: file.name,
      });
    } else {
      const { blob } = await downscaleImageFile(file);
      const url = URL.createObjectURL(blob);
      next = setActiveLayerImage(preview, targetId, url, file.name);
    }
    setActiveLayerId(targetId);
    commitPreview(next);
    setStatusLine(
      isVideo
        ? `Video loaded into ${targetLayer.label || "layer"} (animated).`
        : `Image loaded into layer: ${file.name}`,
    );
    if (wasBackground) {
      void claimLearning("yopho_set_background");
    } else if ((targetLayer.budgetKind ?? "image") === "image") {
      void claimLearning("yopho_add_image_layer");
    }
  };

  const handleSaveEditionClick = () => {
    if (!hasYoPhoBackgroundSet(preview)) {
      setStatusLine(YOPHO_BACKGROUND_FIRST_MESSAGE);
      return;
    }
    const trimmed = ensureTripleLayerStack(clonePortraitBlueprint(preview));
    onSaveEdition?.(trimmed);
    onMasterChange(trimmed);
    const cardId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `yopho_${crypto.randomUUID().slice(0, 8)}`
        : `yopho_${Date.now().toString(36)}`;
    setShareCardId(cardId);
    try {
      void fetch("/api/yopho/cards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cardId,
          displayName: trimmed.title || "YoPho Card",
          subjectUrl:
            trimmed.primaryLayer.imageUrl ||
            getYoPhoBackgroundLayer(trimmed)?.imageUrl ||
            "/images/tmi-placeholder.jpg",
          role: cardRole,
        }),
      });
    } catch {
      /* non-fatal */
    }
    setStatusLine("Composition saved. Share link + QR ready below.");
    void claimLearning("yopho_save_composition");
  };

  const handleShareClick = async () => {
    const cardId = shareCardId ?? preview.id;
    const artifact = {
      type: "yopho_card" as const,
      cardId,
      displayName: preview.title,
    };
    const native = await nativeShareYoPhoCard(artifact);
    if (native.ok) {
      setStatusLine("Shared.");
      void claimLearning("yopho_share_card");
      return;
    }
    const copied = await copyYoPhoShareLink(artifact);
    if (copied.ok) {
      setStatusLine(copied.url ? `Link copied: ${copied.url}` : "Share link copied.");
      void claimLearning("yopho_share_card");
      return;
    }
    setStatusLine(copied.error ?? native.error ?? "Share unavailable. Save first, then copy link.");
  };

  const handleControlClick = (controlId: string) => {
    const def = getPortraitControl(controlId);
    if (!def) return;

    let alreadyOnStack = false;
    if (def.overlayId) {
      alreadyOnStack = Boolean(
        (preview.portraitEffects ?? []).find((effect) => effect.effectId === def.overlayId && effect.enabled),
      );
    } else if (controlId === "black_white" || controlId === "vintage") {
      alreadyOnStack = preview.texturePreset !== "none";
    } else if (controlId === "motion") {
      alreadyOnStack = Boolean(
        (preview.portraitEffects ?? []).find((effect) => effect.effectId === "drift" && effect.enabled),
      );
    }

    const burnsNewTotalLayer =
      Boolean(def.overlayId) || controlId === "black_white" || controlId === "vintage" || controlId === "motion";
    if (burnsNewTotalLayer && !canApplyYoPhoOwnedEffect(preview, alreadyOnStack, tierOrRole)) {
      setShowUpgradeCta(true);
      setStatusLine(yoPhoTotalLayerCapMessage(tierOrRole));
      return;
    }

    pushUndo();
    setSelectedControlId(controlId);
    const next = applyPortraitControl(preview, controlId);
    commitPreview(next);
    setShowUpgradeCta(false);
    setStatusLine(
      burnsNewTotalLayer
        ? `Applied effect: ${def.label} (counts as a total layer, not an extra image slot).`
        : `Applied effect: ${def.label}`,
    );
    if (!isPlaying) setIsPlaying(true);
    void claimLearning("yopho_add_effect");
  };

  const patchSelectedParams = (partial: Parameters<typeof patchOverlayParams>[2]) => {
    if (!selectedOverlayId) return;
    setPreview((p) => patchOverlayParams(p, selectedOverlayId, partial));
  };

  const handleApplyStylePreset = (styleId: YoPhoStudioStyleId) => {
    const preset = YOPHO_STUDIO_STYLE_PRESETS.find((s) => s.id === styleId);
    if (!preset) return;
    let projected = countYoPhoTotalLayers(preview);
    if (preset.objectMaskHint && !preview.objectMask) projected += 1;
    if (preset.textureHint && preset.textureHint !== "none" && preview.texturePreset === "none") {
      projected += 1;
    }
    if (projected > capacity.maxTotalLayers) {
      setShowUpgradeCta(true);
      setStatusLine(yoPhoTotalLayerCapMessage(tierOrRole));
      return;
    }
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
    commitPreview(next);
    setStatusLine(`Style applied: ${preset.label}`);
  };

  const handleAddLayerItem = (kind: string) => {
    setShowAddModal(false);
    const verdict = evaluateYoPhoAdd(preview, kind, tierOrRole);
    if (!verdict.ok) {
      // Free already has a 3-slot image stack — fill an empty matching slot instead of minting a 4th.
      if (
        verdict.reason === "image" &&
        (kind === "background" || kind === "photo" || kind === "cutout")
      ) {
        const emptyBg = getYoPhoBackgroundLayer(preview);
        if (kind === "background" && emptyBg && !layerHasVisibleMedia(emptyBg)) {
          setActiveLayerId(emptyBg.id);
          onPickImage({ layerId: emptyBg.id, blueprint: preview });
          setStatusLine("Fill your Background slot first (Free 3-slot stack).");
          return;
        }
        if ((kind === "photo" || kind === "cutout") && !hasYoPhoBackgroundSet(preview)) {
          setShowUpgradeCta(false);
          setStatusLine(YOPHO_BACKGROUND_FIRST_MESSAGE);
          if (emptyBg) setActiveLayerId(emptyBg.id);
          return;
        }
        const emptyImage = listStackLayers(preview).find(
          (ref) =>
            (ref.layer.budgetKind ?? "image") === "image" &&
            !layerHasVisibleMedia(ref.layer) &&
            ref.layer.role !== "background",
        );
        if (emptyImage && hasYoPhoBackgroundSet(preview)) {
          setActiveLayerId(emptyImage.id);
          onPickImage({ layerId: emptyImage.id, blueprint: preview });
          setStatusLine(`Filling empty ${emptyImage.layer.label || "image"} slot.`);
          return;
        }
      }
      setShowUpgradeCta(verdict.reason === "image" || verdict.reason === "total");
      setStatusLine(verdict.message);
      if (verdict.reason === "background_first") {
        const bg = getYoPhoBackgroundLayer(preview);
        if (bg) setActiveLayerId(bg.id);
      }
      return;
    }

    if (kind === "effect" || kind === "particle" || kind === "animation") {
      setShowUpgradeCta(false);
      setActiveTab("fx");
      setStatusLine(
        "Owned effects apply onto the existing image — no extra image slot. A new overlay still counts as one total layer. Apply from FX.",
      );
      return;
    }

    const budgetKind = yoPhoBudgetKindForAddLayer(kind);
    if (budgetKind === "unsupported" || budgetKind === "media") return;

    // Prefer filling empty Background slot over adding another image layer.
    if (kind === "background") {
      const bg = getYoPhoBackgroundLayer(preview);
      if (bg && !layerHasVisibleMedia(bg)) {
        setActiveLayerId(bg.id);
        onPickImage({ layerId: bg.id, blueprint: preview });
        return;
      }
    }

    pushUndo();
    const next = addStackLayer(preview, capacity.maxImages, capacity.maxTotalLayers, budgetKind);
    if (!next) {
      setShowUpgradeCta(true);
      setStatusLine(
        yoPhoAddKindConsumesImageSlot(kind) ? yoPhoImageCapMessage(tierOrRole) : yoPhoTotalLayerCapMessage(tierOrRole),
      );
      return;
    }
    setShowUpgradeCta(false);
    const added = listStackLayers(next).at(-1);
    let patched = next;
    if (added) {
      const role =
        kind === "background" ? "background" : kind === "cutout" ? "cutout" : kind === "photo" ? "secondary" : added.layer.role;
      const label = `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${added.layer.zIndex}`;
      patched = updateLayerById(next, added.id, { label, budgetKind, role });
      setActiveLayerId(added.id);
    }
    commitPreview(patched);
    if (kind === "photo" || kind === "background" || kind === "cutout") {
      if (added) onPickImage({ layerId: added.id, blueprint: patched });
    } else {
      setStatusLine(`New ${kind} layer created — total layer used, image slot unchanged.`);
    }
  };

  const handleStartOver = () => {
    if (typeof window !== "undefined" && !window.confirm("Start over? This will reset all layers and effects to initial state.")) {
      return;
    }
    pushUndo();
    const fresh = ensureTripleLayerStack(clonePortraitBlueprint(master));
    fresh.portraitEffects = [];
    commitPreview(fresh);
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
          if (!layerHasVisibleMedia(activeLayer)) onPickImage();
        }}
        style={{ cursor: !layerHasVisibleMedia(activeLayer) ? "pointer" : "default" }}
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
          if (!layerHasVisibleMedia(activeLayer)) onPickImage();
        }}
        style={{ cursor: !layerHasVisibleMedia(activeLayer) ? "pointer" : "default" }}
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
          <button type="button" onClick={() => onPickImage()} style={chipBtn(FUCHSIA)}>
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
          {(["layers", "fx", "style", "color", "motion", "media"] as const).map((tab) => {
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
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                Background first, then Mid / Foreground. Free image slots {countYoPhoImageSlots(preview)}/
                {capacity.maxImages} (1 bg + 2 images) · Total layers {countYoPhoTotalLayers(preview)}/
                {capacity.maxTotalLayers} on {capacity.tierKey}. FX/filters are separate from image slots.
                {!backgroundReady ? (
                  <span style={{ color: FUCHSIA, display: "block", marginTop: 4 }}>
                    {YOPHO_BACKGROUND_FIRST_MESSAGE}
                  </span>
                ) : null}
              </div>
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

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Media:</span>
                  {(["static", "animated"] as const).map((mode) => {
                    const selected = (activeLayer.mediaMode ?? "static") === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          commitPreview(
                            setActiveLayerMedia(preview, activeLayerId, {
                              mediaMode: mode,
                              ...(mode === "static" ? { videoUrl: "" } : {}),
                            }),
                          )
                        }
                        style={{
                          ...chipBtn(selected ? CYAN : "rgba(255,255,255,0.45)"),
                          fontSize: 8,
                          padding: "3px 8px",
                        }}
                      >
                        {mode.toUpperCase()}
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => onPickImage()} style={{ ...chipBtn(FUCHSIA), fontSize: 8, padding: "3px 8px" }}>
                    {(activeLayer.mediaMode ?? "static") === "animated" ? "UPLOAD VIDEO" : "UPLOAD IMAGE"}
                  </button>
                </div>
              </div>

              {/* Layer Stack Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[...stackLayers].reverse().map((ref) => {
                  const selected = ref.id === activeLayerId;
                  const empty = !layerHasVisibleMedia(ref.layer);
                  const thumbBg =
                    ref.layer.mediaMode === "animated" && ref.layer.videoUrl
                      ? "rgba(255,45,170,0.25)"
                      : ref.layer.imageUrl
                        ? `url(${ref.layer.imageUrl}) center/cover`
                        : "rgba(255,255,255,0.1)";
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
                          background: thumbBg,
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        {!layerHasVisibleMedia(ref.layer) ? (ref.layer.mediaMode === "animated" ? "🎬" : "🖼") : null}
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
                          z{ref.layer.zIndex} · {(ref.layer.budgetKind ?? "image") === "image" ? (empty ? "Empty slot" : ref.layer.mediaMode === "animated" ? "Animated video" : "Static image") : `${ref.layer.budgetKind} layer`}
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
                    const next = duplicateStackLayer(
                      preview,
                      activeLayerId,
                      capacity.maxImages,
                      capacity.maxTotalLayers,
                    );
                    if (next) {
                      setPreview(next);
                      const added = listStackLayers(next).at(-1);
                      if (added) {
                        setActiveLayerId(added.id);
                        setStatusLine(`Duplicated layer: ${activeLayer.label ?? "Layer"}`);
                      }
                      setShowUpgradeCta(false);
                    } else {
                      setShowUpgradeCta(true);
                      setStatusLine(
                        (activeLayer.budgetKind ?? "image") === "image"
                          ? yoPhoImageCapMessage(tierOrRole)
                          : yoPhoTotalLayerCapMessage(tierOrRole),
                      );
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

          {activeTab === "media" && (
            <YoPhoMediaModuleComposer
              role={cardRole}
              userKey={userKey}
              accountTier={tierOrRole}
              modules={cardComp.mediaModules ?? []}
              onChange={(next) => {
                const updated = { ...cardComp, mediaModules: next, updatedAt: new Date().toISOString() };
                setCardComp(updated);
                saveCardComposition(cardRole, userKey, updated);
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <YoPhoFreeOnboardingGuide
        forceOpen={guideForceOpen}
        onDismissed={() => setGuideForceOpen(false)}
        onProgressChange={setLearningProgress}
      />

      {learningProgress ? (
        <div
          data-yopho-learning-progress
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.25)",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: CYAN }}>
            LEARNING · {learningProgress.earnedXp}/{YOPHO_LEARNING_TRACK_TARGET_XP} XP
          </span>
          <div
            style={{
              flex: "1 1 120px",
              height: 5,
              borderRadius: 99,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
              minWidth: 80,
            }}
          >
            <div
              style={{
                width: `${yoPhoLearningPct(learningProgress)}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${CYAN}, ${FUCHSIA})`,
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              reopenYoPhoFreeGuide();
              setGuideForceOpen(true);
            }}
            style={chipBtn(GOLD)}
          >
            HOW-TO
          </button>
        </div>
      ) : null}

      {!backgroundReady ? (
        <div
          data-yopho-bg-gate
          data-yopho-bg-soft={softGateOpen ? "1" : "0"}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${FUCHSIA}66`,
            background: `${FUCHSIA}12`,
            fontSize: 11,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.4,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: "1 1 220px" }}>
            <strong style={{ color: FUCHSIA }}>
              {softGateOpen ? "Add your background first, then add your images." : "Tip — background still empty."}
            </strong>{" "}
            {YOPHO_BACKGROUND_FIRST_MESSAGE}{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{YOPHO_FREE_ALLOWANCE_COPY}</span>
          </div>
          {softGateOpen ? (
            <button
              type="button"
              data-yopho-bg-ack
              onClick={() => {
                acknowledgeYoPhoBackgroundFirst();
                setBgFirstAcked(true);
                setStatusLine("Got it — you can add layers now. Background-first still recommended.");
              }}
              style={chipBtn(GOLD)}
            >
              I UNDERSTAND — CONTINUE
            </button>
          ) : null}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
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
            {!backgroundReady ? (
              <div style={{ fontSize: 10, color: FUCHSIA, fontWeight: 700, lineHeight: 1.4 }}>
                {YOPHO_BACKGROUND_FIRST_MESSAGE}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["🌆 Background", "background"],
                ["📷 Photo", "photo"],
                ["✂ Cutout", "cutout"],
                ["🎥 Video", "video"],
                ["🔤 Text", "text"],
                ["⚡ Effect", "effect"],
                ["🖼 Frame", "frame"],
                ["✨ Prop / Sticker", "prop"],
                ["🏷 Logo", "logo"],
                ["🎆 Particle", "particle"],
                ["🎬 Animation", "animation"],
              ].map(([label, kind]) => {
                const blocked =
                  softGateOpen && (kind === "photo" || kind === "cutout");
                return (
                  <button
                    key={kind}
                    type="button"
                    disabled={blocked}
                    title={blocked ? YOPHO_BACKGROUND_FIRST_MESSAGE : undefined}
                    onClick={() => handleAddLayerItem(kind)}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border: blocked
                        ? "1px solid rgba(255,68,102,0.35)"
                        : kind === "background"
                          ? `1px solid ${CYAN}88`
                          : "1px solid rgba(255,255,255,0.15)",
                      background: blocked
                        ? "rgba(255,68,102,0.08)"
                        : kind === "background"
                          ? `${CYAN}18`
                          : "rgba(255,255,255,0.05)",
                      color: blocked ? "rgba(255,255,255,0.35)" : "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: blocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
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

      <div
        data-yopho-share-strip
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,215,0,0.28)",
          background: "rgba(8,8,20,0.9)",
        }}
      >
        <button type="button" onClick={handleSaveEditionClick} style={chipBtn(GREEN)}>
          💾 SAVE COMPOSITION
        </button>
        <button type="button" onClick={() => void handleShareClick()} style={chipBtn(GOLD)}>
          ↗ SHARE / COPY LINK
        </button>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", flex: "1 1 160px" }}>
          Album cover · baseball card · QR on footer. Share works after save when a card id exists.
        </span>
        <div
          style={{
            position: "relative",
            width: 120,
            height: 48,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#0a0614",
          }}
        >
          <YoPhoBrandingFooter
            cardId={shareCardId ?? preview.id}
            showSafeGuide={false}
            heightPct={0.12}
            config={{ enabled: true, showQr: true, qrTarget: "card", label: "TMI × YoPho" }}
          />
        </div>
      </div>

      {statusLine ? (
        <div style={{ fontSize: 10, color: CYAN, fontWeight: 700, textAlign: "center" }}>
          {statusLine}
          {showUpgradeCta ? (
            <>
              {" "}
              <Link href={capacity.upgradeHref} style={{ color: GOLD }}>
                Upgrade
              </Link>
            </>
          ) : null}
        </div>
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
