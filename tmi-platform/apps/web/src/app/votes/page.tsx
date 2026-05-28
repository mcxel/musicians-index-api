"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Contest {
  id: string;
  label: string;
  end: string;
  votes: number;
  color: string;
  icon: string;
}

const INITIAL_CONTESTS: Contest[] = [
  { id: "v1", label: "Artist of the Week",  end: "Jun 4, 2026",  votes: 1240, color: "#00FFFF", icon: "🎤" },
  { id: "v2", label: "Best Cypher Battle",  end: "Jun 5, 2026",  votes: 890,  color: "#AA2DFF", icon: "⚔️" },
  { id: "v3", label: "Fan Favorite Track",  end: "Jun 7, 2026",  votes: 3400, color: "#FFD700", icon: "🎵" },
  { id: "v4", label: "Top Dancer Showdown", end: "Jun 8, 2026",  votes: 612,  color: "#FF2DAA", icon: "💃" },
  { id: "v5", label: "Best Comedian",       end: "Jun 10, 2026", votes: 488,  color: "#00FF88", icon: "😂" },
];

const chip: React.CSSProperties = {
  color: "#fde68a",
  textDecoration: "none",
  fontSize: 12,
  border: "1px solid rgba(253,230,138,0.3)",
  borderRadius: 8,
  padding: "8px 12px",
};

export default function VotesPage() {
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  async function castVote(contestId: string) {
    if (voted.has(contestId) || loading.has(contestId)) return;

    setLoading((prev) => new Set([...prev, contestId]));

    try {
      await fetch("/api/rooms/challenges/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId }),
      });
    } catch {
      // fire-and-forget — optimistic update regardless
    }

    setContests((prev) =>
      prev.map((c) => c.id === contestId ? { ...c, votes: c.votes + 1 } : c)
    );
    setVoted((prev) => new Set([...prev, contestId]));
    setLoading((prev) => {
      const next = new Set(prev);
      next.delete(contestId);
      return next;
    });
  }

  return (
    <main
      data-testid="votes-page"
      style={{ minHeight: "100vh", background: "#050510", color: "#e2e8f0", paddingBottom: 80 }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #050510, #0a0820)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 24px 24px",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Link href="/home/4" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            ← HOME
          </Link>
          <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10, marginTop: 10 }}>
            ACTIVE VOTES
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900 }}>
            Community Voting
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            One vote per contest. Results tallied live.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {contests.map(({ id, label, end, votes, color, icon }) => {
            const hasVoted = voted.has(id);
            const isLoading = loading.has(id);
            return (
              <motion.div
                key={id}
                data-testid={`vote-${id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  border: `1px solid ${hasVoted ? color + "55" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14,
                  background: hasVoted ? `${color}08` : "rgba(255,255,255,0.02)",
                  padding: "18px 20px",
                  transition: "border-color 0.3s, background 0.3s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Ends {end}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: color, fontWeight: 800, textAlign: "right" }}>
                    {votes.toLocaleString()}<br />
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>VOTES</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    data-testid={`cast-vote-${id}`}
                    type="button"
                    onClick={() => void castVote(id)}
                    disabled={hasVoted || isLoading}
                    style={{
                      border: `1px solid ${hasVoted ? color + "66" : color + "44"}`,
                      borderRadius: 8,
                      background: hasVoted ? `${color}22` : `${color}14`,
                      color: hasVoted ? color : "#fff",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "8px 18px",
                      cursor: hasVoted ? "default" : "pointer",
                      letterSpacing: "0.1em",
                      transition: "all 0.2s",
                    }}
                  >
                    {isLoading ? "..." : hasVoted ? "✓ VOTED" : "CAST VOTE"}
                  </button>

                  {/* Vote bar */}
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (votes / 5000) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: color, borderRadius: 2 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link data-testid="votes-to-leaderboard" href="/leaderboard" style={chip}>Leaderboard →</Link>
          <Link data-testid="votes-to-prizes" href="/prizes" style={chip}>Prizes →</Link>
          <Link href="/battles" style={chip}>Battles →</Link>
        </div>
      </div>
    </main>
  );
}
