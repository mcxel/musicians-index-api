"use client";
/**
 * JudgeInterface — battle/cypher judging panel for official judges.
 * Displays criteria, sliders, and submits score via API.
 */
import { useState } from "react";

const CRITERIA = [
  { key: "flow",        label: "Flow",        description: "Rhythm, cadence, and delivery" },
  { key: "lyrics",      label: "Lyrics",      description: "Content, wordplay, and creativity" },
  { key: "performance", label: "Performance", description: "Stage presence and energy" },
  { key: "originality", label: "Originality", description: "Unique style and voice" },
  { key: "crowd",       label: "Crowd",       description: "Crowd reaction and engagement" },
];

interface Contestant {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface Props {
  battleId: string;
  contestants: [Contestant, Contestant];
  judgeId: string;
  judgeName: string;
  accentColor?: string;
  onScoreSubmit?: (scores: Record<string, Record<string, number>>) => void;
}

export default function JudgeInterface({
  battleId,
  contestants,
  judgeId,
  judgeName,
  accentColor = "#FFD700",
  onScoreSubmit,
}: Props) {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({
    [contestants[0].id]: { flow: 5, lyrics: 5, performance: 5, originality: 5, crowd: 5 },
    [contestants[1].id]: { flow: 5, lyrics: 5, performance: 5, originality: 5, crowd: 5 },
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  function setScore(contestantId: string, criterion: string, value: number) {
    setScores(prev => ({
      ...prev,
      [contestantId]: { ...prev[contestantId], [criterion]: value },
    }));
  }

  function getTotal(contestantId: string): number {
    return Object.values(scores[contestantId] ?? {}).reduce((a, b) => a + b, 0);
  }

  function getWinner(): Contestant | null {
    const t0 = getTotal(contestants[0].id);
    const t1 = getTotal(contestants[1].id);
    if (t0 > t1) return contestants[0];
    if (t1 > t0) return contestants[1];
    return null;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch(`/api/battles/${battleId}/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId, scores, notes, battleId }),
      });
      setSubmitted(true);
      onScoreSubmit?.(scores);
    } catch (e) {
      console.error("Score submit failed:", e);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const winner = getWinner();
    return (
      <div style={{
        background: "rgba(5,5,16,0.97)", borderRadius: 18,
        border: `1px solid ${accentColor}33`, padding: "32px",
        textAlign: "center", fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88", marginBottom: 6 }}>SCORES SUBMITTED</div>
        {winner ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            Your scorecard gives the edge to <span style={{ color: winner.color, fontWeight: 800 }}>{winner.name}</span>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Your scorecard is a TIE</div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(5,5,16,0.97)", borderRadius: 18,
      border: `1px solid ${accentColor}33`, padding: "20px",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", color: accentColor, fontWeight: 900 }}>
          ⚖️ JUDGE SCORECARD
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 3 }}>
          {judgeName}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
          Battle ID: {battleId}
        </div>
      </div>

      {/* Contestant headers */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div />
        {contestants.map(c => (
          <div key={c.id} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{c.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: c.color }}>{c.name}</div>
            <div style={{
              fontSize: 16, fontWeight: 900, color: accentColor, marginTop: 4,
            }}>
              {getTotal(c.id)}/50
            </div>
          </div>
        ))}
      </div>

      {/* Criteria rows */}
      {CRITERIA.map(criterion => (
        <div key={criterion.key} style={{
          display: "grid", gridTemplateColumns: "120px 1fr 1fr",
          gap: 12, marginBottom: 16, alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{criterion.label}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", lineHeight: 1.3 }}>{criterion.description}</div>
          </div>
          {contestants.map(c => (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <input
                type="range"
                min={1}
                max={10}
                value={scores[c.id]?.[criterion.key] ?? 5}
                onChange={e => setScore(c.id, criterion.key, Number(e.target.value))}
                style={{ width: "100%", accentColor: c.color, cursor: "pointer" }}
              />
              <div style={{ textAlign: "center", fontSize: 14, fontWeight: 900, color: c.color }}>
                {scores[c.id]?.[criterion.key] ?? 5}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Notes */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 6 }}>
          JUDGE NOTES (OPTIONAL)
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add commentary visible to admin after battle ends..."
          style={{
            width: "100%", minHeight: 72, padding: "8px 10px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, color: "#fff", fontSize: 11, resize: "vertical",
            fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Winner preview */}
      {(() => {
        const winner = getWinner();
        return (
          <div style={{
            padding: "8px 12px", borderRadius: 8,
            background: winner ? `${winner.color}12` : "rgba(255,255,255,0.04)",
            border: `1px solid ${winner ? winner.color + "33" : "rgba(255,255,255,0.08)"}`,
            fontSize: 10, color: winner ? winner.color : "rgba(255,255,255,0.4)",
            fontWeight: 800, marginBottom: 14, textAlign: "center",
          }}>
            {winner ? `🏆 Your scorecard: ${winner.name} wins (${getTotal(winner.id)} vs ${getTotal(contestants.find(c => c.id !== winner.id)!.id)})` : "⚖️ Current score: TIE"}
          </div>
        );
      })()}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", padding: "12px", borderRadius: 10,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
          color: "#000", fontWeight: 900, fontSize: 11, border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.12em", opacity: loading ? 0.6 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "SUBMITTING..." : "⚖️ SUBMIT SCORECARD"}
      </button>
    </div>
  );
}
