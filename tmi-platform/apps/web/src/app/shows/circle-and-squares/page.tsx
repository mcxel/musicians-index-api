"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ShowRoomEnvironmentShell } from "@/components/environments/ShowRoomEnvironmentShell";
import { ShowRuntimeHUD } from "@/components/shows/ShowRuntimeHUD";
import { CircleAndSquaresEngine } from "@/lib/shows/CircleAndSquaresEngine";
import type { GridCell } from "@/lib/shows/CircleAndSquaresEngine";
import type { ShowState } from "@/lib/shows/ShowRuntimeEngine";

const SAMPLE_CONTESTANTS = [
  { id: 'sq1', name: 'Dante W.', color: '#FF2DAA' },
  { id: 'sq2', name: 'Nadia H.', color: '#00FFFF' },
  { id: 'sq3', name: 'Leon F.', color: '#FFD700' },
];

export default function CircleAndSquaresPage() {
  const engine = useMemo(() => {
    const e = new CircleAndSquaresEngine(9);
    SAMPLE_CONTESTANTS.forEach((c) => e.addContestant(c.id, c.name));
    return e;
  }, []);

  const [showState, setShowState] = useState<ShowState>(() => engine.getState());
  const [grid, setGrid] = useState<GridCell[]>(() => engine.getGrid());
  const [started, setStarted] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState(SAMPLE_CONTESTANTS[0].id);
  const [pattern, setPattern] = useState<string | null>(null);
  const [patternMsg, setPatternMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setShowState(engine.getState());
    setGrid(engine.getGrid());
  }, [engine]);

  const handleStart = useCallback(() => {
    engine.startShow();
    setStarted(true);
    refresh();
  }, [engine, refresh]);

  const handleCellClick = useCallback((cell: GridCell) => {
    if (!started) return;
    if (cell.occupantId !== null) return; // already assigned

    engine.assignCell(cell.position, selectedContestant);
    refresh();
  }, [engine, started, selectedContestant, refresh]);

  const handleReveal = useCallback((cell: GridCell) => {
    if (!started) return;
    if (cell.revealed) return;

    engine.revealCell(cell.position);
    const detectedPattern = engine.checkPattern();
    if (detectedPattern && detectedPattern !== pattern) {
      setPattern(detectedPattern);
      setPatternMsg(`PATTERN DETECTED: ${detectedPattern.toUpperCase()}! Bonus points awarded!`);
    }
    refresh();
  }, [engine, started, pattern, refresh]);

  const getContestantColor = (id: string | null): string => {
    if (!id) return 'rgba(255,255,255,0.06)';
    return SAMPLE_CONTESTANTS.find((c) => c.id === id)?.color ?? '#fff';
  };

  const getContestantInitial = (id: string | null): string => {
    if (!id) return '';
    const name = SAMPLE_CONTESTANTS.find((c) => c.id === id)?.name ?? id;
    return name[0];
  };

  return (
    <ShowRoomEnvironmentShell
      roomId="circle-squares"
      lightingMode="performance"
      occupancyPct={0.6}
      showSeating
      showHosts
      showSponsors
    >
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Link href="/shows" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textDecoration: "none" }}>
            ← SHOWS
          </Link>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#c4b5fd", fontWeight: 800 }}>THE MUSICIAN'S INDEX</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>CIRCLE & SQUARES</div>
          </div>
          {!started && (
            <button
              type="button"
              onClick={handleStart}
              style={{
                marginLeft: "auto",
                padding: "10px 22px",
                background: "rgba(196,181,253,0.12)",
                border: "1px solid #c4b5fd",
                borderRadius: 8,
                color: "#c4b5fd",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.15em",
                cursor: "pointer",
              }}
            >
              START SHOW
            </button>
          )}
        </div>

        {/* Pattern detection banner */}
        {patternMsg && (
          <div style={{
            padding: "12px 16px",
            marginBottom: 16,
            background: "rgba(255,215,0,0.1)",
            border: "1px solid #FFD70066",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            color: "#FFD700",
          }}>
            {patternMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          {/* Left: Grid */}
          <div>
            {/* Contestant selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                ASSIGN AS
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {SAMPLE_CONTESTANTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedContestant(c.id)}
                    style={{
                      padding: "7px 14px",
                      background: selectedContestant === c.id ? `${c.color}22` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selectedContestant === c.id ? c.color : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 7,
                      color: selectedContestant === c.id ? c.color : "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid instructions */}
            <div style={{ marginBottom: 12, fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
              {started ? "CLICK EMPTY CELL TO ASSIGN • CLICK ASSIGNED CELL TO REVEAL" : "Start show to interact with grid"}
            </div>

            {/* 3x3 Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              maxWidth: 360,
            }}>
              {grid.map((cell) => {
                const ownerColor = getContestantColor(cell.occupantId);
                const initial = getContestantInitial(cell.occupantId);
                const isClickable = started && !cell.revealed;

                return (
                  <div
                    key={cell.id}
                    onClick={() => {
                      if (!started) return;
                      if (!cell.occupantId) {
                        handleCellClick(cell);
                      } else if (!cell.revealed) {
                        handleReveal(cell);
                      }
                    }}
                    style={{
                      aspectRatio: "1",
                      background: cell.revealed
                        ? `${ownerColor}22`
                        : cell.occupantId
                        ? `${ownerColor}11`
                        : "rgba(255,255,255,0.04)",
                      border: `2px solid ${
                        cell.revealed
                          ? ownerColor
                          : cell.occupantId
                          ? `${ownerColor}66`
                          : "rgba(255,255,255,0.1)"
                      }`,
                      borderRadius: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isClickable ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      minHeight: 90,
                    }}
                  >
                    {cell.revealed ? (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 900, color: ownerColor }}>{initial}</div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: ownerColor }}>+{cell.pointValue}</div>
                      </>
                    ) : cell.occupantId ? (
                      <>
                        <div style={{ fontSize: 20, fontWeight: 900, color: ownerColor }}>{initial}</div>
                        <div style={{ fontSize: 8, color: `${ownerColor}88`, letterSpacing: "0.1em" }}>TAP REVEAL</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
                        {String(cell.position + 1).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid scores */}
            {started && (
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                {SAMPLE_CONTESTANTS.map((c) => {
                  const score = engine.calculateGridScore(c.id);
                  return (
                    <div key={c.id} style={{
                      flex: 1,
                      padding: "8px 10px",
                      background: `${c.color}11`,
                      border: `1px solid ${c.color}44`,
                      borderRadius: 8,
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 8, color: c.color, letterSpacing: "0.1em", marginBottom: 2 }}>{c.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: c.color }}>{score}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pattern detector display */}
            <div style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>
                PATTERN DETECTOR
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: pattern ? "#FFD700" : "rgba(255,255,255,0.2)",
              }}>
                {pattern ? pattern.toUpperCase() : "NO PATTERN YET"}
              </span>
            </div>
          </div>

          {/* Right: HUD */}
          <ShowRuntimeHUD
            showId="circle-squares"
            phase={showState.phase}
            contestants={showState.contestants}
            round={showState.round}
            maxRounds={showState.maxRounds}
            crowdYay={showState.crowdYayCount}
            crowdBoo={showState.crowdBooCount}
            crowdVoteOpen={false}
            winner={showState.winner}
            onCrowdVote={() => undefined}
          />
        </div>
      </div>
    </ShowRoomEnvironmentShell>
  );
}
