"use client";

import React from "react";

type Props = {
  title?: string;
  details: string;
  severity?: "info" | "warning";
};

export default function LoginAlertCard({ title = "Login Security Alert", details, severity = "info" }: Props) {
  const color = severity === "warning" ? "#f59e0b" : "#38bdf8";

  return (
    <div
      style={{
        border: `1px solid ${color}66`,
        background: "rgba(10,14,24,0.72)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
        {title}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>{details}</p>
    </div>
  );
}
