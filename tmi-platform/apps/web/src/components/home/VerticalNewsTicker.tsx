"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  "Music News: city stages sold out this week",
  "Interview: producer bracket champs speak",
  "Studio Recaps: five sessions trending",
  "Editorial: Top 10 list updates every cycle",
];

export default function VerticalNewsTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % ITEMS.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ borderRadius: 12, border: "1px solid rgba(255,215,0,0.34)", overflow: "hidden", background: "rgba(17,13,8,0.88)", minHeight: 36 }}>
      <div
        style={{
          transform: `translateY(-${index * 36}px)`,
          transition: "transform 360ms ease",
        }}
      >
        {[...ITEMS, ...ITEMS].map((text, idx) => (
          <div key={`${text}-${idx}`} style={{ height: 36, display: "flex", alignItems: "center", padding: "0 10px", fontSize: 10, color: "#ffe9a8", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
