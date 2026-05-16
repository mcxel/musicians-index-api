"use client";

// ConfettiField
// Slower, sparser ambient confetti for Home 2 — less intrusive than ConfettiLayer
// Triangular shards + dots drifting at low opacity

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#FF6B35"];

type Piece = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
};

let _id = 0;

function makePiece(): Piece {
  return {
    id: _id++,
    x: Math.random() * 96 + 2,
    y: Math.random() * 96 + 2,
    size: 4 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    rotation: Math.random() * 360,
    duration: 6 + Math.random() * 12,
    delay: Math.random() * 6,
  };
}

type Props = {
  count?: number;
};

export default function ConfettiField({ count = 16 }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(Array.from({ length: count }, makePiece));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -18, 12, 0],
            x: [0, p.size * 1.5, -(p.size), 0],
            rotate: [p.rotation, p.rotation + 90, p.rotation],
            opacity: [0.08, 0.14, 0.08],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? "50%" : 2,
            clipPath: p.id % 3 === 2 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
