"use client";

// Renders SHOW_SOCIAL_PROOF actions dispatched by MomentOrchestrator.
// Floats above everything as ephemeral toast notifications — right side, stacked upward.

import { useEffect, useState } from "react";
import { getGlobalOrchestrator } from "@/lib/showmanship/MomentOrchestrator";

interface Toast {
  id: number;
  message: string;
}

let cssInjected = false;
const CSS = `
@keyframes momentToastIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes momentToastOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(20px) scale(0.95); }
}
`;

let _id = 0;

export default function MomentFeedOverlay() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    const orch = getGlobalOrchestrator();
    const unsub = orch.onAction((action) => {
      if (action.type !== "SHOW_SOCIAL_PROOF") return;
      const id = ++_id;
      setToasts(prev => [...prev.slice(-4), { id, message: action.message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4200);
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "9rem",
      right: "1.5rem",
      zIndex: 8800,
      display: "flex",
      flexDirection: "column-reverse",
      gap: 6,
      pointerEvents: "none",
      alignItems: "flex-end",
    }}>
      {toasts.map((t, i) => (
        <div
          key={t.id}
          style={{
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 11,
            color: "rgba(255,255,255,0.8)",
            fontWeight: 700,
            maxWidth: 220,
            textAlign: "right",
            animation: `momentToastIn 0.3s ease-out`,
            opacity: 1 - i * 0.15,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
