"use client";

import { useMemo } from "react";

type PageEdgeStackProps = {
  side: "left" | "right";
  layers?: number;
  active?: boolean;
};

export default function PageEdgeStack({
  side,
  layers = 32,
  active = true,
}: PageEdgeStackProps) {
  const strips = useMemo(() => {
    const list: Array<JSX.Element> = [];
    for (let i = 0; i < layers; i += 1) {
      const depth = i / Math.max(1, layers - 1);
      const offset = Math.round(depth * 28);
      const tilt = side === "left" ? -(depth * 1.8) : depth * 1.8;
      const width = 2 + Math.round(depth * 3);
      const opacity = active ? 0.28 + depth * 0.52 : 0.12 + depth * 0.28;

      list.push(
        <div
          key={`${side}-${i}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            width,
            transform: `translateX(${side === "left" ? -offset : offset}px) rotate(${tilt}deg)`,
            transformOrigin: side === "left" ? "right center" : "left center",
            borderRadius: 1,
            background:
              "linear-gradient(180deg, rgba(255,252,240,0.95) 0%, rgba(235,218,196,0.9) 50%, rgba(222,206,186,0.85) 100%)",
            boxShadow:
              side === "left"
                ? "1px 0 3px rgba(0,0,0,0.22)"
                : "-1px 0 3px rgba(0,0,0,0.22)",
            opacity,
            [side]: 0,
          }}
        />
      );
    }
    return list;
  }, [active, layers, side]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 40,
        pointerEvents: "none",
        overflow: "visible",
        [side]: 0,
      }}
    >
      {strips}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 20,
          [side]: side === "left" ? -20 : -20,
          background:
            side === "left"
              ? "linear-gradient(to left, rgba(0,0,0,0.18), transparent)"
              : "linear-gradient(to right, rgba(0,0,0,0.18), transparent)",
          opacity: active ? 0.85 : 0.45,
        }}
      />
    </div>
  );
}
