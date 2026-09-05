"use client";

/**
 * GameShowPresentationShell — production presentation for Official Game Shows (Phase 1).
 *
 * Center of gravity = host + contestants + board/turn + prize ledger —
 * NOT Battle VS, NOT Cypher circle. Never invents scores, contestants, or prize winners.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_GAME_SHOW,
  type GameShowProgramComposition,
} from "@/lib/experiencePresentation/composeGameShowProgram";

export type GameShowPresentationShellProps = {
  composition: GameShowProgramComposition | null;
  programSourceId?: string;
};

const FORMAT_TITLE: Record<string, string> = {
  DEAL_OR_FEUD: "DEAL OR FEUD 1000",
  NAME_THAT_TUNE: "NAME THAT TUNE",
  CIRCLE_AND_SQUARES: "CIRCLE AND SQUARES",
};

export default function GameShowPresentationShell({
  composition,
  programSourceId,
}: GameShowPresentationShellProps) {
  const layout = composition?.composition ?? "GAME_BOARD";
  const badge = composition?.worldMiniBadge ?? "🌍 WORLD";
  const mainHost = composition?.mainHost ?? null;
  const coHosts = composition?.coHosts ?? [];
  const prizeHost = composition?.prizeHost ?? null;
  const contestants = composition?.contestants ?? [];
  const board = composition?.board ?? null;
  const activeId = composition?.activeContestantId ?? null;
  const turnMs = composition?.turnRemainingMs ?? null;
  const roundIndex = composition?.roundIndex ?? null;
  const prizeLedger = composition?.prizeLedger ?? [];
  const winnerId = composition?.winnerId ?? null;
  const audienceCount = composition?.audiencePresenceCount ?? null;
  const formatId = composition?.formatId ?? "DEAL_OR_FEUD";
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_GAME_SHOW;
  const activeContestant = contestants.find((c) => c.id === activeId) ?? null;
  const winner = contestants.find((c) => c.id === winnerId) ?? null;

  return (
    <div
      data-game-show-presentation="production"
      data-experience-pack="GameShow"
      data-game-show-format={formatId}
      data-game-show-scope="WORLD"
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale={winnerId ? "true" : "false"}
      data-is-regular-go-live="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "PRESHOW"}
      data-winner-id={winnerId ?? ""}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 220,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,215,0,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(255,215,0,0.12)",
      }}
    >
      <div
        data-primitive="LiveVideoPanel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 10,
          minHeight: 220,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(20,14,4,0.96) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#FFD700",
            }}
          >
            GAME SHOW · {FORMAT_TITLE[formatId] ?? formatId}
          </div>
          <span
            data-world-mini-badge="WORLD"
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid rgba(0,255,255,0.45)",
              color: "#00FFFF",
              background: "rgba(0,255,255,0.08)",
            }}
          >
            {badge}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,45,170,0.75)",
            }}
          >
            ≠ BATTLE VS · ≠ CYPHER
          </span>
          {turnMs != null && turnMs > 0 ? (
            <span
              data-primitive="TimerRing"
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "2px 10px",
                borderRadius: 4,
                border: "1px solid rgba(255,215,0,0.5)",
                color: "#FFD700",
                background: "rgba(255,215,0,0.1)",
              }}
            >
              {Math.ceil(turnMs / 1000)}s
            </span>
          ) : null}
        </div>

        <div
          data-primitive="IdentityPanel"
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(255,215,0,0.35)",
            lineHeight: 1.25,
          }}
        >
          {winner
            ? `WINNER · ${winner.displayName}`
            : activeContestant
              ? `TURN · ${activeContestant.displayName}`
              : board
                ? board.category
                : mainHost
                  ? `HOST · ${mainHost.displayName}${mainHost.isBot ? " · [BOT]" : ""}`
                  : "Waiting for show — no invented contestants"}
        </div>

        {board ? (
          <div
            data-primitive="GameBoard"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid rgba(255,215,0,0.25)",
              background: "rgba(255,215,0,0.06)",
            }}
          >
            <span style={{ color: "#FFD700", fontSize: 9, fontWeight: 800 }}>
              BOARD{" "}
            </span>
            {board.category}
            {board.answerCount > 0
              ? ` · ${board.revealedCount}/${board.answerCount} revealed`
              : ""}
            {roundIndex != null ? ` · Round ${roundIndex}` : ""}
          </div>
        ) : null}

        <div
          data-primitive="LowerThird"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(255,215,0,0.85)", fontSize: 9, fontWeight: 800 }}>
              HOST{" "}
            </span>
            {mainHost
              ? `${mainHost.displayName}${mainHost.isBot ? " [BOT]" : ""}`
              : "—"}
            {coHosts.length > 0
              ? ` · ${coHosts.map((h) => h.displayName).join(", ")}`
              : ""}
          </div>
          <div
            data-primitive="ScoreCard"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <span style={{ color: "rgba(0,255,255,0.85)", fontSize: 9, fontWeight: 800 }}>
              CONTESTANTS{" "}
            </span>
            {contestants.length > 0
              ? contestants
                  .map((c) => `${c.displayName}${c.score > 0 ? ` (${c.score})` : ""}`)
                  .join(" · ")
              : "none yet — no invented roster"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(255,45,170,0.85)", fontSize: 9, fontWeight: 800 }}>
              AUDIENCE{" "}
            </span>
            {audienceCount !== null
              ? `${audienceCount} real presence`
              : "presence unknown — no invented count"}
          </div>
          {prizeHost ? (
            <div style={{ color: "rgba(255,255,255,0.65)" }}>
              <span style={{ color: "rgba(170,45,255,0.85)", fontSize: 9, fontWeight: 800 }}>
                PRIZE HOST{" "}
              </span>
              {prizeHost.displayName}
              {prizeHost.isBot ? " [BOT]" : ""}
            </div>
          ) : null}
        </div>

        {prizeLedger.length > 0 ? (
          <div
            data-primitive="PrizeLedgerView"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 11,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span style={{ color: "#FFD700", fontSize: 9, fontWeight: 800 }}>
              PRIZE LEDGER
            </span>
            {prizeLedger.map((p) => (
              <div key={p.entryId}>
                {p.label} · {p.currencyKind} {p.amount}
                {p.authoritativeGrantId && p.awardedToContestantId
                  ? ` · awarded ${p.awardedToContestantId}`
                  : " · intent only"}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
