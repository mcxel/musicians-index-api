"use client";

/**
 * MixTeleprompterControl — Canonical presentation and composition controls for Teleprompter in MIX.
 *
 * Requirements:
 * - TELEPROMPTER button in Command Controls operates the runtime (input, edit, speed, play/pause).
 * - MIX controls presentation on the workspace (PAD, WORDS ONLY, OVERLAY, FULLSCREEN, MIRROR).
 * - Single script authority (useTeleprompterStore) preserved across all transitions.
 * - Private by default (never broadcasts to audience).
 * - Desktop & Galaxy portrait compatible (compact, zero overflow).
 */

import React, { useState, useRef, useEffect } from "react";
import {
  useTeleprompterStore,
  type TeleprompterPresentationMode,
  type TeleprompterMonitorTarget,
  type TeleprompterOverlayPosition,
} from "@/lib/teleprompter/teleprompterStore";

export default function MixTeleprompterControl() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const presentationMode = useTeleprompterStore((s) => s.presentationMode);
  const setPresentationMode = useTeleprompterStore((s) => s.setPresentationMode);
  const isMirrored = useTeleprompterStore((s) => s.isMirrored);
  const toggleMirror = useTeleprompterStore((s) => s.toggleMirror);
  const targetMonitor = useTeleprompterStore((s) => s.targetMonitor);
  const setTargetMonitor = useTeleprompterStore((s) => s.setTargetMonitor);
  const setIsPadOpen = useTeleprompterStore((s) => s.setIsPadOpen);

  const overlayOpacity = useTeleprompterStore((s) => s.overlayOpacity);
  const setOverlayOpacity = useTeleprompterStore((s) => s.setOverlayOpacity);
  const readingWidthPercent = useTeleprompterStore((s) => s.readingWidthPercent);
  const setReadingWidthPercent = useTeleprompterStore((s) => s.setReadingWidthPercent);
  const overlayPosition = useTeleprompterStore((s) => s.overlayPosition);
  const setOverlayPosition = useTeleprompterStore((s) => s.setOverlayPosition);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeLabel =
    presentationMode === "PAD"
      ? "PAD"
      : presentationMode === "WORDS_ONLY"
      ? "WORDS"
      : presentationMode === "OVERLAY"
      ? "OVERLAY"
      : presentationMode === "FULLSCREEN"
      ? "FULL"
      : "OFF";

  return (
    <div
      ref={menuRef}
      data-testid="mix-teleprompter-control"
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <button
        type="button"
        data-testid="tmi-mix-teleprompter-btn"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.08em",
          padding: "5px 8px",
          borderRadius: 5,
          border: open
            ? "1px solid #FFD700"
            : presentationMode !== "OFF"
            ? "1px solid rgba(0,255,255,0.7)"
            : "1px solid rgba(255,215,0,0.35)",
          background: open
            ? "linear-gradient(180deg, rgba(255,215,0,0.35), rgba(255,215,0,0.15))"
            : presentationMode !== "OFF"
            ? "linear-gradient(180deg, rgba(0,255,255,0.2), rgba(0,255,255,0.05))"
            : "linear-gradient(180deg, #2a3040, #141722)",
          color: presentationMode !== "OFF" ? "#00FFFF" : "#FFD700",
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>📜 PROMPTER:</span>
        <span style={{ color: "#fff", fontWeight: 800 }}>{activeLabel}</span>
        {isMirrored ? <span style={{ color: "#FF2DAA" }}>[M]</span> : null}
      </button>

      {/* MIX Teleprompter Presentation Flyout */}
      {open ? (
        <div
          data-testid="mix-teleprompter-menu"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            right: 0,
            zIndex: 9000,
            width: 260,
            maxWidth: "90vw",
            background: "#080c16",
            border: "1px solid rgba(0, 255, 255, 0.4)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.85), 0 0 16px rgba(0,255,255,0.2)",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#FFD700",
                textTransform: "uppercase",
              }}
            >
              MIX · TELEPROMPTER
            </span>
            <span
              style={{
                fontSize: 8,
                color: "#00FF88",
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              PRIVATE BY DEFAULT
            </span>
          </div>

          {/* Presentation Modes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
              PRESENTATION MODE:
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {/* PAD */}
              <button
                type="button"
                data-testid="mix-prompter-mode-pad"
                onClick={() => {
                  setPresentationMode("PAD");
                  setIsPadOpen(true);
                  setOpen(false);
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 5,
                  border: presentationMode === "PAD" ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.15)",
                  background: presentationMode === "PAD" ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.04)",
                  color: presentationMode === "PAD" ? "#FFD700" : "#ddd",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                📝 PAD
              </button>

              {/* WORDS ONLY */}
              <button
                type="button"
                data-testid="mix-prompter-mode-words"
                onClick={() => {
                  setPresentationMode("WORDS_ONLY");
                  setIsPadOpen(false);
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 5,
                  border: presentationMode === "WORDS_ONLY" ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
                  background: presentationMode === "WORDS_ONLY" ? "rgba(0,255,255,0.25)" : "rgba(255,255,255,0.04)",
                  color: presentationMode === "WORDS_ONLY" ? "#00FFFF" : "#ddd",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                📜 WORDS ONLY
              </button>

              {/* OVERLAY */}
              <button
                type="button"
                data-testid="mix-prompter-mode-overlay"
                onClick={() => {
                  setPresentationMode("OVERLAY");
                  setTargetMonitor("a");
                  setIsPadOpen(false);
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 5,
                  border: presentationMode === "OVERLAY" ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.15)",
                  background: presentationMode === "OVERLAY" ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.04)",
                  color: presentationMode === "OVERLAY" ? "#00FF88" : "#ddd",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                👁️ OVERLAY (CAM)
              </button>

              {/* FULLSCREEN */}
              <button
                type="button"
                data-testid="mix-prompter-mode-fullscreen"
                onClick={() => {
                  setPresentationMode("FULLSCREEN");
                  setOpen(false);
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 5,
                  border: presentationMode === "FULLSCREEN" ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.15)",
                  background: presentationMode === "FULLSCREEN" ? "rgba(255,45,170,0.25)" : "rgba(255,255,255,0.04)",
                  color: presentationMode === "FULLSCREEN" ? "#FF2DAA" : "#ddd",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                ⛶ FULLSCREEN
              </button>
            </div>
          </div>

          {/* Monitor Targeting */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
              TARGET MONITOR:
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <button
                type="button"
                data-testid="mix-prompter-target-a"
                onClick={() => setTargetMonitor("a")}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: targetMonitor === "a" ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
                  background: targetMonitor === "a" ? "rgba(0,255,255,0.2)" : "transparent",
                  color: targetMonitor === "a" ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                MONITOR A {targetMonitor === "a" ? "✓" : ""}
              </button>
              <button
                type="button"
                data-testid="mix-prompter-target-b"
                onClick={() => setTargetMonitor("b")}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: targetMonitor === "b" ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
                  background: targetMonitor === "b" ? "rgba(0,255,255,0.2)" : "transparent",
                  color: targetMonitor === "b" ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                MONITOR B {targetMonitor === "b" ? "✓" : ""}
              </button>
            </div>
          </div>

          {/* Mirror & Overlay Adjustments */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            {/* Mirror Toggle */}
            <button
              type="button"
              data-testid="mix-prompter-toggle-mirror"
              onClick={toggleMirror}
              style={{
                flex: 1,
                fontSize: 8,
                fontWeight: 900,
                padding: "6px 8px",
                borderRadius: 5,
                border: isMirrored ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.2)",
                background: isMirrored ? "rgba(255,45,170,0.25)" : "rgba(255,255,255,0.04)",
                color: isMirrored ? "#FF2DAA" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              🪞 MIRROR: {isMirrored ? "ON" : "OFF"}
            </button>

            {/* Turn Off / Dismiss Presentation */}
            {presentationMode !== "OFF" ? (
              <button
                type="button"
                data-testid="mix-prompter-mode-off"
                onClick={() => setPresentationMode("OFF")}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  padding: "6px 8px",
                  borderRadius: 5,
                  border: "1px solid rgba(255,80,80,0.4)",
                  background: "rgba(255,80,80,0.15)",
                  color: "#FF8080",
                  cursor: "pointer",
                }}
              >
                ✕ HIDE PROMPTER
              </button>
            ) : null}
          </div>

          {/* Composition Details (Scrim & Width) */}
          {presentationMode === "OVERLAY" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "6px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                  OVERLAY SCRIM:
                </span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[0.4, 0.65, 0.85].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOverlayOpacity(op)}
                      style={{
                        fontSize: 7,
                        fontWeight: 800,
                        padding: "2px 5px",
                        borderRadius: 3,
                        border: overlayOpacity === op ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                        background: overlayOpacity === op ? "rgba(0,255,255,0.2)" : "transparent",
                        color: overlayOpacity === op ? "#00FFFF" : "#aaa",
                        cursor: "pointer",
                      }}
                    >
                      {Math.round(op * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                  READING WIDTH:
                </span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[60, 85, 100].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setReadingWidthPercent(w)}
                      style={{
                        fontSize: 7,
                        fontWeight: 800,
                        padding: "2px 5px",
                        borderRadius: 3,
                        border: readingWidthPercent === w ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                        background: readingWidthPercent === w ? "rgba(0,255,255,0.2)" : "transparent",
                        color: readingWidthPercent === w ? "#00FFFF" : "#aaa",
                        cursor: "pointer",
                      }}
                    >
                      {w}%
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                  POSITION:
                </span>
                <div style={{ display: "flex", gap: 3 }}>
                  {(["top", "center", "bottom"] as TeleprompterOverlayPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setOverlayPosition(pos)}
                      style={{
                        fontSize: 7,
                        fontWeight: 800,
                        padding: "2px 5px",
                        borderRadius: 3,
                        border: overlayPosition === pos ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                        background: overlayPosition === pos ? "rgba(0,255,255,0.2)" : "transparent",
                        color: overlayPosition === pos ? "#00FFFF" : "#aaa",
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
