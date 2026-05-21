"use client";

import { useState } from "react";
import {
  castPerformanceVote,
  getPerformanceStats,
  hasVoted,
  recordJudgeVote,
  getJudgeProfile,
  getRoleConfig,
  TIER_COLORS,
  TIER_LABELS,
  TAG_LABELS,
  type CreatorRole,
  type OriginalityRating,
  type ReturnIntent,
  type AllTag,
  type PerformanceStats,
} from "@/lib/performance/TMIPerformanceIntelligenceEngine";

interface PerformanceVotePanelProps {
  performanceId: string;
  creatorId: string;
  creatorRole: CreatorRole;
  creatorName?: string;
  fanId?: string;
  accentColor?: string;
  contextId?: string;
  contextType?: "battle" | "cypher" | "room" | "contest" | "submission";
  onVoteComplete?: (stats: PerformanceStats) => void;
}

type Step = "liked" | "originality" | "score" | "tags" | "return" | "done";

const ORIGINALITY_OPTIONS: { value: OriginalityRating; label: string; desc: string }[] = [
  { value: "NEW_SOUND",           label: "New Sound",                  desc: "Doesn't sound like anything I've heard" },
  { value: "FAMILIAR",            label: "Familiar but good",          desc: "Similar style, not a direct copy"       },
  { value: "SIMILAR_TO_EXISTING", label: "Sounds like another artist", desc: "Reminds me of someone specific"        },
  { value: "UNSURE",              label: "Not sure",                   desc: "Hard to place"                         },
];

function ScoreDot({ n, active, color, onClick }: { n: number; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: "50%", border: `2px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
        background: active ? `${color}22` : "rgba(255,255,255,0.03)",
        color: active ? color : "rgba(255,255,255,0.5)",
        fontWeight: 900, fontSize: 16, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {n}
    </button>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 2, background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function PerformanceVotePanel({
  performanceId,
  creatorId,
  creatorRole,
  creatorName,
  fanId = "anon",
  accentColor = "#FF2DAA",
  contextId,
  contextType,
  onVoteComplete,
}: PerformanceVotePanelProps) {
  const alreadyVoted = hasVoted(performanceId, fanId);
  const judgeProfile = getJudgeProfile(fanId);
  const roleConfig   = getRoleConfig(creatorRole);

  const [step,         setStep]         = useState<Step>(alreadyVoted ? "done" : "liked");
  const [liked,        setLiked]        = useState<boolean | null>(null);
  const [originality,  setOriginality]  = useState<OriginalityRating | null>(null);
  const [perfScore,    setPerfScore]    = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<AllTag[]>([]);
  const [returnIntent, setReturnIntent] = useState<ReturnIntent | null>(null);
  const [stats,        setStats]        = useState<PerformanceStats | null>(
    alreadyVoted ? getPerformanceStats(performanceId) : null,
  );

  const allTags: AllTag[] = [...roleConfig.universalTags, ...roleConfig.roleTags];

  function toggleTag(tag: AllTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function submitVote(ri: ReturnIntent) {
    if (liked === null || !originality || perfScore < 1) return;
    castPerformanceVote({
      performanceId,
      creatorId,
      creatorRole,
      fanId,
      liked,
      originalityRating: originality,
      performanceScore: perfScore,
      wouldWatchAgain: ri,
      tags: selectedTags,
      contextId,
      contextType,
    });
    recordJudgeVote(fanId, performanceId);
    const s = getPerformanceStats(performanceId);
    setStats(s);
    setStep("done");
    onVoteComplete?.(s);
  }

  const base: React.CSSProperties = {
    background:   "rgba(255,255,255,0.03)",
    border:       `1px solid ${accentColor}30`,
    borderRadius: 16,
    padding:      "22px 24px",
    fontFamily:   "'Inter', sans-serif",
    color:        "#fff",
    maxWidth:     480,
  };

  // ── DONE STATE ────────────────────────────────────────────────────────────
  if (step === "done" && stats) {
    const tierColor = TIER_COLORS[judgeProfile.reputationTier];
    return (
      <div style={base}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: accentColor }}>
              PERFORMANCE STATS
            </div>
            {creatorName && (
              <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>{creatorName}</div>
            )}
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: tierColor }}>{TIER_LABELS[judgeProfile.reputationTier]}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
              {judgeProfile.totalVotesCast} vote{judgeProfile.totalVotesCast !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          {[
            { label: "Like Score",   value: stats.likeScore,        color: stats.likeScore >= 70 ? "#00FF88" : "#FFD700" },
            { label: "Performance",  value: stats.performanceScore, color: accentColor                                   },
            { label: "Originality",  value: stats.originalityScore, color: "#00FFFF"                                     },
            { label: "Crowd Energy", value: stats.crowdEnergyScore, color: "#FF2DAA"                                     },
            { label: "Return Rate",  value: stats.returnIntent,     color: "#00FF88"                                     },
            { label: "Familiar Risk",value: stats.familiarityRisk,  color: stats.familiarityRisk >= 40 ? "#FF5050" : "rgba(255,255,255,0.3)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>{s.value}%</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {stats.topTags.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginBottom: 8 }}>
              FAN FEEDBACK
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {stats.topTags.map((t) => (
                <span key={t.tag} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: `${accentColor}14`, border: `1px solid ${accentColor}28`, color: accentColor }}>
                  {TAG_LABELS[t.tag]} {t.percent}%
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {stats.totalVotes} vote{stats.totalVotes !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700,
            color: stats.styleEvolutionTrend === "RISING" ? "#00FF88" : stats.styleEvolutionTrend === "FALLING" ? "#FF5050" : "#FFD700" }}>
            {stats.styleEvolutionTrend === "RISING" ? "↑ RISING" : stats.styleEvolutionTrend === "FALLING" ? "↓ FALLING" : "→ STABLE"}
          </span>
        </div>
      </div>
    );
  }

  const progressStep = { liked: 1, originality: 2, score: 3, tags: 4, return: 5, done: 5 }[step];

  return (
    <div style={base}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: accentColor }}>
            {roleConfig.icon} JUDGE THIS {roleConfig.label.toUpperCase()}
          </div>
          {creatorName && <div style={{ fontSize: 14, fontWeight: 800, marginTop: 3 }}>{creatorName}</div>}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{progressStep}/5</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginBottom: 22 }}>
        <div style={{ width: `${(progressStep / 5) * 100}%`, height: "100%", background: accentColor, borderRadius: 1, transition: "width 0.3s" }} />
      </div>

      {/* Step 1 — Liked */}
      {step === "liked" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Did you like it?</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ v: true, label: "👍  Yes" }, { v: false, label: "👎  No" }].map((opt) => (
              <button
                key={String(opt.v)}
                onClick={() => { setLiked(opt.v); setStep("originality"); }}
                style={{
                  flex: 1, padding: "14px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 15,
                  background: liked === opt.v ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${liked === opt.v ? accentColor : "rgba(255,255,255,0.1)"}`,
                  color: liked === opt.v ? accentColor : "rgba(255,255,255,0.6)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Originality */}
      {step === "originality" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Does it sound original?</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {ORIGINALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setOriginality(opt.value); setStep("score"); }}
                style={{
                  textAlign: "left" as const, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  background: originality === opt.value ? `${accentColor}16` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${originality === opt.value ? accentColor : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: originality === opt.value ? accentColor : "#fff" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Performance score */}
      {step === "score" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>How was the performance?</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            1 = weak · 5 = exceptional
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <ScoreDot
                key={n}
                n={n}
                active={perfScore >= n}
                color={accentColor}
                onClick={() => setPerfScore(n)}
              />
            ))}
          </div>
          <button
            onClick={() => { if (perfScore >= 1) setStep("tags"); }}
            disabled={perfScore < 1}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: perfScore >= 1 ? "pointer" : "not-allowed",
              background: perfScore >= 1 ? `linear-gradient(135deg,${accentColor},${accentColor}99)` : "rgba(255,255,255,0.06)",
              color: perfScore >= 1 ? "#050510" : "rgba(255,255,255,0.3)",
              fontWeight: 900, fontSize: 14,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 4 — Tags */}
      {step === "tags" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
            What stood out?
            <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>optional</span>
          </div>
          <div style={{ fontSize: 10, color: accentColor, fontWeight: 700, marginBottom: 14 }}>
            {roleConfig.icon} {roleConfig.label} tags
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 20 }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background:  selectedTags.includes(tag) ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                  border:      `1px solid ${selectedTags.includes(tag) ? accentColor : "rgba(255,255,255,0.1)"}`,
                  color:       selectedTags.includes(tag) ? accentColor : "rgba(255,255,255,0.55)",
                }}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("return")}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${accentColor},${accentColor}99)`,
              color: "#050510", fontWeight: 900, fontSize: 14,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 5 — Would watch again */}
      {step === "return" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Would you watch them again?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {([["YES", "Definitely", "#00FF88"], ["MAYBE", "Maybe", "#FFD700"], ["NO", "Probably not", "#FF5050"]] as const).map(([v, label, color]) => (
              <button
                key={v}
                onClick={() => { setReturnIntent(v); submitVote(v); }}
                style={{
                  flex: 1, padding: "13px 6px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 12,
                  background: returnIntent === v ? `${color}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${returnIntent === v ? color : "rgba(255,255,255,0.1)"}`,
                  color: returnIntent === v ? color : "rgba(255,255,255,0.6)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
