"use client";

import { useRef, useEffect } from "react";

export type SeatingTierContext = "VIP_FRONT_ROW" | "MID_ROW" | "FREE_BACK_ROW";

export interface CrowdOcclusionLayerProps {
  userSeatingTier?: SeatingTierContext;
  totalLobbyCount?: number;
  liveDeployments?: number;
  width?: number;
  height?: number;
}

const ARC_ROWS: Record<SeatingTierContext, number> = {
  VIP_FRONT_ROW: 0,
  MID_ROW: 1,
  FREE_BACK_ROW: 3,
};

const HEAD_COLORS = [
  "#2a1a0e", "#3d2610", "#5c3a1a", "#7a4f2e", "#1a0e08",
  "#4a3020", "#8a6040", "#6a4a30", "#3a2010", "#2e1a0c",
];

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  skinColor: string,
  animOffset: number,
) {
  const bobY = y + Math.sin(animOffset) * 1.5;

  // Shoulders
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(x, bobY + radius * 2.2, radius * 2.8, radius * 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, bobY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Hair highlight
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, bobY - radius * 0.3, radius * 0.85, radius * 0.55, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

export default function CrowdOcclusionLayer({
  userSeatingTier = "FREE_BACK_ROW",
  totalLobbyCount = 0,
  liveDeployments = 0,
  width = 800,
  height = 220,
}: CrowdOcclusionLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const arcRows = ARC_ROWS[userSeatingTier];

  useEffect(() => {
    if (arcRows === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const density = Math.min(0.3 + liveDeployments * 0.05, 0.95);
    const headRadius = 14 + (arcRows === 1 ? 4 : 0);
    const spacing = (width / (Math.floor(width / (headRadius * 2.8))));

    const draw = () => {
      ctx!.clearRect(0, 0, width, height);
      timeRef.current += 0.012;

      for (let row = 0; row < arcRows; row++) {
        const rowY = height - 20 - row * (headRadius * 2.4);
        const rowOpacity = 0.55 + row * 0.15;
        const count = Math.floor((width / spacing) * density);

        for (let i = 0; i < count; i++) {
          const x = spacing * i + spacing * 0.5 + (row % 2 === 0 ? 0 : spacing * 0.5);
          if (x > width) continue;
          const colorIdx = (i + row * 3) % HEAD_COLORS.length;
          const animOffset = timeRef.current + i * 0.4 + row * 1.2;
          ctx!.globalAlpha = rowOpacity;
          drawHead(ctx!, x, rowY, headRadius - row * 2, HEAD_COLORS[colorIdx]!, animOffset);
        }
      }

      ctx!.globalAlpha = 1;
      // Bottom fade so crowd blends into screen edge
      const grad = ctx!.createLinearGradient(0, height - 60, 0, height);
      grad.addColorStop(0, "rgba(4,6,20,0)");
      grad.addColorStop(1, "rgba(4,6,20,0.85)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, height - 60, width, 60);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [arcRows, width, height, liveDeployments]);

  if (arcRows === 0) return null;

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, width, height, pointerEvents: "none", zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block" }}
      />
      {totalLobbyCount > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 10,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {totalLobbyCount.toLocaleString()} IN CROWD
        </div>
      )}
    </div>
  );
}
