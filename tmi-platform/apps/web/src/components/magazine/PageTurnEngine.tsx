"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPageFlipFrame } from "@/lib/magazine/PageTurnEngine";

interface PageTurnEngineProps {
  pageNumber: number;
}

type TransitionMode = "opening" | "turning" | null;
type TurnDirection = "forward" | "backward";
type FlipPhase = "accelerate" | "fold" | "edge" | "swap" | "return";

const STORAGE_KEY = "tmi.home.magazine.page";

export default function PageTurnEngine({ pageNumber }: PageTurnEngineProps) {
  const pathname = usePathname() ?? "";
  const [mode, setMode] = useState<TransitionMode>(null);
  const [direction, setDirection] = useState<TurnDirection>("forward");
  const [phase, setPhase] = useState<FlipPhase>("accelerate");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const previousRaw = window.sessionStorage.getItem(STORAGE_KEY);
    const previousPage = previousRaw ? Number(previousRaw) : Number.NaN;
    const hasPreviousPage = Number.isFinite(previousPage);

    let nextMode: TransitionMode = null;
    let nextDirection: TurnDirection = "forward";

    if (!hasPreviousPage && pageNumber === 1) {
      nextMode = "opening";
    } else if (hasPreviousPage && previousPage !== pageNumber && pageNumber >= 2 && pageNumber <= 5) {
      nextMode = "turning";
      nextDirection = previousPage < pageNumber ? "forward" : "backward";
    }

    window.sessionStorage.setItem(STORAGE_KEY, String(pageNumber));

    if (!nextMode) {
      setMode(null);
      return undefined;
    }

    setMode(nextMode);
    setDirection(nextDirection);
    setPhase("accelerate");

    const timers: number[] = [];
    const schedule = (delay: number, nextPhase: FlipPhase | null) => {
      const id = window.setTimeout(() => {
        if (nextPhase) {
          setPhase(nextPhase);
          return;
        }
        setMode(null);
      }, delay);
      timers.push(id);
    };

    const timings =
      nextMode === "opening"
        ? { accelerate: 100, fold: 230, edge: 300, swap: 345, ret: 610 }
        : { accelerate: 75, fold: 175, edge: 230, swap: 268, ret: 520 };

    schedule(timings.accelerate, "fold");
    schedule(timings.fold, "edge");
    schedule(timings.edge, "swap");
    schedule(timings.swap, "return");
    schedule(timings.ret, null);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pageNumber, pathname]);

  if (!mode) {
    return null;
  }

  const phaseStyle = getPageFlipFrame(mode, direction, phase);

  const turnBaseStyle =
    direction === "forward"
      ? { right: 0, transformOrigin: "left center" }
      : { left: 0, transformOrigin: "right center" };

  const turnTransform = `rotateY(${phaseStyle.rotate}) scaleX(${phaseStyle.scaleX})`;

  const shadowOpacity = phase === "fold" || phase === "edge" ? 0.55 : phase === "swap" ? 0.20 : 0;
  const shadowX = direction === "forward" ? "-24px" : "24px";

  // Corner lift: visible only during accelerate, fades as fold begins
  const cornerLiftOpacity = phase === "accelerate" ? 0.82 : 0;
  const cornerLiftSide = direction === "forward" ? { right: 0 } : { left: 0 };
  const cornerLiftGrad = direction === "forward"
    ? "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.34), transparent 58%)"
    : "radial-gradient(ellipse at 0% 100%, rgba(255,255,255,0.34), transparent 58%)";

  // Reflection sweep: travels across page during fold, exits at edge
  const sweepVisible = phase === "fold" || phase === "edge";
  const sweepTranslate = phase === "edge"
    ? (direction === "forward" ? "translateX(55%)" : "translateX(-55%)")
    : "translateX(0%)";
  const sweepAngle = direction === "forward" ? "108deg" : "72deg";

  // Spine pressure: center crease widens as page loads into fold
  const spineWidth = phase === "fold" ? 5 : phase === "edge" || phase === "swap" ? 9 : 1;
  const spineOpacity = phase === "fold" ? 0.55 : phase === "edge" || phase === "swap" ? 0.70 : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden [perspective:2400px]">
      {/* Cast shadow — projected onto opposite page surface during fold */}
      <div
        className="absolute inset-y-0 w-[38%] rounded-[20px] bg-gradient-to-r from-black/0 via-black/45 to-black/0"
        style={{
          left: direction === "forward" ? "32%" : "30%",
          opacity: shadowOpacity,
          transform: `translateX(${shadowX})`,
          transition: `opacity ${phaseStyle.duration} ease-out, transform ${phaseStyle.duration} ease-out`,
        }}
      />

      {/* Spine pressure deformation — crease widens under page load */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-transparent via-black/60 to-transparent"
        style={{
          width: spineWidth,
          opacity: spineOpacity,
          transition: `width ${phaseStyle.duration} ease-out, opacity ${phaseStyle.duration} ease-out`,
        }}
      />

      {/* Page leaf */}
      <div
        className="absolute inset-y-0 rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(248,245,233,0.98),rgba(214,202,175,0.94))] shadow-[0_18px_80px_rgba(0,0,0,0.4)]"
        style={
          mode === "opening"
            ? {
                left: 0,
                right: 0,
                opacity: phaseStyle.opacity,
                transformOrigin: direction === "forward" ? "left center" : "right center",
                transform: turnTransform,
                transitionDuration: phaseStyle.duration,
                transitionProperty: "transform, opacity",
                transitionTimingFunction: phaseStyle.ease,
              }
            : {
                width: "50%",
                opacity: phaseStyle.opacity,
                transform: turnTransform,
                transitionDuration: phaseStyle.duration,
                transitionProperty: "transform, opacity",
                transitionTimingFunction: phaseStyle.ease,
                ...turnBaseStyle,
              }
        }
      >
        {/* Paper sheen */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38),rgba(0,0,0,0.06)_42%,rgba(0,0,0,0.24))]" />

        {/* Paper fiber grain */}
        <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_3px)]" />

        {/* Spine edge shadow on turning leaf */}
        <div
          className="absolute inset-y-0 w-12 bg-gradient-to-r from-black/30 to-transparent"
          style={direction === "forward" ? { left: 0 } : { right: 0, transform: "scaleX(-1)" }}
        />

        {/* Compression darkening — deepens at near-edge perpendicular */}
        <div
          className="absolute inset-0 rounded-[20px]"
          style={{
            backgroundColor: phase === "edge" || phase === "swap" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0)",
            transition: `background-color ${phaseStyle.duration} ease-in`,
          }}
        />

        {/* Corner lift — paper tension indicator before full turn begins */}
        <div
          className="absolute bottom-0 rounded-br-[20px] rounded-bl-[20px]"
          style={{
            ...cornerLiftSide,
            width: 76,
            height: 76,
            background: cornerLiftGrad,
            opacity: cornerLiftOpacity,
            transition: `opacity ${phaseStyle.duration} ease-out`,
          }}
        />

        {/* Light reflection sweep — gloss coat highlight traveling across page */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[20px]"
          style={{ opacity: sweepVisible ? 1 : 0, transition: "opacity 80ms ease-out" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(${sweepAngle}, transparent 26%, rgba(255,255,255,0.20) 46%, rgba(255,255,255,0.07) 54%, transparent 72%)`,
              transform: sweepTranslate,
              transition: `transform ${phaseStyle.duration} cubic-bezier(0.33,1,0.68,1)`,
            }}
          />
        </div>

        <div className="absolute inset-x-6 top-6 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-gradient-to-t from-black/38 to-transparent" />
      </div>

      {/* Ambient shadow overlay under turning page */}
      <div
        className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-transparent via-black/12 to-transparent"
        style={{ opacity: phase === "return" ? 0 : 1, transition: "opacity 230ms ease-out" }}
      />

      {/* Edge glow — bright flash at near-perpendicular spine-on view */}
      <div
        className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24),transparent_62%)]"
        style={{ opacity: phase === "edge" || phase === "swap" ? 0.55 : 0, transition: "opacity 80ms linear" }}
      />
    </div>
  );
}
