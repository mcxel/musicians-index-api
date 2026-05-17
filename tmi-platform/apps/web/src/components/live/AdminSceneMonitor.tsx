"use client";

function stateFromScore(score: number): "spotlight" | "active" | "idle" {
  if (score >= 5) return "spotlight";
  if (score >= 2) return "active";
  return "idle";
}

const STATE_COLORS = {
  spotlight: "#00FFFF",
  active: "#FFD700",
  idle: "rgba(255,255,255,0.35)",
} as const;

interface AdminSceneMonitorProps {
  performers: Array<{ userId: string; displayName?: string }>;
  scores: Record<string, number>;
  focusId: string | null;
  overrideFocusId: string | null;
  onForceFocus: (id: string | null) => void;
}

export default function AdminSceneMonitor({
  performers,
  scores,
  focusId,
  overrideFocusId,
  onForceFocus,
}: AdminSceneMonitorProps) {
  const activeFocusId = overrideFocusId ?? focusId;

  return (
    <details
      style={{
        border: "1px solid rgba(255,215,0,0.25)",
        borderRadius: 10,
        background: "rgba(255,215,0,0.04)",
        padding: 0,
        marginTop: 6,
      }}
    >
      <summary
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,215,0,0.8)",
          listStyle: "none",
          userSelect: "none",
        }}
      >
        ⚙ Admin Monitor
      </summary>

      <div style={{ padding: "0 12px 12px", display: "grid", gap: 10 }}>
        {/* Score table */}
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 6,
            }}
          >
            Live Scores
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {performers.map((p) => {
              const score = scores[p.userId] ?? 0;
              const state = stateFromScore(score);
              const isFocus = p.userId === activeFocusId;
              const name = p.displayName ?? (p.userId.startsWith("viewer-") ? "Guest" : p.userId);
              return (
                <div
                  key={p.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: isFocus ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isFocus ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  <span style={{ fontSize: 9, color: STATE_COLORS[state], fontWeight: 800, minWidth: 60 }}>
                    {state.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: "#fff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: STATE_COLORS[state], minWidth: 28, textAlign: "right" }}>
                    {score}pt
                  </span>
                  {isFocus && <span style={{ fontSize: 10 }}>👑</span>}
                  <button
                    type="button"
                    onClick={() => onForceFocus(isFocus && overrideFocusId !== null ? null : p.userId)}
                    style={{
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: `1px solid ${isFocus && overrideFocusId !== null ? "rgba(255,80,80,0.5)" : "rgba(0,255,255,0.4)"}`,
                      background: isFocus && overrideFocusId !== null ? "rgba(255,60,60,0.12)" : "rgba(0,255,255,0.08)",
                      color: isFocus && overrideFocusId !== null ? "#FF8080" : "#BFFFFF",
                      fontSize: 8,
                      fontWeight: 800,
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {isFocus && overrideFocusId !== null ? "RELEASE" : "FORCE"}
                  </button>
                </div>
              );
            })}
            {performers.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>No performers on stage.</div>
            )}
          </div>
        </div>

        {/* Current focus panel */}
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.2)",
            background: "rgba(0,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(0,255,255,0.6)", marginBottom: 4 }}>
            Current Focus
          </div>
          {activeFocusId ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>
                {performers.find((p) => p.userId === activeFocusId)?.displayName ?? activeFocusId}
              </span>
              {overrideFocusId !== null && (
                <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(255,215,0,0.15)", color: "#FFD700", fontWeight: 700 }}>
                  FORCED
                </span>
              )}
              <button
                type="button"
                onClick={() => onForceFocus(null)}
                style={{
                  marginLeft: "auto",
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: "1px solid rgba(255,80,80,0.4)",
                  background: "rgba(255,60,60,0.1)",
                  color: "#FF8080",
                  fontSize: 8,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                CLEAR FOCUS
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>No performer in focus</div>
          )}
        </div>
      </div>
    </details>
  );
}
