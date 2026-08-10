"use client";

import React from "react";

interface CircularDialProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

/**
 * CircularStatusDial — SVG ring meter for percentages, streaks, and sentinel counts.
 */
export function CircularStatusDial({
  value,
  max = 100,
  size = 56,
  strokeWidth = 4,
  color = "#00FFFF",
  label,
}: CircularDialProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${color}22`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 900, color }}>
          {value}
        </span>
        {label && (
          <span style={{ fontSize: 6, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface SegmentedMeterProps {
  segments?: number;
  activeSegments?: number;
  color?: string;
  height?: number;
}

/**
 * SegmentedProgressBar — Sci-Fi battery/power telemetry bar.
 */
export function SegmentedProgressBar({
  segments = 12,
  activeSegments = 8,
  color = "#00FF88",
  height = 8,
}: SegmentedMeterProps) {
  return (
    <div className="flex items-center gap-1 w-full" style={{ height }}>
      {Array.from({ length: segments }).map((_, i) => {
        const isActive = i < activeSegments;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: "100%",
              background: isActive ? color : "rgba(255,255,255,0.08)",
              boxShadow: isActive ? `0 0 6px ${color}66` : "none",
              borderRadius: 1,
              transition: "background 0.2s ease",
            }}
          />
        );
      })}
    </div>
  );
}

interface WaveformGraphProps {
  data?: number[];
  color?: string;
  height?: number;
}

/**
 * WaveformAreaGraph — Mountain/wave telemetry telemetry graph.
 */
export function WaveformAreaGraph({
  data = [20, 45, 28, 80, 65, 90, 40, 70, 95, 60],
  color = "#00E5FF",
  height = 42,
}: WaveformGraphProps) {
  const width = 280;
  const maxVal = Math.max(...data, 100);
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / maxVal) * (height - 6);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full relative overflow-hidden" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`wave-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#wave-grad-${color.replace("#", "")})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}
