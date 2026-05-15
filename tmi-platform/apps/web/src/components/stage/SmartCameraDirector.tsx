"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  advanceDirectorPhase,
  createDirectorMomentumState,
  createSmartCameraDirectorState,
  type DirectorPhase,
  type DirectorSignal,
  DirectorMode,
  resolveMomentumFocus,
  setDirectorMode,
  type ActivePerformer,
  type DirectorMomentumState,
  SmartCameraDirectorState,
  tickDirectorPhaseWithSignals,
} from "@/lib/stage/SmartCameraDirectorEngine";

const MODE_LABEL: Record<DirectorMode, string> = {
  "world-release": "World Release",
  "versus-2026": "Versus 2026",
  "guest-jam": "Guest Jam",
  "ensemble": "Ensemble",
};

function Layer({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.985)",
        transition: "opacity 420ms ease, transform 420ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

function getVersusSlotGeometry(phase: DirectorPhase, active: ActivePerformer) {
  const activeWidth = phase === "drop" ? 58 : 75;
  const opponentWidth = 100 - activeWidth;

  if (active === "A") {
    return {
      a: { left: 0, width: activeWidth, scale: 1, z: 3, glow: "0 0 28px rgba(255,93,115,0.32)" },
      b: { left: activeWidth, width: opponentWidth, scale: 0.92, z: 2, glow: "0 0 18px rgba(94,162,255,0.2)" },
    };
  }

  return {
    a: { left: 0, width: opponentWidth, scale: 0.92, z: 2, glow: "0 0 18px rgba(255,93,115,0.2)" },
    b: { left: opponentWidth, width: activeWidth, scale: 1, z: 3, glow: "0 0 28px rgba(94,162,255,0.32)" },
  };
}

export default function SmartCameraDirector() {
  const [state, setState] = useState<SmartCameraDirectorState>(() =>
    createSmartCameraDirectorState("world-release"),
  );
  const [momentum, setMomentum] = useState<DirectorMomentumState>(() =>
    createDirectorMomentumState(Date.now(), "A"),
  );
  const [heat, setHeat] = useState(54);
  const [leftVote, setLeftVote] = useState(51);
  const [audioA, setAudioA] = useState(60);
  const [audioB, setAudioB] = useState(58);
  const [newFanRate, setNewFanRate] = useState(9);
  const [completionRate, setCompletionRate] = useState(68);
  const [likeRate, setLikeRate] = useState(62);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeat((prev) => {
        const delta = Math.round((Math.random() - 0.42) * 8);
        return Math.max(12, Math.min(98, prev + delta));
      });
      setLeftVote((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 6);
        return Math.max(30, Math.min(70, prev + delta));
      });
      setAudioA((prev) => Math.max(20, Math.min(100, prev + Math.round((Math.random() - 0.48) * 14))));
      setAudioB((prev) => Math.max(20, Math.min(100, prev + Math.round((Math.random() - 0.52) * 14))));
      setNewFanRate((prev) => Math.max(2, Math.min(24, prev + (Math.random() - 0.45) * 2.2)));
      setCompletionRate((prev) => Math.max(20, Math.min(100, prev + (Math.random() - 0.46) * 3.2)));
      setLikeRate((prev) => Math.max(20, Math.min(100, prev + (Math.random() - 0.47) * 3)));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const rightVote = 100 - leftVote;

  const signal = useMemo<DirectorSignal>(
    () => ({
      heat,
      audioLevelA: audioA,
      audioLevelB: audioB,
      fanVotesA: leftVote,
      fanVotesB: rightVote,
      performerActive: momentum.active,
      newFanRate,
      completionRate,
      likeRate,
    }),
    [audioA, audioB, completionRate, heat, leftVote, likeRate, momentum.active, newFanRate, rightVote],
  );

  useEffect(() => {
    const now = Date.now();
    setMomentum((prev) => {
      const next = resolveMomentumFocus(prev, signal, now);
      if (
        next.active === prev.active &&
        next.lastSwitchAtMs === prev.lastSwitchAtMs &&
        Math.abs(next.scoreA - prev.scoreA) < 0.01 &&
        Math.abs(next.scoreB - prev.scoreB) < 0.01
      ) {
        return prev;
      }
      return next;
    });
    setState((prev) => tickDirectorPhaseWithSignals(prev, signal, now));
  }, [signal]);

  const emotionalHeat = useMemo(
    () => Math.round(heat * 0.4 + newFanRate * 2.1 + completionRate * 0.25 + likeRate * 0.2),
    [completionRate, heat, likeRate, newFanRate],
  );

  const modeTitle = useMemo(() => MODE_LABEL[state.mode], [state.mode]);
  const versusGeometry = useMemo(
    () => getVersusSlotGeometry(state.phase, momentum.active),
    [momentum.active, state.phase],
  );

  return (
    <section
      aria-label="Smart camera director"
      style={{
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 12,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(12,9,28,0.95) 0%, rgba(8,8,20,0.95) 100%)",
        boxShadow: "0 28px 50px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#00FFFF", letterSpacing: "0.16em", fontWeight: 800 }}>
            SMART CAMERA DIRECTOR
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
            {modeTitle} · {state.phase.toUpperCase()}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
            Focus {momentum.active} · Emotional Heat {emotionalHeat}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["world-release", "versus-2026", "guest-jam"] as DirectorMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setState((prev) => setDirectorMode(prev, mode))}
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "3px 8px",
                background: state.mode === mode ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.06)",
                color: state.mode === mode ? "#00FFFF" : "rgba(255,255,255,0.75)",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {MODE_LABEL[mode]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setState((prev) => advanceDirectorPhase(prev))}
            style={{
              border: "1px solid rgba(255,45,170,0.45)",
              borderRadius: 6,
              padding: "3px 8px",
              background: "rgba(255,45,170,0.16)",
              color: "#FF2DAA",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Next Phase
          </button>
        </div>
      </div>

      <div style={{ position: "relative", height: 310 }}>
        {/* WORLD RELEASE */}
        <Layer visible={state.mode === "world-release" && state.phase === "drop"}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,255,0.18), rgba(5,5,16,0.9))" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ fontSize: 36, color: "#00FFFF", fontWeight: 900 }}>VIDEO FEED 100%</div>
          </div>
        </Layer>

        <Layer visible={state.mode === "world-release" && state.phase === "engage"}>
          <div style={{ position: "absolute", inset: 0, background: "#070915" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "70%", borderRight: "1px solid rgba(255,255,255,0.14)", display: "grid", placeItems: "center", color: "#00FFFF", fontWeight: 800 }}>
            VIDEO 70%
          </div>
          <div style={{ position: "absolute", right: 12, top: 12, width: "28%", height: "52%", border: "1px solid rgba(255,45,170,0.55)", borderRadius: 10, background: "linear-gradient(135deg, rgba(255,45,170,0.2), rgba(15,8,22,0.95))", display: "grid", placeItems: "center", color: "#FF2DAA", fontWeight: 900 }}>
            ARTIST CAM 30%
          </div>
        </Layer>

        <Layer visible={state.mode === "world-release" && state.phase === "reaction"}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,45,170,0.18), rgba(6,6,16,0.96))" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 30 }}>
            ARTIST CAM 100%
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", gap: 8 }}>
            {[
              "Replay",
              "Talk To Fans",
              "Clip Highlight",
            ].map((label) => (
              <button
                key={label}
                type="button"
                style={{
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Layer>

        {/* VERSUS 2026 */}
        <Layer visible={state.mode === "versus-2026"}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(200,30,50,0.2), rgba(7,7,18,0.95) 50%, rgba(45,90,220,0.18))" }} />

          <div
            style={{
              position: "absolute",
              left: `${versusGeometry.a.left}%`,
              top: 0,
              bottom: 0,
              width: `${versusGeometry.a.width}%`,
              borderRight: "1px solid rgba(255,255,255,0.16)",
              display: "grid",
              placeItems: "center",
              color: "#FF5D73",
              fontWeight: 900,
              transform: `scale(${versusGeometry.a.scale})`,
              transformOrigin: "center",
              transition: "left 420ms ease, width 420ms ease, transform 420ms ease, box-shadow 420ms ease",
              zIndex: versusGeometry.a.z,
              boxShadow: versusGeometry.a.glow,
              background: momentum.active === "A" ? "rgba(255,93,115,0.08)" : "rgba(255,93,115,0.03)",
            }}
          >
            ARTIST A
          </div>

          <div
            style={{
              position: "absolute",
              left: `${versusGeometry.b.left}%`,
              top: 0,
              bottom: 0,
              width: `${versusGeometry.b.width}%`,
              display: "grid",
              placeItems: "center",
              color: "#5EA2FF",
              fontWeight: 900,
              transform: `scale(${versusGeometry.b.scale})`,
              transformOrigin: "center",
              transition: "left 420ms ease, width 420ms ease, transform 420ms ease, box-shadow 420ms ease",
              zIndex: versusGeometry.b.z,
              boxShadow: versusGeometry.b.glow,
              background: momentum.active === "B" ? "rgba(94,162,255,0.08)" : "rgba(94,162,255,0.03)",
            }}
          >
            ARTIST B
          </div>

          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 8, fontSize: 11, color: "#FFD700", fontWeight: 900, letterSpacing: "0.12em" }}>
            VERSUS LIVE
          </div>

          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "grid", gap: 8, zIndex: 5 }}>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div style={{ width: `${heat}%`, height: "100%", background: "linear-gradient(90deg, #FF2DAA, #FFD700)", transition: "width 240ms ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 800 }}>
              <span>Heat {heat}% · Emotion {emotionalHeat}</span>
              <span>Audio A {audioA} · Audio B {audioB} · Vote A {leftVote}% · Vote B {rightVote}%</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: state.phase === "reaction" ? 1 : 0,
              background: "radial-gradient(circle at center, rgba(255,215,0,0.3), rgba(255,45,170,0.08), transparent 70%)",
              transition: "opacity 320ms ease",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 36,
              right: 12,
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 8,
              padding: "6px 8px",
              background: "rgba(4,4,12,0.7)",
              fontSize: 10,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.06em",
            }}
          >
            Momentum A {momentum.scoreA.toFixed(1)} · B {momentum.scoreB.toFixed(1)}
          </div>
        </Layer>

        {/* GUEST JAM */}
        <Layer visible={state.mode === "guest-jam" && state.phase === "drop"}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,136,0.18), rgba(8,8,18,0.95))" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#00FF88", fontWeight: 900, fontSize: 32 }}>
            ARTIST CAM
          </div>
        </Layer>

        <Layer visible={state.mode === "guest-jam" && state.phase === "engage"}>
          <div style={{ position: "absolute", inset: 0, background: "#060b12" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", borderRight: "1px solid rgba(255,255,255,0.16)", display: "grid", placeItems: "center", color: "#00FF88", fontWeight: 900 }}>
            HOST CAM
          </div>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", display: "grid", placeItems: "center", color: "#00FFFF", fontWeight: 900 }}>
            GUEST CAM
          </div>
        </Layer>

        <Layer visible={state.mode === "guest-jam" && state.phase === "reaction"}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(0,255,255,0.14), rgba(7,7,18,0.95))" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 30 }}>
            SHARED AUDIENCE RESPONSE
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", color: "#00FFFF", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em" }}>
            Invite accepted · duet locked · room energy rising
          </div>
        </Layer>
      </div>
    </section>
  );
}
