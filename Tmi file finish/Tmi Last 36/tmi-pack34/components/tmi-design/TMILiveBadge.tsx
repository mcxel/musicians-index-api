// apps/web/src/components/tmi-design/TMILiveBadge.tsx
"use client";
import { useEffect, useState } from "react";

interface Props { viewers?: number; pulse?: boolean; }

export function TMILiveBadge({ viewers, pulse = true }: Props) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!pulse) return;
    const t = setInterval(() => setOn(v => !v), 900);
    return () => clearInterval(t);
  }, [pulse]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: on ? "#FF2020" : "#881010", transition: "background 0.3s", boxShadow: on ? "0 0 6px #FF2020" : "none" }} />
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 700, color: "#FF2020", letterSpacing: 1.5 }}>LIVE</span>
      {viewers !== undefined && <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, color: "#7A5F9A", letterSpacing: 0.5 }}>{viewers.toLocaleString()}</span>}
    </div>
  );
}
