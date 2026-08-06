"use client";

/**
 * PointFlightEngine — mount once (CommandCenterShell). Listens for real
 * POINTS_EARNED events (see PointFlightBus — only fired on an observed
 * backend balance increase, never a guessed amount) and plays: badge
 * appears at the source → pauses + pulses so the user registers it →
 * curves into the header wallet counter → counter flashes on landing.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  subscribePointsEarned,
  type PointsEarnedPayload,
} from "@/lib/rewards/PointFlightBus";

const DEFAULT_TARGET_ID = "tmi-header-wallet-counter";
const CURRENCY_ICON: Record<PointsEarnedPayload["currency"], string> = {
  COIN: "🪙",
  XP: "✨",
};
const CURRENCY_COLOR: Record<PointsEarnedPayload["currency"], string> = {
  COIN: "#FFD700",
  XP: "#00FFFF",
};

interface ActiveFlight extends PointsEarnedPayload {
  id: string;
  phase: "pause" | "flight" | "done";
  start: { x: number; y: number };
  end: { x: number; y: number } | null;
}

function elementCenter(el: Element): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export default function PointFlightEngine() {
  const [flights, setFlights] = useState<ActiveFlight[]>([]);
  const [landedFlash, setLandedFlash] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribePointsEarned((payload) => {
      if (typeof window === "undefined") return;
      const id = `flight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const start = payload.originRect
        ? { x: payload.originRect.left + payload.originRect.width / 2, y: payload.originRect.top + payload.originRect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      setFlights((prev) => [...prev, { ...payload, id, phase: "pause", start, end: null }]);

      // Pause & inspect (0.8s), then compute the real target position and fly.
      window.setTimeout(() => {
        const targetEl = document.getElementById(payload.targetId ?? DEFAULT_TARGET_ID);
        const end = targetEl ? elementCenter(targetEl) : start;
        setFlights((prev) => prev.map((f) => (f.id === id ? { ...f, phase: "flight", end } : f)));

        window.setTimeout(() => {
          setFlights((prev) => prev.filter((f) => f.id !== id));
          setLandedFlash(payload.currency);
          window.setTimeout(() => setLandedFlash(null), 500);
        }, 650);
      }, 800);
    });
    return unsub;
  }, []);

  return (
    <>
      <AnimatePresence>
        {flights.map((f) => {
          const color = CURRENCY_COLOR[f.currency];
          const target = f.end ?? f.start;
          return (
            <motion.div
              key={f.id}
              initial={{ x: f.start.x, y: f.start.y, opacity: 0, scale: 0.6 }}
              animate={
                f.phase === "pause"
                  ? { x: f.start.x, y: f.start.y, opacity: 1, scale: 1.15 }
                  : { x: target.x, y: target.y, opacity: [1, 1, 0.4], scale: 0.5 }
              }
              transition={
                f.phase === "pause"
                  ? { duration: 0.3, ease: "backOut" }
                  : { duration: 0.65, ease: [0.3, 0.7, 0.4, 1] }
              }
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 10000,
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(5,5,16,0.92)",
                border: `1px solid ${color}`,
                boxShadow: `0 0 20px ${color}99`,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 15 }}>{CURRENCY_ICON[f.currency]}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color }}>
                +{f.amount.toLocaleString()}
              </span>
              {f.sourceLabel ? (
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{f.sourceLabel}</span>
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {landedFlash ? (
        <motion.div
          key={`flash-${landedFlash}`}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            background: `radial-gradient(circle at var(--tmi-wallet-x,90%) 20px, ${CURRENCY_COLOR[landedFlash as PointsEarnedPayload["currency"]]}22, transparent 15%)`,
          }}
        />
      ) : null}
    </>
  );
}
