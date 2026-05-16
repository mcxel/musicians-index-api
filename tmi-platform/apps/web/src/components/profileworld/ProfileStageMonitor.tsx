"use client";

import type { ReactNode } from "react";

type ProfileStageMonitorProps = {
  children: ReactNode;
  title: string;
  preShow?: boolean;
  countdownText?: string;
};

export default function ProfileStageMonitor({ children, title, preShow = false, countdownText = "Show starts in 04:30" }: ProfileStageMonitorProps) {
  return (
    <div style={{ borderRadius: 18, border: "1px solid rgba(90,215,255,0.3)", background: "rgba(3,10,24,0.92)", padding: 10, position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#8ecaf0", textTransform: "uppercase", marginBottom: 8, fontWeight: 800 }}>
        {title}
      </div>
      <div style={{ position: "relative" }}>
        {children}
        {preShow && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(84,4,6,0.68), rgba(115,6,7,0.75))", display: "grid", placeItems: "center", borderRadius: 12, border: "1px solid rgba(255,120,90,0.34)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#ffc1b3", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontWeight: 900 }}>Red Curtain Pre-Show</div>
              <div style={{ fontSize: 14, color: "#ffe0d1", fontWeight: 800 }}>{countdownText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
