"use client";

import { useState } from "react";
import {
  castVote,
  hasFanVoted,
  getSongStats,
  type OriginalityRating,
  type FeedbackTag,
  type SongVoteStats,
} from "@/lib/voting/SongOriginalityVoteEngine";

interface SongOriginalityPollProps {
  songId: string;
  artistId: string;
  fanId?: string;
  songTitle?: string;
  accentColor?: string;
  onVoteComplete?: (stats: SongVoteStats) => void;
}

const ORIGINALITY_OPTIONS: { value: OriginalityRating; label: string; desc: string }[] = [
  { value: "NEW_SOUND",           label: "New Sound",              desc: "Doesn't sound like anything I've heard" },
  { value: "FAMILIAR",            label: "Sounds Familiar",        desc: "Similar style, but not a direct copy"   },
  { value: "SIMILAR_TO_EXISTING", label: "Sounds Like Another Artist", desc: "Reminds me of someone specific"   },
  { value: "UNSURE",              label: "Not Sure",               desc: "I can't quite place it"               },
];

const TAGS: { value: FeedbackTag; label: string }[] = [
  { value: "FLOW",          label: "Flow"          },
  { value: "BEAT",          label: "Beat"          },
  { value: "HOOK",          label: "Hook"          },
  { value: "VOICE",         label: "Voice"         },
  { value: "MIXING",        label: "Mixing"        },
  { value: "ENERGY",        label: "Energy"        },
  { value: "LYRICS",        label: "Lyrics"        },
  { value: "STAGE_PRESENCE",label: "Stage Presence"},
];

type Step = "liked" | "originality" | "tags" | "done";

function mapTagToSongDnaPart(tag: FeedbackTag): 'hook' | 'beat' | 'vocals' | 'lyrics' | 'energy' | 'mix' | 'overall' {
  if (tag === 'HOOK') return 'hook';
  if (tag === 'BEAT') return 'beat';
  if (tag === 'VOICE' || tag === 'STAGE_PRESENCE') return 'vocals';
  if (tag === 'LYRICS' || tag === 'FLOW') return 'lyrics';
  if (tag === 'ENERGY') return 'energy';
  if (tag === 'MIXING') return 'mix';
  return 'overall';
}

export default function SongOriginalityPoll({
  songId,
  artistId,
  fanId = "anon",
  songTitle,
  accentColor = "#00FFFF",
  onVoteComplete,
}: SongOriginalityPollProps) {
  const alreadyVoted = hasFanVoted(songId, fanId);
  const [step,              setStep]              = useState<Step>(alreadyVoted ? "done" : "liked");
  const [liked,             setLiked]             = useState<boolean | null>(null);
  const [originalityRating, setOriginalityRating] = useState<OriginalityRating | null>(null);
  const [selectedTags,      setSelectedTags]      = useState<FeedbackTag[]>([]);
  const [stats,             setStats]             = useState<SongVoteStats | null>(
    alreadyVoted ? getSongStats(songId) : null,
  );

  function toggleTag(tag: FeedbackTag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }

  function submit() {
    if (liked === null || !originalityRating) return;
    castVote({
      songId,
      artistId,
      fanId,
      liked,
      originalityRating,
      feedbackTags: selectedTags,
    });

    const bestPart = selectedTags.length > 0 ? mapTagToSongDnaPart(selectedTags[0]) : 'overall';
    const needsWork = liked
      ? 'none'
      : (selectedTags.length > 0 ? mapTagToSongDnaPart(selectedTags[0]) : 'overall');

    void fetch('/api/analytics/song-dna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songId,
        artistId,
        bestPart,
        needsWork,
        listenAgainTomorrow: liked,
      }),
    }).catch(() => null);

    const s = getSongStats(songId);
    setStats(s);
    setStep("done");
    onVoteComplete?.(s);
  }

  const base: React.CSSProperties = {
    background:  "rgba(255,255,255,0.03)",
    border:      `1px solid ${accentColor}28`,
    borderRadius: 14,
    padding:     "20px 22px",
    fontFamily:  "'Inter', sans-serif",
    color:       "#fff",
  };

  if (step === "done" && stats) {
    return (
      <div style={base}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: accentColor, marginBottom: 8 }}>
          SONG STATS
        </div>
        {songTitle && <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>{songTitle}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Like Score",        value: `${stats.likeScore}%`,        color: stats.likeScore >= 70 ? "#00FF88" : "#FFD700" },
            { label: "Originality",       value: `${stats.originalityScore}%`, color: accentColor                                   },
            { label: "Familiarity Risk",  value: `${stats.familiarityRisk}%`,  color: stats.familiarityRisk >= 40 ? "#FF5050" : "#00FF88" },
            { label: "Trend",             value: stats.styleEvolutionTrend,    color: stats.styleEvolutionTrend === "RISING" ? "#00FF88" : stats.styleEvolutionTrend === "FALLING" ? "#FF5050" : "#FFD700" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {stats.topTags.length > 0 && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginBottom: 8 }}>
              FAN FEEDBACK
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {stats.topTags.map(t => (
                <span key={t.tag} style={{ padding: "4px 10px", borderRadius: 20, background: `${accentColor}14`, border: `1px solid ${accentColor}30`, fontSize: 10, fontWeight: 700, color: accentColor }}>
                  {t.tag.replace("_", " ")} {t.percent}%
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          {stats.totalVotes} vote{stats.totalVotes !== 1 ? "s" : ""} total
        </div>
      </div>
    );
  }

  return (
    <div style={base}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: accentColor, marginBottom: 8 }}>
        RATE THIS SONG
      </div>
      {songTitle && <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>{songTitle}</div>}

      {/* Step 1 — Like */}
      {step === "liked" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Did you like it?</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ v: true, label: "Yes 👍" }, { v: false, label: "No 👎" }].map(opt => (
              <button
                key={String(opt.v)}
                onClick={() => { setLiked(opt.v); setStep("originality"); }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 14,
                  background: liked === opt.v ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                  border:     `1px solid ${liked === opt.v ? accentColor : "rgba(255,255,255,0.1)"}`,
                  color:      liked === opt.v ? accentColor : "rgba(255,255,255,0.6)",
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Does this sound original?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ORIGINALITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setOriginalityRating(opt.value); setStep("tags"); }}
                style={{
                  textAlign: "left" as const, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  background: originalityRating === opt.value ? `${accentColor}16` : "rgba(255,255,255,0.03)",
                  border:     `1px solid ${originalityRating === opt.value ? accentColor : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: originalityRating === opt.value ? accentColor : "#fff" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Tags */}
      {step === "tags" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>What stood out? <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>(optional)</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {TAGS.map(t => (
              <button
                key={t.value}
                onClick={() => toggleTag(t.value)}
                style={{
                  padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background:  selectedTags.includes(t.value) ? `${accentColor}20` : "rgba(255,255,255,0.04)",
                  border:      `1px solid ${selectedTags.includes(t.value) ? accentColor : "rgba(255,255,255,0.1)"}`,
                  color:       selectedTags.includes(t.value) ? accentColor : "rgba(255,255,255,0.6)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
              color: "#050510", fontWeight: 900, fontSize: 14, letterSpacing: "0.04em",
            }}
          >
            Submit Vote →
          </button>
          <button
            onClick={submit}
            style={{ display: "block", marginTop: 8, background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", width: "100%", textAlign: "center" as const }}
          >
            Skip tags and submit
          </button>
        </div>
      )}
    </div>
  );
}
