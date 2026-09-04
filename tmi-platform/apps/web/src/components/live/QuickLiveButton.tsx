"use client";

/**
 * QuickLiveButton
 *
 * One click. Immediately live. No setup screens.
 * Uses LiveDestinationRouter + executeInstantGoLive (Launch Dock shared path).
 */

import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { triggerCanonicalGoLive } from "@/lib/dock/presentInstantGoLiveInPlace";
import { loadPersistedLivePrivacy } from "@/lib/live/LiveDestinationRouter";

export type QuickLiveCategory =
  | "live"
  | "battle"
  | "challenge"
  | "cypher"
  | "concert"
  | "dance-party"
  | "release-party"
  | "lounge"
  | "fan-lobby";

type Phase = "idle" | "camera" | "creating" | "live" | "error";

/** Derive broadcast category from the current pathname */
function pathToCategory(pathname: string): QuickLiveCategory {
  const p = pathname.toLowerCase();
  if (/battle/.test(p)) return "battle";
  if (/cypher/.test(p)) return "cypher";
  if (/challenge/.test(p)) return "challenge";
  if (/concert/.test(p)) return "concert";
  if (/dance.?party|world.?dance/.test(p)) return "dance-party";
  if (/release.?party|new.?release|world.?premiere/.test(p)) return "release-party";
  if (/lounge/.test(p)) return "lounge";
  if (/fan.?lobby|fan.?lounge/.test(p)) return "fan-lobby";
  return "live";
}

const CATEGORY_LABELS: Record<QuickLiveCategory, string> = {
  live: "Live Session",
  battle: "Battle",
  challenge: "Challenge",
  cypher: "Cypher",
  concert: "Concert",
  "dance-party": "Dance Party",
  "release-party": "Release Party",
  lounge: "Lounge",
  "fan-lobby": "Fan Lobby",
};

const PHASE_LABELS: Record<Phase, string> = {
  idle: "⚡ QUICK LIVE",
  camera: "📷 OPENING CAMERA…",
  creating: "🔴 STARTING BROADCAST…",
  live: "✅ GOING LIVE…",
  error: "⚠ TRY AGAIN",
};

interface QuickLiveButtonProps {
  /** Override auto-detected category with an explicit one */
  eventCategory?: QuickLiveCategory;
  /** Override display name (falls back to session user name) */
  displayName?: string;
  genre?: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  /** Label override — defaults to "⚡ QUICK LIVE" */
  label?: string;
}

export default function QuickLiveButton({
  eventCategory,
  displayName: displayNameProp,
  accentColor = "#FF2DAA",
  size = "md",
  label,
}: QuickLiveButtonProps) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const category = eventCategory ?? pathToCategory(pathname ?? "");

  const handleQuickLive = useCallback(async () => {
    if (phase !== "idle" && phase !== "error") return;
    setPhase("camera");
    setErrorMsg("");

    setPhase("creating");
    const result = await triggerCanonicalGoLive({
      role: "PERFORMER",
      privacy: loadPersistedLivePrivacy(),
      preferredExperience: category,
      publishSession: true,
    });

    if (!result.ok) {
      setPhase("error");
      setErrorMsg(result.error ?? "Failed to start broadcast.");
      return;
    }

    setPhase("live");
  }, [phase, category, displayNameProp, accentColor, pathname]);

  const sizeStyle: CSSProperties = {
    sm: { padding: "8px 16px", fontSize: 9, borderRadius: 7 },
    md: { padding: "12px 22px", fontSize: 10, borderRadius: 8 },
    lg: { padding: "16px 32px", fontSize: 12, borderRadius: 9 },
  }[size];

  const isIdle = phase === "idle" || phase === "error";
  const isActive = phase !== "idle" && phase !== "error";

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <motion.button
        onClick={handleQuickLive}
        disabled={isActive}
        whileHover={isIdle ? { scale: 1.04, boxShadow: `0 0 28px ${accentColor}88` } : {}}
        whileTap={isIdle ? { scale: 0.97 } : {}}
        style={{
          ...sizeStyle,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: phase === "idle" ? "#050510" : "#fff",
          background: phase === "error"
            ? "rgba(255,68,68,0.15)"
            : isActive
              ? `${accentColor}30`
              : accentColor,
          border: isActive || phase === "error"
            ? `1px solid ${phase === "error" ? "#FF4444" : accentColor}`
            : "none",
          cursor: isActive ? "default" : "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence>
          {isActive && (
            <motion.span
              key="pulse"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                border: `2px solid ${accentColor}`,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {phase === "idle" && (
          <motion.span
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              pointerEvents: "none",
            }}
          />
        )}

        <span style={{ position: "relative", zIndex: 1 }}>
          {label && phase === "idle" ? label : PHASE_LABELS[phase]}
        </span>
      </motion.button>

      {phase === "idle" && (
        <div style={{
          fontSize: 8,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.15em",
          fontWeight: 700,
        }}>
          {CATEGORY_LABELS[category].toUpperCase()} MODE
        </div>
      )}

      <AnimatePresence>
        {phase === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 9, color: "#FF4444", maxWidth: 200, textAlign: "center" }}
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
