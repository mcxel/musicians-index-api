"use client";

// ConfettiLayer — triangular shards + drifting particles with optional burst
// Used as an ambient background energy layer on Home 1 and Home 2

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

type Shard = {
  id: number;
  x: number;         // 0-100 vw %
  size: number;      // px
  color: string;
  rotation: number;
  driftX: number;    // drift range px
  duration: number;  // float duration s
  delay: number;
  shape: "triangle" | "rect" | "dot";
};

const COLORS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#FF6B35", "#00FF88"];

function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]!; }
function randomBetween(min: number, max: number) { return min + Math.random() * (max - min); }

function buildShard(id: number): Shard {
  return {
    id,
    x: randomBetween(2, 98),
    size: randomBetween(4, 10),
    color: randomColor(),
    rotation: randomBetween(0, 360),
    driftX: randomBetween(-18, 18),
    duration: randomBetween(5.5, 14),
    delay: randomBetween(0, 8),
    shape: (["triangle", "rect", "dot"] as const)[Math.floor(Math.random() * 3)]!,
  };
}

const TRIANGLE_CLIP = "polygon(50% 0%, 0% 100%, 100% 100%)";

function ShardItem({ s }: { s: Shard }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: "-12px",
        left: `${s.x}%`,
        width: s.size,
        height: s.size,
        background: s.color,
        borderRadius: s.shape === "dot" ? "50%" : s.shape === "triangle" ? 0 : 2,
        clipPath: s.shape === "triangle" ? TRIANGLE_CLIP : undefined,
        pointerEvents: "none",
      }}
      initial={{ rotate: `${s.rotation}deg`, x: "0px", y: "0px", opacity: 0 }}
      animate={{
        y: ["0px", "1600px"],
        x: ["0px", `${s.driftX}px`],
        rotate: [`${s.rotation}deg`, `${s.rotation + 180}deg`],
        opacity: [0, 0.14, 0.10, 0],
      }}
      transition={{
        duration: s.duration,
        delay: s.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

type Props = {
  count?: number;
  burst?: boolean;     // one-shot burst event
  className?: string;
  style?: React.CSSProperties;
};

export default function ConfettiLayer({ count = 22, burst = false, style }: Props) {
  const [shards, setShards] = useState<Shard[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    setShards(Array.from({ length: count }, () => buildShard(idRef.current++)));
  }, [count]);

  useEffect(() => {
    if (!burst) return;
    const extra = Array.from({ length: 14 }, () =>
      buildShard(idRef.current++)
    ).map((s) => ({ ...s, delay: randomBetween(0, 0.6), opacity: 0.32, duration: randomBetween(2.5, 4.5) }));
    setShards((prev) => [...prev, ...extra]);
    const t = setTimeout(() => {
      setShards((prev) => prev.slice(0, count));
    }, 5000);
    return () => clearTimeout(t);
  }, [burst, count]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
        ...style,
      }}
    >
      {shards.map((s) => <ShardItem key={s.id} s={s} />)}
    </div>
  );
}
