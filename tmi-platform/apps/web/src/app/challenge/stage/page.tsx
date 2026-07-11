"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import { useTmiSession } from "@/hooks/SessionContext";
import { getGenrePerformers, type GenrePerformer } from "@/lib/performers/PerformerRegistry";
import { webRTCBroadcastEngine, type BroadcastStatus } from "@/lib/media/WebRTCBroadcastEngine";

const CYAN = "#00FFFF";
const GOLD = "#FFD700";
const FUCHSIA = "#FF2DAA";
const PURPLE = "#AA2DFF";

// Real genre keys — must match GENRE_TO_CATEGORIES in PerformerRegistry.ts
const GENRE_ROTATION = ["Hip-Hop", "R&B", "Rap", "Gospel", "Pop", "Jazz", "Soul", "EDM"] as const;
const ROUND_SECONDS = 180; // 3 min per genre round before rotating + declaring a winner

interface ChallengeVoteResult {
  challengeId: string;
  contestants: Record<string, { votes: number; weightedScore: number; displayName: string }>;
  totalVotes: number;
  leaderId: string | null;
  status: "open" | "closed";
}

export default function ChallengeStagePage() {
  const { userId, userName } = useTmiSession();
  const [genreIdx, setGenreIdx] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  const [roundSec, setRoundSec] = useState(ROUND_SECONDS);
  const [contestants, setContestants] = useState<GenrePerformer[]>([]);
  const [voteResult, setVoteResult] = useState<ChallengeVoteResult | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [lastWinner, setLastWinner] = useState<{ genre: string; displayName: string } | null>(null);

  const [onCameraSlug, setOnCameraSlug] = useState<string | null>(null);
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>("IDLE");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const genre = GENRE_ROTATION[genreIdx] ?? GENRE_ROTATION[0]!;
  const challengeId = `challenge-${genre.toLowerCase().replace(/[^a-z0-9]/g, "")}-${roundNumber}`;
  const roomId = "challenge-stage";

  // Load real contestants for the active genre from PerformerRegistry
  useEffect(() => {
    setContestants(getGenrePerformers(genre, 4));
    setMyVote(null);
    setVoteError(null);
  }, [genre, roundNumber]);

  // Poll real vote tally for the active round
  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      fetch(`/api/rooms/challenges/vote?challengeId=${encodeURIComponent(challengeId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: ChallengeVoteResult | null) => { if (!cancelled && d) setVoteResult(d); })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [challengeId]);

  // Round timer — rotates genre and declares the winner from real vote data
  useEffect(() => {
    if (roundSec <= 0) {
      const leaderId = voteResult?.leaderId;
      const leaderName = leaderId ? voteResult?.contestants[leaderId]?.displayName : undefined;
      setLastWinner(leaderName ? { genre, displayName: leaderName } : null);
      setGenreIdx((i) => (i + 1) % GENRE_ROTATION.length);
      setRoundNumber((n) => n + 1);
      setRoundSec(ROUND_SECONDS);
      return;
    }
    const t = setTimeout(() => setRoundSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [roundSec, genre, voteResult]);

  const castVote = useCallback(async (contestantSlug: string) => {
    setVoteError(null);
    try {
      const res = await fetch("/api/rooms/challenges/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, voterId: userId, contestantId: contestantSlug }),
      });
      const data = await res.json() as { error?: string; result?: ChallengeVoteResult };
      if (!res.ok) {
        setVoteError(data.error ?? "Vote failed.");
        return;
      }
      setMyVote(contestantSlug);
      if (data.result) setVoteResult(data.result);
    } catch {
      setVoteError("Network error — vote not recorded.");
    }
  }, [challengeId, userId]);

  // Real WebRTC — performer explicitly opts in to step on camera and challenge.
  // Never auto-requests camera access; mirrors the safe pattern already used
  // in MonitorSatelliteSystem.tsx.
  const stepOnCamera = useCallback(async (slug: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setOnCameraSlug(slug);

      webRTCBroadcastEngine.setLocalStream(stream);
      webRTCBroadcastEngine.on((_event, session) => setBroadcastStatus(session.status));
      await webRTCBroadcastEngine.createBroadcastSession(`${roomId}-${challengeId}`);
    } catch {
      setBroadcastStatus("FAILED");
    }
  }, [roomId, challengeId]);

  const stepOffCamera = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    webRTCBroadcastEngine.close();
    setOnCameraSlug(null);
    setBroadcastStatus("IDLE");
  }, []);

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      webRTCBroadcastEngine.close();
    };
  }, []);

  const mm = String(Math.floor(roundSec / 60)).padStart(2, "0");
  const ss = String(roundSec % 60).padStart(2, "0");
  const totalVotes = voteResult?.totalVotes ?? 0;

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(255,215,0,0.14), transparent 55%), #050510", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "11px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: GOLD, textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700 }}>CHALLENGE STAGE</span>
        <span style={{ fontSize: 9, fontWeight: 900, color: GOLD, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", padding: "3px 10px", borderRadius: 999, letterSpacing: "0.1em" }}>
          {genre.toUpperCase()} ROUND
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>⏱ {mm}:{ss}</span>
        <Link href="/challenge" style={{ marginLeft: "auto", fontSize: 10, color: GOLD, textDecoration: "none", fontWeight: 700 }}>📋 SUBMISSION CHALLENGES</Link>
        <Link href="/cypher/stage" style={{ fontSize: 10, color: PURPLE, textDecoration: "none", fontWeight: 700 }}>🎤 CYPHER</Link>
      </div>

      {lastWinner && (
        <div style={{ margin: "14px 20px 0", padding: "10px 16px", background: "rgba(255,215,0,0.08)", border: `1px solid ${GOLD}44`, borderRadius: 10, fontSize: 12, color: GOLD, fontWeight: 700 }}>
          🏆 Last round's {lastWinner.genre} winner: {lastWinner.displayName}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px", display: "grid", gap: 20 }}>
        {/* Real venue + audience + chat, shared with Battle/Cypher */}
        <ArenaEventShell eventType="challenge" roomId={roomId} mode="audience" liveState="live" />

        {/* Real genre-filtered contestants from PerformerRegistry */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 10 }}>
            {genre.toUpperCase()} SONG CHALLENGERS · {totalVotes} VOTES CAST
          </div>
          {contestants.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              No {genre} performers registered yet for this round.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {contestants.map((c) => {
                const tally = voteResult?.contestants[c.slug];
                const isLeader = voteResult?.leaderId === c.slug && (tally?.votes ?? 0) > 0;
                const isVoted = myVote === c.slug;
                const isOnCamera = onCameraSlug === c.slug;
                return (
                  <div key={c.slug} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isLeader ? GOLD : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `1px solid ${CYAN}44`, flexShrink: 0 }}>
                        {c.profileImageUrl ? (
                          <Image src={c.profileImageUrl} alt={c.name} fill sizes="44px" style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.emoji}</div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                          {c.name} {isLeader && <span style={{ color: GOLD }}>👑</span>}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>#{c.rank} · {c.fanCount.toLocaleString()} fans</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: CYAN, fontWeight: 800 }}>
                      {(tally?.votes ?? 0).toLocaleString()} votes
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => void castVote(c.slug)}
                        disabled={Boolean(myVote) || voteResult?.status === "closed"}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 10, fontWeight: 900, letterSpacing: "0.06em", cursor: myVote ? "default" : "pointer",
                          background: isVoted ? "rgba(0,255,136,0.15)" : "rgba(0,255,255,0.1)",
                          border: `1px solid ${isVoted ? "#00FF88" : "rgba(0,255,255,0.3)"}`,
                          color: isVoted ? "#00FF88" : CYAN,
                          opacity: myVote && !isVoted ? 0.4 : 1,
                        }}
                      >
                        {isVoted ? "✓ VOTED" : "VOTE"}
                      </button>
                      {isOnCamera ? (
                        <button onClick={stepOffCamera} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, background: "rgba(255,45,45,0.12)", border: "1px solid rgba(255,45,45,0.35)", color: "#ff8a8a", cursor: "pointer" }}>
                          STEP OFF
                        </button>
                      ) : (
                        <button onClick={() => void stepOnCamera(c.slug)} disabled={Boolean(onCameraSlug)} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", color: FUCHSIA, cursor: onCameraSlug ? "default" : "pointer", opacity: onCameraSlug ? 0.4 : 1 }}>
                          📷 STEP ON CAM
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {voteError && <div style={{ marginTop: 10, fontSize: 11, color: "#ff8a8a" }}>{voteError}</div>}
        </div>

        {/* Real local camera preview when a performer is actively challenging */}
        {onCameraSlug && (
          <div style={{ border: `1px solid ${FUCHSIA}44`, borderRadius: 14, padding: 14, background: "rgba(255,45,170,0.04)" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: FUCHSIA, fontWeight: 800, marginBottom: 10 }}>
              🔴 YOU'RE ON CAMERA · {broadcastStatus}
            </div>
            <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", maxWidth: 480, borderRadius: 10, background: "#000" }} />
          </div>
        )}

        {/* Genre rotation strip */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 10 }}>UP NEXT IN ROTATION</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GENRE_ROTATION.map((g, i) => (
              <span key={g} style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                background: i === genreIdx ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === genreIdx ? GOLD : "rgba(255,255,255,0.12)"}`,
                color: i === genreIdx ? GOLD : "rgba(255,255,255,0.5)",
              }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
