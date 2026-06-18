"use client";

import { useEffect, useState } from "react";
import {
  battleBroadcastStateMachine,
  type BattleBroadcastState,
} from "@/lib/competition/BattleBroadcastStateMachine";

interface Competitor {
  id: string;
  name: string;
  imageUrl?: string;
}

interface BattleBillboardPreviewProps {
  battleId: string;
  competitorA: Competitor;
  competitorB?: Competitor;
  isLive?: boolean;
  winnerId?: string;
  votesA?: number;
  votesB?: number;
  audienceCount?: number;
  sponsorLabel?: string;
  onJoin?: () => void;
  height?: number;
}

const FALLBACK_IMG = "/images/tmi-placeholder.jpg";

/**
 * Billboard tile for a Battle room, driven by BattleBroadcastStateMachine.
 * Live Billboard Preview Canon: full-screen solo performer until a second
 * competitor joins, then a versus reveal, then the persistent split-screen
 * audience view — exactly what the room itself shows, never a random thumbnail.
 */
export default function BattleBillboardPreview({
  battleId,
  competitorA,
  competitorB,
  isLive = false,
  winnerId,
  votesA = 0,
  votesB = 0,
  audienceCount,
  sponsorLabel,
  onJoin,
  height = 220,
}: BattleBillboardPreviewProps) {
  const [state, setState] = useState<BattleBroadcastState>("SOLO_WAITING");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const unsubscribe = battleBroadcastStateMachine.subscribe(battleId, (entry) => {
      setState(entry.state);
    });

    if (!battleBroadcastStateMachine.getState(battleId)) {
      battleBroadcastStateMachine.competitorAJoins(battleId, competitorA.id);
      if (competitorB) {
        battleBroadcastStateMachine.competitorBJoins(battleId, competitorB.id);
      }
      if (winnerId) {
        battleBroadcastStateMachine.revealWinner(battleId, winnerId);
      }
    }

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId]);

  useEffect(() => {
    if (state !== "VS_REVEAL") { setCountdown(3); return; }
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 900);
    const t2 = setTimeout(() => setCountdown(1), 1800);
    const t3 = setTimeout(() => setCountdown(0), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [state]);

  const totalVotes = votesA + votesB || 1;
  const pctA = Math.round((votesA / totalVotes) * 100);
  const pctB = 100 - pctA;

  return (
    <button
      onClick={onJoin}
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,45,170,0.4)",
        background: "#050510",
        cursor: onJoin ? "pointer" : "default",
        padding: 0,
        textAlign: "left",
      }}
    >
      <style>{`
        @keyframes bbpPullBack { from { transform: scale(1.08); } to { transform: scale(1); } }
        @keyframes bbpSlideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes bbpSlideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes bbpVsPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
        @keyframes bbpWinnerGlow { 0%,100% { box-shadow: 0 0 12px #FFD70088; } 50% { box-shadow: 0 0 28px #FFD700cc; } }
      `}</style>

      {/* SOLO_WAITING — full screen performer A */}
      {state === "SOLO_WAITING" && (
        <div style={{ position: "absolute", inset: 0, animation: "bbpPullBack 0.6s ease" }}>
          <img src={competitorA.imageUrl ?? FALLBACK_IMG} alt={competitorA.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,16,0.88), transparent 55%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>{competitorA.name}</div>
            <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: "0.08em", marginTop: 2 }}>⏳ WAITING FOR CHALLENGER…</div>
          </div>
        </div>
      )}

      {/* OPPONENT_JOINED — split transition */}
      {state === "OPPONENT_JOINED" && competitorB && (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", animation: "bbpSlideInLeft 0.5s ease" }}>
            <img src={competitorA.imageUrl ?? FALLBACK_IMG} alt={competitorA.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", animation: "bbpSlideInRight 0.5s ease" }}>
            <img src={competitorB.imageUrl ?? FALLBACK_IMG} alt={competitorB.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      )}

      {/* VS_REVEAL — A vs B + countdown */}
      {state === "VS_REVEAL" && competitorB && (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src={competitorA.imageUrl ?? FALLBACK_IMG} alt={competitorA.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src={competitorB.imageUrl ?? FALLBACK_IMG} alt={competitorB.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#FF2DAA", animation: "bbpVsPulse 0.9s ease-in-out infinite", textShadow: "0 0 18px #FF2DAA" }}>VS</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", textShadow: "0 0 16px #FFD700" }}>
              {countdown > 0 ? countdown : "BATTLE LIVE"}
            </div>
          </div>
        </div>
      )}

      {/* BATTLE_LIVE / ROUND_BREAK — locked split screen, audience view */}
      {(state === "BATTLE_LIVE" || state === "ROUND_BREAK") && competitorB && (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src={competitorA.imageUrl ?? FALLBACK_IMG} alt={competitorA.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(5,5,16,0.75)", padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 800 }}>{competitorA.name}</div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", marginTop: 2 }}>
                <div style={{ width: `${pctA}%`, height: "100%", background: "#00FFFF", borderRadius: 2 }} />
              </div>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src={competitorB.imageUrl ?? FALLBACK_IMG} alt={competitorB.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(5,5,16,0.75)", padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 800 }}>{competitorB.name}</div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", marginTop: 2 }}>
                <div style={{ width: `${pctB}%`, height: "100%", background: "#FF2DAA", borderRadius: 2 }} />
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", fontSize: 14, fontWeight: 900, color: "#fff", textShadow: "0 0 8px #000" }}>VS</div>
          <div style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: state === "ROUND_BREAK" ? "#FFD700" : "#E63000", background: "rgba(5,5,16,0.72)", padding: "3px 7px", borderRadius: 4 }}>
            {state === "ROUND_BREAK" ? "⏸ ROUND BREAK" : "🔴 BATTLE LIVE"}
          </div>
          {audienceCount != null && (
            <div style={{ position: "absolute", top: 8, right: 8, fontSize: 8, fontWeight: 800, color: "#fff", background: "rgba(5,5,16,0.72)", padding: "3px 7px", borderRadius: 4 }}>
              👁 {audienceCount.toLocaleString()}
            </div>
          )}
          {sponsorLabel && (
            <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", fontSize: 7, letterSpacing: "0.1em", color: "#FFD700", background: "rgba(5,5,16,0.72)", padding: "2px 6px", borderRadius: 4 }}>
              {sponsorLabel}
            </div>
          )}
        </div>
      )}

      {/* WINNER_REVEAL — winner spotlight */}
      {state === "WINNER_REVEAL" && (
        <div style={{ position: "absolute", inset: 0, animation: "bbpWinnerGlow 1.8s ease-in-out infinite" }}>
          <img
            src={(winnerId === competitorB?.id ? competitorB?.imageUrl : competitorA.imageUrl) ?? FALLBACK_IMG}
            alt="Winner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,16,0.88), transparent 55%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em" }}>🏆 WINNER</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>
              {winnerId === competitorB?.id ? competitorB?.name : competitorA.name}
            </div>
          </div>
        </div>
      )}

      {!isLive && state === "SOLO_WAITING" && (
        <div style={{ position: "absolute", bottom: 8, right: 8, fontSize: 8, fontWeight: 800, color: "#00FF88", background: "rgba(5,5,16,0.72)", padding: "3px 8px", borderRadius: 4 }}>
          JOIN BATTLE →
        </div>
      )}
    </button>
  );
}
