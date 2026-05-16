"use client";

/**
 * WinnerCeremonyOverlay v2 — Ceremony Intelligence Layer
 * Full cinematic ceremony UI.
 *
 * Intelligence:
 * - Randomized declaration phrases (CeremonyPhraseEvolutionEngine)
 * - Dynamic camera shot direction (CeremonyCameraDirectorEngine)
 * - Recording grace period + coordinated pullout (CeremonyCloseoutEngine)
 * - Confetti per-context with upset variant
 * - Sequential reward line reveal
 * - Engagement feedback loop (phrase performance)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  winnerCeremonyEngine,
  crownTransferEngine,
  confettiEngine,
  rewardSplashEngine,
  ceremonyPhraseEngine,
  ceremonyCameraDirector,
  ceremonyCloseoutEngine,
} from "@/lib/ceremony";
import type {
  CeremonyParticipant,
  BattleContext,
  CeremonyResult,
  ConfettiBurst,
  RewardSplash,
  CameraDirective,
} from "@/lib/ceremony";
import type { CrownContext } from "@/lib/ceremony";

interface WinnerCeremonyOverlayProps {
  battleId: string;
  context: BattleContext;
  winner: CeremonyParticipant;
  loser?: CeremonyParticipant;
  totalVotes?: number;
  isUpset?: boolean;
  rewardPoints?: number;
  rewardUsd?: number;
  badgeAwarded?: string;
  replayRoute?: string;
  onDismiss?: () => void;
}

const CONTEXT_LABEL: Record<BattleContext, string> = {
  battle:          "BATTLE",
  cypher:          "CYPHER",
  "dirty-dozens":  "DIRTY DOZENS",
  contest:         "CONTEST",
};

const CONTEXT_ACCENT: Record<BattleContext, string> = {
  battle:          "#FFD700",
  cypher:          "#FF2DAA",
  "dirty-dozens":  "#AA2DFF",
  contest:         "#00FFFF",
};

const CROWN_CONTEXT_MAP: Record<BattleContext, CrownContext> = {
  battle:          "battle-1v1",
  cypher:          "cypher-monday",
  "dirty-dozens":  "dirty-dozens",
  contest:         "contest-weekly",
};

const TONE_COLORS: Record<string, string> = {
  epic:       "#FFD700",
  hype:       "#FF2DAA",
  poetic:     "#AA2DFF",
  cold:       "#00FFFF",
  theatrical: "#FF6B35",
};

/** DOM confetti layer */
function ConfettiLayer({ burst }: { burst: ConfettiBurst }) {
  const particles = Array.from({ length: Math.min(burst.particleCount, 80) }, (_, i) => {
    const color = burst.particles[i % burst.particles.length]?.color ?? "#FFD700";
    const left  = `${5 + Math.floor(((i * 37 + 13) % 90))}%`;
    const animDuration = `${1.2 + (i % 5) * 0.3}s`;
    const animDelay    = `${(i % 8) * 0.1}s`;
    const size = 6 + (i % 4) * 2;
    return { color, left, animDuration, animDelay, size };
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 10 }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes crownDrop {
          0%   { transform: translateY(-80px) rotate(-20deg) scale(0.5); opacity: 0; }
          60%  { transform: translateY(8px) rotate(4deg) scale(1.1); opacity: 1; }
          80%  { transform: translateY(-4px) rotate(-2deg) scale(1.05); }
          100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes winnerGlow {
          0%, 100% { text-shadow: 0 0 20px currentColor; }
          50%       { text-shadow: 0 0 60px currentColor, 0 0 100px currentColor; }
        }
        @keyframes phraseReveal {
          0%   { opacity: 0; transform: translateY(12px); letter-spacing: 0.5em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.06em; }
        }
        @keyframes rewardLineIn {
          0%   { opacity: 0; transform: translateX(-16px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes shotLabel {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gracePulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-10px",
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            animation: `confettiFall ${p.animDuration} ${p.animDelay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/** Camera shot label chip */
function CameraShotChip({ shot }: { shot: CameraDirective }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 4,
        padding: "3px 10px",
        fontSize: 9,
        letterSpacing: "0.2em",
        color: "rgba(255,255,255,0.6)",
        fontFamily: "monospace",
        animation: "shotLabel 2s ease forwards",
        pointerEvents: "none",
      }}
    >
      ◉ {shot.label}
    </div>
  );
}

export default function WinnerCeremonyOverlay({
  battleId,
  context,
  winner,
  loser,
  totalVotes,
  isUpset = false,
  rewardPoints = 35,
  rewardUsd,
  badgeAwarded,
  replayRoute,
  onDismiss,
}: WinnerCeremonyOverlayProps) {
  const [ceremony, setCeremony]           = useState<CeremonyResult | null>(null);
  const [phase, setPhase]                 = useState<string>("freeze");
  const [burst, setBurst]                 = useState<ConfettiBurst | null>(null);
  const [splash, setSplash]               = useState<RewardSplash | null>(null);
  const [dismissed, setDismissed]         = useState(false);
  const [declarationLine, setDeclaration] = useState<string>("");
  const [declarationTone, setTone]        = useState<string>("epic");
  const [currentShot, setCurrentShot]     = useState<CameraDirective | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [cameraZoom, setCameraZoom]       = useState(1);
  const [graceSecsLeft, setGraceSecsLeft] = useState(0);
  const [inGrace, setInGrace]             = useState(false);
  const [revealedLines, setRevealedLines] = useState(0);
  const ceremonyIdRef                     = useRef<string>("");
  const intervalRef                       = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseIdRef                       = useRef<string>("");
  const mountedAtRef                      = useRef<number>(Date.now());

  const accent = CONTEXT_ACCENT[context] ?? "#FFD700";

  const dismiss = useCallback((completed: boolean) => {
    // Feed phrase engagement back to evolution engine
    if (phraseIdRef.current) {
      ceremonyPhraseEngine.recordEngagement({
        phraseId: phraseIdRef.current,
        dwellMs: Date.now() - mountedAtRef.current,
        completedCeremony: completed,
      });
    }
    if (ceremonyIdRef.current) {
      ceremonyCameraDirector.clearSequence(ceremonyIdRef.current);
      ceremonyCloseoutEngine.clearState(ceremonyIdRef.current);
    }
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    mountedAtRef.current = Date.now();

    // 1. Trigger ceremony
    const cer = winnerCeremonyEngine.trigger({
      battleId,
      context,
      winner,
      loser,
      allParticipants: loser ? [winner, loser] : [winner],
      isUpset,
      totalVotes,
      rewardPoints,
      rewardUsd,
      rewardBadge: badgeAwarded,
      replayRoute,
    });
    setCeremony(cer);
    ceremonyIdRef.current = cer.ceremonyId;

    // 2. Transfer crown
    crownTransferEngine.transfer({
      battleId,
      context: CROWN_CONTEXT_MAP[context],
      winner,
      isUpset,
    });

    // 3. Pick declaration phrase (randomized, weighted)
    const phrase = ceremonyPhraseEngine.pick(
      context === "dirty-dozens" ? "battle" : context,
      winner.displayName,
      isUpset
    );
    setDeclaration(phrase.line);
    setTone(phrase.tone);
    phraseIdRef.current = phrase.phraseId;

    // 4. Direction camera sequence
    const camSeq = ceremonyCameraDirector.direct({
      ceremonyId: cer.ceremonyId,
      context,
      hasLoser: !!loser,
      isUpset,
    });
    setCurrentShot(camSeq.shots[0] ?? null);

    // 5. Build confetti
    const b = isUpset
      ? confettiEngine.getBurst("upset")
      : confettiEngine.getBurst(
          context === "dirty-dozens" ? "cypher" : context as Parameters<typeof confettiEngine.getBurst>[0]
        );
    setBurst(b);

    // 6. Build reward splash
    const streak = crownTransferEngine.getStreak(winner.userId);
    const sp = rewardSplashEngine.generate({
      battleId,
      winnerUserId: winner.userId,
      winnerDisplayName: winner.displayName,
      basePoints: rewardPoints,
      audienceFavorite: false,
      streakBonus: streak >= 3 ? 10 : 0,
      crowdVoteBonus: 3,
      upsetBonus: isUpset,
      prizeUsd: rewardUsd,
      badgeAwarded,
      replayRoute,
    });
    setSplash(sp);

    // 7. Poll ceremony phase + camera advance + closeout
    let camAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
    let closeoutStarted = false;

    intervalRef.current = setInterval(() => {
      const updated = winnerCeremonyEngine.getCeremonyForBattle(battleId);
      if (!updated) return;

      const newPhase = updated.currentPhase;
      setPhase(newPhase);

      // Advance camera shot on confetti phase
      if (newPhase === "confetti" && !camAdvanceTimer) {
        const seq = ceremonyCameraDirector.getSequence(cer.ceremonyId);
        if (seq) {
          let shotIdx = 0;
          camAdvanceTimer = setInterval(() => {
            const nextShot = ceremonyCameraDirector.advance(cer.ceremonyId);
            if (nextShot) setCurrentShot(nextShot);
            shotIdx++;
            if (shotIdx >= (seq.shots.length - 1)) {
              clearInterval(camAdvanceTimer!);
            }
          }, 2000);
        }
      }

      // Reveal reward lines sequentially
      if (newPhase === "rewards" && sp) {
        let lineIdx = 0;
        const revealInterval = setInterval(() => {
          lineIdx++;
          setRevealedLines(lineIdx);
          if (lineIdx >= sp.pointBreakdown.length) clearInterval(revealInterval);
        }, 350);
      }

      // Begin closeout when phase hits "replay"
      if (newPhase === "replay" && !closeoutStarted) {
        closeoutStarted = true;
        ceremonyCloseoutEngine.begin(cer.ceremonyId);
      }

      // Tick closeout
      if (closeoutStarted) {
        const cs = ceremonyCloseoutEngine.tick(cer.ceremonyId);
        if (cs) {
          setOverlayOpacity(cs.overlayOpacity);
          setCameraZoom(cs.cameraZoom);
          setInGrace(cs.phase === "grace");
          setGraceSecsLeft(ceremonyCloseoutEngine.graceSecondsRemaining(cer.ceremonyId));

          if (cs.phase === "complete") {
            clearInterval(intervalRef.current!);
            dismiss(true);
          }
        }
      }

      if (newPhase === "done" && !closeoutStarted) {
        clearInterval(intervalRef.current!);
        dismiss(true);
      }
    }, 150);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId]);

  if (dismissed || !ceremony) return null;

  const showDeclare  = ["declare","crown","confetti","rewards","replay","article","done"].includes(phase);
  const showCrown    = ["crown","confetti","rewards","replay","article","done"].includes(phase);
  const showConfetti = ["confetti","rewards","replay","article"].includes(phase);
  const showRewards  = ["rewards","replay","article"].includes(phase);
  const showCtas     = ["replay","article","done"].includes(phase);

  const voteW = ceremony.votePercentWinner;
  const voteL = ceremony.votePercentLoser;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(5,5,16,${0.88 * overlayOpacity})`,
        transition: "background 0.5s ease",
        fontFamily: "var(--font-tmi-orbitron, monospace)",
        opacity: overlayOpacity,
      }}
    >
      {/* Confetti layer */}
      {showConfetti && burst && <ConfettiLayer burst={burst} />}

      {/* Main ceremony card */}
      <div
        style={{
          position: "relative",
          width: "min(580px, 93vw)",
          background: "linear-gradient(160deg, #0c0c22 0%, #050510 100%)",
          border: `2px solid ${accent}`,
          borderRadius: 16,
          boxShadow: `0 0 60px ${accent}55, 0 0 140px ${accent}18`,
          padding: "40px 32px 32px",
          textAlign: "center",
          overflow: "hidden",
          transform: `scale(${0.95 + cameraZoom * 0.05})`,
          transition: "transform 1.2s ease",
        }}
      >
        {/* Glow strip top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        {/* Camera shot label */}
        {currentShot && <CameraShotChip shot={currentShot} />}

        {/* Context label */}
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: accent, marginBottom: 6, textTransform: "uppercase" }}>
          {CONTEXT_LABEL[context]} ENDED
        </div>

        {/* Crown */}
        {showCrown && (
          <div
            style={{
              fontSize: 60,
              marginBottom: 14,
              display: "inline-block",
              filter: `drop-shadow(0 0 24px ${accent})`,
              animation: "crownDrop 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            👑
          </div>
        )}

        {/* Declaration phrase */}
        {showDeclare && declarationLine && (
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.06em",
              color: TONE_COLORS[declarationTone] ?? accent,
              marginBottom: 10,
              fontStyle: "italic",
              opacity: 0.85,
              animation: "phraseReveal 0.7s ease forwards",
            }}
          >
            "{declarationLine}"
          </div>
        )}

        {/* Winner name */}
        {showDeclare && (
          <div>
            {isUpset && (
              <div
                style={{
                  display: "inline-block",
                  background: "#FF6B35",
                  color: "#000",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  padding: "2px 12px",
                  borderRadius: 4,
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                ⚡ UPSET WIN
              </div>
            )}
            <div
              style={{
                fontSize: "clamp(30px, 6vw, 52px)",
                fontWeight: 900,
                color: accent,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                animation: "winnerGlow 2s ease-in-out infinite",
                marginBottom: 14,
                fontFamily: "var(--font-tmi-bebas, var(--font-tmi-orbitron, monospace))",
              }}
            >
              {winner.displayName}
            </div>

            {/* Vote split bar */}
            {loser && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#777", marginBottom: 5 }}>
                  <span style={{ color: accent }}>{winner.displayName} {voteW}%</span>
                  <span>{loser.displayName} {voteL}%</span>
                </div>
                <div style={{ height: 6, background: "#151528", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${voteW}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)`, borderRadius: 3, transition: "width 1.8s ease" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reward splash — lines revealed sequentially */}
        {showRewards && splash && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 18,
              textAlign: "left",
            }}
          >
            {splash.pointBreakdown.slice(0, revealedLines).map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: i < revealedLines - 1 ? 8 : 0,
                  paddingTop: i === splash.pointBreakdown.length - 1 ? 8 : 0,
                  borderTop: i === splash.pointBreakdown.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  animation: "rewardLineIn 0.3s ease forwards",
                }}
              >
                <span style={{ fontSize: 11, color: "#aaa" }}>{line.icon} {line.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: line.color }}>{line.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Grace period indicator */}
        {inGrace && graceSecsLeft > 0 && (
          <div
            style={{
              marginBottom: 14,
              fontSize: 10,
              color: "#555",
              letterSpacing: "0.15em",
              animation: "gracePulse 1s ease-in-out infinite",
            }}
          >
            ● REC — {graceSecsLeft}s remaining
          </div>
        )}

        {/* CTAs */}
        {showCtas && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <a
              href={ceremony.replayRoute}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: accent, color: "#000", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase" }}
            >
              ▶ REPLAY
            </a>
            {splash?.articleDraftQueued && (
              <a
                href="/articles"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "transparent", color: accent, border: `1px solid ${accent}`, borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase" }}
              >
                📰 RECAP
              </a>
            )}
            <button
              onClick={() => {
                if (inGrace && ceremonyIdRef.current) {
                  ceremonyCloseoutEngine.skipGrace(ceremonyIdRef.current);
                } else {
                  dismiss(false);
                }
              }}
              style={{ padding: "10px 18px", background: "transparent", color: "#444", border: "1px solid #2a2a3e", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {inGrace ? "SKIP" : "CLOSE"}
            </button>
          </div>
        )}

        {/* Glow strip bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      </div>
    </div>
  );
}
