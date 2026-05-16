"use client";

type LightningArcLayerProps = {
  color?: string;
};

export default function LightningArcLayer({ color = "#00ffff" }: LightningArcLayerProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.1) 35%, transparent 45%), linear-gradient(300deg, transparent 55%, rgba(255,255,255,0.08) 70%, transparent 80%)",
        boxShadow: `inset 0 0 80px ${color}22`,
        mixBlendMode: "screen",
      }}
    />
  );
}