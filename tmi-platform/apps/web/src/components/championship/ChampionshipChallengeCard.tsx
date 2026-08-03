"use client";

/**
 * Championship Challenge Card — Phase 2C.
 * Title, holder, defenses, days until defense, Challenge CTA (green if eligible).
 */

import { useState } from "react";
import {
  checkChallengeEligibility,
  getDefenseWarning,
  requestChampionshipChallenge,
  type ChampionshipTitle,
} from "@/lib/championship";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import TitleLineageTimeline from "./TitleLineageTimeline";

export interface ChampionshipChallengeCardProps {
  title: ChampionshipTitle;
  challengerId?: string;
  role?: "fan" | "performer";
  showLineage?: boolean;
  onChallengeResult?: (ok: boolean, message: string) => void;
}

export default function ChampionshipChallengeCard({
  title,
  challengerId,
  role = "performer",
  showLineage = false,
  onChallengeResult,
}: ChampionshipChallengeCardProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const holder = title.currentHolderId
    ? getPerformerById(title.currentHolderId)
    : null;
  const warning = getDefenseWarning(title);
  const canChallenge =
    role === "performer" &&
    Boolean(challengerId) &&
    (title.assetType === "CROWN" || title.assetType === "BELT");

  const eligibility =
    canChallenge && challengerId
      ? checkChallengeEligibility({
          challengerId,
          titleId: title.id,
          accountActive: true,
        })
      : null;

  const daysUntilDefense =
    warning.daysRemaining != null && warning.daysRemaining >= 0
      ? warning.daysRemaining
      : null;

  const onChallenge = () => {
    if (!challengerId || !eligibility?.eligible) return;
    const kind =
      title.assetType === "CROWN"
        ? ("REQUEST_CROWN_CHALLENGE" as const)
        : ("REQUEST_BELT_CHALLENGE" as const);
    const actionId =
      kind === "REQUEST_CROWN_CHALLENGE"
        ? "ACTION_REQUEST_CROWN_CHALLENGE"
        : "ACTION_REQUEST_BELT_CHALLENGE";

    livingOsCommandBus.executeAction(actionId, {
      userId: challengerId,
      role,
      payload: { titleId: title.id, challengerId },
      idempotencyKey: `${kind}_${challengerId}_${title.id}`,
    });

    const result = requestChampionshipChallenge({
      kind,
      titleId: title.id,
      challengerId,
      accountActive: true,
    });
    const message = result.ok
      ? `Challenge queued for ${title.label}.`
      : result.error ?? "Challenge rejected.";
    setMsg(message);
    onChallengeResult?.(result.ok, message);
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,215,0,0.28)",
        background: "rgba(255,215,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#FFD700" }}>
            {title.assetType === "CROWN"
              ? "👑"
              : title.assetType === "BELT"
                ? "🥋"
                : "🏆"}{" "}
            {title.label}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {title.geographicTier} · {title.category} · {title.status}
          </div>
        </div>
        {daysUntilDefense != null && title.status === "ACTIVE" ? (
          <span style={{ fontSize: 9, fontWeight: 800, color: "#FF6B35", whiteSpace: "nowrap" }}>
            DEFENSE {daysUntilDefense}d
          </span>
        ) : null}
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
        {holder
          ? `Holder: ${holder.name}`
          : title.status === "VACANT"
            ? "Vacant — no verified holder"
            : "No holder on record"}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
        Defenses: {title.successfulDefenses}
        {daysUntilDefense != null && title.status === "ACTIVE"
          ? ` · ${daysUntilDefense} day${daysUntilDefense === 1 ? "" : "s"} until defense window`
          : ""}
      </div>

      {canChallenge ? (
        <button
          type="button"
          disabled={!eligibility?.eligible}
          onClick={onChallenge}
          title={eligibility?.reason}
          style={{
            alignSelf: "flex-start",
            padding: "7px 14px",
            borderRadius: 8,
            border: eligibility?.eligible
              ? "1px solid #00FF88"
              : "1px solid rgba(255,255,255,0.15)",
            background: eligibility?.eligible ? "rgba(0,255,136,0.18)" : "transparent",
            color: eligibility?.eligible ? "#00FF88" : "rgba(255,255,255,0.35)",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.06em",
            cursor: eligibility?.eligible ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          {eligibility?.eligible ? "CHALLENGE" : "CHALLENGE LOCKED"}
        </button>
      ) : null}

      {canChallenge && eligibility && !eligibility.eligible ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          {eligibility.reason.includes("verified")
            ? "Need verified wins"
            : eligibility.reason.includes("Top")
              ? "Top 5 required"
              : eligibility.reason}
        </div>
      ) : null}

      {msg ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{msg}</div>
      ) : null}

      {showLineage ? <TitleLineageTimeline lineage={title.lineage} /> : null}
    </div>
  );
}
