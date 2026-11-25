"use client";

/**
 * DancePartyPresentationShell — production DJ + floor presentation for World Dance Party (Phase 1).
 *
 * Center of gravity = DJ + dance floor / group energy — NOT Battle VS, NOT Cypher combat.
 * Includes:
 * 1. DJ Video Panel (`data-testid="dj-video-panel"`) at the DJ spot (`DJ_STAGE_SLOT`) with Official Active-Performer Ring
 * 2. Foreground DJ Booth (`data-testid="dj-booth-foreground"`) layered in front of the DJ panel with turntables, mixer, EQ LEDs
 * 3. DJ Real Equipment Camera Composition (`REAL_EQUIPMENT_WIDE` 16:9 wide contain view vs `VIRTUAL_BOOTH_DECK` virtual turntable deck)
 * 4. Interactive DJ HUD & Effects Bar (`data-testid="dj-hud-effects-bar"`) wired to DancePartyPresentationAdapter
 * Never invents DJ, tracks, dancer counts, tips, or scores.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import { useEffect, useState } from "react";
import {
  PROGRAM_WDP_COMPOSITE,
  type DancePartyProgramComposition,
} from "@/lib/experiencePresentation/composeDancePartyProgram";

export type DjBoothCameraMode = "REAL_EQUIPMENT_WIDE" | "VIRTUAL_BOOTH_DECK";
export type DjStageEffectKind =
  | "NONE"
  | "BEAT_DROP_STROBE"
  | "LASER_GRID"
  | "BASS_PULSE"
  | "GLOBAL_WAVE";

export const DJ_EFFECT_TTL_MS = 4000;

export type DancePartyPresentationShellProps = {
  composition: DancePartyProgramComposition | null;
  programSourceId?: string;
  djBoothMode?: DjBoothCameraMode;
  onChangeDjBoothMode?: (mode: DjBoothCameraMode) => void;
  onTriggerDjEffect?: (effectEventName: string) => void;
  /** Authorization gate for DJ stage effects (defaults to true for interactive booth / authorized DJ). */
  canTriggerEffects?: boolean;
  /** Duration before an active DJ stage effect automatically expires back to NONE (no stale FX). */
  effectTtlMs?: number;
};

export default function DancePartyPresentationShell({
  composition,
  programSourceId,
  djBoothMode: controlledBoothMode,
  onChangeDjBoothMode,
  onTriggerDjEffect,
  canTriggerEffects = true,
  effectTtlMs = DJ_EFFECT_TTL_MS,
}: DancePartyPresentationShellProps) {
  const [localBoothMode, setLocalBoothMode] = useState<DjBoothCameraMode>("REAL_EQUIPMENT_WIDE");
  const [activeEffect, setActiveEffect] = useState<DjStageEffectKind>("NONE");
  const [crossfaderPos, setCrossfaderPos] = useState<number>(50);

  const boothMode = controlledBoothMode ?? localBoothMode;
  const setBoothMode = (next: DjBoothCameraMode) => {
    setLocalBoothMode(next);
    onChangeDjBoothMode?.(next);
  };

  // Bounded TTL cleanup: automatically expire activeEffect back to "NONE" so no stale FX state persists.
  useEffect(() => {
    if (activeEffect === "NONE") return;
    const timer = setTimeout(() => {
      setActiveEffect("NONE");
      onTriggerDjEffect?.("DancePartyCooldown");
    }, effectTtlMs);
    return () => clearTimeout(timer);
  }, [activeEffect, effectTtlMs, onTriggerDjEffect]);

  const triggerFx = (fx: DjStageEffectKind, adapterEvent: string) => {
    if (!canTriggerEffects) return;
    setActiveEffect((prev) => (prev === fx ? "NONE" : fx));
    onTriggerDjEffect?.(adapterEvent);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: {
            eventName: adapterEvent,
            payload: { roomId: composition?.roomId ?? "world-dance-party", intensity: 0.9 },
          },
        }),
      );
    }
  };

  const layout = composition?.composition ?? "FLOOR_WIDE";
  const badge = composition?.worldMiniBadge ?? "🌍 WORLD";
  const dj = composition?.dj ?? null;
  const nowPlaying = composition?.nowPlaying ?? null;
  const floorCount = composition?.floorPresenceCount ?? null;
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_WDP_COMPOSITE;

  return (
    <div
      data-dance-party-presentation="production"
      data-experience-pack="DanceParty"
      data-dance-party-scope={composition?.scope ?? "WORLD"}
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "VENUE_OPENING"}
      data-active-performer-id={dj?.id ?? ""}
      data-dj-booth-mode={boothMode}
      data-dj-active-effect={activeEffect}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,45,170,0.45)",
        borderRadius: 6,
        boxShadow:
          activeEffect === "BEAT_DROP_STROBE"
            ? "0 0 38px rgba(0,255,255,0.55), inset 0 0 42px rgba(255,45,170,0.35)"
            : activeEffect === "LASER_GRID"
              ? "0 0 32px rgba(0,255,136,0.45), inset 0 0 36px rgba(0,255,255,0.28)"
              : "inset 0 0 36px rgba(255,45,170,0.12)",
      }}
    >
      {/* Active DJ Visual Effects Overlay */}
      {activeEffect !== "NONE" && (
        <div
          data-testid="dj-effects-overlay"
          data-effect-kind={activeEffect}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            background:
              activeEffect === "BEAT_DROP_STROBE"
                ? "radial-gradient(circle at 50% 35%, rgba(0,255,255,0.24), rgba(255,45,170,0.18), transparent 72%)"
                : activeEffect === "LASER_GRID"
                  ? "repeating-linear-gradient(125deg, rgba(0,255,255,0.14) 0px, rgba(0,255,255,0.14) 2px, transparent 2px, transparent 22px)"
                  : activeEffect === "BASS_PULSE"
                    ? "radial-gradient(ellipse at 50% 85%, rgba(170,45,255,0.32), transparent 68%)"
                    : "linear-gradient(90deg, rgba(255,215,0,0.18), rgba(0,255,255,0.18), rgba(255,45,170,0.18))",
          }}
        />
      )}

      <div
        data-primitive="LiveVideoPanel"
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 280,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.35) 0%, rgba(20,6,40,0.96) 100%)",
        }}
      >
        {/* Top Header + Camera Composition Toggle */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: "#FF2DAA",
              }}
            >
              DANCE PARTY · DJ + FLOOR
            </div>
            <span
              data-world-mini-badge={composition?.scope ?? "WORLD"}
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "2px 8px",
                borderRadius: 4,
                border:
                  composition?.scope === "MINI"
                    ? "1px solid rgba(255,215,0,0.45)"
                    : "1px solid rgba(0,255,255,0.45)",
                color: composition?.scope === "MINI" ? "#FFD700" : "#00FFFF",
                background:
                  composition?.scope === "MINI"
                    ? "rgba(255,215,0,0.08)"
                    : "rgba(0,255,255,0.08)",
              }}
            >
              {badge}
            </span>
          </div>

          <div
            data-testid="dj-camera-composition-toggle"
            style={{ display: "flex", gap: 6, pointerEvents: "auto" }}
          >
            <button
              type="button"
              data-testid="dj-cam-real-equipment-btn"
              onClick={() => setBoothMode("REAL_EQUIPMENT_WIDE")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  boothMode === "REAL_EQUIPMENT_WIDE"
                    ? "1px solid #00FFFF"
                    : "1px solid rgba(255,255,255,0.2)",
                background:
                  boothMode === "REAL_EQUIPMENT_WIDE"
                    ? "rgba(0,255,255,0.18)"
                    : "rgba(255,255,255,0.05)",
                color: boothMode === "REAL_EQUIPMENT_WIDE" ? "#00FFFF" : "rgba(255,255,255,0.65)",
              }}
            >
              🎛️ REAL EQUIPMENT CAM (16:9 WIDE)
            </button>
            <button
              type="button"
              data-testid="dj-cam-virtual-booth-btn"
              onClick={() => setBoothMode("VIRTUAL_BOOTH_DECK")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  boothMode === "VIRTUAL_BOOTH_DECK"
                    ? "1px solid #FFD700"
                    : "1px solid rgba(255,255,255,0.2)",
                background:
                  boothMode === "VIRTUAL_BOOTH_DECK"
                    ? "rgba(255,215,0,0.18)"
                    : "rgba(255,255,255,0.05)",
                color: boothMode === "VIRTUAL_BOOTH_DECK" ? "#FFD700" : "rgba(255,255,255,0.65)",
              }}
            >
              💿 VIRTUAL BOOTH / TURNTABLES
            </button>
          </div>
        </div>

        {/* DJ Video Panel + Foreground DJ Booth at the DJ Stage Spot */}
        <div
          data-testid="dj-video-panel"
          data-dj-stage-slot="dj-booth"
          data-participant-id={dj?.id ?? ""}
          data-active-performer={dj ? "true" : "false"}
          data-camera-composition={boothMode}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            maxHeight: 220,
            borderRadius: 8,
            overflow: "hidden",
            border: dj ? "2px solid #00FFFF" : "1px solid rgba(255,45,170,0.4)",
            boxShadow: dj
              ? "0 0 22px rgba(0,255,255,0.45), inset 0 0 18px rgba(0,255,255,0.18)"
              : "none",
            background:
              boothMode === "REAL_EQUIPMENT_WIDE"
                ? "radial-gradient(ellipse at 50% 38%, rgba(0,255,255,0.14), rgba(12,6,28,0.96) 75%)"
                : "radial-gradient(ellipse at 50% 45%, rgba(255,215,0,0.16), rgba(14,6,32,0.96) 75%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Official Active-Performer Ring on DJ */}
          {dj && (
            <div
              data-testid="official-active-performer-ring"
              data-active-performer-id={dj.id}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 4,
                borderRadius: 7,
                border: "2px solid rgba(0,255,255,0.95)",
              }}
            />
          )}

          {/* Upper DJ Camera Frame / Equipment Viewport */}
          <div
            data-primitive="IdentityPanel"
            style={{
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  color: "#00FFFF",
                }}
              >
                {boothMode === "REAL_EQUIPMENT_WIDE"
                  ? "DJ STAGE SLOT · 16:9 WIDE EQUIPMENT + HANDS + DECKS"
                  : "DJ STAGE SLOT · TMI VIRTUAL TURNTABLE RIG"}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#fff",
                  textShadow: "0 0 18px rgba(0,255,255,0.35)",
                  marginTop: 2,
                }}
              >
                {dj
                  ? `🎧 ${dj.displayName}${dj.isBot ? " · [BOT]" : ""}`
                  : "Waiting for DJ — no invented host"}
              </div>
            </div>
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#00FFFF",
                background: "rgba(5,5,16,0.82)",
                border: "1px solid rgba(0,255,255,0.65)",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              ● LIVE IN THE BOOTH
            </span>
          </div>

          {/* Foreground DJ Booth (Turntables + Mixer + LED Fascia in front of DJ Panel) */}
          <div
            data-testid="dj-booth-foreground"
            data-booth-mode={boothMode}
            style={{
              position: "relative",
              zIndex: 5,
              background:
                "linear-gradient(180deg, rgba(5,5,16,0.25) 0%, rgba(12,6,28,0.95) 35%, rgba(5,5,16,0.99) 100%)",
              borderTop: "2px solid rgba(0,255,255,0.7)",
              boxShadow: "0 -6px 24px rgba(255,45,170,0.4)",
              padding: "8px 14px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Left Turntable Platter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                data-testid="dj-turntable-left"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "2px solid #00FFFF",
                  boxShadow: "0 0 12px rgba(0,255,255,0.5)",
                  background:
                    "radial-gradient(circle, #FFD700 18%, #050510 24%, #1a1030 58%, #00FFFF 100%)",
                }}
              />
              <div>
                <div style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>
                  DECK A · {boothMode === "REAL_EQUIPMENT_WIDE" ? "DIRECT THRU" : "VINYL SYNC"}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                  {nowPlaying ? nowPlaying.title : "Cue Ready"}
                </div>
              </div>
            </div>

            {/* Center Mixer + Crossfader + Booth Fascia */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid rgba(255,215,0,0.45)",
                background: "rgba(5,5,16,0.9)",
              }}
            >
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  color: "#FFD700",
                }}
              >
                TMI PRO DJ MIXER · CROSSFADER {crossfaderPos}%
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={crossfaderPos}
                onChange={(e) => setCrossfaderPos(Number(e.target.value))}
                aria-label="DJ Crossfader"
                style={{
                  width: 96,
                  height: 4,
                  accentColor: "#00FFFF",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
              />
            </div>

            {/* Right Turntable Platter */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.12em" }}>
                  DECK B · {boothMode === "REAL_EQUIPMENT_WIDE" ? "HARDWARE CAM" : "VIRTUAL DECK"}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
                  {nowPlaying ? nowPlaying.artistName : " Master Out"}
                </div>
              </div>
              <div
                data-testid="dj-turntable-right"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "2px solid #FF2DAA",
                  boxShadow: "0 0 12px rgba(255,45,170,0.5)",
                  background:
                    "radial-gradient(circle, #00FFFF 18%, #050510 24%, #280a2c 58%, #FF2DAA 100%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Interactive DJ HUD & Stage Effects Bar */}
        <div
          data-testid="dj-hud-effects-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: 6,
            background: "rgba(5,5,16,0.78)",
            border: "1px solid rgba(0,255,255,0.28)",
            pointerEvents: "auto",
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF" }}>
            DJ FX HUD
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button
              type="button"
              data-testid="dj-fx-beat-drop-btn"
              onClick={() => triggerFx("BEAT_DROP_STROBE", "BeatDropTriggered")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  activeEffect === "BEAT_DROP_STROBE"
                    ? "1px solid #00FFFF"
                    : "1px solid rgba(0,255,255,0.35)",
                background:
                  activeEffect === "BEAT_DROP_STROBE"
                    ? "rgba(0,255,255,0.22)"
                    : "rgba(0,255,255,0.08)",
                color: "#00FFFF",
              }}
            >
              ⚡ BEAT DROP STROBE
            </button>
            <button
              type="button"
              data-testid="dj-fx-laser-grid-btn"
              onClick={() => triggerFx("LASER_GRID", "BeatDropTriggered")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  activeEffect === "LASER_GRID"
                    ? "1px solid #00FF88"
                    : "1px solid rgba(0,255,136,0.35)",
                background:
                  activeEffect === "LASER_GRID"
                    ? "rgba(0,255,136,0.22)"
                    : "rgba(0,255,136,0.08)",
                color: "#00FF88",
              }}
            >
              🟢 LASER GRID
            </button>
            <button
              type="button"
              data-testid="dj-fx-bass-pulse-btn"
              onClick={() => triggerFx("BASS_PULSE", "HighBassPulse")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  activeEffect === "BASS_PULSE"
                    ? "1px solid #AA2DFF"
                    : "1px solid rgba(170,45,255,0.35)",
                background:
                  activeEffect === "BASS_PULSE"
                    ? "rgba(170,45,255,0.22)"
                    : "rgba(170,45,255,0.08)",
                color: "#AA2DFF",
              }}
            >
              🔊 BASS PULSE
            </button>
            <button
              type="button"
              data-testid="dj-fx-global-wave-btn"
              onClick={() => triggerFx("GLOBAL_WAVE", "GlobalDanceWaveSync")}
              style={{
                fontSize: 9,
                fontWeight: 900,
                padding: "4px 9px",
                borderRadius: 4,
                cursor: "pointer",
                border:
                  activeEffect === "GLOBAL_WAVE"
                    ? "1px solid #FFD700"
                    : "1px solid rgba(255,215,0,0.35)",
                background:
                  activeEffect === "GLOBAL_WAVE"
                    ? "rgba(255,215,0,0.22)"
                    : "rgba(255,215,0,0.08)",
                color: "#FFD700",
              }}
            >
              🌊 GLOBAL DANCE WAVE
            </button>
          </div>
        </div>

        {/* Lower Third Telemetry */}
        <div
          data-primitive="LowerThird"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(255,45,170,0.85)", fontSize: 9, fontWeight: 800 }}>
              NOW PLAYING{" "}
            </span>
            {nowPlaying
              ? `${nowPlaying.title} · ${nowPlaying.artistName}`
              : "— no track yet"}
          </div>
          <div
            data-primitive="AudioVisualizer"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <span style={{ color: "rgba(0,255,255,0.75)", fontSize: 9, fontWeight: 800 }}>
              BPM{" "}
            </span>
            {typeof nowPlaying?.bpm === "number" ? nowPlaying.bpm : "—"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(170,45,255,0.85)", fontSize: 9, fontWeight: 800 }}>
              FLOOR{" "}
            </span>
            {floorCount !== null
              ? `${floorCount} real presence`
              : "presence unknown — no invented count"}
          </div>
        </div>

        <div
          data-primitive="ReactionEmitter"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
        >
          DJ + dance floor energy — not Battle VS, not Cypher combat circle.
        </div>

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 2,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(255,45,170,0.65)",
              letterSpacing: "0.06em",
            }}
          >
            {composition.programSourceId} · {layout} · {boothMode}
          </div>
        ) : null}
      </div>
    </div>
  );
}
