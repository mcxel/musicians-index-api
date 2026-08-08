"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLobbyPropDef } from "@/lib/lobby/LobbyPropRegistry";
import { getFanCosmetic, type PropAnimKind } from "@/lib/avatars/FanCosmeticCatalog";

interface LobbyPropEffectLayerProps {
  propId: string;
  x: number;
  y: number;
}

/**
 * Animated prop FX above avatar floor position — flame flicker, sparkler particles,
 * hold bob. Couples with LobbyPropAtmosphere for room wash.
 */
export function LobbyPropEffectLayer({ propId, x, y }: LobbyPropEffectLayerProps) {
  const lobby = propId !== "none" ? getLobbyPropDef(propId) : undefined;
  const cosmetic = propId !== "none" ? getFanCosmetic(propId) : undefined;
  const icon = cosmetic?.icon ?? lobby?.icon;
  const accent = cosmetic?.accent ?? lobby?.accent ?? "#FFD700";
  const effect = lobby?.effect ?? (cosmetic?.slot === "hand" ? "hold" : "burst");
  const anim: PropAnimKind = cosmetic?.animKind ?? (effect === "hold" ? "hold_bob" : "none");

  if (!icon) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -100%)",
        pointerEvents: "none",
        zIndex: 25,
      }}
    >
      <AnimatePresence>
        {effect === "hold" && (
          <motion.div
            key={`hold-${propId}`}
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: anim === "flame_flicker" || anim === "candle_glow" ? [-4, -10, -4] : [-2, -8, -2],
              scale: anim === "flame_flicker" ? [0.95, 1.15, 0.9, 1.1] : 1,
              rotate: [-6, 6, -6],
            }}
            exit={{ opacity: 0, y: 10, scale: 0.6 }}
            transition={{
              y: { repeat: Infinity, duration: anim.includes("flame") || anim === "candle_glow" ? 0.45 : 1.6, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 0.35, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
            }}
            style={{
              fontSize: 28,
              filter: `drop-shadow(0 0 14px ${accent})`,
              position: "relative",
            }}
          >
            {icon}
            {(anim === "flame_flicker" || anim === "candle_glow" || anim === "sparkler_burst" || anim === "glow_pulse") && (
              <motion.div
                aria-hidden
                animate={{
                  opacity: [0.35, 0.85, 0.4],
                  scale: [0.8, 1.4, 0.9],
                }}
                transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "40%",
                  width: 48,
                  height: 48,
                  marginLeft: -24,
                  marginTop: -24,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}aa 0%, transparent 70%)`,
                  zIndex: -1,
                }}
              />
            )}
            {anim === "sparkler_burst" && (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{
                      x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i * 6)],
                      y: [0, -18 - i * 8],
                      opacity: [1, 0],
                      scale: [0.6, 1.2],
                    }}
                    transition={{ repeat: Infinity, duration: 0.7 + i * 0.1, delay: i * 0.08 }}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: 0,
                      fontSize: 10,
                      color: accent,
                    }}
                  >
                    ✦
                  </motion.span>
                ))}
              </>
            )}
          </motion.div>
        )}

        {effect === "burst" && (
          <BurstEffect key={`${propId}-${x}-${y}`} icon={icon} accent={accent} />
        )}
      </AnimatePresence>
    </div>
  );
}

function BurstEffect({ icon, accent }: { icon: string; accent: string }) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
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
