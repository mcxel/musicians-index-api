"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamWinSong, FeedbackReaction } from "@/lib/economy/StreamAndWinEngine";
import type { RadioLine } from "@/lib/radio/RadioHostEngine";
import type { GameQuestion } from "@/lib/radio/GameEngine";
import type { LockProgress } from "@/lib/radio/DailyLockEngine";
import { RadioHostEngine } from "@/lib/radio/RadioHostEngine";
import { GameEngine } from "@/lib/radio/GameEngine";
import { RadioDJEngine } from "@/lib/radio/RadioDJEngine";
import { DailyLockEngine } from "@/lib/radio/DailyLockEngine";
import { PlaylistFairnessEngine } from "@/lib/radio/PlaylistFairnessEngine";
import SongFeedbackOrb from "./SongFeedbackOrb";
import SponsorDropBanner from "@/components/media/SponsorDropBanner";
import GhostChatWidget from "@/components/live/GhostChatWidget";
import RadioHostBot from "@/components/radio/RadioHostBot";
import GameInterrupt from "@/components/radio/GameInterrupt";
import LiveRankingMoment from "@/components/radio/LiveRankingMoment";
import NowMixingBanner from "@/components/radio/NowMixingBanner";
import type { TransitionType } from "@/lib/radio/BPMMatchEngine";

interface StreamWinRoomProps {
  roomId: string;
}

interface DropInfo {
  sponsorName: string;
  prizeName: string;
  triggerDesc: string;
  dropId: string;
  userId?: string;
}

export default function StreamWinRoom({ roomId }: StreamWinRoomProps) {
  const [songs, setSongs] = useState<StreamWinSong[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [activeDrop] = useState<DropInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Radio host
  const [djLine, setDjLine] = useState<RadioLine | null>(null);
  // Game
  const [activeGame, setActiveGame] = useState<GameQuestion | null>(null);
  // Ranking
  const [rankingVisible, setRankingVisible] = useState(false);
  // Mixing banner
  const [mixingVisible, setMixingVisible] = useState(false);
  const [mixingLabel, setMixingLabel] = useState("blending smooth…");
  const [mixingType, setMixingType] = useState<TransitionType>("fade");
  // Daily lock
  const [lockProgress, setLockProgress] = useState<LockProgress | null>(null);

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userId = useRef(`guest-${Math.random().toString(36).slice(2, 7)}`);
  const songAdvanceCount = useRef(0);
  const lastInteractionAt = useRef(Date.now());

  // Tab visibility anti-cheat
  useEffect(() => {
    const handler = () => setIsActive(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Track interaction recency
  useEffect(() => {
    const update = () => { lastInteractionAt.current = Date.now(); };
    window.addEventListener("click", update);
    window.addEventListener("keydown", update);
    return () => { window.removeEventListener("click", update); window.removeEventListener("keydown", update); };
  }, []);

  // Fetch song list
  useEffect(() => {
    fetch("/api/stream-win/songs")
      .then(r => r.ok ? r.json() : { songs: [] })
      .then(d => setSongs(d.songs ?? []))
      .catch(() => {});
  }, []);

  // Progress bar per song
  useEffect(() => {
    setProgress(0);
    setEligible(false);
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100; }
        const next = p + 1;
        if (next >= 30) setEligible(true);
        return next;
      });
    }, 150);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [currentIdx]);

  // Radio host loop
  useEffect(() => {
    RadioHostEngine.start(line => setDjLine(line));
    return () => RadioHostEngine.stop();
  }, []);

  const clearDjLine = useCallback(() => setDjLine(null), []);

  // Daily lock heartbeat every 30s
  const currentSong = songs[currentIdx];
  useEffect(() => {
    if (!currentSong) return;
    const id = setInterval(() => {
      const recentlyInteracted = Date.now() - lastInteractionAt.current < 90_000;
      const activeForLock = isActive && recentlyInteracted;
      const prog = DailyLockEngine.recordActivity(userId.current, currentSong.id, activeForLock);
      setLockProgress(prog);
      // Feed boost into rotation fairness when tier unlocked
      if (prog.boostMultiplier > 1) {
        PlaylistFairnessEngine.applyBoost(currentSong.id, prog.boostMultiplier);
      }
      // Set locked flag in fairness engine
      if (prog.isLocked) {
        PlaylistFairnessEngine.setLocked(currentSong.id, true);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [currentSong?.id, isActive]);

  function handleNext() {
    if (songs.length === 0) return;
    const current = songs[currentIdx];
    const decision = RadioDJEngine.getNextSong(current ?? null, songs);

    if (decision) {
      const newIdx = songs.findIndex(s => s.id === decision.song.id);
      setCurrentIdx(newIdx >= 0 ? newIdx : 0);
      setMixingLabel(decision.transition.label);
      setMixingType(decision.transition.type);
      setMixingVisible(true);
      // DJ announces the transition
      setDjLine({
        ...RadioHostEngine.generateLine("radio-song-intro"),
        text: decision.djComment,
        ts: Date.now(),
      });
    } else {
      setCurrentIdx(i => (i + 1) % Math.max(songs.length, 1));
    }

    songAdvanceCount.current += 1;
    const count = songAdvanceCount.current;

    // Game every 3–5 songs
    if (count % (3 + Math.floor(Math.random() * 3)) === 0 && !activeGame) {
      const q = GameEngine.startGame();
      setActiveGame(q);
      RadioHostEngine.pushUrgent("radio-game-start");
    }

    // Ranking flash every 5 songs
    if (count % 5 === 0 && songs.length >= 2) {
      setRankingVisible(true);
    }
  }

  async function handleReact(songId: string, reaction: FeedbackReaction) {
    const listenPct = progress / 100;
    // Feed into trend engine
    if (currentSong) RadioDJEngine.onReaction(currentSong.genre, reaction);
    try {
      const res = await fetch("/api/stream-win/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, userId: userId.current, reaction, listenPct, isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.xpAwarded) setSessionXP(x => x + (data.xpAmount ?? 10));
      if (reaction !== "skip") setStreak(s => s + 1);
      else setStreak(0);
    } catch {}
  }

  function handleGameAnswer(choiceIdx: number) {
    const result = GameEngine.submitAnswer(userId.current, choiceIdx);
    if (result.xpAwarded) setSessionXP(x => x + result.xpAwarded);
    return result;
  }

  function handleGameExpire() {
    GameEngine.endGame();
    setActiveGame(null);
  }

  const queueSongs = songs.slice(0, 5);

  return (
    <div style={{
      background: "#050510",
      minHeight: "100vh",
      fontFamily: "'Inter',sans-serif",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.4em", color: "#FFD700", marginBottom: 6 }}>
          ⚡ STREAM &amp; WIN RADIO
        </div>
        <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, letterSpacing: "0.06em" }}>
          EARN XP. WIN PRIZES.
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginTop: 2 }}>
          Smart DJ · Fair rotation · No purchase required
        </div>
      </div>

      {/* Drop banner */}
      {activeDrop && (
        <div style={{ padding: "12px 24px 0" }}>
          <SponsorDropBanner drop={activeDrop} />
        </div>
      )}

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", flex: 1, overflow: "hidden" }}>
        {/* Left: Now Playing + reactions */}
        <div style={{ padding: 24, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Status bar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>SESSION XP</span>
              <span style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 20, color: "#00C8FF" }}>{sessionXP}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>STREAK</span>
              <span style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 20, color: "#FF2DAA" }}>{streak}🔥</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: eligible ? "#00C896" : "#555",
                display: "inline-block",
                boxShadow: eligible ? "0 0 8px #00C896" : "none",
                transition: "all 0.3s ease",
              }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: eligible ? "#00C896" : "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                {eligible ? "DROP ELIGIBLE" : "LISTEN TO QUALIFY"}
              </span>
            </div>
            {!isActive && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#FF4040", letterSpacing: "0.1em" }}>
                ⚠ PAUSED — TAB HIDDEN
              </span>
            )}
          </div>

          {/* Now Playing */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 20,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", marginBottom: 12 }}>
              NOW PLAYING
            </div>
            {currentSong ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{currentSong.title}</div>
                <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700, marginBottom: 2 }}>{currentSong.genre}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  Score: {Math.round(currentSong.visibilityScore)} · {currentSong.listenCount} listens
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No songs in queue yet — artists: submit your track</div>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.08)", height: 3 }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: progress >= 30 ? "#00C896" : "#444",
                transition: "width 0.15s linear, background 0.3s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
              <span>0:00</span>
              <span style={{ color: progress >= 30 ? "#00C896" : "rgba(255,255,255,0.2)" }}>
                {progress >= 30 ? "✓ Qualifying" : `${Math.ceil((30 - progress) * 0.3)}s to qualify`}
              </span>
              <span>3:00</span>
            </div>
          </div>

          {/* Daily Lock Progress */}
          {lockProgress && currentSong && (
            <div style={{
              background: "rgba(255,215,0,0.04)",
              border: "1px solid rgba(255,215,0,0.15)",
              padding: "10px 14px",
              marginBottom: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#FFD700" }}>
                  DAILY LOCK PROGRESS
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: lockProgress.tier === "none" ? "rgba(255,255,255,0.3)" : "#FFD700" }}>
                  {lockProgress.tierLabel}
                </span>
              </div>
              {/* 120-min bar */}
              <div style={{ background: "rgba(255,255,255,0.08)", height: 4, position: "relative" }}>
                {/* 30min marker */}
                <div style={{ position: "absolute", left: "25%", top: -2, width: 1, height: 8, background: "rgba(255,215,0,0.3)" }} />
                {/* 60min marker */}
                <div style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 8, background: "rgba(255,215,0,0.3)" }} />
                <div style={{
                  height: "100%",
                  width: `${lockProgress.pct120}%`,
                  background: lockProgress.isLocked
                    ? "linear-gradient(90deg, #FFD700, #FF9500)"
                    : lockProgress.pct60 >= 100
                    ? "#FFD700"
                    : lockProgress.pct30 >= 100
                    ? "#FF9500"
                    : "#AA2DFF",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
                <span>0</span>
                <span>{lockProgress.activeMinutes.toFixed(0)}min / 120min</span>
                <span>🔒</span>
              </div>
            </div>
          )}

          {/* Reactions */}
          {currentSong && (
            <SongFeedbackOrb
              key={currentSong.id}
              songId={currentSong.id}
              onReact={handleReact}
            />
          )}

          <button
            onClick={handleNext}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Inter',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              cursor: "pointer",
            }}
          >
            NEXT SONG →
          </button>
        </div>

        {/* Right: Queue + chat */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "#AA2DFF", marginBottom: 10 }}>
              SONG QUEUE — DJ ORDER
            </div>
            {queueSongs.length === 0 && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>No songs yet</div>
            )}
            {queueSongs.map((song, i) => (
              <div key={song.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                marginBottom: 4,
                background: i === currentIdx ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${i === currentIdx ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.05)"}`,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: i === currentIdx ? "#FFD700" : "#fff" }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{song.genre}</div>
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: song.state === "active" ? "#00C896" : song.state === "decaying" ? "#FFD700" : "#555",
                }}>
                  {song.state === "active" ? "●" : song.state === "decaying" ? "◐" : "○"}
                  {" "}{Math.round(song.visibilityScore)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <GhostChatWidget roomId={roomId} accentColor="#FFD700" />
          </div>
        </div>
      </div>

      {/* Overlays */}
      <RadioHostBot line={djLine} onClear={clearDjLine} />

      <NowMixingBanner
        visible={mixingVisible}
        label={mixingLabel}
        transitionType={mixingType}
        onDone={() => setMixingVisible(false)}
      />

      <GameInterrupt
        question={activeGame}
        onAnswer={handleGameAnswer}
        onExpire={handleGameExpire}
      />

      <LiveRankingMoment
        songs={songs}
        visible={rankingVisible}
        onDone={() => setRankingVisible(false)}
      />
    </div>
  );
}
