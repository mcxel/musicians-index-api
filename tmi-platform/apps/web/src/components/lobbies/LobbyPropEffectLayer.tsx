"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLobbyPropDef } from "@/lib/lobby/LobbyPropRegistry";

interface LobbyPropEffectLayerProps {
  propId: string;
  /** Anchor position as a percentage of the room floor. */
  x: number;
  y: number;
}

/**
 * Renders the active prop above an avatar's position. Held props (mic,
 * candle, lighter...) float and pulse for as long as they're active;
 * reaction props (hearts, fire, confetti...) burst upward once and clear -
 * both driven by the same registry entry, no per-prop component.
 */
export function LobbyPropEffectLayer({ propId, x, y }: LobbyPropEffectLayerProps) {
  const def = propId !== "none" ? getLobbyPropDef(propId) : undefined;

  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: 25 }}>
      <AnimatePresence>
        {def && def.effect === "hold" && (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, y: 10, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, y: [-2, -8, -2], scale: 1, rotate: [-6, 6, -6] }}
            exit={{ opacity: 0, y: 10, scale: 0.6 }}
            transition={{ y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }, rotate: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }}
            style={{
              fontSize: 26,
              filter: `drop-shadow(0 0 10px ${def.accent})`,
            }}
          >
            {def.icon}
          </motion.div>
        )}

        {def && def.effect === "burst" && (
          <BurstEffect key={`${def.id}-${x}-${y}`} icon={def.icon} accent={def.accent} />
        )}
      </AnimatePresence>
    </div>
  );
}

function BurstEffect({ icon, accent }: { icon: string; accent: string }) {
  const particles = React.useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      id: i,
      dx: (Math.random() - 0.5) * 70,
      dy: -40 - Math.random() * 50,
      delay: i * 0.04,
      size: 16 + Math.round(Math.random() * 14),
      rotate: (Math.random() - 0.5) * 90,
    })),
    [],
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 1.1, rotate: p.rotate }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontSize: p.size,
            filter: `drop-shadow(0 0 6px ${accent})`,
          }}
        >
          {icon}
        </motion.div>
      ))}
    </>
  );
}
