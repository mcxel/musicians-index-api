"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import SmartCameraDirector from "./SmartCameraDirector";
import type { CameraLayout, CameraMode, CameraTrigger, LiveSignals, MomentumState } from "@/lib/camera/SmartCameraDirectorEngine";
import {
  decideNextLayout,
  defaultLayout,
  updateMomentum,
  canSwitch,
  computeEmotionalHeat,
  MOMENTUM_INITIAL,
} from "@/lib/camera/SmartCameraDirectorEngine";

// ─── Placeholder slots ────────────────────────────────────────────────────────

function VideoPlaceholder() {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(135deg, #0a0020, #1a0040)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ fontSize: 32 }}>🎬</div>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
        Music Video
      </div>
    </div>
  );
}

function ArtistPlaceholder({ accent = "#00FFFF" }: { accent?: string }) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: `linear-gradient(135deg, ${accent}18, #050508)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
        border: `1px solid ${accent}33`,
      }}
    >
      <div style={{ fontSize: 32 }}>🎤</div>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accent, textTransform: "uppercase" }}>
        Artist Cam
      </div>
    </div>
  );
}

function OpponentPlaceholder({ accent = "#FF2DAA" }: { accent?: string }) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: `linear-gradient(135deg, ${accent}18, #050508)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
        border: `1px solid ${accent}33`,
      }}
    >
      <div style={{ fontSize: 32 }}>🥊</div>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accent, textTransform: "uppercase" }}>
        Opponent Cam
      </div>
    </div>
  );
}

function GuestPlaceholder() {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(135deg, #FFD70018, #050508)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
        border: "1px solid rgba(255,215,0,0.25)",
      }}
    >
      <div style={{ fontSize: 32 }}>🎸</div>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase" }}>
        Guest Cam
      </div>
    </div>
  );
}

// ─── Mode-specific trigger sets ───────────────────────────────────────────────

const TRIGGERS: Record<CameraMode, CameraTrigger[]> = {
  WORLD_RELEASE: ["VIDEO_STARTED", "VIDEO_ENDED", "FAN_ENGAGED", "REPLAY_REQUESTED", "REACTION_PEAK"],
  VERSUS_BATTLE: ["TURN_SWITCH", "VOTING_STARTED", "REACTION_PEAK"],
  GUEST_JAM: ["GUEST_JOINED", "FAN_ENGAGED", "REACTION_PEAK"],
};

const TRIGGER_LABELS: Record<CameraTrigger, string> = {
  VIDEO_STARTED: "▶ Video Start",
  VIDEO_ENDED: "⏹ Video End",
  FAN_ENGAGED: "🔥 Fan Engaged",
  TURN_SWITCH: "🔄 Turn Switch",
  VOTING_STARTED: "🗳 Voting Start",
  GUEST_JOINED: "🎸 Guest Joins",
  REPLAY_REQUESTED: "↩ Replay",
  REACTION_PEAK: "💥 Reaction Peak",
};

const MODE_LABELS: Record<CameraMode, string> = {
  WORLD_RELEASE: "World Release",
  VERSUS_BATTLE: "Versus Battle",
  GUEST_JAM: "Guest Jam",
};

const MODES: CameraMode[] = ["WORLD_RELEASE", "VERSUS_BATTLE", "GUEST_JAM"];

// ─── Demo shell ───────────────────────────────────────────────────────────────

function formatSignal(v: number) {
  return Math.round(v).toString().padStart(3, " ");
}

export default function SmartCameraDirectorDemo() {
  const [mode, setMode] = useState<CameraMode>("VERSUS_BATTLE");
  const [layout, setLayout] = useState<CameraLayout>(() => defaultLayout("VERSUS_BATTLE"));
  const [heat, setHeat] = useState(62);
  const [aVotes, setAVotes] = useState(340);
  const [bVotes, setBVotes] = useState(210);
  const [liveMode, setLiveMode] = useState(false);
  const [signals, setSignals] = useState<LiveSignals>({
    heat: 62, audioLevelA: 45, audioLevelB: 32,
    voteDelta: 130, newFanRate: 8, completionRate: 74, likeRate: 55,
  });
  const [momentum, setMomentum] = useState<MomentumState>(MOMENTUM_INITIAL);

  // Refs so the interval captures current values without stale closures
  const layoutRef = useRef(layout);
  const modeRef = useRef(mode);
  const momentumRef = useRef<MomentumState>(MOMENTUM_INITIAL);
  const lastSwitchRef = useRef<number>(Date.now());
  useEffect(() => { layoutRef.current = layout; }, [layout]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { momentumRef.current = momentum; }, [momentum]);

  // Live signal simulation + momentum update — fires every 1.4s
  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      setAVotes((a) => a + Math.floor(Math.random() * 22));
      setBVotes((b) => b + Math.floor(Math.random() * 18));
      setHeat((h) => Math.max(10, Math.min(99, h + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 12))));

      setSignals((prev) => {
        const next: LiveSignals = {
          heat: Math.max(0, Math.min(99, prev.heat + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10))),
          // Active performer is louder — biased toward current full-frame slot
          audioLevelA: layoutRef.current === "TURN_A_FULL"
            ? 58 + Math.random() * 32
            : 12 + Math.random() * 30,
          audioLevelB: layoutRef.current === "TURN_B_FULL"
            ? 58 + Math.random() * 32
            : 12 + Math.random() * 30,
          voteDelta: aVotes - bVotes + Math.floor((Math.random() - 0.42) * 60),
          newFanRate: Math.random() * 35,
          completionRate: 62 + Math.random() * 35,
          likeRate: 35 + Math.random() * 50,
        };

        // Update momentum EMA from this tick's signals
        const newMomentum = updateMomentum(momentumRef.current, next);
        setMomentum(newMomentum);
        momentumRef.current = newMomentum;

        // Heat > 85 bypasses cooldown — room emergency always fires immediately
        const isHeatEmergency = next.heat > 85;
        if (isHeatEmergency || canSwitch(lastSwitchRef.current)) {
          const suggested = decideNextLayout({
            mode: modeRef.current,
            current: layoutRef.current,
            signals: next,
            momentum: newMomentum,
          });
          if (suggested !== layoutRef.current) {
            setLayout(suggested);
            lastSwitchRef.current = Date.now();
          }
        }

        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMode]);

  const handleModeChange = useCallback((m: CameraMode) => {
    setMode(m);
    setLayout(defaultLayout(m));
    setLiveMode(false);
  }, []);

  const fireTrigger = useCallback(
    (trigger: CameraTrigger) => {
      // Reset cooldown so live-mode doesn't immediately override a manual director call
      lastSwitchRef.current = Date.now();
      // All decisions go through decideNextLayout — single authority
      setLayout((prev) =>
        decideNextLayout({ mode, current: prev, signals, momentum, trigger })
      );
      if (trigger === "TURN_SWITCH") {
        setAVotes((v) => v + Math.floor(Math.random() * 40));
        setBVotes((v) => v + Math.floor(Math.random() * 40));
      }
      if (trigger === "FAN_ENGAGED" || trigger === "REACTION_PEAK") {
        setHeat((h) => Math.min(99, h + Math.floor(Math.random() * 18) + 4));
      }
    },
    [mode, signals, momentum]
  );

  const available = TRIGGERS[mode];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #050510 0%, #080318 60%, #040410 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px",
        gap: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 4,
          }}
        >
          TMI Smart Camera Director · V1
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.04em" }}>
          Broadcast Director Console
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        {/* Mode selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 2,
            }}
          >
            Mode
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: `1px solid ${mode === m ? "rgba(0,255,255,0.6)" : "rgba(255,255,255,0.15)"}`,
                  background: mode === m ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  color: mode === m ? "#00FFFF" : "rgba(255,255,255,0.55)",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Trigger buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 2,
            }}
          >
            Triggers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {available.map((t) => (
              <button
                key={t}
                onClick={() => fireTrigger(t)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,45,170,0.4)",
                  background: "rgba(255,45,170,0.08)",
                  color: "rgba(255,180,220,0.9)",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                {TRIGGER_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Heat control */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 2,
            }}
          >
            Heat Score · {heat}
          </div>
          <input
            type="range"
            min={0}
            max={99}
            value={heat}
            onChange={(e) => setHeat(Number(e.target.value))}
            style={{ width: 140, accentColor: "#FF7700" }}
          />
        </div>

        {/* Vote controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 2,
            }}
          >
            Fan Votes · A:{aVotes} B:{bVotes}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setAVotes((v) => v + 50)}
              style={{
                padding: "5px 10px", borderRadius: 6,
                border: "1px solid rgba(0,255,255,0.4)", background: "rgba(0,255,255,0.08)",
                color: "#00FFFF", fontSize: 8, fontWeight: 900, cursor: "pointer",
              }}
            >
              +50 A
            </button>
            <button
              onClick={() => setBVotes((v) => v + 50)}
              style={{
                padding: "5px 10px", borderRadius: 6,
                border: "1px solid rgba(255,45,170,0.4)", background: "rgba(255,45,170,0.08)",
                color: "#FF2DAA", fontSize: 8, fontWeight: 900, cursor: "pointer",
              }}
            >
              +50 B
            </button>
          </div>
        </div>

        {/* Live Mode toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 2,
            }}
          >
            Director Mode
          </div>
          <button
            onClick={() => setLiveMode((v) => !v)}
            style={{
              padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${liveMode ? "rgba(255,48,48,0.7)" : "rgba(255,255,255,0.2)"}`,
              background: liveMode ? "rgba(255,48,48,0.15)" : "rgba(255,255,255,0.04)",
              color: liveMode ? "#FF5050" : "rgba(255,255,255,0.5)",
              fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {liveMode && (
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#FF3030", boxShadow: "0 0 6px rgba(255,48,48,0.9)",
                  display: "inline-block",
                }}
              />
            )}
            {liveMode ? "LIVE — Auto-Directing" : "Manual Mode"}
          </button>
        </div>

        {/* Signal telemetry */}
        {liveMode && (
          <div
            style={{
              display: "flex", flexDirection: "column", gap: 4,
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.18)",
              background: "rgba(0,255,255,0.04)",
              fontFamily: "monospace",
            }}
          >
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(0,255,255,0.6)", marginBottom: 2 }}>
              LIVE SIGNALS
            </div>
            {[
              { label: "AudA", value: signals.audioLevelA, color: "#00FFFF", max: 100 },
              { label: "AudB", value: signals.audioLevelB, color: "#FF2DAA", max: 100 },
              { label: "MomA", value: momentum.scoreA, color: "#00FFFF", max: 30 },
              { label: "MomB", value: momentum.scoreB, color: "#FF2DAA", max: 30 },
              { label: "ΔVote", value: Math.abs(signals.voteDelta), color: "#FFD700", max: 100 },
              { label: "FanRate", value: signals.newFanRate, color: "#00FF88", max: 35 },
              { label: "EmoHeat", value: computeEmotionalHeat(signals), color: "#FF7700", max: 200 },
            ].map(({ label, value, color, max }) => (
              <div key={label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", minWidth: 44 }}>{label}</span>
                <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, (Math.abs(value) / max) * 100)}%`,
                    background: color,
                    borderRadius: 2,
                    transition: "width 600ms ease",
                  }} />
                </div>
                <span style={{ fontSize: 7, color, minWidth: 26, textAlign: "right" }}>{formatSignal(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Layout indicator */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 2,
            }}
          >
            Current Layout
          </div>
          <div
            style={{
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.35)",
              background: "rgba(255,215,0,0.08)",
              color: "#FFD700", fontSize: 8, fontWeight: 900,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}
          >
            {layout.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {/* Director viewport */}
      <div
        style={{
          flex: 1,
          minHeight: 480,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        <SmartCameraDirector
          mode={mode}
          layout={layout}
          videoSlot={<VideoPlaceholder />}
          artistSlot={<ArtistPlaceholder accent="#00FFFF" />}
          opponentSlot={<OpponentPlaceholder accent="#FF2DAA" />}
          guestSlot={<GuestPlaceholder />}
          performerA={{ name: "Nova Cipher", role: "Performer A", accentColor: "#00FFFF" }}
          performerB={{ name: "Jax Onyx", role: "Performer B", accentColor: "#FF2DAA" }}
          heatScore={heat}
          voteData={{ aVotes, bVotes }}
        />
      </div>

      {/* Quick-access layout buttons */}
      <div>
        <div
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: 8,
          }}
        >
          Override Layout (Director Override)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(
            [
              "VIDEO_FULL",
              "ARTIST_FULL",
              "ARTIST_PIP",
              "OPPONENT_PIP",
              "SPLIT_SCREEN",
              "TURN_A_FULL",
              "TURN_B_FULL",
              "REACTION_VIEW",
              "REPLAY_VIEW",
            ] as CameraLayout[]
          ).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                border: `1px solid ${layout === l ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.12)"}`,
                background: layout === l ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)",
                color: layout === l ? "#FFD700" : "rgba(255,255,255,0.4)",
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {l.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
