"use client";
import { motion } from "framer-motion";
import type { AvatarPresenceState, AvatarIdentity } from "@/systems/avatar";
import { getCostumeById } from "@/systems/avatar";

export interface AvatarCostumeLayerProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}

const SLOT_EMOJI: Record<string, string> = {
  hat:       "🎩",
  glasses:   "🕶️",
  jacket:    "🥼",
  shirt:     "👕",
  pants:     "👖",
  shoes:     "👟",
  chain:     "📿",
  accessory: "💍",
};

const SLOT_COLOR: Record<string, string> = {
  hat:       "#FFD700",
  glasses:   "#00FFFF",
  jacket:    "#AA2DFF",
  shirt:     "#FF2DAA",
  pants:     "#4444AA",
  shoes:     "#888888",
  chain:     "#FFD700",
  accessory: "#00FF88",
};

const SLOT_POSITION: Record<string, { top: string; left: string }> = {
  hat:       { top: "2%",  left: "50%" },
  glasses:   { top: "18%", left: "50%" },
  jacket:    { top: "38%", left: "50%" },
  shirt:     { top: "40%", left: "50%" },
  pants:     { top: "62%", left: "50%" },
  shoes:     { top: "82%", left: "50%" },
  chain:     { top: "32%", left: "50%" },
  accessory: { top: "28%", left: "62%" },
};

const TIER_BADGE: Record<string, string> = {
  starter:     "",
  rising:      "✦",
  established: "✦✦",
  featured:    "✦✦✦",
  legendary:   "👑",
};

export function AvatarCostumeLayer({ identity, presence, className = "" }: AvatarCostumeLayerProps) {
  const costume = getCostumeById(identity.costumeId);
  if (!costume) return null;

  const isHyped = presence.currentExpression === "hyped" || presence.currentExpression === "excited";
  const tierBadge = TIER_BADGE[identity.tier] ?? "";

  return (
    <div
      className={`avatar-layer avatar-costume-layer ${className}`}
      data-avatar-id={identity.id}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Costume items */}
      {costume.items.map((item, i) => {
        const emoji = SLOT_EMOJI[item.slot] ?? "👔";
        const color = SLOT_COLOR[item.slot] ?? "#888";
        const pos = SLOT_POSITION[item.slot] ?? { top: "50%", left: "50%" };
        const shouldAnimate = item.animated || isHyped;

        return (
          <motion.div
            key={item.slot}
            animate={
              shouldAnimate
                ? { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              transform: "translateX(-50%)",
              fontSize: 13,
              lineHeight: 1,
              filter: item.animated
                ? `drop-shadow(0 0 4px ${color}99)`
                : "none",
              opacity: 0.9,
              zIndex: 8,
            }}
            title={`${item.label} (${item.slot})`}
          >
            {emoji}
          </motion.div>
        );
      })}

      {/* Tier badge overlay */}
      {tierBadge && (
        <div
          style={{
            position: "absolute",
            top: "6%",
            right: "4%",
            fontSize: 10,
            color: "#FFD700",
            textShadow: "0 0 6px #FFD70088",
            zIndex: 12,
          }}
        >
          {tierBadge}
        </div>
      )}

      {/* Costume label chip */}
      <div
        style={{
          position: "absolute",
          bottom: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 7,
          color: "rgba(255,255,255,0.45)",
          whiteSpace: "nowrap",
          background: "rgba(0,0,0,0.5)",
          padding: "1px 5px",
          borderRadius: 4,
          zIndex: 12,
        }}
      >
        {costume.label}
      </div>
    </div>
  );
}

export default AvatarCostumeLayer;
