"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  castPerformanceVote,
  getPerformanceStats,
  hasVoted,
  type OriginalityRating,
  type ReturnIntent,
  type PerformanceStats,
} from "@/lib/performance/PerformanceScoreEngine";
import {
  recordJudgeVote,
  getJudgeProfile,
  getJudgeVoteWeight,
  TIER_COLORS,
  TIER_LABELS,
  TIER_WEIGHTS,
  TIER_REQUIREMENTS,
  type JudgeTier,
  type FanJudgeProfile,
} from "@/lib/performance/FanJudgeReputationEngine";
import type { AllTag, UniversalTag } from "@/lib/performance/roles";
import type { CreatorRole } from "@/lib/performance/roles";

// ── Demo fan session ──────────────────────────────────────────────────────────

const DEMO_FAN_ID = "demo-fan-001";

// ── Demo performances (seed data) ────────────────────────────────────────────

interface Performance {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole: CreatorRole;
  title: string;
  description: string;
  icon: string;
  color: string;
  contextType: "battle" | "cypher" | "room" | "contest";
  contextLabel: string;
}

const DEMO_PERFORMANCES: Performance[] = [
  {
    id: "perf-001",
    creatorId: "artist-001",
    creatorName: "Kairo Blaze",
    creatorRole: "RAPPER",
    title: "Friday Night Freestyle",
    description: "16-bar freestyle over a custom Boom Bap beat. Raw delivery, heavy lyricism.",
    icon: "🎤",
    color: "#00FFFF",
    contextType: "cypher",
    contextLabel: "Cypher Arena",
  },
  {
    id: "perf-002",
    creatorId: "artist-002",
    creatorName: "Nova Reign",
    creatorRole: "SINGER",
    title: "Midnight Vocals",
    description: "Original R&B track with live harmonics. Emotional delivery, strong hook.",
    icon: "🎵",
    color: "#FF2DAA",
    contextType: "room",
    contextLabel: "Monday Stage",
  },
  {
    id: "perf-003",
    creatorId: "artist-003",
    creatorName: "DJ Axiom",
    creatorRole: "DJ",
    title: "60-Minute Club Set",
    description: "Seamless transitions, exclusive edits, crowd control mastery.",
    icon: "🎧",
    color: "#FFD700",
    contextType: "battle",
    contextLabel: "Battle Arena",
  },
  {
    id: "perf-004",
    creatorId: "artist-004",
    creatorName: "Lyric Storm",
    creatorRole: "RAPPER",
    title: "Battle Rap Round 1",
    description: "3-round battle, punching above weight class. Crowd energy was electric.",
    icon: "⚔️",
    color: "#00FF88",
    contextType: "battle",
    contextLabel: "Dirty Dozens",
  },
  {
    id: "perf-005",
    creatorId: "artist-005",
    creatorName: "Echo & The Machine",
    creatorRole: "PRODUCER",
    title: "Beat Lab Showcase",
    description: "Live beat construction from scratch. 4-track layering in under 8 minutes.",
    icon: "🎹",
    color: "#AA2DFF",
    contextType: "contest",
    contextLabel: "Beat Lab Contest",
  },
];

const UNIVERSAL_TAGS: UniversalTag[] = ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CONFIDENCE", "CREATIVITY", "VISUAL_PERFORMANCE"];

const ORIGINALITY_LABELS: Record<OriginalityRating, string> = {
  NEW_SOUND:           "New Sound",
  FAMILIAR:            "Familiar",
  SIMILAR_TO_EXISTING: "Sounds Like Someone",
  UNSURE:              "Not Sure",
};

const RETURN_INTENT_LABELS: Record<ReturnIntent, string> = {
  YES:   "Yes, I&apos;d watch again",
  NO:    "No",
  MAYBE: "Maybe",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: JudgeTier }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", border: `1px solid ${TIER_COLORS[tier]}44`, background: `${TIER_COLORS[tier]}11`, color: TIER_COLORS[tier] }}>
      {TIER_LABELS[tier].toUpperCase()}
    </span>
  );
}

function ScoreBar({ value, color = "#00FF88" }: { value: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, minWidth: 28 }}>{value}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PerformanceVotePage() {
  const [activePerf, setActivePerf] = useState<Performance | null>(null);
  const [judgeProfile, setJudgeProfile] = useState<FanJudgeProfile | null>(null);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Vote form state
  const [liked, setLiked]               = useState<boolean | null>(null);
  const [score, setScore]               = useState<number>(3);
  const [originality, setOriginality]   = useState<OriginalityRating>("FAMILIAR");
  const [returnIntent, setReturnIntent] = useState<ReturnIntent>("MAYBE");
  const [selectedTags, setSelectedTags] = useState<AllTag[]>([]);
  const [voteSent, setVoteSent]         = useState(false);

  useEffect(() => {
    const profile = getJudgeProfile(DEMO_FAN_ID);
    setJudgeProfile(profile);
    // Check which performances already have votes from this fan
    const voted = new Set(DEMO_PERFORMANCES.filter((p) => hasVoted(p.id, DEMO_FAN_ID)).map((p) => p.id));
    setVotedIds(voted);
  }, []);

  function openPerformance(perf: Performance) {
    setActivePerf(perf);
    setStats(getPerformanceStats(perf.id));
    setLiked(null);
    setScore(3);
    setOriginality("FAMILIAR");
    setReturnIntent("MAYBE");
    setSelectedTags([]);
    setVoteSent(false);
  }

  function toggleTag(tag: AllTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function submitVote() {
    if (!activePerf || liked === null) return;

    castPerformanceVote({
      performanceId: activePerf.id,
      creatorId: activePerf.creatorId,
      creatorRole: activePerf.creatorRole,
      fanId: DEMO_FAN_ID,
      liked,
      originalityRating: originality,
      performanceScore: score,
      wouldWatchAgain: returnIntent,
      tags: selectedTags,
      contextType: activePerf.contextType,
    });

    recordJudgeVote(DEMO_FAN_ID, activePerf.id);

    const updated = getJudgeProfile(DEMO_FAN_ID);
    setJudgeProfile(updated);
    setStats(getPerformanceStats(activePerf.id));
    setVotedIds((prev) => new Set([...prev, activePerf.id]));
    setVoteSent(true);
  }

  const voteWeight = judgeProfile ? getJudgeVoteWeight(DEMO_FAN_ID) : 1.0;
  const tier       = judgeProfile?.reputationTier ?? "ROOKIE";
  const nextTier   = tier === "ROOKIE" ? "TRUSTED" : tier === "TRUSTED" ? "ELITE" : tier === "ELITE" ? "LEGEND" : null;
  const nextReq    = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <Link href="/home/3" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← LIVE ROOMS</Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>PERFORMANCE INTELLIGENCE</div>
            <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, margin: "0 0 6px" }}>Fan Vote Panel</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Score live performances. Build your judge reputation. Your votes shape the platform.</p>
          </div>
          {/* Judge profile badge */}
          {judgeProfile && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${TIER_COLORS[tier]}33`, borderRadius: 14, padding: "14px 18px", minWidth: 200 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>YOUR JUDGE PROFILE</div>
              <div style={{ marginBottom: 8 }}><TierBadge tier={tier} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>VOTES CAST</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: TIER_COLORS[tier] }}>{judgeProfile.totalVotesCast}</div>
                </div>
                <div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>VOTE WEIGHT</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>×{voteWeight.toFixed(1)}</div>
                </div>
              </div>
              {nextReq && (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  Next: {nextTier} at {nextReq.votes} votes{nextReq.accuracy > 0 ? ` + ${nextReq.accuracy}% accuracy` : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier legend */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {(["ROOKIE", "TRUSTED", "ELITE", "LEGEND"] as JudgeTier[]).map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, border: `1px solid ${TIER_COLORS[t]}33`, background: `${TIER_COLORS[t]}08` }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: TIER_COLORS[t] }}>{TIER_LABELS[t]}</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>×{TIER_WEIGHTS[t].toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: activePerf ? "1fr 1fr" : "1fr", gap: 20, alignItems: "start" }}>

          {/* Performance list */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>ACTIVE PERFORMANCES</div>
            {DEMO_PERFORMANCES.map((perf) => {
              const voted = votedIds.has(perf.id);
              const perfStats = voted ? getPerformanceStats(perf.id) : null;
              return (
                <div
                  key={perf.id}
                  onClick={() => openPerformance(perf)}
                  style={{ background: activePerf?.id === perf.id ? `${perf.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${activePerf?.id === perf.id ? perf.color + "33" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{perf.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{perf.creatorName}</div>
                      <div style={{ fontSize: 10, color: perf.color }}>{perf.title}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{perf.contextLabel}</div>
                      {voted ? (
                        <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em" }}>VOTED</span>
                      ) : (
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>VOTE →</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: voted && perfStats ? 10 : 0 }}>{perf.description}</div>

                  {voted && perfStats && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
                      {[
                        { label: "LIKE SCORE", value: perfStats.likeScore, color: "#00FF88" },
                        { label: "PERFORMANCE", value: perfStats.performanceScore, color: "#00FFFF" },
                        { label: "ORIGINALITY", value: perfStats.originalityScore, color: "#AA2DFF" },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{label}</div>
                          <ScoreBar value={value} color={color} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vote panel */}
          {activePerf && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${activePerf.color}33`, borderRadius: 14, padding: "20px 18px", position: "sticky", top: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{activePerf.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{activePerf.creatorName}</div>
                  <div style={{ fontSize: 10, color: activePerf.color }}>{activePerf.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{activePerf.creatorRole} · {activePerf.contextLabel}</div>
                </div>
              </div>

              {voteSent ? (
                /* Post-vote stats */
                <div>
                  <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88", marginBottom: 4 }}>Vote Recorded</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Vote weight: ×{voteWeight.toFixed(1)} · <TierBadge tier={tier} /></div>
                  </div>

                  {stats && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>LIVE STATS — {stats.totalVotes} vote{stats.totalVotes !== 1 ? "s" : ""}</div>
                      {[
                        { label: "Like Score",    value: stats.likeScore,         color: "#00FF88" },
                        { label: "Performance",   value: stats.performanceScore,   color: "#00FFFF" },
                        { label: "Originality",   value: stats.originalityScore,   color: "#AA2DFF" },
                        { label: "Crowd Energy",  value: stats.crowdEnergyScore,   color: "#FFD700" },
                        { label: "Return Intent", value: stats.returnIntent,       color: "#FF2DAA" },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{label.toUpperCase()}</div>
                          <ScoreBar value={value} color={color} />
                        </div>
                      ))}
                      <div style={{ marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                        Style trend: <span style={{ fontWeight: 700, color: stats.styleEvolutionTrend === "RISING" ? "#00FF88" : stats.styleEvolutionTrend === "FALLING" ? "#FF2DAA" : "#FFD700" }}>{stats.styleEvolutionTrend}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setActivePerf(null)} style={{ width: "100%", marginTop: 16, padding: "10px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer" }}>
                    BACK TO LIST
                  </button>
                </div>
              ) : (
                /* Vote form */
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Liked? */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>DID YOU LIKE IT?</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setLiked(true)} style={{ flex: 1, padding: "9px 0", fontSize: 11, fontWeight: 800, color: liked === true ? "#050510" : "#00FF88", background: liked === true ? "#00FF88" : "transparent", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 8, cursor: "pointer" }}>👍 YES</button>
                      <button onClick={() => setLiked(false)} style={{ flex: 1, padding: "9px 0", fontSize: 11, fontWeight: 800, color: liked === false ? "#050510" : "#FF2DAA", background: liked === false ? "#FF2DAA" : "transparent", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 8, cursor: "pointer" }}>👎 NO</button>
                    </div>
                  </div>

                  {/* Score 1-5 */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>PERFORMANCE SCORE (1–5)</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setScore(n)} style={{ flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 900, color: score === n ? "#050510" : "rgba(255,255,255,0.5)", background: score === n ? activePerf.color : "rgba(255,255,255,0.04)", border: `1px solid ${score === n ? activePerf.color : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer" }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Originality */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>ORIGINALITY</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {(Object.keys(ORIGINALITY_LABELS) as OriginalityRating[]).map((r) => (
                        <button key={r} onClick={() => setOriginality(r)} style={{ padding: "7px 8px", fontSize: 9, fontWeight: 700, color: originality === r ? "#050510" : "rgba(255,255,255,0.5)", background: originality === r ? "#AA2DFF" : "rgba(255,255,255,0.03)", border: `1px solid ${originality === r ? "#AA2DFF" : "rgba(255,255,255,0.07)"}`, borderRadius: 7, cursor: "pointer" }}>
                          {ORIGINALITY_LABELS[r]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Would watch again */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>WOULD WATCH AGAIN?</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["YES", "NO", "MAYBE"] as ReturnIntent[]).map((r) => (
                        <button key={r} onClick={() => setReturnIntent(r)} style={{ flex: 1, padding: "8px 0", fontSize: 9, fontWeight: 800, color: returnIntent === r ? "#050510" : "rgba(255,255,255,0.5)", background: returnIntent === r ? "#00FFFF" : "rgba(255,255,255,0.03)", border: `1px solid ${returnIntent === r ? "#00FFFF" : "rgba(255,255,255,0.08)"}`, borderRadius: 7, cursor: "pointer" }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>TAGS (OPTIONAL)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {UNIVERSAL_TAGS.map((tag) => (
                        <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: "5px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: selectedTags.includes(tag) ? "#050510" : "rgba(255,255,255,0.4)", background: selectedTags.includes(tag) ? activePerf.color : "rgba(255,255,255,0.03)", border: `1px solid ${selectedTags.includes(tag) ? activePerf.color : "rgba(255,255,255,0.08)"}`, borderRadius: 999, cursor: "pointer" }}>
                          {tag.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vote weight indicator */}
                  <div style={{ background: `${TIER_COLORS[tier]}08`, border: `1px solid ${TIER_COLORS[tier]}22`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Your vote weight:</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: TIER_COLORS[tier] }}>×{voteWeight.toFixed(1)}</span>
                      <TierBadge tier={tier} />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={submitVote}
                    disabled={liked === null}
                    style={{ width: "100%", padding: "12px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: liked !== null ? "#050510" : "rgba(255,255,255,0.3)", background: liked !== null ? `linear-gradient(135deg, ${activePerf.color}, ${activePerf.color}99)` : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, cursor: liked !== null ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                  >
                    SUBMIT VOTE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
