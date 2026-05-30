'use client';

import { useEffect, useRef } from 'react';

interface StarfieldLayerProps {
  density?: number;        // stars per 10k px²  — default 4
  speed?: number;          // drift speed multiplier — default 0.3
  opacity?: number;        // max opacity — default 0.18
  color?: string;          // hex — default '#ffffff'
  zIndex?: number;
}

export default function StarfieldLayer({
  density = 4,
  speed = 0.3,
  opacity = 0.18,
  color = '#ffffff',
  zIndex = 0,
}: StarfieldLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let w = 0, h = 0;

    interface Star { x: number; y: number; r: number; a: number; dy: number }
    let stars: Star[] = [];

    function resize() {
      if (!canvas) return;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      const count = Math.floor((w * h) / 10000 * density);
      stars = Array.from({ length: count }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h,
        r:  Math.random() * 1.2 + 0.3,
        a:  Math.random() * opacity,
        dy: (Math.random() * 0.4 + 0.1) * speed,
      }));
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = s.a;
        ctx.fill();
        s.y -= s.dy;
        if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [density, speed, opacity, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
      }}
    />
  );
}
