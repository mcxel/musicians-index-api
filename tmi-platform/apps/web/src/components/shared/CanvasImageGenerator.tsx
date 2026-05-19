'use client';
import { useEffect, useRef } from 'react';

interface CanvasImageGeneratorProps {
  textLabel: string;
  themeColor: string;
  width?: number;
  height?: number;
}

export default function CanvasImageGenerator({
  textLabel,
  themeColor,
  width = 320,
  height = 180,
}: CanvasImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060410';
    ctx.fillRect(0, 0, width, height);

    // Retro grid
    ctx.strokeStyle = `${themeColor}18`;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Radial glow from center
    const grd = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.45);
    grd.addColorStop(0, `${themeColor}22`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.floor(height * 0.072)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textLabel.toUpperCase(), width / 2, height / 2);

    // Corner frame
    ctx.strokeStyle = `${themeColor}55`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  }, [textLabel, themeColor, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block', borderRadius: 8 }}
    />
  );
}
