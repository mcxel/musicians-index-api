"use client";

import { useEffect, useRef } from "react";

export interface InterstellarLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

const PALETTE = [
  "#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF",
  "#00FF88", "#FF9500", "#5ad7ff", "#ff6bc8",
];

export default function InterstellarLogo({ size = 80, animate = true }: InterstellarLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = size;

    function draw() {
      ctx!.clearRect(0, 0, s, s);
      timeRef.current += animate ? 0.018 : 0;
      const t = timeRef.current;

      // Outer ring
      const outerGrad = ctx!.createLinearGradient(0, 0, s, s);
      outerGrad.addColorStop(0, PALETTE[(Math.floor(t * 0.5)) % PALETTE.length]!);
      outerGrad.addColorStop(1, PALETTE[(Math.floor(t * 0.5) + 3) % PALETTE.length]!);
      ctx!.strokeStyle = outerGrad;
      ctx!.lineWidth = 2.5;
      ctx!.beginPath();
      ctx!.arc(s / 2, s / 2, s * 0.44, 0, Math.PI * 2);
      ctx!.stroke();

      // Inner T · M · I letters
      ctx!.save();
      ctx!.translate(s / 2, s / 2);
      ctx!.rotate(Math.sin(t * 0.3) * 0.04);
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.font = `900 ${s * 0.22}px 'Inter', sans-serif`;
      ctx!.fillStyle = "#fff";
      ctx!.fillText("TMI", 0, s * 0.04);
      ctx!.restore();

      // Orbiting dot
      const orbitR = s * 0.44;
      const dotX = s / 2 + Math.cos(t * 1.2) * orbitR;
      const dotY = s / 2 + Math.sin(t * 1.2) * orbitR;
      ctx!.beginPath();
      ctx!.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx!.fillStyle = PALETTE[Math.floor(t) % PALETTE.length]!;
      ctx!.fill();

      if (animate) animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block" }}
      aria-label="The Musician's Index"
    />
  );
}
