"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import { getHomeCrownFeed, type HomeCrownFeedGenre, type HomeCrownFeedRow } from "@/components/home/data/getHomeCrownFeed";

const GENRE_CYCLE_SECONDS = 18;
const LOWER_RANK_WINDOW_SECONDS = 3;
const TOP_RANK_WINDOW_SECONDS = 5;
const TOP_RANK_START_SECONDS = 12;
const CROWN_TRIGGER_SECONDS = 15.5;

function getCycleCrownMode(cycle: number): "glow" | "fire" | "shine" | "phase" {
  const modes: Array<"glow" | "fire" | "shine" | "phase"> = ["glow", "fire", "shine", "phase"];
  return modes[cycle % modes.length];
}

function CrownIcon({ active, mode }: Readonly<{ active: boolean; mode: "glow" | "fire" | "shine" | "phase" }>) {
  const glowColor = mode === "fire" ? "#ff7a33" : mode === "shine" ? "#ffe37d" : "#ffd700";
  const opacity = mode === "phase" ? [0.2, 1, 0.4, 1] : [0.55, 1, 0.55];
  return (
    <motion.svg
      width="48" height="40" viewBox="0 0 48 40" fill="none"
      animate={{
        filter: active
          ? [`drop-shadow(0 0 6px ${glowColor})`, `drop-shadow(0 0 22px ${glowColor})`, `drop-shadow(0 0 8px ${glowColor})`]
          : ["drop-shadow(0 0 4px rgba(255,215,0,0.5))"],
        opacity: active ? opacity : [0.65],
        scale: active ? [1, 1.08, 1] : [1],
      }}
      transition={{ duration: active ? 1.4 : 0.3, repeat: Infinity }}
    >
      <motion.path
        d="M4 36 L8 14 L16 26 L24 6 L32 26 L40 14 L44 36 Z"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1.5"
        animate={{ y: active ? [0, -3.5, 0] : [0, -1, 0] }}
        transition={{ duration: active ? 1.2 : 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="4" cy="14" r="3" fill="#FF2DAA" />
      <circle cx="24" cy="6" r="3.5" fill="#00FFFF" />
      <circle cx="44" cy="14" r="3" fill="#FF2DAA" />
      <rect x="4" y="36" width="40" height="4" rx="2" fill="#AA6600" />
    </motion.svg>
  );
}

export default function WeeklyCrownBelt() {
  const [genreData, setGenreData] = useState<HomeCrownFeedGenre[]>([]);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [genreIdx, setGenreIdx] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [maxTenureDays, setMaxTenureDays] = useState(60);

  useEffect(() => {
    getHomeCrownFeed()
      .then((payload) => {
        setGenreData(payload.data.genres);
        setMaxTenureDays(payload.data.rules.maxTenureDays);
        setSource(payload.source);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setCycleProgress((prev) => {
        const next = prev + 0.1;
        if (next >= GENRE_CYCLE_SECONDS) {
          setGenreIdx((idx) => idx + 1);
          setCycleCount((count) => count + 1);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(t);
  }, []);

  const genrePool = useMemo(
    () => (genreData.length > 0 ? genreData.map((entry) => entry.genre) : ["Hip-Hop", "R&B", "Rock", "Electronic"]),
    [genreData],
  );

  const activeGenre = genrePool[genreIdx % genrePool.length] ?? "Hip-Hop";
  const activeGenreData = genreData.find((item) => item.genre === activeGenre) ?? genreData[0];

  const genreRows = useMemo<HomeCrownFeedRow[]>(() => {
    if (activeGenreData?.ranked?.length) {
      return activeGenreData.ranked.slice(0, 10);
    }

    return [
      {
        id: "seed-1",
        artistName: "FOUNDING ARTIST",
        genre: activeGenre,
        rank: 1,
        score: 80,
        eligible: true,
        inCooldown: false,
      },
    ];
  }, [activeGenreData, activeGenre]);

  const winner = genreRows[0];
  const lowerRanks = genreRows.slice(1);
  const lowerCycleStep = Math.max(0, Math.floor(Math.max(0, cycleProgress - 2) / LOWER_RANK_WINDOW_SECONDS));
  const activeLower = lowerRanks.length > 0 ? lowerRanks[lowerCycleStep % lowerRanks.length] : null;
  const inTopRankWindow = cycleProgress >= TOP_RANK_START_SECONDS && cycleProgress <= TOP_RANK_START_SECONDS + TOP_RANK_WINDOW_SECONDS;
  const crownActive = cycleProgress >= CROWN_TRIGGER_SECONDS && cycleProgress <= GENRE_CYCLE_SECONDS - 0.4;
  const crownMode = getCycleCrownMode(cycleCount);

  function renderMotionPortrait(row: HomeCrownFeedRow, emphasize: boolean) {
    const duration = emphasize ? TOP_RANK_WINDOW_SECONDS : LOWER_RANK_WINDOW_SECONDS;
    const initials = row.artistName
      .split(" ")
      .slice(0, 2)
      .map((token) => token[0])
      .join("")
      .toUpperCase();

    return (
      <motion.div
        key={`${row.id}-${emphasize ? "top" : "support"}`}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.03, y: -8 }}
        transition={{ duration: 0.45 }}
        style={{
          borderRadius: 12,
          border: `1px solid ${emphasize ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.16)"}`,
          background: emphasize
            ? "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,255,255,0.12), rgba(255,45,170,0.14))"
            : "linear-gradient(135deg, rgba(0,255,255,0.13), rgba(255,45,170,0.11), rgba(255,215,0,0.08))",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", minHeight: emphasize ? 230 : 150, padding: emphasize ? 16 : 12 }}>
          <motion.div
            animate={{ x: [0, 6, -5, 0], y: [0, -3, 2, 0], scale: [1, 1.06, 1] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: -40,
              background:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.26), transparent 44%), radial-gradient(circle at 70% 74%, rgba(0,255,255,0.2), transparent 46%)",
            }}
          />
          <motion.div
            animate={{ rotate: [0, 1.5, -1.5, 0], y: [0, -2, 1, 0] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative",
              zIndex: 2,
              width: emphasize ? 112 : 82,
              height: emphasize ? 112 : 82,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: emphasize ? 32 : 24,
              fontWeight: 900,
              color: "#ffffff",
              textShadow: "0 0 14px rgba(0,0,0,0.45)",
              background: "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.25), rgba(8,14,34,0.85))",
              boxShadow: emphasize ? "0 0 30px rgba(255,215,0,0.25)" : "0 0 18px rgba(0,255,255,0.16)",
            }}
          >
            {initials}
          </motion.div>
          <div style={{ position: "relative", zIndex: 2, marginTop: 10 }}>
            <div style={{ fontSize: emphasize ? 22 : 15, fontWeight: 900, lineHeight: 1.15 }}>{row.artistName.toUpperCase()}</div>
            <div style={{ marginTop: 4, fontSize: emphasize ? 13 : 11, opacity: 0.88 }}>{row.genre}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.74)" }}>
              #{row.rank} • crown score {row.score.toFixed(1)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F0A00 0%, #100800 50%, #0A0A1A 100%)",
      border: "1px solid rgba(255,215,0,0.25)",
      borderRadius: 12,
      padding: "28px 28px 24px",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 0 40px rgba(255,215,0,0.06), 0 0 80px rgba(255,45,170,0.04)",
    }}>
      {/* Gold radial glow behind crown */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, position: "relative", zIndex: 1 }}>
        {/* Left: winner spotlight */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionTitle title="Weekly Crown" accent="gold" badge={`${activeGenre} • ${source === "live" ? "Live" : "Seeded"}`} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <CrownIcon active={crownActive} mode={crownMode} />
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={`${winner.id}-${activeGenre}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 4 }}>
                    ♛ crown sequence {crownActive ? "active" : "arming"}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 4 }}>
                    {winner.artistName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                    Crown tenure: day {activeGenreData?.term.daysHeld ?? 0} of {maxTenureDays}
                  </div>
                  <div style={{ fontSize: 11, color: "#FFD700" }}>
                    crown score {winner.score.toFixed(2)} • #{winner.rank} • {winner.genre}
                  </div>
                  {activeGenreData?.term.warningActive ? (
                    <div style={{ marginTop: 6, fontSize: 10, color: "#ffb347" }}>
                      term warning: {activeGenreData.term.remainingTenureDays} days left before cooldown
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Link href="/contest" style={{ padding: "7px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: "#FFD700", color: "#000", borderRadius: 5 }}>
                  Vote Now
                </Link>
                <Link href="/winners" style={{ padding: "7px 18px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(255,215,0,0.4)", color: "#FFD700", borderRadius: 5 }}>
                  All Winners
                </Link>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
              Motion portrait sequence
            </div>
            <AnimatePresence mode="wait">
              {inTopRankWindow ? (
                <div key={`top-${winner.id}`}>{renderMotionPortrait(winner, true)}</div>
              ) : activeLower ? (
                <div key={`support-${activeLower.id}`}>{renderMotionPortrait(activeLower, false)}</div>
              ) : null}
            </AnimatePresence>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>Ranks #2-#10: {LOWER_RANK_WINDOW_SECONDS}s motion windows</span>
              <span style={{ fontSize: 10, color: "rgba(255,215,0,0.82)" }}>Rank #1: {TOP_RANK_WINDOW_SECONDS}s spotlight</span>
            </div>
          </div>
        </div>

        {/* Right: genre wheel */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 160 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
            Genre Crown
          </div>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            border: "2px solid rgba(255,215,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)",
            position: "relative",
          }}>
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px dashed rgba(255,215,0,0.15)" }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={`${genreIdx}-${activeGenre}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: "center" }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", textAlign: "center", lineHeight: 1.2 }}>
                    {activeGenre}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 160 }}>
            {genrePool.slice(0, 8).map((g, i) => (
              <span key={g} style={{
                fontSize: 8, padding: "2px 7px", borderRadius: 3,
                background: g === activeGenre ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                color: g === activeGenre ? "#FFD700" : "rgba(255,255,255,0.3)",
                border: `1px solid ${g === activeGenre ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
                letterSpacing: "0.08em",
              }}>{g}</span>
            ))}
          </div>
          <div style={{ marginTop: 12, width: "100%" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.58)", marginBottom: 4 }}>
              Genre cycle {(GENRE_CYCLE_SECONDS - cycleProgress).toFixed(1)}s
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: crownActive
                    ? "linear-gradient(90deg, #ff7a33, #ffd700, #00ffff)"
                    : "linear-gradient(90deg, #00ffff, #aa2dff)",
                }}
                animate={{ width: `${Math.min(100, (cycleProgress / GENRE_CYCLE_SECONDS) * 100)}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
