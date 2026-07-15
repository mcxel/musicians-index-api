"use client";

import Link from "next/link";

import { BezelFrame } from "@/components/admin/overseer/AdminDesignSystem";
import type { HQDockItem } from "@/components/admin/overseer/services/DockRegistry";

export default function HQDock({
  items,
  onCameraToggle,
  cameraActive,
}: {
  items: HQDockItem[];
  onCameraToggle?: () => void;
  cameraActive?: boolean;
}) {
  const toneStyles: Record<NonNullable<HQDockItem["tone"]>, { border: string; bg: string; text: string }> = {
    gold: {
      border: "rgba(255,215,0,0.38)",
      bg: "linear-gradient(180deg, rgba(76,36,14,0.85), rgba(36,17,9,0.92))",
      text: "#FFD88F",
    },
    cyan: {
      border: "rgba(0,255,255,0.35)",
      bg: "linear-gradient(180deg, rgba(10,45,58,0.85), rgba(7,21,28,0.92))",
      text: "#9CEEFF",
    },
    violet: {
      border: "rgba(170,45,255,0.35)",
      bg: "linear-gradient(180deg, rgba(62,22,88,0.85), rgba(24,10,37,0.92))",
      text: "#E9C7FF",
    },
    rose: {
      border: "rgba(255,45,170,0.35)",
      bg: "linear-gradient(180deg, rgba(88,24,52,0.85), rgba(37,10,21,0.92))",
      text: "#FFD1E9",
    },
    neutral: {
      border: "rgba(255,255,255,0.2)",
      bg: "linear-gradient(180deg, rgba(47,45,42,0.85), rgba(24,21,20,0.92))",
      text: "#E7E5E4",
    },
  };

  return (
    <BezelFrame variant="ornate-gold">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 8,
          padding: 8,
          background: "linear-gradient(180deg, rgba(28,14,8,0.86), rgba(13,7,5,0.92))",
        }}
      >
        {items.map((item) => {
          const tone = toneStyles[item.tone ?? "neutral"];
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                textDecoration: "none",
                borderRadius: 10,
                border: `1px solid ${tone.border}`,
                background: tone.bg,
                color: tone.text,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "10px 8px",
                textAlign: "center",
                boxShadow: "inset 0 0 0 1px rgba(255,215,0,0.15), 0 3px 12px rgba(0,0,0,0.35)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </Link>
          );
        })}
        {onCameraToggle && (
          <button
            type="button"
            onClick={onCameraToggle}
            style={{
              textDecoration: "none",
              borderRadius: 10,
              border: `1px solid ${cameraActive ? "rgba(0,255,136,0.5)" : "rgba(255,255,255,0.2)"}`,
              background: cameraActive
                ? "linear-gradient(180deg, rgba(0,80,45,0.85), rgba(0,36,20,0.92))"
                : "linear-gradient(180deg, rgba(47,45,42,0.85), rgba(24,21,20,0.92))",
              color: cameraActive ? "#8BFFC7" : "#E7E5E4",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "10px 8px",
              textAlign: "center",
              boxShadow: "inset 0 0 0 1px rgba(255,215,0,0.15), 0 3px 12px rgba(0,0,0,0.35)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
          >
            {cameraActive ? "📷 Camera On" : "📷 Camera"}
          </button>
        )}
      </div>
    </BezelFrame>
  );
}
