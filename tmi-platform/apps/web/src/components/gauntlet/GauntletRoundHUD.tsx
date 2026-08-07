"use client";

/**
 * GauntletRoundHUD — main round / alive / clock + visible side-stage / vote status.
 * Main + side are both visible; side only goes LIVE between rounds.
 */

import type { CSSProperties } from "react";
import type { GauntletRunState } from "@/lib/gauntlet/GauntletRunRuntime";
import { getSideStageSummary } from "@/lib/gauntlet/GauntletSideBattleEngine";
import {
  getEliminationTallies,
  isEliminationVoteOpen,
} from "@/lib/gauntlet/GauntletAudienceEliminationVote";

type Props = {
  run: GauntletRunState | null;
  clockSeconds: number;
  roomId: string;
};

export default function GauntletRoundHUD({ run, clockSeconds, roomId }: Props) {
  const side = getSideStageSummary(roomId);
  const voteOpen = run ? isEliminationVoteOpen(run.runId) : false;
  const tallies = run ? getEliminationTallies(run.runId) : [];
  const totalVotes = tallies.reduce((s, r) => s + r.audienceVotes, 0);

  if (!run) {
    return (
      <div style={barStyle}>
        <span style={labelStyle}>MAIN STAGE</span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
          Registration open · no active run
        </span>
        <SidePill
          label={side.latestLabel ?? "Side stage idle"}
          live={side.liveBattles}
          queued={side.queuedBattles + side.queuedEligible}
          windowOpen={side.windowOpen}
        />
      </div>
    );
  }

  const phaseColor =
    run.phase === "FINAL" || run.phase === "CHAMPION"
      ? "#FFD700"
      : run.phase === "AUDIENCE_ELIMINATION_VOTE"
        ? "#00FFFF"
        : run.phase === "SIDE_BATTLE_WINDOW" || run.phase === "SURVIVOR_REST"
          ? "#FF2DAA"
          : run.phase === "ELIMINATION_RESULT"
            ? "#FF2DAA"
            : "#00FF88";

  const clockLabel =
    run.phase === "AUDIENCE_ELIMINATION_VOTE"
      ? "VOTE"
      : run.phase === "SIDE_BATTLE_WINDOW" || run.phase === "SURVIVOR_REST"
        ? "REST/SIDE"
        : "CLOCK";

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={barStyle}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={labelStyle}>
            {run.mainStageFocus ? "MAIN FOCUS" : "SURVIVORS REST"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 900, color: phaseColor, letterSpacing: "0.08em" }}>
            {run.phase.replace(/_/g, " ")}
          </span>
          <Stat label="ROUND" value={String(run.roundNumber || "—")} />
          <Stat label="ALIVE" value={String(run.aliveIds.length)} accent="#00FF88" />
          <Stat
            label={clockLabel}
            value={clockSeconds > 0 ? `${clockSeconds}s` : "—"}
            accent="#00FFFF"
          />
          <Stat label="BRACKET" value={`OF ${run.roundSize}`} />
        </div>
        <SidePill
          label={side.latestLabel ?? "No side battles yet"}
          live={side.liveBattles}
          queued={side.queuedBattles + side.queuedEligible}
          windowOpen={side.windowOpen || run.phase === "SIDE_BATTLE_WINDOW"}
        />
      </div>

      {run.phase === "AUDIENCE_ELIMINATION_VOTE" && (
        <div style={voteBarStyle}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF" }}>
            {voteOpen ? "VOTING OPEN" : "VOTING CLOSED"}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {totalVotes === 0
              ? "No ballots yet — honest empty (gifts never count as votes)"
              : `${totalVotes} audience elimination ballot${totalVotes === 1 ? "" : "s"}`}
          </span>
          {tallies.slice(0, 4).map((t) => (
            <span key={t.competitorId} style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>
              {t.competitorId.slice(0, 8)} · {t.audienceVotes}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "#fff",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "baseline" }}>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "monospace" }}>
        {value}
      </span>
    </span>
  );
}

function SidePill({
  label,
  live,
  queued,
  windowOpen,
}: {
  label: string;
  live: number;
  queued: number;
  windowOpen: boolean;
}) {
  return (
    <div
      title="Side stage is visible (PiP/wall). LIVE only between main rounds while survivors rest."
      style={{
        marginLeft: "auto",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.06em",
        color: windowOpen ? "#FF2DAA" : "rgba(255,255,255,0.45)",
        border: `1px solid ${windowOpen ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.14)"}`,
        borderRadius: 999,
        padding: "5px 10px",
        background: windowOpen ? "rgba(255,45,170,0.14)" : "rgba(255,255,255,0.04)",
        maxWidth: 320,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      SIDE {windowOpen ? "● LIVE WINDOW" : "○ QUEUED"} · L{live}/Q{queued} · {label}
    </div>
  );
}

const barStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,215,0,0.28)",
  background: "linear-gradient(90deg, rgba(12,8,24,0.95), rgba(5,5,16,0.98))",
};

const voteBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,255,255,0.35)",
  background: "rgba(0,255,255,0.08)",
};

const labelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "#FFD700",
};
