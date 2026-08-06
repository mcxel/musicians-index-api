"use client";

/**
 * SongChallengeOverlaySystem — broadcast overlays/underlays for Song Challenges.
 * Same class as BattleOverlaySystem (intro / VS / perform / vote / winner / recruiting)
 * with a distinct gold-amber + electric-teal skin (not battle cyan/red or cypher purple).
 */

import { useState } from "react";
import { SONG_CHALLENGE_SKIN as SKIN } from "@/lib/challenge/SongChallengeSkin";

export type SongChallengePhase =
  | "recruiting"
  | "loadout"
  | "intro"
  | "vs"
  | "perform"
  | "vote"
  | "winner";

export interface SongChallengeSide {
  id: string;
  displayName: string;
  songTitle?: string | null;
  genre?: string | null;
  wins?: number | null;
}

interface Props {
  phase?: SongChallengePhase;
  onPhaseChange?: (p: SongChallengePhase) => void;
  sideA?: SongChallengeSide | null;
  sideB?: SongChallengeSide | null;
  voteA?: number;
  voteB?: number;
  winnerSide?: "A" | "B" | null;
  crownMessage?: string | null;
  needsCount?: number;
  showPhaseControls?: boolean;
  className?: string;
}

function LowerThird({ side, accent, role }: { side: SongChallengeSide; accent: string; role: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        background: "rgba(5,5,16,0.88)",
        borderLeft: `4px solid ${accent}`,
        padding: "8px 14px",
        borderRadius: "0 8px 8px 0",
        boxShadow: `0 0 18px ${accent}33`,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>{role}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{side.displayName}</div>
      <div style={{ fontSize: 10, color: accent, marginTop: 2 }}>
        {side.songTitle ? `🎵 ${side.songTitle}` : "Song pending"}
      </div>
    </div>
  );
}

function RecruitingBanner({ needsCount }: { needsCount: number }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "14px 16px",
        border: `1px solid ${SKIN.underlay}55`,
        borderRadius: 10,
        background: `${SKIN.underlay}14`,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: SKIN.underlay, letterSpacing: "0.18em" }}>
        ◉ NEEDS CHALLENGERS · WORK VS WORK
      </div>
      <div style={{ fontSize: 12, color: "#fff", marginTop: 6 }}>
        {needsCount > 0
          ? `${needsCount} open challenger seat${needsCount === 1 ? "" : "s"} — bring your best track`
          : "Both seats open — first two real challengers lock the matchup"}
      </div>
      <div style={{ fontSize: 9, color: SKIN.textMuted, marginTop: 4 }}>
        Support agents never count as human audience
      </div>
    </div>
  );
}

function VSGraphic({ a, b }: { a: SongChallengeSide; b: SongChallengeSide }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
      <div style={{ textAlign: "center", padding: 12, border: `2px solid ${SKIN.sideA}`, borderRadius: 10, background: `${SKIN.sideA}12` }}>
        <div style={{ fontSize: 9, color: SKIN.sideA, fontWeight: 900, letterSpacing: "0.14em" }}>WORK A</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: SKIN.sideA, marginTop: 4 }}>{a.displayName}</div>
        <div style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>{a.songTitle ? `"${a.songTitle}"` : "—"}</div>
      </div>
      <div
        style={{
          background: SKIN.vsBadge,
          color: "#050510",
          fontWeight: 900,
          fontSize: 18,
          padding: "12px 14px",
          borderRadius: 8,
          boxShadow: `0 0 28px ${SKIN.vsBadgeGlow}`,
        }}
      >
        VS
      </div>
      <div style={{ textAlign: "center", padding: 12, border: `2px solid ${SKIN.sideB}`, borderRadius: 10, background: `${SKIN.sideB}12` }}>
        <div style={{ fontSize: 9, color: SKIN.sideB, fontWeight: 900, letterSpacing: "0.14em" }}>WORK B</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: SKIN.sideB, marginTop: 4 }}>{b.displayName}</div>
        <div style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>{b.songTitle ? `"${b.songTitle}"` : "—"}</div>
      </div>
    </div>
  );
}

function WinnerReveal({
  winner,
  accent,
  crownMessage,
}: {
  winner: SongChallengeSide;
  accent: string;
  crownMessage?: string | null;
}) {
  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <div style={{ fontSize: 42, marginBottom: 8 }}>👑</div>
      <div style={{ fontSize: 11, fontWeight: 900, color: SKIN.crown, letterSpacing: "0.2em" }}>
        SONG CHALLENGE WINNER
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent, marginTop: 8 }}>{winner.displayName}</div>
      {winner.songTitle && (
        <div style={{ fontSize: 13, color: "#fff", marginTop: 6 }}>🎵 {winner.songTitle}</div>
      )}
      {crownMessage ? (
        <div
          style={{
            marginTop: 12,
            fontSize: 10,
            color: SKIN.crown,
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          {crownMessage}
        </div>
      ) : null}
    </div>
  );
}

const PHASES: SongChallengePhase[] = [
  "recruiting",
  "loadout",
  "intro",
  "vs",
  "perform",
  "vote",
  "winner",
];

export default function SongChallengeOverlaySystem({
  phase: controlledPhase,
  onPhaseChange,
  sideA = null,
  sideB = null,
  voteA = 0,
  voteB = 0,
  winnerSide = null,
  crownMessage = null,
  needsCount = 2,
  showPhaseControls = false,
  className,
}: Props) {
  const [internalPhase, setInternalPhase] = useState<SongChallengePhase>("recruiting");
  const phase = controlledPhase ?? internalPhase;

  function setPhase(p: SongChallengePhase) {
    if (!controlledPhase) setInternalPhase(p);
    onPhaseChange?.(p);
  }

  const a: SongChallengeSide = sideA ?? { id: "", displayName: "Open Seat A" };
  const b: SongChallengeSide = sideB ?? { id: "", displayName: "Open Seat B" };
  const total = voteA + voteB;
  const pctA = total > 0 ? Math.round((voteA / total) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <div
      className={className}
      style={{
        pointerEvents: showPhaseControls ? "auto" : "none",
        background: "transparent",
      }}
    >
      {/* Underlay strip */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${SKIN.sideA}, ${SKIN.underlay}, ${SKIN.sideB})`,
          boxShadow: `0 0 12px ${SKIN.underlay}66`,
          marginBottom: 8,
        }}
      />

      {showPhaseControls && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, pointerEvents: "auto" }}>
          {PHASES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              style={{
                padding: "5px 10px",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.1em",
                border: `1px solid ${phase === p ? SKIN.crown : "rgba(255,255,255,0.12)"}`,
                borderRadius: 6,
                background: phase === p ? `${SKIN.crown}22` : "rgba(255,255,255,0.04)",
                color: phase === p ? SKIN.crown : SKIN.textMuted,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          background: SKIN.glass,
          border: `1px solid ${SKIN.sideA}33`,
          borderRadius: 12,
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: SKIN.crown,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {SKIN.label} · {phase.toUpperCase()}
        </div>

        {phase === "recruiting" && <RecruitingBanner needsCount={needsCount} />}

        {(phase === "loadout" || phase === "intro") && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <LowerThird side={a} accent={SKIN.sideA} role="CHALLENGER A" />
            <LowerThird side={b} accent={SKIN.sideB} role="CHALLENGER B" />
          </div>
        )}

        {phase === "vs" && <VSGraphic a={a} b={b} />}

        {phase === "perform" && (
          <div>
            <VSGraphic a={a} b={b} />
            <div style={{ marginTop: 10, fontSize: 9, color: SKIN.textMuted, textAlign: "center" }}>
              Dual stage live · audience watches faces + selected songs
            </div>
          </div>
        )}

        {phase === "vote" && (
          <div>
            <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${pctA}%`, background: SKIN.sideA, transition: "width 0.4s" }} />
              <div style={{ width: `${pctB}%`, background: SKIN.sideB, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800 }}>
              <span style={{ color: SKIN.sideA }}>{pctA}% · {voteA}</span>
              <span style={{ color: SKIN.textMuted }}>LIVE VOTES</span>
              <span style={{ color: SKIN.sideB }}>{pctB}% · {voteB}</span>
            </div>
          </div>
        )}

        {phase === "winner" && winnerSide && (
          <WinnerReveal
            winner={winnerSide === "A" ? a : b}
            accent={winnerSide === "A" ? SKIN.sideA : SKIN.sideB}
            crownMessage={crownMessage}
          />
        )}
        {phase === "winner" && !winnerSide && (
          <div style={{ textAlign: "center", fontSize: 11, color: SKIN.textMuted }}>
            No winner declared yet
          </div>
        )}
      </div>
    </div>
  );
}
