"use client";

import { useEffect, useState } from "react";

interface RewardNotificationProps {
  show: boolean;
  points: number;
  reason: string;
  onDismiss: () => void;
}

export default function RewardNotification({ show, points, reason, onDismiss }: RewardNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
        animation: "slideIn 0.4s ease-out",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #00FF88 0%, #00FFFF 100%)",
          borderRadius: 12,
          padding: "24px 32px",
          boxShadow: "0 0 40px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,255,0.2)",
          textAlign: "center",
          minWidth: 280,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#050510", marginBottom: 8 }}>🎉 Reward Earned!</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#050510", marginBottom: 4 }}>{points} Points</div>
        <div style={{ fontSize: 11, color: "rgba(5,5,16,0.7)" }}>{reason}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
