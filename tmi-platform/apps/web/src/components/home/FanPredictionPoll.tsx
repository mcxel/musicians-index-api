"use client";

import { useState } from "react";

export default function FanPredictionPoll() {
  const [leftVotes, setLeftVotes] = useState(58);
  const [rightVotes, setRightVotes] = useState(42);
  const total = Math.max(1, leftVotes + rightVotes);

  return (
    <div style={{ borderRadius: 12, border: "1px solid rgba(196,181,253,0.45)", background: "rgba(21,14,34,0.82)", padding: 12, display: "grid", gap: 7 }}>
      <div style={{ fontSize: 10, color: "#ddd6fe", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Fan Prediction Poll</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => setLeftVotes((v) => v + 1)} style={{ borderRadius: 8, border: "1px solid rgba(255,45,170,0.42)", background: "rgba(44,10,31,0.88)", color: "#fff", padding: "8px 6px", fontWeight: 800, fontSize: 10 }}>Team Neon</button>
        <button onClick={() => setRightVotes((v) => v + 1)} style={{ borderRadius: 8, border: "1px solid rgba(0,255,255,0.42)", background: "rgba(7,23,33,0.88)", color: "#fff", padding: "8px 6px", fontWeight: 800, fontSize: 10 }}>Team Pulse</button>
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${(leftVotes / total) * 100}%`, background: "#ff2daa" }} />
          <div style={{ width: `${(rightVotes / total) * 100}%`, background: "#00ffff" }} />
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.78)", fontWeight: 700 }}>Neon {Math.round((leftVotes / total) * 100)}% · Pulse {Math.round((rightVotes / total) * 100)}%</div>
      </div>
    </div>
  );
}
