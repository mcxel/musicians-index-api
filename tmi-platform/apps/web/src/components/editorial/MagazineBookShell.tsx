"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useMagazinePageTurnEngine } from "./MagazinePageTurnEngine";

export type MagazineSpread = {
  id: string;
  label: string;
  pageRange?: string;
  left: ReactNode;
  right: ReactNode;
};

type MagazineBookShellProps = {
  spreads: MagazineSpread[];
  initialSpread?: number;
  coverSpreadIndex?: number;
};

// Paper grain — SVG fractalNoise as data URI, tiled at low opacity
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23f)' opacity='0.06'/%3E%3C/svg%3E")`;

// Alternating paper tones for page edge stack
const PAPER = ["#f2e9cd", "#e8ddb9", "#ede4c8", "#e4d9b2", "#f0e7ca", "#e2d6ae"] as const;

function PageStack({ side, count = 16 }: { side: "left" | "right"; count?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 40,
        bottom: 40,
        width: 96,
        [side]: -50,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {Array.from({ length: count }, (_, pageIndex) => {
        const offset = pageIndex * 3.8;
        const base = PAPER[pageIndex % PAPER.length] ?? "#ede4c8";
        const dark = pageIndex % 2 === 0 ? base : "#d4c79c";
        return (
          <div
            key={`${side}-stack-${pageIndex}`}
            style={{
              position: "absolute",
              top: offset,
              bottom: offset,
              [side]: offset * -0.9,
              width: 84,
              background: `linear-gradient(${side === "left" ? "270deg" : "90deg"}, ${dark} 0%, ${base} 100%)`,
              borderRadius: side === "left" ? "16px 0 0 16px" : "0 16px 16px 0",
              boxShadow:
                side === "left"
                  ? "-8px 0 18px rgba(0,0,0,0.22), inset -1px 0 0 rgba(0,0,0,0.16), inset -2px 0 0 rgba(0,0,0,0.06)"
                  : "8px 0 18px rgba(0,0,0,0.22), inset 1px 0 0 rgba(0,0,0,0.16), inset 2px 0 0 rgba(0,0,0,0.06)",
              opacity: Math.max(0.10, 0.96 - pageIndex * 0.052),
              transform: `scaleY(${1 - pageIndex * 0.008})`,
            }}
          />
        );
      })}
    </div>
  );
}

function PageSurface({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  const isLeft = side === "left";
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 760,
        background: `${GRAIN}, linear-gradient(180deg, #09080f 0%, #0e0b19 55%, #0b091a 100%)`,
        borderRadius: isLeft ? "20px 0 0 20px" : "0 20px 20px 0",
        boxShadow: isLeft
          ? "inset -28px 0 48px rgba(0,0,0,0.46), inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "inset 28px 0 48px rgba(0,0,0,0.46), inset 0 0 0 1px rgba(255,255,255,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fold compression shadow near spine */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        [isLeft ? "right" : "left"]: 0,
        width: 56,
        background: isLeft
          ? "linear-gradient(to left, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0.28) 38%, transparent 100%)"
          : "linear-gradient(to right, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0.28) 38%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      {/* Outer edge highlight — page thickness bevel */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        [isLeft ? "left" : "right"]: 0,
        width: 3,
        background: "rgba(255,255,255,0.10)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      {/* Top sheen — light catching top edge */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 110,
        background: "linear-gradient(180deg, rgba(255,255,255,0.055), transparent)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      {/* Inner border */}
      <div style={{
        position: "absolute", inset: 14,
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: isLeft ? "14px 0 0 14px" : "0 14px 14px 0",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      {/* Content */}
      <div style={{ flex: 1, padding: "18px 18px 20px", position: "relative", zIndex: 3 }}>{children}</div>
      {/* Corner curl — outer bottom corner lift tension */}
      <div style={{
        position: "absolute",
        [isLeft ? "left" : "right"]: 0,
        bottom: 0,
        width: 52,
        height: 52,
        background: isLeft
          ? "linear-gradient(135deg, transparent 46%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.16) 100%)"
          : "linear-gradient(225deg, transparent 46%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.16) 100%)",
        pointerEvents: "none",
        zIndex: 4,
      }} />
      {/* Page footer */}
      <div style={{ padding: "0 22px 16px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", position: "relative", zIndex: 3 }}>
        {side === "left" ? "Left Page" : "Right Page"}
      </div>
    </div>
  );
}

export default function MagazineBookShell({ spreads, initialSpread = 0, coverSpreadIndex = 0 }: MagazineBookShellProps) {
  const {
    currentSpread,
    canGoBack,
    canGoForward,
    forward,
    back,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    spreadTransform,
    spreadTransition,
  } = useMagazinePageTurnEngine({ spreadCount: spreads.length, initialSpread });

  const activeSpread = spreads[currentSpread] ?? spreads[0];
  const pageCounter = useMemo(
    () => activeSpread?.pageRange ?? `${String(currentSpread * 2 + 1).padStart(2, "0")}-${String(currentSpread * 2 + 2).padStart(2, "0")}`,
    [activeSpread, currentSpread],
  );
  const isClosedCover = currentSpread === coverSpreadIndex;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(56,32,83,0.52), transparent 58%), linear-gradient(180deg, #08070d 0%, #110d18 42%, #06050a 100%)",
        padding: "28px 18px 34px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Table surface darkening — book resting on a surface */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: "linear-gradient(0deg, rgba(0,0,0,0.36), transparent)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1560, margin: "0 auto", position: "relative" }}>
        {/* Masthead strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "rgba(255,255,255,0.44)", marginBottom: 16, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>
          <span>The Musician&apos;s Index</span>
          <span>{activeSpread?.label ?? "Spread"}</span>
          <span>pp. {pageCounter}</span>
        </div>

        {/* Book housing */}
        <div
          style={{
            position: "relative",
            padding: "34px 62px",
            borderRadius: 34,
            background: "linear-gradient(180deg, rgba(22,15,32,0.94), rgba(8,6,12,0.97))",
            boxShadow: "0 52px 150px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.11)",
          }}
          onPointerDown={(event) => onPointerDown(event.clientX)}
          onPointerMove={(event) => onPointerMove(event.clientX)}
          onPointerUp={(event) => onPointerUp(event.clientX)}
        >
          {isClosedCover ? (
            <>
              <PageStack side="right" count={18} />
              <div
                style={{
                  position: "relative",
                  zIndex: 5,
                  width: "min(980px, 76vw)",
                  minHeight: 780,
                  margin: "0 auto",
                  transform: "rotate(-1.2deg)",
                }}
              >
                {/* Cover page edge stack */}
                <div style={{ position: "absolute", top: 22, bottom: 22, right: -36, width: 84, pointerEvents: "none" }}>
                  {Array.from({ length: 18 }, (_, index) => (
                    <div
                      key={`cover-edge-${index}`}
                      style={{
                        position: "absolute",
                        top: index * 3.8,
                        bottom: index * 3.8,
                        right: index * -1.6,
                        width: 72,
                        borderRadius: "0 16px 16px 0",
                        background: `linear-gradient(90deg, ${PAPER[index % PAPER.length] ?? "#ede4c8"}, #d4c79c)`,
                        boxShadow: "inset 1px 0 0 rgba(0,0,0,0.12), inset 2px 0 0 rgba(255,255,255,0.05)",
                        opacity: Math.max(0.10, 0.96 - index * 0.048),
                      }}
                    />
                  ))}
                </div>
                {/* Drop shadow blob */}
                <div style={{
                  position: "absolute",
                  inset: "20px 12px 4px 20px",
                  background: "linear-gradient(180deg, rgba(0,0,0,0.42), transparent 20%, rgba(0,0,0,0.35) 100%)",
                  filter: "blur(28px)",
                  transform: "translate(22px, 32px)",
                  pointerEvents: "none",
                }} />
                {/* Cover face */}
                <div
                  style={{
                    position: "relative",
                    minHeight: 780,
                    borderRadius: 26,
                    overflow: "hidden",
                    background: `${GRAIN}, linear-gradient(180deg, #0a0910 0%, #100d1a 100%)`,
                    boxShadow: "0 36px 90px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.14)",
                    transform: spreadTransform,
                    transition: spreadTransition,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Cover gloss sweep */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 28%, transparent 68%, rgba(0,0,0,0.30))", pointerEvents: "none", zIndex: 2 }} />
                  {/* Cover right-edge shadow */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: "100%", background: "linear-gradient(to left, rgba(0,0,0,0.40), transparent)", pointerEvents: "none", zIndex: 2 }} />
                  {/* Cover left-edge spine bevel */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 16, height: "100%", background: "linear-gradient(to right, rgba(255,255,255,0.13), transparent)", pointerEvents: "none", zIndex: 2 }} />
                  {/* Cover corner curl */}
                  <div style={{ position: "absolute", right: 0, bottom: 0, width: 52, height: 52, background: "linear-gradient(225deg, transparent 46%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 100%)", pointerEvents: "none", zIndex: 2 }} />
                  <div style={{ padding: "26px 28px 22px", minHeight: 780, position: "relative", zIndex: 3 }}>{activeSpread.left}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <PageStack side="left" count={16} />
              <PageStack side="right" count={16} />

              {/* Spine */}
              <div style={{
                position: "absolute",
                top: 34, bottom: 34,
                left: "50%", width: 42,
                transform: "translateX(-50%)",
                background: "linear-gradient(180deg, #3d2c14 0%, #1e1008 100%)",
                borderRadius: 21,
                boxShadow: "inset 0 0 24px rgba(255,255,255,0.09), 0 0 28px rgba(0,0,0,0.44), -10px 0 20px rgba(0,0,0,0.38), 10px 0 20px rgba(0,0,0,0.38)",
                zIndex: 4,
              }}>
                {/* Spine ridge highlight */}
                <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, transform: "translateX(-50%)", background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.13))", borderRadius: 1 }} />
                {/* Spine inner glow */}
                <div style={{ position: "absolute", inset: 8, borderRadius: 13, background: "linear-gradient(180deg, rgba(255,255,255,0.07), transparent 55%, rgba(0,0,0,0.24))" }} />
              </div>

              {/* Open page spread */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  position: "relative",
                  zIndex: 3,
                  transform: spreadTransform,
                  transition: spreadTransition,
                  transformStyle: "preserve-3d",
                  boxShadow: "0 28px 70px rgba(0,0,0,0.52), 0 52px 110px rgba(0,0,0,0.36)",
                  borderRadius: 20,
                }}
              >
                <PageSurface side="left">{activeSpread.left}</PageSurface>
                <PageSurface side="right">{activeSpread.right}</PageSurface>
              </div>
            </>
          )}

          {/* Left nav button */}
          <button
            type="button"
            onClick={back}
            disabled={!canGoBack}
            style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              width: 38, height: 130, borderRadius: 19,
              border: "1px solid rgba(255,255,255,0.11)",
              background: canGoBack ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
              color: canGoBack ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.18)",
              cursor: canGoBack ? "pointer" : "default",
              fontSize: 22, zIndex: 6,
              transition: "background 160ms, color 160ms",
            }}
          >‹</button>

          {/* Right nav button */}
          <button
            type="button"
            onClick={forward}
            disabled={!canGoForward}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              width: 38, height: 130, borderRadius: 19,
              border: "1px solid rgba(255,255,255,0.11)",
              background: canGoForward ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
              color: canGoForward ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.18)",
              cursor: canGoForward ? "pointer" : "default",
              fontSize: 22, zIndex: 6,
              transition: "background 160ms, color 160ms",
            }}
          >›</button>
        </div>

        {/* Hint strip */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 16, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)" }}>
          <span>‹ › Arrow keys</span>
          <span>·</span>
          <span>Click edges</span>
          <span>·</span>
          <span>Swipe to turn</span>
        </div>
      </div>
    </main>
  );
}
