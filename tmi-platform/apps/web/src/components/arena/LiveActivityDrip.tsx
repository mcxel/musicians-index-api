"use client";

import { useEffect, useRef, useState } from "react";

interface ActivityItem {
  id: number;
  text: string;
  color: string;
  icon: string;
}

const DRIP_MESSAGES = [
  { text: "just joined the room",     color: "#00e5ff", icon: "👤" },
  { text: "$1 tip just landed",       color: "#ffd700", icon: "💸" },
  { text: "reacted with 🔥",          color: "#ff6b35", icon: "🔥" },
  { text: "claimed a spotlight",      color: "#ff00ff", icon: "🎤" },
  { text: "$5 tip just landed",       color: "#ffd700", icon: "💸" },
  { text: "voted on the battle",      color: "#00e5ff", icon: "⚡" },
  { text: "earned a badge",           color: "#9b59b6", icon: "🏅" },
  { text: "joined the crowd",         color: "#00e5ff", icon: "🙌" },
  { text: "reacted with ❤️",          color: "#ff2d7f", icon: "❤️" },
  { text: "3 fans just tipped 🔥",    color: "#ffd700", icon: "💰" },
];

const NAMES = [
  "Nova_K", "WaveFan", "BeatLover", "ArenaRider", "UrbanSoul",
  "TrapFan99", "CypherBoi", "VibeCatcher", "RoomKing", "FlowMaster",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function LiveActivityDrip({ intervalMs = 9000 }: { intervalMs?: number }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    // Stagger first drip 4–8s after mount to feel natural
    const firstDelay = 4000 + Math.random() * 4000;

    function addItem() {
      const msg = pick(DRIP_MESSAGES);
      const name = pick(NAMES);
      const item: ActivityItem = {
        id: counter.current++,
        text: `${name} ${msg.text}`,
        color: msg.color,
        icon: msg.icon,
      };
      setItems(prev => [...prev.slice(-4), item]); // keep max 5 visible
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== item.id));
      }, 4500);
    }

    const first = setTimeout(() => {
      addItem();
      const interval = setInterval(addItem, intervalMs + Math.random() * 5000);
      return () => clearInterval(interval);
    }, firstDelay);

    return () => clearTimeout(first);
  }, [intervalMs]);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5rem",
        left: "1.5rem",
        zIndex: 8000,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      {items.map(item => (
        <div
          key={item.id}
          style={{
            background: "rgba(0,0,0,0.78)",
            border: `1px solid ${item.color}33`,
            borderRadius: 20,
            padding: "6px 12px",
            fontSize: 11,
            color: "#ccc",
            display: "flex",
            alignItems: "center",
            gap: 6,
            animation: "drip-fade-in 0.35s ease",
            backdropFilter: "blur(4px)",
          }}
        >
          <span>{item.icon}</span>
          <span>
            <strong style={{ color: item.color }}>{item.text.split(" ")[0]}</strong>
            {" " + item.text.split(" ").slice(1).join(" ")}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes drip-fade-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
