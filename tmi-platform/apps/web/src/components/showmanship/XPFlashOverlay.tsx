"use client";

// Renders FLASH_XP_GAIN actions from MomentOrchestrator.
// Shows a brief "+N XP" burst that floats up and fades.

import { useEffect, useState } from "react";
import { getGlobalOrchestrator } from "@/lib/showmanship/MomentOrchestrator";

interface XPFlash {
  id: number;
  amount: number;
}

let cssInjected = false;
const CSS = `
@keyframes xpFloatUp {
  0%   { opacity: 0;   transform: translateY(0)   scale(0.8); }
  20%  { opacity: 1;   transform: translateY(-8px) scale(1.1); }
  80%  { opacity: 1;   transform: translateY(-28px) scale(1); }
  100% { opacity: 0;   transform: translateY(-44px) scale(0.9); }
}
`;

let _xpId = 0;

export default function XPFlashOverlay() {
  const [flashes, setFlashes] = useState<XPFlash[]>([]);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    const orch = getGlobalOrchestrator();
    const unsub = orch.onAction((action) => {
      if (action.type !== "FLASH_XP_GAIN") return;
      const id = ++_xpId;
      setFlashes(prev => [...prev.slice(-5), { id, amount: action.amount }]);
      setTimeout(() => {
        setFlashes(prev => prev.filter(f => f.id !== id));
      }, 1600);
    });
    return unsub;
  }, []);

  if (flashes.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "12rem",
      right: "2rem",
      zIndex: 8900,
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      alignItems: "flex-end",
    }}>
      {flashes.map((f) => (
        <div
          key={f.id}
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#ffd700",
            textShadow: "0 0 12px rgba(255,215,0,0.6)",
            letterSpacing: "0.05em",
            animation: "xpFloatUp 1.5s ease-out forwards",
          }}
        >
          +{f.amount} XP
        </div>
      ))}
    </div>
  );
}
