"use client";

import React from "react";

type Props = {
  title: string;
  status: "idle" | "success" | "error" | "warning";
  message: string;
};

export default function RecoveryStatusCard({ title, status, message }: Props) {
  const color =
    status === "success"
      ? "#22c55e"
      : status === "error"
      ? "#ef4444"
      : status === "warning"
      ? "#f59e0b"
      : "#38bdf8";

  return (
    <div
      style={{
        border: `1px solid ${color}55`,
        background: "rgba(8, 12, 20, 0.7)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
        {title}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>{message}</p>
    </div>
  );
}
