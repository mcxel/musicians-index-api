"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageSlotWrapper, PerformerPortraitWrapper } from '@/components/visual-enforcement';
import {
  type CrownContender,
  tickOrbit,
  simulateVoteTick,
  resolveCrownHolder,
} from "@/engines/home/CrownCycleEngine";
import type { MusicGenre } from "@/engines/home/CoverGenreRotationAuthority";
import { GENRE_ACCENT } from "@/engines/home/CoverGenreRotationAuthority";
import { getClipPathCSS, type IrregularShape } from "@/engines/home/ShapeOverlayEngine";
import { buildCrownCenterMotion, buildCrownOrbiterMotion } from "@/lib/home/CrownCenterMotionEngine";

// ─── PROPS ───────────────────────────────────────────────────────────────────
interface OrbitBattleAnimationLayerProps {
  contenders: CrownContender[];
  genre: MusicGenre;
  orbitRadiusPx?: number;
  orbitRadiusX?: number;
  orbitRadiusY?: number;
  containerSize?: number;
  shapeIdentity?: IrregularShape;
  renderMode?: "circle" | "cutout";
}

function getPortraitDiameter(): number {
  // Locked parity mode: all contenders use the same readable portrait diameter.
  // This matches the previous FlowStateJ master size and preserves center anchors.
  return 160;
}

// ─── LIGHTNING BOLT ──────────────────────────────────────────────────────────
function LightningBolt({
  x, y, angle, length, color, opacity,
}: {
  x: number; y: number; angle: number; length: number; color: string; opacity: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 1,
        height: length,
        background: `linear-gradient(to bottom, ${color}, transparent)`,
        transform: `rotate(${angle}deg)`,
        opacity,
        transformOrigin: "top center",
        pointerEvents: "none",
        filter: `blur(1px)`,
        boxShadow: `0 0 4px ${color}`,
      }}
    />
  );
}

// ─── CROWN PULSE ─────────────────────────────────────────────────────────────
function CrownPulseCenter({
  genre,
  holder,
  size,
  shapeIdentity,
}: {
  genre: MusicGenre;
  holder: CrownContender | null;
  size: number;
  shapeIdentity: IrregularShape;
}) {
  const accent = GENRE_ACCENT[genre];
  const half   = size / 2;
  const clipPath = getClipPathCSS(shapeIdentity);

  return (
    <div
      style={{
        position: "absolute",
        left: half - 108,
        top:  half - 90,
        width:  216,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {/* Pulse rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          aria-hidden="true"
          style={{
            position: "absolute",
            border: `1px solid ${accent}`,
            width:  72 + ring * 40,
            height: 72 + ring * 40,
            opacity: 0.12 / ring,
            animation: `pulse ${1.4 + ring * 0.5}s ease-in-out infinite`,
            animationDelay: `${ring * 0.25}s`,
            clipPath,
          }}
        />
      ))}
      {/* Crown icon */}
      <div
        style={{
          fontSize: 64,
          lineHeight: 1,
          textShadow: `0 0 20px ${accent}, 0 0 40px ${accent}88`,
          zIndex: 2,
        }}
      >
        👑
      </div>
      {/* Crown holder name */}
      {holder && (
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accent,
            whiteSpace: "nowrap",
            textShadow: `0 0 8px ${accent}`,
          }}
        >
          {holder.name}
        </div>
      )}
    </div>
  );
}

// ─── ORBIT CARD ──────────────────────────────────────────────────────────────
function OrbitCard({
  contender,
  x,
  y,
  accent,
  isCrown,
  orbitIndex,
  shapeIdentity,
  renderMode,
}: {
  contender: CrownContender;
  x: number;
  y: number;
  accent: string;
  isCrown: boolean;
  orbitIndex: number;
  shapeIdentity: IrregularShape;
  renderMode: "circle" | "cutout";
}) {
  const cardW = getPortraitDiameter();
  const cardH = cardW;
  const clipPath = getClipPathCSS(shapeIdentity);
  const portraitMotion = isCrown
    ? buildCrownCenterMotion(contender.performerId)
    : buildCrownOrbiterMotion(contender.performerId, orbitIndex);
  const labelMaxWidth = Math.max(60, cardW - 18);
  const badgeFontSize = 18;
  const nameFontSize = 9;
  const votesFontSize = 7;
  const isCutout = renderMode === "cutout";
  const cardClipPath = isCutout ? undefined : clipPath;

  return (
    <Link href={contender.profileRoute} style={{ textDecoration: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x - cardW / 2,
          top:  y - cardH / 2,
          width:  cardW,
          height: cardH,
          border: isCutout ? "none" : `2px solid ${isCrown ? accent : accent + "44"}`,
          background: isCutout ? "transparent" : isCrown ? `${accent}18` : "rgba(5,5,20,0.75)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          boxShadow: isCutout
            ? isCrown
              ? `0 0 24px ${accent}40`
              : "none"
            : isCrown
              ? `0 0 20px ${accent}55, 0 0 40px ${accent}22`
              : `0 2px 12px rgba(0,0,0,0.5)`,
          transition: "box-shadow 300ms ease",
          zIndex: isCrown ? 15 : 10,
          overflow: "hidden",
          clipPath: cardClipPath,
        }}
      >
        <motion.div
          animate={portraitMotion.animate}
          transition={portraitMotion.transition}
          style={{
            position: "absolute",
            inset: 0,
            clipPath: cardClipPath,
            opacity: isCutout ? 1 : 0.62,
            transformOrigin: "center center",
            filter: isCutout
              ? `drop-shadow(0 8px 16px rgba(0,0,0,0.45))`
              : undefined,
          }}
        >
          <PerformerPortraitWrapper
            performerId={contender.performerId}
            roomId="orbit-battle"
            displayName={contender.name}
            kind="artist"
            containerStyle={{ width: "100%", height: "100%" }}
            className={`w-full h-full ${isCutout ? "object-contain" : "object-cover"}`}
          />
        </motion.div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: isCutout
              ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 68%, rgba(0,0,0,0.4) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.68) 100%)",
          }}
        />
        {/* Name */}
        <span
          style={{
            position: "relative",
            fontSize: nameFontSize,
            fontWeight: 900,
            color: isCrown ? accent : "#fff",
            textAlign: "center",
            letterSpacing: "0.06em",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            maxWidth: labelMaxWidth,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            bottom: isCutout ? 10 : undefined,
          }}
        >
          {contender.name}
        </span>
        {/* Vote count */}
        <span
          style={{
            position: "relative",
            fontSize: votesFontSize,
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            bottom: isCutout ? 2 : undefined,
          }}
        >
          {contender.votes.toLocaleString()}
        </span>
        {/* Crown badge */}
        {isCrown && (
          <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: badgeFontSize, lineHeight: 1 }}>
            👑
          </div>
        )}
      </div>
    </Link>
  );
}

function CenterAuthorityPortrait({ holder, accent, size }: { holder: CrownContender; accent: string; size: number }) {
  const authorityMotion = buildCrownCenterMotion(holder.performerId);
  const portraitSize = Math.max(152, Math.round(size * 0.38));

  return (
    <Link href={holder.profileRoute} style={{ textDecoration: "none" }}>
      <motion.div
        animate={authorityMotion.animate}
        transition={authorityMotion.transition}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: portraitSize,
          height: portraitSize,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${accent}`,
          boxShadow: `0 0 36px ${accent}60, inset 0 0 24px rgba(255,255,255,0.14)`,
          background: "#090812",
          zIndex: 18,
        }}
      >
        <ImageSlotWrapper imageId="img-k6lle" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        <motion.div
          animate={authorityMotion.crownOverlay?.animate}
          transition={authorityMotion.crownOverlay?.transition}
          style={{
            position: "absolute",
            left: "50%",
            top: 4,
            transform: "translateX(-50%)",
            fontSize: 24,
            lineHeight: 1,
            zIndex: 22,
            pointerEvents: "none",
          }}
        >
          👑
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            padding: "14px 12px 12px",
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.84))",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{holder.name}</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: accent, textTransform: "uppercase" }}>
            #1 Crown Holder
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── CONFETTI SPARK ──────────────────────────────────────────────────────────
function ConfettiSpark({ x, y, color, index, containerSize: cs }: { x: number; y: number; color: string; index: number; containerSize: number }) {
  const [offsetY, setOffsetY] = useState(0);
  const duration = 4000 + (index * 373) % 4000; // 4–8s per particle, deterministic spread

  useEffect(() => {
    let start: number | null = null;
    let raf: ReturnType<typeof requestAnimationFrame>;

    function tick(ts: number) {
      if (!start) start = ts - ((index * 373) % duration); // stagger start
      const elapsed = (ts - start) % duration;
      setOffsetY((elapsed / duration) * (cs + 40));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, cs, index]);

  const progress = offsetY / (cs + 40);
  const opacity  = progress < 0.1 ? progress * 7 : progress > 0.85 ? (1 - progress) * 6.7 : 0.7;
  const rotation = (offsetY * 1.2 + index * 45) % 360;
  const size     = 3 + (index % 3);

  return (
    <div
      aria-hidden="true"
      style={{
        position:  "absolute",
        left:      x,
        top:       y - 20 + offsetY,
        width:     size,
        height:    size,
        borderRadius: index % 3 === 0 ? "50%" : "2px",
        background: color,
        opacity,
        boxShadow:  `0 0 6px ${color}`,
        transform:  `rotate(${rotation}deg)`,
        pointerEvents: "none",
        willChange: "transform, top, opacity",
      }}
    />
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function OrbitBattleAnimationLayer({
  contenders: initialContenders,
  genre,
  orbitRadiusPx = 396,
  orbitRadiusX,
  orbitRadiusY,
  containerSize = 960,
  shapeIdentity = "circle",
  renderMode = "circle",
}: OrbitBattleAnimationLayerProps) {
  const [contenders, setContenders] = useState(initialContenders);
  const frameRef   = useRef<ReturnType<typeof requestAnimationFrame>>();
  const accent     = GENRE_ACCENT[genre];
  const half       = containerSize / 2;
  const clipPath   = getClipPathCSS(shapeIdentity);
  // B3 scale patch: support elliptical orbit (+220% X, +180% Y vs original 180px)
  const effectiveRadiusX = orbitRadiusX ?? orbitRadiusPx;
  const effectiveRadiusY = orbitRadiusY ?? Math.round(orbitRadiusPx * 0.818);
  // Orbit tick via rAF — smooth continuous rotation
  useEffect(() => {
    let last = performance.now();
    function frame(now: number) {
      const dt = now - last;
      last = now;
      // ~0.4 deg/100ms = slow gentle orbit
      setContenders((prev) => tickOrbit(prev, 0.004 * dt));
      frameRef.current = requestAnimationFrame(frame);
    }
    frameRef.current = requestAnimationFrame(frame);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  // Vote tick every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setContenders((prev) => simulateVoteTick(prev));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const holder = resolveCrownHolder(contenders);
  const orbiters = useMemo(
    () => contenders.filter((contender) => contender.performerId !== holder?.performerId),
    [contenders, holder?.performerId],
  );

  // Pre-calculate stable confetti positions (deterministic from count)
  const confettiPositions = orbiters.map((_, i) => ({
    x: half + Math.cos((i / Math.max(1, orbiters.length)) * Math.PI * 2) * (effectiveRadiusX * 1.35),
    y: half + Math.sin((i / Math.max(1, orbiters.length)) * Math.PI * 2) * (effectiveRadiusY * 1.35),
    color: [accent, "#FF2DAA", "#FFD700", "#00FF88"][i % 4] ?? accent,
  }));

  // Lightning positions (stable, decorative)
  const lightningBolts = [
    { x: half * 0.3, y: half * 0.1, angle: 35,  length: 80,  color: accent,     opacity: 0.4 },
    { x: half * 1.5, y: half * 1.4, angle: -25, length: 100, color: "#FF2DAA",  opacity: 0.35 },
    { x: half * 0.8, y: half * 1.6, angle: 55,  length: 60,  color: "#FFD700",  opacity: 0.3 },
    { x: half * 1.7, y: half * 0.2, angle: -40, length: 90,  color: "#00E5FF",  opacity: 0.35 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width:  containerSize,
        height: containerSize,
        maxWidth: "100%",
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      {/* Background orbit ring */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left:  half - effectiveRadiusX,
          top:   half - effectiveRadiusY,
          width:  effectiveRadiusX * 2,
          height: effectiveRadiusY * 2,
          border: `1px dashed ${accent}28`,
          borderRadius: "50%",
          boxShadow: `0 0 30px ${accent}18 inset`,
          pointerEvents: "none",
        }}
      />

      {/* Lightning bolts */}
      {lightningBolts.map((b, i) => (
        <LightningBolt key={i} {...b} />
      ))}

      {/* Confetti sparks */}
      {confettiPositions.map((c, i) => (
        <ConfettiSpark key={i} {...c} index={i} containerSize={containerSize} />
      ))}

      {/* Crown center */}
      <CrownPulseCenter genre={genre} holder={holder} size={containerSize} shapeIdentity={shapeIdentity} />
      {holder ? <CenterAuthorityPortrait holder={holder} accent={accent} size={containerSize} /> : null}

      {/* Orbit cards */}
      {orbiters.map((c, orbitIndex) => {
        const rad = (c.orbitAngle * Math.PI) / 180;
        const x   = half + Math.cos(rad) * effectiveRadiusX;
        const y   = half + Math.sin(rad) * effectiveRadiusY;
        return (
          <OrbitCard
            key={c.performerId}
            contender={c}
            x={x}
            y={y}
            accent={accent}
            isCrown={false}
            orbitIndex={orbitIndex}
            shapeIdentity={shapeIdentity}
            renderMode={renderMode}
          />
        );
      })}
    </div>
  );
}
