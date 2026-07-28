"use client";

import { useCypherRuntime } from "@/components/eos/CypherRuntimeContext";

export default function CypherBeatPlayer() {
  const runtime = useCypherRuntime();

  if (!runtime) return null;

  const { currentBeat, skipBeat } = runtime;

  return (
    <div
      style={{
        padding: 12,
        background: "rgba(5,5,16,0.9)",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#FFD700", marginBottom: 8 }}>
        BEAT PLAYER
      </div>
      {currentBeat ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{currentBeat.title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            {currentBeat.producerName} · {currentBeat.bpm} BPM · {currentBeat.genre}
          </div>
          <button
            type="button"
            onClick={skipBeat}
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.4)",
              background: "rgba(255,215,0,0.1)",
              color: "#FFD700",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            SKIP BEAT
          </button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          No beat loaded for this session yet.
        </div>
      )}
    </div>
  );
}
