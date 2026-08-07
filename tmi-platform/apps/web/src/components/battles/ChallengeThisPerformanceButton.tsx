"use client";

/**
 * CHALLENGE THIS PERFORMANCE — exposed after eligible song/beat/guitar/etc. content
 * when PerformerChallengePolicy allows.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canChallengeThisPerformance,
  type ChallengeContentType,
  type ChallengeGateActor,
} from "@/lib/competition/PerformerChallengePolicy";

type Props = {
  performerId: string;
  contentType: ChallengeContentType;
  contentLabel?: string;
  actor?: ChallengeGateActor | null;
  /** Optional prebuilt challenge destination */
  challengeHref?: string;
};

export default function ChallengeThisPerformanceButton({
  performerId,
  contentType,
  contentLabel,
  actor,
  challengeHref,
}: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  const gate = useMemo(() => {
    if (!actor) return { ok: false as const, reason: "sign-in-required" };
    return canChallengeThisPerformance({ performerId, contentType, actor });
  }, [actor, contentType, performerId]);

  if (!gate.ok && gate.reason === "content-type-not-challengeable") return null;
  if (!gate.ok && gate.reason === "challenges-closed") return null;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button
        type="button"
        disabled={!gate.ok}
        onClick={() => {
          if (!gate.ok) {
            setErr(gate.reason ?? "not-allowed");
            return;
          }
          const href =
            challengeHref ??
            `/battles/create?target=${encodeURIComponent(performerId)}&content=${encodeURIComponent(contentType)}`;
          router.push(href);
        }}
        style={{
          border: gate.ok ? "1px solid rgba(255,45,170,0.55)" : "1px solid rgba(255,255,255,0.12)",
          background: gate.ok ? "rgba(255,45,170,0.18)" : "rgba(255,255,255,0.04)",
          color: gate.ok ? "#FF2DAA" : "rgba(255,255,255,0.35)",
          borderRadius: 8,
          padding: "8px 12px",
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: "0.08em",
          cursor: gate.ok ? "pointer" : "not-allowed",
        }}
      >
        CHALLENGE THIS PERFORMANCE
        {contentLabel ? ` · ${contentLabel}` : ""}
      </button>
      {(err || (!gate.ok && gate.reason)) && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
          {err ?? gate.reason}
        </div>
      )}
    </div>
  );
}
