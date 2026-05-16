import type { CSSProperties } from "react";

type MagazinePaperTextureProps = {
  className?: string;
  intensity?: number;
  tone?: "warm" | "neutral";
};

export default function MagazinePaperTexture({ className = "", intensity = 1, tone = "warm" }: MagazinePaperTextureProps) {
  const warmTint = tone === "warm" ? "rgba(109,84,56,0.10)" : "rgba(92,99,108,0.08)";
  const grainOpacity = Math.min(0.22, 0.14 * intensity);
  const noiseOpacity = Math.min(0.2, 0.08 * intensity);

  const rootStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: 20,
    overflow: "hidden",
  };

  return (
    <div className={className} style={rootStyle} aria-hidden>
      {/* Fiber grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: grainOpacity,
          mixBlendMode: "multiply",
          backgroundImage:
            "radial-gradient(circle at 18% 24%, rgba(0,0,0,0.24) 0.4px, transparent 1px), radial-gradient(circle at 78% 64%, rgba(0,0,0,0.18) 0.45px, transparent 1px)",
          backgroundSize: "8px 7px, 12px 11px",
        }}
      />

      {/* Print noise and subtle CMYK misalignment simulation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: noiseOpacity,
          mixBlendMode: "overlay",
          filter: "blur(0.25px)",
          transform: "translate(0.35px, 0.2px)",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Ink bleed around page edge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 0 1px ${warmTint}, inset 0 14px 20px rgba(0,0,0,0.05), inset 0 -10px 18px rgba(0,0,0,0.07)`,
        }}
      />

      {/* Fold pressure and paper tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 46%, rgba(255,255,255,0.14), transparent 70%), linear-gradient(180deg, ${warmTint}, transparent 20%, transparent 80%, rgba(0,0,0,0.06))`,
        }}
      />
    </div>
  );
}
