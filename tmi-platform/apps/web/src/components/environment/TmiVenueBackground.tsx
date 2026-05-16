"use client";

import { type ReactNode } from "react";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

export type VenueMode = "arena" | "battle" | "cypher" | "lobby" | "stage" | "gameshow" | "backstage" | "producer";

const MODE_PALETTE: Record<VenueMode, { ray1: string; ray2: string; ray3: string; floor: string; grid: string }> = {
  arena:     { ray1: "#FF2DAA", ray2: "#00FFFF", ray3: "#FFD700", floor: "#1a0030",  grid: "#FF2DAA33" },
  battle:    { ray1: "#FF4400", ray2: "#FF2DAA", ray3: "#FFD700", floor: "#1a0808",  grid: "#FF440033" },
  cypher:    { ray1: "#00FFFF", ray2: "#AA2DFF", ray3: "#FF2DAA", floor: "#000d1a",  grid: "#00FFFF33" },
  lobby:     { ray1: "#FFD700", ray2: "#FF2DAA", ray3: "#00FFFF", floor: "#0d0a00",  grid: "#FFD70033" },
  stage:     { ray1: "#FF2DAA", ray2: "#FFD700", ray3: "#AA2DFF", floor: "#0f0018",  grid: "#AA2DFF33" },
  gameshow:  { ray1: "#FFD700", ray2: "#00FFFF", ray3: "#FF2DAA", floor: "#050014",  grid: "#FFD70044" },
  backstage: { ray1: "#4ade80", ray2: "#00FFFF", ray3: "#FFD700", floor: "#001408",  grid: "#4ade8033" },
  producer:  { ray1: "#AA2DFF", ray2: "#00FFFF", ray3: "#FF2DAA", floor: "#08001a",  grid: "#AA2DFF33" },
};

interface TmiVenueBackgroundProps {
  mode?: VenueMode;
  children?: ReactNode;
  showAudience?: boolean;
  showConfetti?: boolean;
  showGrid?: boolean;
  backgroundImage?: string;
  className?: string;
}

export default function TmiVenueBackground({
  mode = "arena",
  children,
  showAudience = true,
  showConfetti = false,
  showGrid = true,
  backgroundImage,
  className,
}: TmiVenueBackgroundProps) {
  const p = MODE_PALETTE[mode];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 50% 85%, ${p.floor} 0%, #03020b 60%, #020009 100%)`,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {backgroundImage && (
        <ImageSlotWrapper
          imageId={`venue-bg-${mode}`}
          roomId={`venue-${mode}`}
          priority="high"
          fallbackUrl={backgroundImage}
          altText={`${mode} venue background`}
          className="w-full h-full object-cover"
          containerStyle={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.55,
          }}
        />
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
        }}
      />

      {showGrid && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            zIndex: 2,
            pointerEvents: "none",
            background: `linear-gradient(to bottom, transparent 0%, ${p.grid} 100%)`,
            backgroundImage: `
              linear-gradient(${p.grid} 1px, transparent 1px),
              linear-gradient(90deg, ${p.grid} 1px, transparent 1px)
            `,
            backgroundSize: "60px 40px",
            transform: "perspective(600px) rotateX(55deg)",
            transformOrigin: "bottom center",
            opacity: 0.7,
          }}
        />
      )}

      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
        <SpotRay color={p.ray2} angle={-12} left="38%" animDelay="0.8s" />
        <SpotRay color={p.ray1} angle={0} left="50%" animDelay="1.4s" />
        <SpotRay color={p.ray3} angle={12} left="62%" animDelay="0.4s" />
        <SpotRay color={p.ray2} angle={35} left="82%" animDelay="1.1s" />
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: 200,
          zIndex: 4,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 100%, ${p.ray1}44 0%, ${p.ray2}22 40%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      {showAudience && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "28%",
            left: 0,
            right: 0,
            height: 90,
            zIndex: 5,
            pointerEvents: "none",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <AudienceRow count={40} baseHeight={60} color={p.ray1} />
        </div>
      )}

      {showConfetti && <ConfettiLayer colors={[p.ray1, p.ray2, p.ray3, "#ffffff"]} />}

      <MarqueeLightStrip position="top" color={p.ray1} accentColor={p.ray3} />

      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  );
}

function SpotRay({ color, angle, left, animDelay = "0s" }: { color: string; angle: number; left: string; animDelay?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left,
        width: 3,
        height: "60%",
        background: `linear-gradient(to bottom, ${color}cc, transparent)`,
        transformOrigin: "top center",
        transform: `rotate(${angle}deg)`,
        filter: "blur(8px) brightness(1.3)",
        opacity: 0.55,
        animation: "spotRayPulse 3.5s ease-in-out infinite alternate",
        animationDelay: animDelay,
      }}
    />
  );
}

function AudienceRow({ count, baseHeight, color }: { count: number; baseHeight: number; color: string }) {
  const heads: Array<{ h: number; w: number; x: number }> = [];
  for (let i = 0; i < count; i++) {
    heads.push({
      h: baseHeight - Math.round(Math.sin(i * 1.37) * 14),
      w: 18 + Math.round(Math.cos(i * 0.89) * 4),
      x: i * 22,
    });
  }
  return (
    <svg width={count * 22 + 40} height={baseHeight + 10} style={{ display: "block", opacity: 0.6 }} aria-hidden>
      {heads.map((h, i) => (
        <g key={i} transform={`translate(${h.x + 20}, ${baseHeight - h.h + 10})`}>
          <ellipse cx={0} cy={-h.h * 0.18} rx={h.w * 0.45} ry={h.h * 0.22} fill={i % 5 === 0 ? `${color}66` : "#1a1232"} />
          <rect x={-h.w * 0.3} y={0} width={h.w * 0.6} height={h.h} rx={2} fill="#0d0920" />
        </g>
      ))}
    </svg>
  );
}

function ConfettiLayer({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 28 }).map((_, i) => ({
    color: colors[i % colors.length]!,
    x: (i * 3.7 + 4) % 100,
    delay: (i * 0.37) % 3,
    dur: 2.8 + (i % 4) * 0.7,
    rot: (i * 43) % 360,
    size: 6 + (i % 4) * 3,
  }));

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((piece, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${piece.x}%`,
            top: "-20px",
            width: piece.size,
            height: piece.size * 0.45,
            background: piece.color,
            borderRadius: 2,
            transform: `rotate(${piece.rot}deg)`,
            animation: `confettiFall ${piece.dur}s ${piece.delay}s linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall { from { transform: translateY(-20px) rotate(0deg); opacity: 1; } to { transform: translateY(110vh) rotate(720deg); opacity: 0.3; } }
        @keyframes spotRayPulse { from { opacity: 0.35; } to { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

function MarqueeLightStrip({ position, color, accentColor }: { position: "top" | "bottom"; color: string; accentColor: string }) {
  const count = 32;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        [position]: 0,
        left: 0,
        right: 0,
        height: 12,
        zIndex: 8,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: i % 3 === 0 ? accentColor : color,
            boxShadow: `0 0 6px ${i % 3 === 0 ? accentColor : color}`,
            animation: `marqueeBlink ${1 + (i % 4) * 0.3}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`@keyframes marqueeBlink { from { opacity: 0.3; } to { opacity: 1; } }`}</style>
    </div>
  );
}
