"use client";

type FanPointsPanelProps = {
  points: number;
  goalPoints: number;
  frontRowLabel: string;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  watchToEarnMultiplier: number;
};

export default function FanPointsPanel({
  points,
  goalPoints,
  frontRowLabel,
  message,
  onMessageChange,
  onSend,
  watchToEarnMultiplier,
}: FanPointsPanelProps) {
  const progress = Math.max(0, Math.min(100, Math.round((points / goalPoints) * 100)));

  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid rgba(90,215,255,0.28)",
        background: "linear-gradient(160deg, rgba(4,12,28,0.96), rgba(3,8,18,0.97))",
        padding: 14,
        boxShadow: "inset 0 0 0 1px rgba(255,120,45,0.12)",
      }}
    >
      {/* Message box */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          color: "#8ecfe9",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 800,
        }}
      >
        <span>Message Box</span>
        <span style={{ color: "#ff7b2f" }}>Watch ×{watchToEarnMultiplier.toFixed(2)}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Send a message to the room…"
          style={{
            flex: 1,
            borderRadius: 10,
            border: "1px solid rgba(255,120,45,0.4)",
            background: "rgba(3,8,18,0.96)",
            color: "#dff4ff",
            padding: "9px 10px",
            fontSize: 12,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onSend}
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,120,45,0.45)",
            background: "rgba(255,120,45,0.2)",
            color: "#ffddbc",
            padding: "0 14px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          Send
        </button>
      </div>

      {/* Fan Points */}
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#8ecfe9",
          fontWeight: 800,
          marginBottom: 8,
        }}
      >
        Fan Points Progress
      </div>

      {/* Marquee bulb progress bar */}
      <div
        style={{
          position: "relative",
          height: 20,
          borderRadius: 10,
          border: "1px solid rgba(255,120,45,0.3)",
          background: "rgba(4,9,20,0.9)",
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #ff4422, #ff7b2f, #ffb84a)",
            boxShadow: "0 0 10px rgba(255,120,45,0.5)",
            transition: "width 400ms ease",
          }}
        />
        {/* Bulb marks */}
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: `${(i + 1) * 10}%`,
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: progress >= (i + 1) * 10 ? "#fff" : "rgba(255,255,255,0.15)",
              boxShadow: progress >= (i + 1) * 10 ? "0 0 4px #fff" : "none",
              zIndex: 2,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 4px rgba(0,0,0,0.8)",
            zIndex: 3,
          }}
        >
          {progress}%
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: "#cde7ff", fontSize: 11 }}>
        <span style={{ fontWeight: 700 }}>{points.toLocaleString()} FP</span>
        <span style={{ color: "rgba(200,230,255,0.55)" }}>{goalPoints.toLocaleString()} FP goal</span>
      </div>

      {/* Front Row Goal callout */}
      <div
        style={{
          marginTop: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,184,74,0.38)",
          background: "rgba(255,184,74,0.08)",
          padding: "8px 12px",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 18 }}>🏆</span>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb84a", fontWeight: 900 }}>
            Front Row Goal
          </div>
          <div style={{ fontSize: 12, color: "#ffe0a8", fontWeight: 700 }}>{frontRowLabel}</div>
        </div>
      </div>
    </section>
  );
}
