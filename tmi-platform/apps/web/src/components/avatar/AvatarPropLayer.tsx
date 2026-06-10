"use client";
import { motion } from "framer-motion";
import type { AvatarPresenceState, AvatarIdentity } from "@/systems/avatar";
import { getPropById } from "@/systems/avatar";

export interface AvatarPropLayerProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}

const PROP_EMOJI: Record<string, { emoji: string; color: string }> = {
  "mic-standard":    { emoji: "🎙️", color: "#00FFFF" },
  "mic-wireless":    { emoji: "🎤", color: "#00FFFF" },
  "mic-golden":      { emoji: "🎤", color: "#FFD700" },
  "guitar-electric": { emoji: "🎸", color: "#FF2DAA" },
  "guitar-acoustic": { emoji: "🎸", color: "#AA7722" },
  "dj-headphones":   { emoji: "🎧", color: "#AA2DFF" },
  "sign-fan":        { emoji: "📋", color: "#00FFFF" },
  "sign-glowing":    { emoji: "✨", color: "#FFD700" },
  "glow-stick":      { emoji: "🟢", color: "#00FF88" },
  "glow-wristband":  { emoji: "💚", color: "#00FF88" },
  "trophy":          { emoji: "🏆", color: "#FFD700" },
  "confetti-cannon": { emoji: "🎉", color: "#FF2DAA" },
};

const HOLD_POSITION: Record<string, { top: string; left?: string; right?: string; rotate?: number }> = {
  "right-hand":    { top: "62%", right: "4%" },
  "left-hand":     { top: "62%", left: "4%" },
  "both-hands":    { top: "55%", left: "50%", rotate: -15 },
  "overhead":      { top: "4%",  left: "50%" },
  "body":          { top: "38%", left: "50%" },
};

export function AvatarPropLayer({ identity, presence, className = "" }: AvatarPropLayerProps) {
  if (!identity.propIds?.length) return null;

  const props = identity.propIds
    .map((id) => ({ def: getPropById(id), id }))
    .filter((p) => p.def !== undefined);

  const isActive = presence.isActive;
  const isReacting = presence.isReacting;

  return (
    <div
      className={`avatar-layer avatar-prop-layer ${className}`}
      data-avatar-id={identity.id}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {props.map(({ def, id }, i) => {
        if (!def) return null;
        const visual = PROP_EMOJI[id] ?? { emoji: "🎁", color: "#FFD700" };
        const pos = HOLD_POSITION[def.holdSlot] ?? HOLD_POSITION["right-hand"];
        const shouldGlow = def.glowEffect && isActive;
        const shouldAnimate = def.animated || isReacting;

        return (
          <motion.div
            key={id}
            animate={
              shouldAnimate
                ? { y: [0, -3, 0], scale: [1, 1.08, 1] }
                : shouldGlow
                ? { opacity: [0.8, 1, 0.8] }
                : {}
            }
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: `translateX(-50%) rotate(${pos.rotate ?? 0}deg)`,
              fontSize: 18,
              lineHeight: 1,
              filter: shouldGlow
                ? `drop-shadow(0 0 6px ${visual.color}) drop-shadow(0 0 12px ${visual.color}88)`
                : "none",
              zIndex: 10,
            }}
            title={def.label}
          >
            {visual.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}

export default AvatarPropLayer;
