import type { CSSProperties } from "react";

type MagazineSpineCoreProps = {
  depth?: number;
};

export default function MagazineSpineCore({ depth = 1 }: MagazineSpineCoreProps) {
  const shadow = Math.min(0.7, 0.45 * depth);

  const ridgeStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 120,
    transform: "translateX(-50%)",
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse at center, rgba(0,0,0,0.45), rgba(0,0,0,0.2) 54%, transparent 76%)",
    opacity: shadow,
  };

  return (
    <>
      <div style={ridgeStyle} aria-hidden />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 2,
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.34), transparent)",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* Left page inward bend */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "50%",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 100% 50%, rgba(0,0,0,0.2), transparent 55%)",
        }}
        aria-hidden
      />

      {/* Right page inward bend */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "50%",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 0% 50%, rgba(0,0,0,0.2), transparent 55%)",
        }}
        aria-hidden
      />

      {/* Page stack depth at spine base */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 8,
          transform: "translateX(-50%)",
          width: 92,
          height: 7,
          borderRadius: 999,
          background: "linear-gradient(180deg, rgba(239,228,205,0.8), rgba(141,126,104,0.75))",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }}
        aria-hidden
      />
    </>
  );
}
