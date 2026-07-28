"use client";

import FlightDeckBezel from "@/components/ui/FlightDeckBezel";
import { useCypherRuntime } from "@/components/eos/CypherRuntimeContext";

export default function CypherQueuePanel() {
  const runtime = useCypherRuntime();

  if (!runtime) {
    return (
      <div style={{ padding: 12, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
        Queue unavailable
      </div>
    );
  }

  const { queue, activeEntryId, requestMic, activateNext } = runtime;

  return (
    <FlightDeckBezel title="CYPHER QUEUE" themeId="performer_purple" flush>
      <div style={{ padding: 12 }}>
        {queue.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
            No performers in queue yet. Request a mic slot to join the circle.
          </div>
        ) : (
          queue.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                marginBottom: 6,
                background: entry.id === activeEntryId ? "rgba(170,45,255,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${entry.id === activeEntryId ? "rgba(170,45,255,0.4)" : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 12 }}>🎤</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: entry.id === activeEntryId ? "#AA2DFF" : "#fff" }}>
                  {entry.displayName}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{entry.status}</div>
              </div>
            </div>
          ))
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => requestMic()}
            style={{
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid rgba(170,45,255,0.45)",
              background: "rgba(170,45,255,0.12)",
              color: "#AA2DFF",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + REQUEST MIC
          </button>
          {queue.some((e) => e.status === "waiting") && (
            <button
              type="button"
              onClick={activateNext}
              style={{
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "rgba(0,255,255,0.08)",
                color: "#00FFFF",
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ▶ ACTIVATE NEXT
            </button>
          )}
        </div>
      </div>
    </FlightDeckBezel>
  );
}
