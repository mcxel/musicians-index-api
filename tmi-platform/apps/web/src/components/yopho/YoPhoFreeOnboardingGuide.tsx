"use client";

/**
 * Free-tier YoPho instructional panel — layered composition how-to + 500 XP track.
 * Persistent until dismissed; re-openable from studio.
 */

import { useCallback, useEffect, useState } from "react";
import {
  YOPHO_BACKGROUND_FIRST_MESSAGE,
  YOPHO_FREE_ALLOWANCE_COPY,
} from "@/lib/yopho/YoPhoImageCapacity";
import {
  YOPHO_LEARNING_STEPS,
  claimYoPhoLearningXp,
  loadYoPhoLearningProgress,
  yoPhoLearningPct,
  type YoPhoLearningProgress,
} from "@/lib/yopho/YoPhoLearningTrack";
import { YOPHO_LEARNING_TRACK_TARGET_XP } from "@/lib/xp/XpActionRegistry";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const DISMISS_KEY = "tmi_yopho_free_guide_dismissed_v1";

export interface YoPhoFreeOnboardingGuideProps {
  /** Force open (e.g. Help button) */
  forceOpen?: boolean;
  onDismissed?: () => void;
  onProgressChange?: (progress: YoPhoLearningProgress) => void;
}

export default function YoPhoFreeOnboardingGuide({
  forceOpen = false,
  onDismissed,
  onProgressChange,
}: YoPhoFreeOnboardingGuideProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<YoPhoLearningProgress | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  useEffect(() => {
    const p = loadYoPhoLearningProgress();
    setProgress(p);
    onProgressChange?.(p);
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      setOpen(forceOpen || !dismissed);
    } catch {
      setOpen(true);
    }
  }, [forceOpen, onProgressChange]);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const dismiss = useCallback(async () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* quota */
    }
    setOpen(false);
    onDismissed?.();
    const result = await claimYoPhoLearningXp("yopho_complete_onboarding");
    setProgress(result.progress);
    onProgressChange?.(result.progress);
    if (result.granted > 0) {
      setClaimStatus(`+${result.granted} XP · how-to complete`);
    } else if (result.reason === "unauthenticated") {
      setClaimStatus("Guide saved. Sign in to earn durable learning XP.");
    }
  }, [onDismissed, onProgressChange]);

  if (!open) return null;

  const pct = progress ? yoPhoLearningPct(progress) : 0;
  const earned = progress?.earnedXp ?? 0;

  return (
    <aside
      data-yopho-onboarding="free"
      style={{
        marginBottom: 14,
        borderRadius: 14,
        border: `1px solid ${CYAN}55`,
        background: "linear-gradient(160deg, rgba(8,12,36,0.98), rgba(20,6,28,0.96))",
        padding: 14,
        boxShadow: `0 0 24px ${FUCHSIA}22`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: CYAN }}>
            FREE YOPHO · LAYERED CREATION
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginTop: 4 }}>
            Build performance baseball cards & album covers
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.45, maxWidth: 640 }}>
            YoPho is a layered composition system — not a single flat photo. Stack a background, add
            your images, mix FX/filters between layers, then share across devices with a QR on the card
            footer. Think trading-card energy: your look, your stage, your link.
          </div>
        </div>
        <button
          type="button"
          onClick={() => void dismiss()}
          style={{
            flexShrink: 0,
            padding: "6px 10px",
            borderRadius: 8,
            border: `1px solid ${GOLD}66`,
            background: `${GOLD}18`,
            color: GOLD,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          GOT IT
        </button>
      </div>

      <ol
        style={{
          margin: "12px 0 0",
          padding: "0 0 0 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontSize: 11,
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.4,
        }}
      >
        <li>
          <strong style={{ color: FUCHSIA }}>Background first</strong> — {YOPHO_BACKGROUND_FIRST_MESSAGE}
        </li>
        <li>
          <strong style={{ color: CYAN }}>Add images</strong> — up to 2 user photos/cutouts on Free after
          the background is set.
        </li>
        <li>
          <strong style={{ color: GOLD }}>FX / filters</strong> — apply between and on layers; system
          layers are separate from image slots.
        </li>
        <li>
          <strong style={{ color: "#00FF88" }}>Share + QR</strong> — save, copy link, or share; the
          protected TMI × YoPho footer carries QR to your card.
        </li>
      </ol>

      <div
        style={{
          marginTop: 12,
          padding: 10,
          borderRadius: 10,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: GOLD }}>
          FREE ALLOWANCE
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.4 }}>
          {YOPHO_FREE_ALLOWANCE_COPY}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: CYAN }}>
            LEARNING TRACK · {YOPHO_LEARNING_TRACK_TARGET_XP} XP
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: GOLD }}>
            {earned} / {YOPHO_LEARNING_TRACK_TARGET_XP} ({pct}%)
          </div>
        </div>
        <div
          style={{
            marginTop: 6,
            height: 6,
            borderRadius: 99,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${CYAN}, ${FUCHSIA})`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 4 }}>
          {YOPHO_LEARNING_STEPS.map((step) => {
            const done = progress?.completed.includes(step.key);
            return (
              <li
                key={step.key}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  fontSize: 10,
                  color: done ? "rgba(0,255,136,0.9)" : "rgba(255,255,255,0.5)",
                }}
              >
                <span aria-hidden>{done ? "✓" : "○"}</span>
                <span>
                  <strong style={{ color: done ? "#00FF88" : "#fff" }}>
                    {step.label} · +{step.xp}
                  </strong>
                  <span style={{ display: "block", opacity: 0.75 }}>{step.hint}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {claimStatus ? (
          <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: CYAN }}>{claimStatus}</div>
        ) : null}
      </div>
    </aside>
  );
}

export function reopenYoPhoFreeGuide(): void {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignore */
  }
}
