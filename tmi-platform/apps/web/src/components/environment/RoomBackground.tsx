"use client";

import React from "react";

interface RoomBackgroundProps {
  videoUrl?: string;
  fallbackGradient?: string;
  opacity?: number;
}

export default function RoomBackground({
  videoUrl,
  fallbackGradient = "radial-gradient(ellipse at 50% 85%, #050510 0%, #03020b 60%, #020009 100%)",
  opacity = 0.55,
}: RoomBackgroundProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: videoUrl ? "transparent" : fallbackGradient,
      }}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
            transition: "opacity 1s ease",
          }}
        />
      ) : null}
      
      {/* Dynamic scanline grid overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}
