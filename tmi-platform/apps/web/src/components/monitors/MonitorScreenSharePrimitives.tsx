"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MonitorShareSlot } from "@/lib/monitors/monitorScreenShareTypes";

export function MonitorScreenShareVideo({
  stream,
  onStop,
  label,
}: {
  stream: MediaStream;
  onStop: () => void;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ flex: 1, minHeight: 0, width: "100%", objectFit: "contain", background: "#000" }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          background: "linear-gradient(180deg,rgba(0,0,0,0.75),transparent)",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, pointerEvents: "none" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FF88",
              boxShadow: "0 0 8px #00FF88",
              display: "inline-block",
              animation: "scrSharePulse 1.2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "#00FF88" }}>
            SCREEN SHARE · {label}
          </span>
        </div>
        <button
          type="button"
          onClick={onStop}
          style={{
            pointerEvents: "all",
            background: "rgba(255,68,68,0.85)",
            border: "none",
            borderRadius: 4,
            color: "#fff",
            fontSize: 8,
            fontWeight: 900,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          ✕ STOP
        </button>
      </div>
      <style>{`
        @keyframes scrSharePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}

function SlotButton({
  label,
  active,
  accent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 8px",
        borderRadius: 5,
        border: `1px solid ${active ? accent : "rgba(255,255,255,0.15)"}`,
        background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
        color: active ? accent : "rgba(255,255,255,0.5)",
        fontSize: 9,
        fontWeight: 800,
        cursor: "pointer",
        transition: "all 0.12s",
        minWidth: 28,
        textAlign: "center",
        outline: active ? `1px solid ${accent}55` : "none",
      }}
    >
      {label}
    </button>
  );
}

export function MonitorShareSlotPicker({
  onPick,
  activeSlot,
  onClose,
  hint,
}: {
  onPick: (slot: MonitorShareSlot) => void;
  activeSlot: MonitorShareSlot | null;
  onClose: () => void;
  hint?: string;
}) {
  const monitors: Array<{ label: string; mon: 0 | 1 }> = [
    { label: "MONITOR A", mon: 0 },
    { label: "MONITOR B", mon: 1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 60,
        width: 280,
        background: "#0a0a1e",
        border: "1px solid rgba(0,255,136,0.5)",
        borderRadius: 10,
        padding: 12,
        boxShadow: "0 16px 48px rgba(0,0,0,0.75), 0 0 24px rgba(0,255,136,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00FF88" }}>
          ⬡ ROUTE SCREEN SHARE TO SLOT
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {monitors.map(({ label, mon }) => (
          <div key={mon}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
              {label}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <SlotButton
                label="FULL"
                active={activeSlot?.monitor === mon && activeSlot.cellIndex === -1}
                accent="#00FF88"
                onClick={() => onPick({ monitor: mon, cellIndex: -1 })}
              />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((ci) => (
                <SlotButton
                  key={ci}
                  label={`${ci + 1}`}
                  active={activeSlot?.monitor === mon && activeSlot.cellIndex === ci}
                  accent="#00FFFF"
                  onClick={() => onPick({ monitor: mon, cellIndex: ci })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 8, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
        {hint ??
          `"FULL" routes to the whole monitor. Cell numbers match the split grid. Share uses a free cell — it never replaces the main stage feed above.`}
      </div>
    </motion.div>
  );
}
