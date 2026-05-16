import React from "react";
import type { TmiFlipDirection, TmiPeelOrigin } from "@/lib/magazine/tmiMagazinePageFlipEngine";
import type { TmiMagazineVisualState } from "@/lib/magazine/tmiMagazineLayerModel";

interface TmiMagazinePageCurlProps {
  active: boolean;
  direction: TmiFlipDirection;
  peelOrigin?: TmiPeelOrigin;
  velocity?: number;
  reducedMotion?: boolean;
  visualState?: TmiMagazineVisualState;
}

const ORIGIN_STYLE: Record<TmiPeelOrigin, { origin: string; sideClass: string }> = {
  "top-right": { origin: "right top", sideClass: "right-0 top-0" },
  "top-left": { origin: "left top", sideClass: "left-0 top-0" },
  "bottom-right": { origin: "right bottom", sideClass: "right-0 bottom-0" },
  "bottom-left": { origin: "left bottom", sideClass: "left-0 bottom-0" },
  "left-edge": { origin: "left center", sideClass: "left-0 top-0" },
  "right-edge": { origin: "right center", sideClass: "right-0 top-0" },
  "top-edge": { origin: "center top", sideClass: "left-0 top-0" },
  "bottom-edge": { origin: "center bottom", sideClass: "left-0 bottom-0" },
};

export default function TmiMagazinePageCurl({
  active,
  direction,
  peelOrigin = "right-edge",
  velocity = 0,
  reducedMotion = false,
  visualState = "closedIdle",
}: TmiMagazinePageCurlProps) {
  const entry = ORIGIN_STYLE[peelOrigin];
  const forward = direction === "forward";
  const bend = Math.min(34, 14 + velocity * 12);
  const searching = visualState === "searchTransition";
  const showEffect = active || searching;

  if (reducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className={showEffect ? "absolute inset-0 bg-white/5 transition-opacity" : "absolute inset-0 opacity-0"} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <div
        className={[
          "absolute h-full w-1/2 transition-all duration-300 ease-out",
          entry.sideClass,
          showEffect ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          transformOrigin: entry.origin,
          transform: showEffect
            ? forward
              ? `perspective(900px) rotateY(-${bend}deg)`
              : `perspective(900px) rotateY(${bend}deg)`
            : "perspective(900px) rotateY(0deg)",
          background: forward
            ? "linear-gradient(270deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05) 44%, rgba(0,0,0,0.36) 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05) 44%, rgba(0,0,0,0.36) 100%)",
          boxShadow: forward
            ? "-22px 0 34px rgba(0,0,0,0.4), inset -5px 0 8px rgba(255,255,255,0.24)"
            : "22px 0 34px rgba(0,0,0,0.4), inset 5px 0 8px rgba(255,255,255,0.24)",
        }}
      />

      {searching ? (
        <div className="absolute inset-0 opacity-90">
          <div className="absolute left-[18%] top-[12%] h-[76%] w-[2px] rotate-[6deg] bg-white/30" />
          <div className="absolute left-[31%] top-[8%] h-[82%] w-[2px] -rotate-[8deg] bg-fuchsia-200/30" />
          <div className="absolute left-[47%] top-[10%] h-[78%] w-[2px] rotate-[5deg] bg-cyan-200/35" />
          <div className="absolute left-[62%] top-[9%] h-[80%] w-[2px] -rotate-[7deg] bg-yellow-200/28" />
        </div>
      ) : null}

      <div
        className={showEffect ? "absolute inset-0 opacity-80 transition-opacity duration-200" : "absolute inset-0 opacity-0"}
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 25%, rgba(0,0,0,0.26))",
        }}
      />
    </div>
  );
}
