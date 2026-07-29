"use client";

/**
 * LaunchDock — non-modal floating side panel (inspiration mode).
 * Configure destination / privacy / cam-mic while watching something else.
 * Collapsible pill · Ready pulse · GO LIVE executes instantly (no wizard).
 * Does not magnetize Overseer rails.
 */

import { useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLaunchDock } from "@/lib/dock/launchDockStore";
import { executeInstantGoLive } from "@/lib/dock/executeInstantGoLive";
import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import { resolveLiveDestination } from "@/lib/live/LiveDestinationRouter";

const PRIVACY_OPTIONS: { id: LivePrivacy; label: string; hint: string }[] = [
  { id: "public", label: "Public", hint: "Lobby wall" },
  { id: "friends", label: "Friends", hint: "Friends only" },
  { id: "invite", label: "Invite", hint: "Invite link" },
  { id: "private", label: "Private", hint: "Rehearsal" },
];

const EXPERIENCE_OPTIONS = [
  { id: "live", label: "Live Stage" },
  { id: "concert", label: "Concert" },
  { id: "lounge", label: "Lounge" },
  { id: "dance-party", label: "Dance Party" },
];

export default function LaunchDock() {
  const router = useRouter();
  const dock = useLaunchDock();

  // Hydrate role from session once when opened
  useEffect(() => {
    if (!dock.isOpen) return;
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user?: { role?: string } }) => {
        if (cancelled) return;
        if (data.user?.role) dock.setRole(data.user.role);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dock.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const preview = resolveLiveDestination({
    role: dock.role,
    privacy: dock.privacy,
    preferredExperience: dock.preferredExperience,
  });

  const requestMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      dock.setCamReady(true);
      dock.setMicReady(true);
      dock.markReady(true);
    } catch {
      // Mark ready anyway — launch continues without devices (honest no-cam mode)
      dock.setCamReady(false);
      dock.setMicReady(false);
      dock.markReady(true);
    }
  }, [dock]);

  const handleGoLive = useCallback(async () => {
    if (dock.phase === "launching") return;
    if (!dock.isReady) {
      await requestMedia();
    }
    const result = await executeInstantGoLive({
      role: dock.role,
      privacy: dock.privacy,
      preferredExperience: dock.preferredExperience,
    });
    if (result.ok && result.href) {
      router.push(result.href);
      return;
    }
  }, [dock, requestMedia, router]);

  // Collapsed pill
  if (dock.isOpen && dock.collapsed) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => dock.expand()}
        title="Open Launch Dock"
        style={{
          position: "fixed",
          right: 16,
          top: "42%",
          zIndex: 9400,
          pointerEvents: "auto",
          padding: "10px 12px",
          borderRadius: 14,
          border: dock.isReady
            ? "1.5px solid rgba(255,45,170,0.85)"
            : "1px solid rgba(255,255,255,0.2)",
          background: "rgba(8,6,20,0.92)",
          color: "#FF2DAA",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.1em",
          cursor: "pointer",
          boxShadow: dock.isReady ? "0 0 18px rgba(255,45,170,0.45)" : "0 8px 24px rgba(0,0,0,0.5)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {dock.isReady ? "● READY" : "🚀 LAUNCH"}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {dock.isOpen && !dock.collapsed && (
        <motion.aside
          key="launch-dock"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            right: 16,
            top: 96,
            bottom: 100,
            width: 300,
            maxHeight: "calc(100vh - 200px)",
            zIndex: 9400,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            background: "rgba(8,6,20,0.94)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,45,170,0.35)",
            borderRadius: 16,
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.7), 0 0 28px rgba(255,45,170,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
            color: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
              LAUNCH DOCK
            </span>
            {dock.isReady && (
              <motion.span
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  color: "#00FF88",
                  letterSpacing: "0.1em",
                  marginLeft: 4,
                }}
              >
                READY
              </motion.span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => dock.collapse()}
                style={iconBtn}
                title="Collapse"
              >
                ›
              </button>
              <button type="button" onClick={() => dock.close()} style={iconBtn} title="Close">
                ✕
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
              Configure while you watch. Press GO LIVE — no wizard after.
            </p>

            {/* Privacy */}
            <section>
              <div style={sectionLabel}>PRIVACY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {PRIVACY_OPTIONS.map((opt) => {
                  const active = dock.privacy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => dock.setPrivacy(opt.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: active ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.12)",
                        background: active ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.04)",
                        color: active ? "#fff" : "rgba(255,255,255,0.65)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 800 }}>{opt.label}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{opt.hint}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Destination (performer experiences; fans ignore — router forces lobby) */}
            <section>
              <div style={sectionLabel}>DESTINATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const active = dock.preferredExperience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => dock.setPreferredExperience(opt.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: active ? "1px solid rgba(0,255,255,0.55)" : "1px solid rgba(255,255,255,0.1)",
                        background: active ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.03)",
                        color: active ? "#00FFFF" : "rgba(255,255,255,0.7)",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                Lands on: <span style={{ color: "#FFD700" }}>{preview.label}</span>
              </div>
            </section>

            {/* Cam / Mic readiness */}
            <section>
              <div style={sectionLabel}>CAMERA · MIC</div>
              <button
                type="button"
                onClick={() => void requestMedia()}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,255,136,0.35)",
                  background: dock.camReady || dock.micReady ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                  color: dock.camReady ? "#00FF88" : "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {dock.camReady && dock.micReady
                  ? "✓ Cam + Mic ready"
                  : dock.isReady
                    ? "Continue without devices"
                    : "Enable cam + mic"}
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={dock.markedReady}
                  onChange={(e) => dock.markReady(e.target.checked)}
                />
                Mark Ready (one-button GO LIVE)
              </label>
            </section>

            {dock.phase === "error" && dock.errorMsg && (
              <div style={{ fontSize: 10, color: "#FF4444" }}>{dock.errorMsg}</div>
            )}
          </div>

          {/* GO LIVE */}
          <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <motion.button
              type="button"
              onClick={() => void handleGoLive()}
              disabled={dock.phase === "launching"}
              whileHover={dock.phase !== "launching" ? { scale: 1.02 } : {}}
              whileTap={dock.phase !== "launching" ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                background: dock.isReady
                  ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)"
                  : "linear-gradient(135deg,rgba(255,45,170,0.55),rgba(170,45,255,0.55))",
                color: "#fff",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.14em",
                cursor: dock.phase === "launching" ? "default" : "pointer",
                boxShadow: dock.isReady ? "0 0 24px rgba(255,45,170,0.45)" : "none",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {dock.isReady && dock.phase !== "launching" && (
                <motion.span
                  animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    border: "2px solid #FF2DAA",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>
                {dock.phase === "launching" ? "● GOING LIVE…" : "🔴 GO LIVE"}
              </span>
            </motion.button>
            <div style={{ marginTop: 6, fontSize: 8, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              {preview.flags.fanLobby
                ? "Fan path → Avatar Lobby"
                : preview.flags.emptyStage
                  ? "Stage opens empty · 0 watching until real fans arrive"
                  : preview.label}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const sectionLabel: CSSProperties = {
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 6,
};

const iconBtn: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 900,
};
