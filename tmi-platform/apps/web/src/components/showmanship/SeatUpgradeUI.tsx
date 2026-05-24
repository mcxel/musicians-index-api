"use client";

import { useCallback, useEffect, useState } from "react";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import {
  previewUpgrade,
  executeUpgrade,
  getGlideDurationMs,
  type SeatUpgradePreview,
} from "@/lib/showmanship/SeatUpgradeEngine";
import { getGlobalOrchestrator } from "@/lib/showmanship/MomentOrchestrator";

interface SeatUpgradeUIProps {
  currentTier: TmiSeatTier;
  userPoints: number;
  onUpgrade?: (newTier: TmiSeatTier, remainingPoints: number) => void;
  pressureLabel?: string; // overridden by orchestrator when momentum is high
}

type Phase = "idle" | "preview" | "gliding" | "done" | "error";

let cssInjected = false;
const CSS = `
@keyframes upgradeGlow {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,0); }
  50%      { box-shadow: 0 0 0 8px rgba(0,229,255,0.3); }
}
@keyframes upgradePulse {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
@keyframes cameraGlide {
  from { filter: blur(4px) brightness(0.6); }
  to   { filter: blur(0) brightness(1); }
}
`;

export default function SeatUpgradeUI({ currentTier, userPoints, onUpgrade, pressureLabel }: SeatUpgradeUIProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<SeatUpgradePreview | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pulsing, setPulsing] = useState(false);
  const [dynamicLabel, setDynamicLabel] = useState<string | null>(null);

  // Subscribe to orchestrator for pulse + pressure label actions
  useEffect(() => {
    const orch = getGlobalOrchestrator();
    const unsub = orch.onAction((action) => {
      if (action.type === "PULSE_SEAT_UPGRADE") {
        setPulsing(true);
        setDynamicLabel(action.label);
        setTimeout(() => { setPulsing(false); setDynamicLabel(null); }, 6000);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    setPhase("idle");
    setPreview(null);
  }, [currentTier]);

  const handleMoveCloser = useCallback(() => {
    const p = previewUpgrade(currentTier, userPoints);
    if (!p) return;
    setPreview(p);
    setPhase("preview");
  }, [currentTier, userPoints]);

  const handleConfirm = useCallback(() => {
    if (!preview) return;
    const result = executeUpgrade("local-user", currentTier, userPoints);
    if (!result.success) {
      setErrorMsg(result.error ?? "Upgrade failed");
      setPhase("error");
      setTimeout(() => setPhase("idle"), 3000);
      return;
    }
    const glideDuration = getGlideDurationMs(currentTier, result.newTier);
    setPhase("gliding");
    getGlobalOrchestrator().notifySeatUpgrade("local-user");
    setTimeout(() => {
      setPhase("done");
      onUpgrade?.(result.newTier, result.remainingPoints);
      setTimeout(() => setPhase("idle"), 2000);
    }, glideDuration);
  }, [preview, currentTier, userPoints, onUpgrade]);

  const handleCancel = useCallback(() => {
    setPhase("idle");
    setPreview(null);
  }, []);

  if (currentTier === "sponsor-vip-front-glow") return null;

  if (phase === "gliding") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9500, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(0,229,255,0.12), transparent 70%)",
        animation: "cameraGlide 0.8s ease-out forwards",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "#00e5ff", fontSize: 12, fontWeight: 900, letterSpacing: "0.3em" }}>
          MOVING CLOSER…
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{
        position: "fixed", bottom: "8rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 9200, background: "rgba(0,0,0,0.9)",
        border: "1px solid rgba(0,229,255,0.4)", borderRadius: 10,
        padding: "12px 24px", color: "#00e5ff", fontSize: 13, fontWeight: 900,
        letterSpacing: "0.15em",
      }}>
        🎉 Seat Upgraded — {preview?.toPerspective.label}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{
        position: "fixed", bottom: "8rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 9200, background: "rgba(0,0,0,0.9)",
        border: "1px solid rgba(255,50,50,0.4)", borderRadius: 10,
        padding: "12px 24px", color: "#ff5555", fontSize: 12, fontWeight: 700,
      }}>
        {errorMsg}
      </div>
    );
  }

  if (phase === "preview" && preview) {
    return (
      <div style={{
        position: "fixed", bottom: "6rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 9200, background: "rgba(0,0,0,0.95)",
        border: "1px solid rgba(0,229,255,0.35)", borderRadius: 12,
        padding: "16px 20px", minWidth: 280, maxWidth: "90vw",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        animation: "upgradeGlow 2s ease-in-out infinite",
      }}>
        <div style={{ fontSize: 9, color: "rgba(0,229,255,0.6)", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 10 }}>
          SEAT UPGRADE PREVIEW
        </div>

        {/* Before / after */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>NOW</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{preview.fromPerspective.label}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>
              {preview.fromPerspective.section}
            </div>
          </div>
          <div style={{ color: "#00e5ff", fontSize: 16 }}>→</div>
          <div style={{ flex: 1, background: "rgba(0,229,255,0.06)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(0,229,255,0.2)" }}>
            <div style={{ fontSize: 9, color: "rgba(0,229,255,0.5)", marginBottom: 4 }}>UPGRADE</div>
            <div style={{ color: "#00e5ff", fontWeight: 900, fontSize: 13 }}>{preview.toPerspective.label}</div>
            <div style={{ color: "rgba(0,229,255,0.5)", fontSize: 10, marginTop: 2 }}>
              {preview.toPerspective.section}
            </div>
          </div>
        </div>

        {/* Cost */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 11 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Cost</span>
          <span style={{ color: preview.canAfford ? "#ffd700" : "#ff5555", fontWeight: 900 }}>
            {preview.cost.toLocaleString()} pts
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 11 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Your Balance</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
            {userPoints.toLocaleString()} pts
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleConfirm}
            disabled={!preview.canAfford}
            style={{
              flex: 2, padding: "10px 0", fontWeight: 900, fontSize: 11,
              letterSpacing: "0.1em", cursor: preview.canAfford ? "pointer" : "not-allowed",
              background: preview.canAfford ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${preview.canAfford ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, color: preview.canAfford ? "#00e5ff" : "rgba(255,255,255,0.3)",
              animation: preview.canAfford ? "upgradePulse 2s ease-in-out infinite" : undefined,
            }}
          >
            Confirm — Move Closer
          </button>
          <button
            onClick={handleCancel}
            style={{
              flex: 1, padding: "10px 0", fontWeight: 800, fontSize: 11,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>

        {!preview.canAfford && (
          <p style={{ margin: "10px 0 0", fontSize: 10, color: "#ff8888", textAlign: "center" }}>
            Need {(preview.cost - userPoints).toLocaleString()} more points — keep watching to earn!
          </p>
        )}
      </div>
    );
  }

  // Idle state — the "Move Closer" button, pressure-aware
  const p = previewUpgrade(currentTier, userPoints);
  if (!p) return null;

  const orch = getGlobalOrchestrator();
  const baseLabel = `⬆ Move Closer`;
  const activeLabel = dynamicLabel
    ?? pressureLabel
    ?? (pulsing ? orch.getSeatUpgradePressureLabel(baseLabel) : baseLabel);

  const borderColor = pulsing ? "rgba(255,100,0,0.6)" : "rgba(0,229,255,0.25)";
  const bgColor = pulsing ? "rgba(255,80,0,0.12)" : "rgba(0,0,0,0.75)";
  const textColor = pulsing ? "#ff9944" : "#00e5ff";

  return (
    <button
      onClick={handleMoveCloser}
      style={{
        position: "fixed", bottom: "5.5rem", right: "1.5rem",
        zIndex: 8500, padding: "8px 16px",
        background: bgColor, backdropFilter: "blur(8px)",
        border: `1px solid ${borderColor}`, borderRadius: 20,
        color: textColor, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        transition: "all 0.3s ease",
        animation: pulsing ? "upgradePulse 1.2s ease-in-out infinite" : undefined,
        maxWidth: 280, textAlign: "left",
      }}
    >
      <span style={{ flex: 1 }}>{activeLabel}</span>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, whiteSpace: "nowrap" }}>
        {p.cost} pts
      </span>
    </button>
  );
}
