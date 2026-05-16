"use client";

type ParticleFieldProps = {
  opacity?: number;
};

export default function ParticleField({ opacity = 0.18 }: ParticleFieldProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        backgroundImage:
          "radial-gradient(circle, rgba(0,255,255,0.5) 1px, transparent 1px), radial-gradient(circle, rgba(255,45,170,0.45) 1px, transparent 1px)",
        backgroundSize: "28px 28px, 34px 34px",
        backgroundPosition: "0 0, 12px 16px",
      }}
    />
  );
}