"use client";

// Canon source: Fan Sign up.png + Performer Sign up.png
// The neon marquee border surrounds the signup form card.
// Moving dot-lights along all 4 edges — classic 1980s showbiz marquee.

import React, { useEffect, useRef } from "react";

interface NeonMarqueeBorderProps {
  children: React.ReactNode;
  color?: string;        // dot color, default #FFD700
  speed?: number;        // animation duration ms, default 3000
  dotSize?: number;      // px, default 5
  dotSpacing?: number;   // px, default 14
  borderRadius?: number; // px, default 12
  style?: React.CSSProperties;
  className?: string;
}

export default function NeonMarqueeBorder({
  children,
  color = "#FFD700",
  speed = 3000,
  dotSize = 5,
  dotSpacing = 14,
  borderRadius = 12,
  style,
  className,
}: NeonMarqueeBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function draw() {
      if (!canvas || !container) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const r = borderRadius;
      const total = 2 * (w + h); // perimeter approximation
      const offset = offsetRef.current;

      // Build perimeter path points
      function* perimeterPoints(): Generator<[number, number]> {
        // Top edge left → right
        for (let x = r; x < w - r; x += dotSpacing) yield [x, 0];
        // Right edge top → bottom
        for (let y = r; y < h - r; y += dotSpacing) yield [w, y];
        // Bottom edge right → left
        for (let x = w - r; x > r; x -= dotSpacing) yield [x, h];
        // Left edge bottom → top
        for (let y = h - r; y > r; y -= dotSpacing) yield [0, y];
      }

      const pts = [...perimeterPoints()];
      const count = pts.length;

      pts.forEach(([x, y], i) => {
        const phase = ((i / count) + offset) % 1;
        // Alternate lit/dim based on phase — every other dot group lit
        const lit = Math.sin(phase * Math.PI * 2 * 2) > 0.3;
        const alpha = lit ? 1 : 0.18;

        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
        if (lit) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Advance offset
      offsetRef.current = (offsetRef.current + 1 / (speed / 16)) % 1;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, speed, dotSize, dotSpacing, borderRadius]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        borderRadius,
        ...style,
      }}
    >
      {/* Canvas marquee overlay */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
          borderRadius,
        }}
      />
      {/* Inner border line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          border: `1px solid ${color}30`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}
