"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  xp: number;
  reason: string;
  onDismiss: () => void;
  autoCloseMs?: number;
}

export default function XPToast({ xp, reason, onDismiss, autoCloseMs = 3500 }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, autoCloseMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onDismiss, autoCloseMs]);

  const content = (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        bottom: 28,
        right: 24,
        zIndex: 99999,
        cursor: "pointer",
        animation: "xpSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "rgba(8,8,24,0.97)",
        border: "1.5px solid rgba(170,45,255,0.5)",
        borderRadius: 14,
        padding: "14px 20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 30px rgba(170,45,255,0.25)",
        backdropFilter: "blur(12px)",
        minWidth: 240,
      }}>
        {/* XP orb */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "radial-gradient(circle, #AA2DFF 0%, rgba(170,45,255,0.2) 70%)",
          border: "1.5px solid rgba(170,45,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 16px rgba(170,45,255,0.5)",
          animation: "xpOrb 1s ease-in-out infinite alternate",
        }}>
          <span style={{ fontSize: 20 }}>⭐</span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#AA2DFF", lineHeight: 1 }}>
            +{xp.toLocaleString()} XP
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3, lineHeight: 1.3 }}>
            {reason}
          </div>
        </div>
        {/* Close hint */}
        <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>✕</div>
      </div>

      <style>{`
        @keyframes xpSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.85); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes xpOrb {
          from { box-shadow: 0 0 12px rgba(170,45,255,0.4); }
          to   { box-shadow: 0 0 24px rgba(170,45,255,0.8); }
        }
      `}</style>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
