"use client";

/**
 * ScoresCanister — competitions / creator / engagement / XP from real sources only.
 * Prefers /api/competition/leaderboard; falls back to PerformerRegistry XP ranks.
 * Honest empty when both yield nothing. Animated display only for real numbers.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";
import { computeRanks, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";

export type ScoreLane = "xp" | "elo" | "wins" | "registry";

export interface ScoreItem {
  id: string;
  rank: number;
  competitorName: string;
  category: string;
  score: number;
  source: ScoreLane;
}

interface ScoresCanisterProps {
  accentColor?: string;
  role?: "fan" | "performer" | "admin";
}

type LoadState = "loading" | "ready" | "empty" | "error";

export function ScoresCanister({
  accentColor = "#00D4FF",
  role = "fan",
}: ScoresCanisterProps) {
  const [lane, setLane] = useState<"xp" | "elo" | "wins">("xp");
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [sourceNote, setSourceNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      try {
        const res = await fetch(`/api/competition/leaderboard?type=${lane}&limit=15`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            success?: boolean;
            leaderboard?: Array<{
              userId?: string;
              displayName?: string;
              username?: string;
              name?: string;
              xp?: number;
              elo?: number;
              rating?: number;
              wins?: number;
              score?: number;
            }>;
          };
          const entries = Array.isArray(data.leaderboard) ? data.leaderboard : [];
          if (entries.length > 0) {
            const mapped: ScoreItem[] = entries.map((e, i) => ({
              id: e.userId ?? `lb-${lane}-${i}`,
              rank: i + 1,
              competitorName: e.displayName || e.username || e.name || e.userId || "Competitor",
              category: lane.toUpperCase(),
              score: Number(e.score ?? e.xp ?? e.elo ?? e.rating ?? e.wins ?? 0) || 0,
              source: lane,
            }));
            if (!cancelled) {
              setScores(mapped);
              setSourceNote(`Live competition leaderboard (${lane})`);
              setState("ready");
            }
            return;
          }
        }

        // Registry fallback — XP-driven ranks only (Rule 3 / Rule 8)
        const ranked = computeRanks().slice(0, 15);
        if (ranked.length > 0) {
          const mapped = ranked.map((p: PerformerIdentity, i: number) => ({
            id: p.id,
            rank: i + 1,
            competitorName: p.name || p.slug,
            category: "REGISTRY XP",
            score: p.xp ?? 0,
            source: "registry" as const,
          }));
          if (!cancelled) {
            setScores(mapped);
            setSourceNote("PerformerRegistry XP ranks (competition API empty)");
            setState("ready");
          }
          return;
        }

        if (!cancelled) {
          setScores([]);
          setSourceNote("");
          setState("empty");
        }
      } catch {
        const ranked = computeRanks().slice(0, 15);
        if (ranked.length > 0) {
          if (!cancelled) {
            setScores(
              ranked.map((p, i) => ({
                id: p.id,
                rank: i + 1,
                competitorName: p.name || p.slug,
                category: "REGISTRY XP",
                score: p.xp ?? 0,
                source: "registry" as const,
              })),
            );
            setSourceNote("PerformerRegistry XP ranks (API unreachable)");
            setState("ready");
          }
          return;
        }
        if (!cancelled) {
          setScores([]);
          setState("error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [lane]);

  return (
    <DrawerBezelChrome variant="chrome" seriesLabel="Scores & Ranks" accentColor={accentColor}>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: accentColor }}>
            {role === "admin" ? "ADMIN SCORES READOUT" : "LEADERBOARDS · REAL DATA ONLY"}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["xp", "elo", "wins"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLane(l)}
                style={{
                  padding: "4px 8px",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  borderRadius: 4,
                  cursor: "pointer",
                  border: `1px solid ${lane === l ? accentColor : "rgba(255,255,255,0.15)"}`,
                  background: lane === l ? `${accentColor}22` : "transparent",
                  color: lane === l ? accentColor : "rgba(255,255,255,0.45)",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {sourceNote ? (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{sourceNote}</div>
        ) : null}

        {state === "loading" ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: 8 }}>Loading scores…</div>
        ) : null}
        {state === "empty" ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: 8 }}>
            No scores yet. Compete or earn XP to appear here.
          </div>
        ) : null}
        {state === "error" ? (
          <div style={{ fontSize: 11, color: "#FF6B9A", padding: 8 }}>
            Unable to load scores. Retry later.
          </div>
        ) : null}

        {state === "ready" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
            {scores.map((sc) => (
              <div
                key={sc.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: sc.rank === 1 ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.025)",
                  border:
                    sc.rank === 1 ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color:
                        sc.rank === 1
                          ? "#FFD700"
                          : sc.rank === 2
                            ? "#C0C0C0"
                            : sc.rank === 3
                              ? "#CD7F32"
                              : "rgba(255,255,255,0.5)",
                      width: 24,
                      textAlign: "center",
                    }}
                  >
                    #{sc.rank}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{sc.competitorName}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: accentColor, marginTop: 2 }}>
                      {sc.category}
                    </div>
                  </div>
                </div>
                <motion.div
                  key={`${sc.id}-${sc.score}`}
                  initial={{ opacity: 0.4, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ fontSize: 13, fontWeight: 900, color: accentColor }}
                >
                  {sc.score.toLocaleString()}
                  <span style={{ fontSize: 8, marginLeft: 4 }}>PTS</span>
                </motion.div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DrawerBezelChrome>
  );
}

export default ScoresCanister;
