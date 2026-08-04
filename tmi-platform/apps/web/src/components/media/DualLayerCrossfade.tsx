/**
 * DualLayerCrossfade — artwork A/B preload with opacity/scale/rotate crossfade.
 * No blank frame on image fail; respects prefers-reduced-motion.
 */

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface DualLayerCrossfadeProps {
  src?: string | null;
  alt?: string;
  fallbackLabel?: string;
  accent?: string;
  durationMs?: number;
  className?: string;
  style?: CSSProperties;
}

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%230a0614" width="400" height="400"/><text x="50%" y="50%" fill="%2300FFFF" font-family="sans-serif" font-size="18" text-anchor="middle" dy=".3em">TMI</text></svg>`,
  );

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return reduced;
}

export default function DualLayerCrossfade({
  src,
  alt = "Artwork",
  fallbackLabel = "No artwork",
  accent = "#00FFFF",
  durationMs = 480,
  className,
  style,
}: DualLayerCrossfadeProps) {
  const reduced = usePrefersReducedMotion();
  const [front, setFront] = useState<"a" | "b">("a");
  const [layerA, setLayerA] = useState(PLACEHOLDER);
  const [layerB, setLayerB] = useState(PLACEHOLDER);
  const [ready, setReady] = useState(true);
  const loadGen = useRef(0);

  useEffect(() => {
    const next = (src && src.trim()) || PLACEHOLDER;
    const gen = ++loadGen.current;
    const img = new Image();
    let settled = false;

    const commit = (url: string) => {
      if (gen !== loadGen.current) return;
      settled = true;
      if (front === "a") {
        setLayerB(url);
        setFront("b");
      } else {
        setLayerA(url);
        setFront("a");
      }
      setReady(true);
    };

    img.onload = () => commit(next);
    img.onerror = () => commit(PLACEHOLDER);
    setReady(false);
    img.src = next;

    // Timeout: never leave a blank frame
    const t = window.setTimeout(() => {
      if (!settled) commit(PLACEHOLDER);
    }, 2400);

    return () => {
      window.clearTimeout(t);
      img.onload = null;
      img.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- front flipped intentionally inside commit
  }, [src]);

  const dur = reduced ? 0 : durationMs;
  const showA = front === "a";

  const layerStyle = (active: boolean): CSSProperties => ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: active ? 1 : 0,
    transform: reduced
      ? "none"
      : active
        ? "scale(1) rotate(0deg)"
        : "scale(1.06) rotate(-1.2deg)",
    transition: dur
      ? `opacity ${dur}ms ease, transform ${dur}ms ease`
      : "none",
    willChange: dur ? "opacity, transform" : undefined,
    pointerEvents: "none",
  });

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0a0614",
        borderRadius: 8,
        ...style,
      }}
      aria-busy={!ready}
      aria-label={alt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={layerA} alt="" style={layerStyle(showA)} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={layerB} alt="" style={layerStyle(!showA)} draggable={false} />
      {!src ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.08em",
            background: "rgba(5,5,16,0.55)",
            pointerEvents: "none",
          }}
        >
          {fallbackLabel}
        </div>
      ) : null}
    </div>
  );
}
