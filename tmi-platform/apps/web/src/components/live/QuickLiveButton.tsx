"use client";

/**
 * QuickLiveButton
 *
 * One click. Immediately live. No setup screens.
 *
 * Pipeline (all in background):
 *   1. Request camera + mic (if not already granted)
 *   2. Resolve performer identity from session
 *   3. Create Daily.co room via /api/video/rooms
 *   4. Register in GlobalLiveSessionRegistry via /api/live/go
 *   5. Navigate directly to the live room as performer
 *
 * Context-aware: automatically determines event category from the current
 * page URL, or accepts an explicit eventCategory prop.
 *
 * Rule 21: Quick Live uses the same GoLiveRuntime venue shell as the studio
 * workflow — it just skips the setup wizard entirely.
 */

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  "live":         "Live Session",
  "battle":       "Battle",
  "challenge":    "Challenge",
  "cypher":       "Cypher",
  "concert":      "Concert",
  "dance-party":  "Dance Party",
  "release-party":"Release Party",
  "lounge":       "Lounge",
  "fan-lobby":    "Fan Lobby",
};

const PHASE_LABELS: Record<Phase, string> = {
  idle:     "⚡ QUICK LIVE",
  camera:   "📷 OPENING CAMERA…",
  creating: "🔴 STARTING BROADCAST…",
  live:     "✅ GOING LIVE…",
  error:    "⚠ TRY AGAIN",
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
  genre,
  accentColor = "#FF2DAA",
  size = "md",
  label,
}: QuickLiveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const category = eventCategory ?? pathToCategory(pathname ?? "");

  const handleQuickLive = useCallback(async () => {
    if (phase !== "idle" && phase !== "error") return;
    setPhase("camera");
    setErrorMsg("");

    // ── Step 1: Camera + mic ────────────────────────────────────────────────
    // Non-blocking: if denied, broadcast continues in no-camera mode.
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      // Permission denied or no device — continue without camera
    }

    setPhase("creating");

    // ── Step 2: Resolve performer identity ──────────────────────────────────
    let resolvedName = displayNameProp ?? "Performer";
    try {
      const sess = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      if (sess.ok) {
        const data = await sess.json() as {
          authenticated?: boolean;
          user?: { name?: string; email?: string; id?: string };
        };
        if (data.user?.name) resolvedName = data.user.name;
        else if (data.user?.email) resolvedName = data.user.email.split("@")[0] ?? resolvedName;
      }
    } catch { /* use default */ }

    // ── Step 3: Create Daily.co room ────────────────────────────────────────
    let resolvedRoomId = `room-${resolvedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    let dailyRoomUrl: string | null = null;
    let dailyToken: string | null = null;
    try {
      const roomRes = await fetch("/api/video/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: resolvedName }),
        credentials: "include",
      });
      if (roomRes.ok) {
        const rd = await roomRes.json() as { roomId: string; roomUrl: string; token: string };
        resolvedRoomId = rd.roomId;
        dailyRoomUrl = rd.roomUrl;
        dailyToken = rd.token;
      }
    } catch { /* Daily.co unavailable — registry-only mode */ }

    // ── Step 4: Register live session ───────────────────────────────────────
    try {
      const res = await fetch("/api/live/go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: resolvedName,
          genre: genre ?? CATEGORY_LABELS[category],
          category,
          eventType: `LIVE_${category.toUpperCase().replace(/-/g, "_")}`,
          roomId: resolvedRoomId,
          accentColor,
          ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl } : {}),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setPhase("error");
        setErrorMsg(
          res.status === 401
            ? "Sign in to go live."
            : (err.error ?? "Failed to start broadcast."),
        );
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
    } catch {
      setPhase("error");
      setErrorMsg("Network error. Check your connection.");
      stream?.getTracks().forEach((t) => t.stop());
      return;
    }

    setPhase("live");

    // ── Step 5: Navigate directly to the live room as performer ────────────
    // Passes all context so GoLiveRuntime can initialize without setup wizard.
    const params = new URLSearchParams({
      mode: "performer",
      category,
      auto: "true",
      ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl } : {}),
      ...(dailyToken ? { token: dailyToken } : {}),
    });
    router.push(`/live/rooms/${resolvedRoomId}?${params.toString()}`);
  }, [phase, category, displayNameProp, genre, accentColor, router]);

  // ── Size presets ────────────────────────────────────────────────────────────
  const sizeStyle: React.CSSProperties = {
    sm: { padding: "8px 16px",  fontSize: 9,  borderRadius: 7 },
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
        {/* Pulse ring when active */}
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

        {/* Shimmer sweep when idle */}
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

      {/* Category badge */}
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

      {/* Error message */}
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

      <style>{`
        @keyframes qlBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
