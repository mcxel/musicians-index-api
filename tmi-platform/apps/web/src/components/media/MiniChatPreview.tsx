"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  { user: "TrapFan99", msg: "YOOO 🔥🔥",         color: "#00C8FF" },
  { user: "WaveTek",   msg: "this beat crazy",    color: "#FF2DAA" },
  { user: "DJ_Nova",   msg: "who's next 🎤",      color: "#FFD700" },
  { user: "AriVolt",   msg: "let's gooo 👏",      color: "#AA2DFF" },
  { user: "RhymeLane", msg: "RUN THAT BACK",      color: "#00C896" },
  { user: "UrbanV",    msg: "front row 🔥",       color: "#FF6B00" },
  { user: "TrapFan99", msg: "no way 😭😭",        color: "#00C8FF" },
  { user: "LexRoyal",  msg: "crown incoming ⚡",  color: "#FFD700" },
];

const REACTIONS = ["🔥", "👏", "💎", "⚡", "🎤", "💯"];

interface MiniChatPreviewProps {
  accentColor?: string;
  speed?: number;
}

interface Burst {
  id: number;
  emoji: string;
  x: number;
}

export default function MiniChatPreview({ accentColor = "#00C8FF", speed = 2800 }: MiniChatPreviewProps) {
  const [offset, setOffset] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setOffset(o => (o + 1) % MESSAGES.length), speed);
    return () => clearInterval(id);
  }, [speed]);

  // Reaction burst every 6–10 seconds
  useEffect(() => {
    function fire() {
      const id = burstId.current++;
      const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!;
      const x = 20 + Math.random() * 60; // % from left
      setBursts(b => [...b, { id, emoji, x }]);
      setTimeout(() => setBursts(b => b.filter(e => e.id !== id)), 1200);
      schedule();
    }
    function schedule() {
      const delay = 6000 + Math.random() * 4000;
      return setTimeout(fire, delay);
    }
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const line1 = MESSAGES[offset % MESSAGES.length]!;
  const line2 = MESSAGES[(offset + 1) % MESSAGES.length]!;

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      marginTop: 6,
      paddingTop: 5,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes miniChatIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes reactionFloat {
          0%   { opacity: 1;   transform: translateY(0)    scale(1); }
          60%  { opacity: 1;   transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0;   transform: translateY(-36px) scale(0.8); }
        }
      `}</style>

      {/* Floating reaction bursts */}
      {bursts.map(b => (
        <div key={b.id} style={{
          position: "absolute",
          bottom: "100%",
          left: `${b.x}%`,
          fontSize: 14,
          animation: "reactionFloat 1.2s ease-out forwards",
          pointerEvents: "none",
          zIndex: 10,
        }}>
          {b.emoji}
        </div>
      ))}

      {[line1, line2].map((line, i) => (
        <div
          key={`${offset}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 8,
            fontFamily: "'Inter',sans-serif",
            animation: i === 0 ? "miniChatIn 0.3s ease-out" : undefined,
            opacity: i === 0 ? 1 : 0.55,
          }}
        >
          <span style={{ color: line.color, fontWeight: 800, flexShrink: 0 }}>{line.user}:</span>
          <span style={{ color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line.msg}</span>
        </div>
      ))}
    </div>
  );
}
