"use client";

/**
 * VenueControlPanel — pop-up venue / lighting / environment controls.
 * Matches Avatar Quick Panel UX: floating overlay, does not block main media view.
 *
 * Role matrix (Rule 26):
 *   Performer — lighting, stage effects, camera, audience energy (NOT avatar)
 *   Fan — avatar lobby environment / ambiance when authorized
 *   Lounge host (fan OR performer) — full lounge environment controls
 *   Guest — read-only preset display
 *
 * Wired to: StageDirectorEngine, LightingMoodRuntime, VenueStateEngine, FanLobbySkinRegistry
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  onStageDirectorChange,
  type StageEffect,
  type CameraAngle,
  type StageDirectorState,
} from "@/lib/live/StageDirectorEngine";
import {
  initLighting,
  subscribeToLighting,
  type LightingPreset,
  type LightingState,
} from "@/lib/venue/LightingMoodRuntime";
import { registerVenue, getVenueState } from "@/lib/venue/VenueStateEngine";
import {
  venueSetLighting,
  venueSetMood,
  venueSetDimmer,
  venueApplyScene,
  venueTriggerFx,
  venueSetCamera,
  venueSetEnergy,
  dispatchVenueToolsCommand,
  previewVenueScene,
  applyVenueScene,
  rollbackVenueScene,
  getPreviewScene,
  getLastKnownGoodScene,
} from "@/lib/venue/VenueToolsDirector";
import { applyVenueCurtainCue, getCurtainStageLabel, pauseShow, resumeShow, getActiveBreakClock } from "@/lib/venue/VenueCurtainDirector";
import { VENUE_SCENE_DEFINITIONS, listStageLightingPresets, SET_THE_MOOD_PRESETS } from "@/lib/venue/VenueToolsRegistry";
import AudienceReactionBar from "@/components/live/AudienceReactionBar";
import {
  listSwitchableFanLobbySkins,
  persistFanLobbySkinId,
  getPersistedFanLobbySkinId,
  FAN_LOBBY_SKIN_CHANGED_EVENT,
  type FanLobbySkinId,
} from "@/lib/lobby/FanLobbySkinRegistry";

const CYAN = "#00FFFF";
const GOLD = "#FFD700";
const FUCHSIA = "#FF2DAA";

export type VenueControlRole = "fan" | "performer";

export interface VenueControlPanelProps {
  role: VenueControlRole;
  userId: string;
  venueId?: string;
  roomId?: string;
  /** When true, fan gets lounge-host environment controls */
  isLoungeHost?: boolean;
  /** Guest mode — view current state only */
  readOnly?: boolean;
  accentColor?: string;
}

type ControlTab = "lighting" | "effects" | "environment" | "audience" | "scenes" | "curtain";

const BREAK_TIMER_OPTIONS = [
  { label: "1 min", ms: 60_000 },
  { label: "2 min", ms: 120_000 },
  { label: "3 min", ms: 180_000 },
  { label: "5 min", ms: 300_000 },
] as const;

const MOOD_PRESETS: { id: LightingPreset; label: string; color: string }[] = [
  { id: "lobby-warm", label: "Warm Lobby", color: "#ffb347" },
  { id: "stage-blue", label: "Stage Blue", color: "#00bfff" },
  { id: "full-production", label: "Full Production", color: "#ff00ff" },
  { id: "party-mode", label: "Party Mode", color: "#00ffcc" },
  { id: "encore-gold", label: "Encore Gold", color: "#ffd700" },
  { id: "spotlight-white", label: "Spotlight", color: "#ffffff" },
  { id: "half-house", label: "Half House", color: "#888888" },
  { id: "blackout", label: "Blackout", color: "#333333" },
];

const STAGE_EFFECTS: { id: StageEffect; label: string; icon: string }[] = [
  { id: "strobe", label: "Strobe", icon: "⚡" },
  { id: "fog-roll", label: "Fog Roll", icon: "🌫️" },
  { id: "laser-scan", label: "Laser Scan", icon: "🔦" },
  { id: "confetti-burst", label: "Confetti", icon: "🎊" },
  { id: "spotlight-sweep", label: "Spot Sweep", icon: "💡" },
  { id: "crowd-glow", label: "Crowd Glow", icon: "✨" },
];

const CAMERA_ANGLES: { id: CameraAngle; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "wide", label: "Wide" },
  { id: "close-up", label: "Close-Up" },
  { id: "audience", label: "Audience" },
  { id: "overhead", label: "Overhead" },
  { id: "side", label: "Side" },
];

function TouchSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent,
  disabled,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accent: string;
  disabled?: boolean;
  formatValue?: (v: number) => string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 900, color: accent }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 44,
          accentColor: accent,
          cursor: disabled ? "not-allowed" : "pointer",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}

function PresetChip({
  label,
  color,
  active,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 44,
        padding: "10px 12px",
        borderRadius: 10,
        border: `1px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
        background: active ? `${color}22` : "rgba(255,255,255,0.04)",
        color: active ? color : "rgba(255,255,255,0.65)",
        fontSize: 10,
        fontWeight: active ? 900 : 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: disabled ? 0.45 : 1,
        touchAction: "manipulation",
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          boxShadow: active ? `0 0 10px ${color}` : "none",
        }}
      />
      {label}
    </button>
  );
}

export default function VenueControlPanel({
  role,
  userId,
  venueId,
  roomId,
  isLoungeHost = false,
  readOnly = false,
  accentColor = CYAN,
}: VenueControlPanelProps) {
  const resolvedVenueId = venueId ?? roomId ?? userId;

  const isPerformer = role === "performer";
  const canEditStage = !readOnly && (isPerformer || isLoungeHost);
  const canEditLobbyEnv = !readOnly && (isLoungeHost || isPerformer);
  const canEditAudience = !readOnly && isPerformer;

  const availableTabs = useMemo((): ControlTab[] => {
    if (role === "fan" && !isLoungeHost) {
      return ["environment"];
    }
    const tabs: ControlTab[] = ["lighting"];
    if (canEditStage) {
      tabs.push("effects", "scenes");
      if (isPerformer) tabs.push("curtain");
    }
    if (canEditLobbyEnv || isPerformer) tabs.push("environment");
    if (canEditAudience) tabs.push("audience");
    return tabs;
  }, [canEditStage, canEditLobbyEnv, canEditAudience, isPerformer]);

  const [activeTab, setActiveTab] = useState<ControlTab>("lighting");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [stageState, setStageState] = useState<StageDirectorState | null>(null);
  const [lightingState, setLightingState] = useState<LightingState | null>(null);
  const [energy, setEnergy] = useState(50);
  const [lobbySkinId, setLobbySkinId] = useState<FanLobbySkinId>(() =>
    getPersistedFanLobbySkinId() ?? "lobby-cinema",
  );

  const lobbySkins = useMemo(() => listSwitchableFanLobbySkins(), []);
  const stagePresets = useMemo(() => listStageLightingPresets(), []);
  const sceneDefs = VENUE_SCENE_DEFINITIONS;
  const sessionId = roomId ? `venue-curtain-${roomId}` : `venue-curtain-${userId}`;

  useEffect(() => {
    initLighting(resolvedVenueId);
    if (!getVenueState(resolvedVenueId)) {
      registerVenue(resolvedVenueId, "Venue", isPerformer ? "virtual-stage" : "lounge");
    }
    const venue = getVenueState(resolvedVenueId);
    if (venue) setEnergy(venue.energyLevel);
  }, [resolvedVenueId, isPerformer]);

  useEffect(() => {
    return onStageDirectorChange(setStageState);
  }, []);

  useEffect(() => {
    return subscribeToLighting(resolvedVenueId, setLightingState);
  }, [resolvedVenueId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const level = lightingState?.dimmingLevel ?? 0.8;
    document.documentElement.style.setProperty("--venue-dimming", String(level));
  }, [lightingState?.dimmingLevel]);

  useEffect(() => {
    const onSkin = (e: Event) => {
      const detail = (e as CustomEvent<{ skinId: FanLobbySkinId }>).detail;
      if (detail?.skinId) setLobbySkinId(detail.skinId);
    };
    window.addEventListener(FAN_LOBBY_SKIN_CHANGED_EVENT, onSkin);
    return () => window.removeEventListener(FAN_LOBBY_SKIN_CHANGED_EVENT, onSkin);
  }, []);

  const handleStagePreset = useCallback(
    (presetId: string) => {
      if (!canEditStage && !canEditLobbyEnv) return;
      venueSetLighting(resolvedVenueId, presetId);
    },
    [canEditStage, canEditLobbyEnv, resolvedVenueId],
  );

  const handleMoodPreset = useCallback(
    (preset: LightingPreset) => {
      if (!canEditStage && !canEditLobbyEnv) return;
      venueSetMood(resolvedVenueId, preset);
    },
    [canEditStage, canEditLobbyEnv, resolvedVenueId],
  );

  const handleDimming = useCallback(
    (level: number) => {
      if (!canEditStage && !canEditLobbyEnv) return;
      venueSetDimmer(resolvedVenueId, level / 100);
    },
    [canEditStage, canEditLobbyEnv, resolvedVenueId],
  );

  const handleEnergy = useCallback(
    (level: number) => {
      if (!canEditAudience) return;
      setEnergy(level);
      venueSetEnergy(resolvedVenueId, level);
    },
    [canEditAudience, resolvedVenueId],
  );

  const handleScene = useCallback(
    (sceneId: string) => {
      if (!canEditStage) return;
      venueApplyScene(resolvedVenueId, sceneId);
    },
    [canEditStage, resolvedVenueId],
  );

  const handleCurtainCue = useCallback(
    (action: Parameters<typeof applyVenueCurtainCue>[0]["action"]) => {
      if (!isPerformer) return;
      applyVenueCurtainCue({
        venueId: resolvedVenueId,
        sessionId,
        performerId: userId,
        action,
      });
    },
    [isPerformer, resolvedVenueId, sessionId, userId],
  );

  const handleSetTheMood = useCallback(
    (presetId: string, sceneId: string) => {
      if (!canEditStage && !canEditLobbyEnv) return;
      previewVenueScene(resolvedVenueId, sceneId);
    },
    [canEditStage, canEditLobbyEnv, resolvedVenueId],
  );

  const handleApplyPreview = useCallback(() => {
    const preview = getPreviewScene();
    if (!preview) return;
    applyVenueScene(resolvedVenueId, preview.sceneId);
  }, [resolvedVenueId]);

  const handleUndoScene = useCallback(() => {
    rollbackVenueScene();
  }, []);

  const handlePauseShow = useCallback(
    (breakMs: number) => {
      if (!isPerformer || !roomId) return;
      pauseShow(roomId, sessionId, userId, resolvedVenueId, breakMs);
    },
    [isPerformer, roomId, sessionId, userId, resolvedVenueId],
  );

  const handleResumeShow = useCallback(() => {
    if (!isPerformer) return;
    resumeShow(resolvedVenueId, sessionId, userId);
  }, [isPerformer, resolvedVenueId, sessionId, userId]);

  const activeBreak = getActiveBreakClock(sessionId);

  const handleSkin = useCallback(
    (skinId: FanLobbySkinId) => {
      if (!canEditLobbyEnv) return;
      setLobbySkinId(skinId);
      persistFanLobbySkinId(skinId);
    },
    [canEditLobbyEnv],
  );

  const activeStagePreset = stageState?.lightingPresetId ?? "purple-wash";
  const dimmingPct = Math.round((lightingState?.dimmingLevel ?? 0.8) * 100);

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Role badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.12em",
            padding: "4px 8px",
            borderRadius: 6,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}55`,
            color: accentColor,
          }}
        >
          {readOnly ? "GUEST VIEW" : isLoungeHost ? "LOUNGE HOST" : isPerformer ? "PERFORMER" : "FAN LOBBY"}
        </span>
        {readOnly && (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
            Host controls the environment
          </span>
        )}
      </div>

      {/* SET THE MOOD — top priority quick presets */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 8 }}>
          SET THE MOOD
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
          {SET_THE_MOOD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={!canEditStage && !canEditLobbyEnv}
              onClick={() => handleSetTheMood(p.id, p.sceneId)}
              style={{
                minHeight: 44,
                padding: "6px 4px",
                borderRadius: 8,
                border: `1px solid ${p.color}44`,
                background: `${p.color}12`,
                color: p.color,
                fontSize: 8,
                fontWeight: 900,
                cursor: canEditStage || canEditLobbyEnv ? "pointer" : "not-allowed",
                opacity: !canEditStage && !canEditLobbyEnv ? 0.45 : 1,
              }}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        {(canEditStage || canEditLobbyEnv) && (
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <button
              type="button"
              onClick={handleApplyPreview}
              disabled={!getPreviewScene()}
              style={{
                flex: 1,
                minHeight: 36,
                borderRadius: 8,
                border: `1px solid ${accentColor}55`,
                background: `${accentColor}18`,
                color: accentColor,
                fontSize: 8,
                fontWeight: 900,
                cursor: getPreviewScene() ? "pointer" : "not-allowed",
                opacity: getPreviewScene() ? 1 : 0.4,
              }}
            >
              APPLY
            </button>
            <button
              type="button"
              onClick={handleUndoScene}
              disabled={!getLastKnownGoodScene()}
              style={{
                flex: 1,
                minHeight: 36,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.65)",
                fontSize: 8,
                fontWeight: 900,
                cursor: getLastKnownGoodScene() ? "pointer" : "not-allowed",
                opacity: getLastKnownGoodScene() ? 1 : 0.4,
              }}
            >
              UNDO
            </button>
          </div>
        )}
        {getPreviewScene() && (
          <div style={{ fontSize: 8, color: GOLD, marginBottom: 8 }}>
            Preview active — tap APPLY to commit or UNDO to restore
          </div>
        )}
      </div>

      {/* Advanced modules toggle (mobile-first compact) */}
      <button
        type="button"
        onClick={() => setAdvancedOpen((o) => !o)}
        style={{
          width: "100%",
          minHeight: 36,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.55)",
          fontSize: 8,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {advancedOpen ? "▲ HIDE ADVANCED" : "▼ ADVANCED (MOOD · LIGHTING · SCENES · STAGE · ENV)"}
      </button>

      {!advancedOpen ? null : (
      <>
      {/* Tab row */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          paddingBottom: 2,
        }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flexShrink: 0,
              minHeight: 40,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${activeTab === tab ? accentColor : "rgba(255,255,255,0.12)"}`,
              background: activeTab === tab ? `${accentColor}18` : "rgba(255,255,255,0.03)",
              color: activeTab === tab ? accentColor : "rgba(255,255,255,0.55)",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lighting */}
      {activeTab === "lighting" && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            STAGE LIGHTING
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {stagePresets.map((p) => (
              <PresetChip
                key={p.id}
                label={p.label}
                color={p.primaryColor}
                active={activeStagePreset === p.id}
                disabled={!canEditStage && !canEditLobbyEnv}
                onClick={() => handleStagePreset(p.id)}
              />
            ))}
          </div>

          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            MOOD PRESETS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {MOOD_PRESETS.map((p) => (
              <PresetChip
                key={p.id}
                label={p.label}
                color={p.color}
                active={lightingState?.masterPreset === p.id}
                disabled={!canEditStage && !canEditLobbyEnv}
                onClick={() => handleMoodPreset(p.id)}
              />
            ))}
          </div>

          <TouchSlider
            label="MASTER DIMMER"
            value={dimmingPct}
            min={0}
            max={100}
            onChange={handleDimming}
            accent={accentColor}
            disabled={!canEditStage && !canEditLobbyEnv}
            formatValue={(v) => `${v}%`}
          />

          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            Scroll the slider with your thumb — changes apply via StageDirectorEngine + LightingMoodRuntime in real time.
          </div>
        </div>
      )}

      {/* Effects — performer / lounge host */}
      {activeTab === "effects" && canEditStage && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            STAGE EFFECTS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {STAGE_EFFECTS.map((fx) => (
              <button
                key={fx.id}
                type="button"
                onClick={() => venueTriggerFx(fx.id)}
                style={{
                  minHeight: 48,
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              >
                {fx.icon} {fx.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatchVenueToolsCommand({ type: "VENUE_FX_CLEAR" })}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 10,
              border: `1px solid ${FUCHSIA}44`,
              background: `${FUCHSIA}12`,
              color: FUCHSIA,
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            CLEAR EFFECT
          </button>

          <div style={{ marginTop: 16, fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            CAMERA ANGLE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {CAMERA_ANGLES.map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => venueSetCamera(cam.id)}
                style={{
                  minHeight: 44,
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: `1px solid ${stageState?.cameraAngle === cam.id ? GOLD : "rgba(255,255,255,0.1)"}`,
                  background: stageState?.cameraAngle === cam.id ? `${GOLD}18` : "rgba(255,255,255,0.03)",
                  color: stageState?.cameraAngle === cam.id ? GOLD : "rgba(255,255,255,0.55)",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Environment — fan lobby skins / lounge ambiance */}
      {activeTab === "environment" && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            {isPerformer ? "STAGE ENVIRONMENT" : "LOBBY SKIN / AMBIANCE"}
          </div>
          {!isPerformer && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lobbySkins.map((skin) => (
                <PresetChip
                  key={skin.id}
                  label={skin.label}
                  color={skin.isPremium ? GOLD : accentColor}
                  active={lobbySkinId === skin.id}
                  disabled={!canEditLobbyEnv}
                  onClick={() => handleSkin(skin.id)}
                />
              ))}
            </div>
          )}
          {isPerformer && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Performer venue environment is driven by lighting presets and stage effects.
              Audience rendering stays active — use Audience tab for crowd energy.
            </div>
          )}
        </div>
      )}

      {/* Scenes — synchronized lighting + mood cues */}
      {activeTab === "scenes" && canEditStage && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            VENUE SCENES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sceneDefs.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleScene(scene.id)}
                style={{
                  minHeight: 44,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>{scene.label}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{scene.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Curtain / intermission — performer only */}
      {activeTab === "curtain" && isPerformer && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            CURTAIN · {getCurtainStageLabel()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(
              [
                { action: "PREPARE_STAGE" as const, label: "Prepare Stage", icon: "🔄" },
                { action: "START_COUNTDOWN" as const, label: "Countdown", icon: "⏱" },
                { action: "OPEN_CURTAIN" as const, label: "Open Curtain", icon: "🎬" },
                { action: "INTERMISSION" as const, label: "Intermission", icon: "⏸" },
                { action: "RESUME_SHOW" as const, label: "Resume", icon: "▶" },
                { action: "CLOSE_AND_END" as const, label: "Close & End", icon: "🚪" },
              ] as const
            ).map((cue) => (
              <button
                key={cue.action}
                type="button"
                onClick={() => handleCurtainCue(cue.action)}
                style={{
                  minHeight: 44,
                  padding: "8px",
                  borderRadius: 10,
                  border: `1px solid ${FUCHSIA}44`,
                  background: `${FUCHSIA}10`,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {cue.icon} {cue.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 10, lineHeight: 1.5 }}>
            Intermission applies half-house scene + curtain close via VenueCurtainDirector.
            Commercial fill uses Rule 12 chain — honest intermission art when no fill.
          </div>
        </div>
      )}

      {/* Audience — performer only (Rule 26 audience controls, not avatar) */}
      {activeTab === "audience" && canEditAudience && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            AUDIENCE CONTROLS
          </div>
          <TouchSlider
            label="CROWD ENERGY"
            value={energy}
            min={0}
            max={100}
            onChange={handleEnergy}
            accent={FUCHSIA}
            formatValue={(v) => `${v}%`}
          />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginTop: 4 }}>
            Adjusts venue energy via VenueStateEngine — drives lighting intensity and crowd reactions.
            This is audience direction, not avatar customization (Rule 26).
          </div>

          <div style={{ marginTop: 18, fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 10 }}>
            REACTIONS
          </div>
          {roomId ? (
            <AudienceReactionBar roomId={roomId} />
          ) : (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>No active room.</div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
