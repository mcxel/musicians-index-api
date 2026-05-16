"use client";
import React, { useEffect, useState } from "react";
import type { EliminationRecord } from "@/lib/shows/LiveEliminationEngine";

const ROLE_COLORS = {
  host: "#ffd700",
  performer: "#00ffff",
  danger: "#ef4444",
  dimmed: "#64748b",
};

interface EliminationBannerProps {
  record: EliminationRecord | null;
  onClose: () => void;
}

export function EliminationBanner({ record, onClose }: EliminationBannerProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (record) {
      setVisible(true);
      setExiting(false);

      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onClose();
        }, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [record, onClose]);

  if (!visible || !record) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        animation: exiting ? "fadeOut 0.5s ease forwards" : "fadeIn 0.3s ease forwards",
        fontFamily: "system-ui, sans-serif",
      }}
      onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose(); }, 500); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
      `}</style>

      <div
        style={{
          background: "rgba(2,6,23,0.98)",
          border: "2px solid rgba(239,68,68,0.7)",
          borderRadius: 20,
          padding: "48px 64px",
          textAlign: "center",
          maxWidth: 520,
          width: "90vw",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(239,68,68,0.3), 0 0 160px rgba(239,68,68,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(239,68,68,0.5)",
            animation: "scanLine 2s linear infinite",
          }}
        />

        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>

        <div
          style={{
            fontSize: 13,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: ROLE_COLORS.danger,
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          Eliminated
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#e2e8f0",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          {record.contestantName}
        </div>

        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 15,
            color: "#cbd5e1",
            fontStyle: "italic",
            marginBottom: 24,
          }}
        >
          "{record.broadcastLine}"
        </div>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", fontSize: 12, color: ROLE_COLORS.dimmed }}>
          <span>Round {record.eliminatedInRound}</span>
          <span>Final Score: <strong style={{ color: ROLE_COLORS.performer }}>{record.finalScore.toFixed(1)}</strong></span>
          <span style={{ textTransform: "capitalize" }}>{record.reason.replace(/_/g, " ")}</span>
        </div>

        <button
          onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose(); }, 500); }}
          style={{
            marginTop: 24,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: ROLE_COLORS.danger,
            padding: "8px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
