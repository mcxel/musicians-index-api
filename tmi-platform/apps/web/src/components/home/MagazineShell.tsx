"use client";

import { ReactNode } from "react";

interface MagazineShellProps {
  children: ReactNode;
  accentColor: string;
  genreLabel?: string;
}

/**
 * MagazineShell
 * 
 * Physical magazine frame that contains the cover composition.
 * Provides:
 * - Proper magazine aspect ratio (9:13.5 landscape format)
 * - Frame border with genre-specific accent coloring
 * - Inset shadow for physical depth (cover sitting on page)
 * - Proper containment for all cover elements
 */
export default function MagazineShell({
  children,
  accentColor,
  genreLabel = "TMI Magazine",
}: MagazineShellProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: "100vh",
        padding: "16px",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.98) 100%)",
      }}
    >
      {/* Magazine physical frame */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "560px",
          aspectRatio: "9 / 13.5",
          borderRadius: "1px",
          background: "#000",
          border: `2px solid ${accentColor}3c`,
          boxShadow: `
            0 0 50px ${accentColor}10,
            inset 0 0 40px ${accentColor}08,
            0 30px 80px rgba(0,0,0,0.9),
            inset 0 2px 8px rgba(255,255,255,0.04)
          `,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Magazine surface (cover print area) */}
        <div
          className="flex flex-col flex-1 overflow-y-auto"
          style={{
            position: "relative",
          }}
        >
          {children}
        </div>

        {/* Magazine spine accent (bottom edge indicator) */}
        <div
          style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
            boxShadow: `0 0 16px ${accentColor}20`,
          }}
        />

        {/* Magazine spine gloss (light refraction edge) */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${accentColor}28, transparent)`,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        {/* Genre label subtle corner accent */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "12px",
            fontSize: "6px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: `${accentColor}40`,
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          {genreLabel}
        </div>
      </div>
    </div>
  );
}
