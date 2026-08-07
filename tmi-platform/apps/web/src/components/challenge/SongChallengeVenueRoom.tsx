"use client";

/**
 * SongChallengeVenueRoom — dedicated Song Challenge contest-stage experience.
 *
 * Rule 21: one Venue Runtime (ArenaEventShell → UniversalVenueRenderer → AudienceScene).
 * Mode = song-challenge with distinct skin, dual WebRTC competitor tiles,
 * Media Locker song picker, and winner/crown overlays.
 *
 * Capacity: AnchorRoomCapacityMatrix song_challenge (~2 competitors, ~150 audience, ~60 VR seats).
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import SongChallengeDualVideoStage, {
  type ChallengerSeatRole,
  type SongChallengeCompetitor,
} from "@/components/challenge/SongChallengeDualVideoStage";
import SongChallengeOverlaySystem, {
  type SongChallengePhase,
  type SongChallengeSide,
} from "@/components/challenge/SongChallengeOverlaySystem";
import ChallengeContentPicker, {
  type ContentPickerItem,
} from "@/components/challenge/ChallengeContentPicker";
import { SONG_CHALLENGE_SKIN as SKIN } from "@/lib/challenge/SongChallengeSkin";
import {
  getSongCrownChallengeCopy,
  recordSongChallengeWin,
  type SongCrownGenre,
} from "@/lib/challenge/SongCrownRegistry";
import { getCapacityForFamily } from "@/lib/live/AnchorRoomCapacityMatrix";
import { useLobbyPeerMediaSession } from "@/lib/lobby/useLobbyPeerMediaSession";

/** Song Challenge subtype — ContentPickerItem filtered to songs. */
type PickerSong = ContentPickerItem;

const ArenaEventShell = dynamic(() => import("@/components/live/ArenaEventShell"), { ssr: false });

const CAP = getCapacityForFamily("song_challenge");
const DEFAULT_ROOM_ID = "anchor-song-challenge-lab";

interface Props {
  roomId?: string;
  genre?: SongCrownGenre;
}

export default function SongChallengeVenueRoom({
  roomId = DEFAULT_ROOM_ID,
  genre = "open_genre",
}: Props) {
  const [phase, setPhase] = useState<SongChallengePhase>("recruiting");
  const [role, setRole] = useState<ChallengerSeatRole>("audience");
  const [sideA, setSideA] = useState<SongChallengeCompetitor | null>(null);
  const [sideB, setSideB] = useState<SongChallengeCompetitor | null>(null);
  const [loadoutA, setLoadoutA] = useState<PickerSong[]>([]);
  const [loadoutB, setLoadoutB] = useState<PickerSong[]>([]);
  const [voteA, setVoteA] = useState(0);
  const [voteB, setVoteB] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [winnerSide, setWinnerSide] = useState<"A" | "B" | null>(null);
  const [crownMessage, setCrownMessage] = useState<string | null>(null);
  const [humanWatching, setHumanWatching] = useState(0);
  const [sessionUser, setSessionUser] = useState<{ id: string; name: string } | null>(null);
  const isChallenger = role === "challenger-a" || role === "challenger-b";

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: { id?: string; name?: string; email?: string } }) => {
        if (d.authenticated && d.user?.id) {
          setSessionUser({
            id: d.user.id,
            name: (d.user.name || d.user.email || "Challenger").slice(0, 40),
          });
        }
      })
      .catch(() => {});
  }, []);

  // Same Daily social-lobby stack as Fan Lobby — receive remote challenger tile (no new media stack).
  const peerMedia = useLobbyPeerMediaSession({
    roomId,
    userId: sessionUser?.id ?? "anon-song-challenge",
    userName: sessionUser?.name ?? "Challenger",
    cameraEnabled: isChallenger,
    micEnabled: isChallenger,
    enabled: Boolean(sessionUser) && isChallenger,
  });

  // Honest human audience count + challenger seat sync from audience API.
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          present?: number;
          activeMembers?: Array<{
            userId: string;
            displayName?: string;
            seatId?: string | null;
            active?: boolean;
            role?: string;
          }>;
        };
        if (cancelled) return;
        setHumanWatching(typeof data.present === "number" ? data.present : 0);

        const members = (data.activeMembers ?? []).filter((m) => m.active !== false);
        const a = members.find((m) => m.seatId === "challenger-a");
        const b = members.find((m) => m.seatId === "challenger-b");
        if (a) {
          setSideA((prev) =>
            prev?.id === a.userId
              ? prev
              : {
                  id: a.userId,
                  displayName: a.displayName || "Challenger A",
                  songTitle: prev?.id === a.userId ? prev.songTitle : null,
                },
          );
        }
        if (b) {
          setSideB((prev) =>
            prev?.id === b.userId
              ? prev
              : {
                  id: b.userId,
                  displayName: b.displayName || "Challenger B",
                  songTitle: prev?.id === b.userId ? prev.songTitle : null,
                },
          );
        }
      } catch {
        /* non-fatal */
      }
    }
    void poll();
    const id = window.setInterval(() => void poll(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [roomId]);

  const overlayA: SongChallengeSide | null = useMemo(() => {
    if (!sideA) return null;
    return {
      id: sideA.id,
      displayName: sideA.displayName,
      songTitle: sideA.songTitle ?? loadoutA[0]?.title ?? null,
    };
  }, [sideA, loadoutA]);

  const overlayB: SongChallengeSide | null = useMemo(() => {
    if (!sideB) return null;
    return {
      id: sideB.id,
      displayName: sideB.displayName,
      songTitle: sideB.songTitle ?? loadoutB[0]?.title ?? null,
    };
  }, [sideB, loadoutB]);

  const claimSeat = useCallback(
    (seat: "A" | "B") => {
      if (!sessionUser) return;
      const competitor: SongChallengeCompetitor = {
        id: sessionUser.id,
        displayName: sessionUser.name,
        songTitle: null,
      };
      if (seat === "A") {
        if (sideA && sideA.id !== sessionUser.id) return;
        setSideA(competitor);
        setRole("challenger-a");
      } else {
        if (sideB && sideB.id !== sessionUser.id) return;
        setSideB(competitor);
        setRole("challenger-b");
      }
      setPhase((p) => (p === "recruiting" ? "loadout" : p));

      // Multiplayer seat claim via canonical audience API (Rule 21 seat system).
      void fetch("/api/live/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "join",
          venueSlug: roomId,
          member: {
            userId: sessionUser.id,
            displayName: sessionUser.name,
            role: "artist",
            seatId: seat === "A" ? "challenger-a" : "challenger-b",
          },
        }),
      }).catch(() => {});
    },
    [sessionUser, sideA, sideB, roomId],
  );

  // Bind opposite challenger's Daily video track onto remoteStream (honest empty when absent).
  const sideABound = useMemo(() => {
    if (!sideA) return null;
    if (role === "challenger-a") return sideA;
    const tracks = peerMedia.snapshot.byUserId.get(sideA.id);
    if (!tracks?.videoTrack) return sideA;
    return {
      ...sideA,
      remoteStream: new MediaStream([tracks.videoTrack]),
    };
  }, [sideA, role, peerMedia.snapshot]);

  const sideBBound = useMemo(() => {
    if (!sideB) return null;
    if (role === "challenger-b") return sideB;
    const tracks = peerMedia.snapshot.byUserId.get(sideB.id);
    if (!tracks?.videoTrack) return sideB;
    return {
      ...sideB,
      remoteStream: new MediaStream([tracks.videoTrack]),
    };
  }, [sideB, role, peerMedia.snapshot]);

  function onLockedA(songs: PickerSong[]) {
    setLoadoutA(songs);
    setSideA((prev) =>
      prev ? { ...prev, songTitle: songs[0]?.title ?? null } : prev,
    );
    if (loadoutB.length > 0 || sideB) setPhase("vs");
  }

  function onLockedB(songs: PickerSong[]) {
    setLoadoutB(songs);
    setSideB((prev) =>
      prev ? { ...prev, songTitle: songs[0]?.title ?? null } : prev,
    );
    if (loadoutA.length > 0 || sideA) setPhase("vs");
  }

  function castVote(side: "A" | "B") {
    if (hasVoted || phase !== "vote") return;
    if (side === "A") setVoteA((v) => v + 1);
    else setVoteB((v) => v + 1);
    setHasVoted(true);
  }

  function startPerform() {
    if (!sideA || !sideB || loadoutA.length === 0 || loadoutB.length === 0) return;
    setPhase("perform");
  }

  function openVoting() {
    setVoteA(0);
    setVoteB(0);
    setHasVoted(false);
    setPhase("vote");
  }

  function declareWinner() {
    if (!sideA || !sideB) return;
    const win: "A" | "B" = voteA >= voteB ? "A" : "B";
    setWinnerSide(win);
    const winner = win === "A" ? sideA : sideB;
    const song = win === "A" ? loadoutA[0] : loadoutB[0];
    if (song) {
      try {
        const progress = recordSongChallengeWin({
          genre,
          songId: song.id,
          songTitle: song.title,
          artistUserId: winner.id,
          artistDisplayName: winner.displayName,
        });
        setCrownMessage(
          progress.isChampion
            ? `👑 Genre Song Crown earned — ${progress.winsInGenre} wins`
            : `Song Crown progress: ${progress.winsInGenre}/${progress.winsRequired} · ${getSongCrownChallengeCopy(genre)}`,
        );
      } catch {
        setCrownMessage(getSongCrownChallengeCopy(genre));
      }
    } else {
      setCrownMessage(getSongCrownChallengeCopy(genre));
    }
    setPhase("winner");
  }

  const needsCount =
    (sideA ? 0 : 1) + (sideB ? 0 : 1);
  const bothReady = !!(sideA && sideB && loadoutA.length && loadoutB.length);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: SKIN.bg,
        color: SKIN.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: "rgba(5,5,16,0.92)",
          borderBottom: `1px solid ${SKIN.sideA}33`,
          backdropFilter: "blur(12px)",
        }}
      >
        <Link href="/challenge" style={{ fontSize: 11, color: SKIN.textMuted, textDecoration: "none" }}>
          ← Challenges
        </Link>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: SKIN.crown }}>
          {SKIN.label}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: SKIN.sideB, fontWeight: 700 }}>
          {humanWatching} watching · cap {CAP.humanViewersMax} · VR seats {CAP.vrVisibleSeats}
        </span>
      </nav>

      {/* Dual competitor WebRTC stage */}
      <SongChallengeDualVideoStage
        role={role}
        sideA={sideABound}
        sideB={sideBBound}
        activeSide={phase === "perform" ? "A" : null}
        localStream={peerMedia.localPreviewStream}
      />

      {/* Overlays */}
      <div style={{ padding: "12px 16px 0", maxWidth: 1100, margin: "0 auto" }}>
        <SongChallengeOverlaySystem
          phase={phase}
          onPhaseChange={setPhase}
          sideA={overlayA}
          sideB={overlayB}
          voteA={voteA}
          voteB={voteB}
          winnerSide={winnerSide}
          crownMessage={crownMessage}
          needsCount={needsCount}
          showPhaseControls={false}
        />
      </div>

      {/* Contest-stage 3D seated venue (Rule 21 — ArenaEventShell / UniversalVenueRenderer) */}
      <div style={{ marginTop: 12 }}>
        <ArenaEventShell
          roomId={roomId}
          eventType="song-challenge"
          mode="audience"
          liveState={phase === "winner" ? "ended" : phase === "recruiting" ? "soon" : "live"}
          watcherCount={humanWatching}
          leftParticipant={sideA ? { id: sideA.id, displayName: sideA.displayName, score: voteA } : null}
          rightParticipant={sideB ? { id: sideB.id, displayName: sideB.displayName, score: voteB } : null}
          winnerParticipantId={
            winnerSide === "A" ? sideA?.id ?? null : winnerSide === "B" ? sideB?.id ?? null : null
          }
          roundLabel="SONG VS SONG"
          instantEmptyStage
          suppressPresentation
          rubricVotingOpen={phase === "vote" || phase === "winner"}
          rubricEventId={`${roomId}-${phase === "winner" ? "result" : "vote"}`}
        />
      </div>

      {/* Controls + song pickers */}
      <div
        style={{
          maxWidth: 1100,
          margin: "16px auto",
          padding: "0 16px 40px",
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {!sessionUser && (
            <Link
              href="/login"
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: SKIN.crown,
                textDecoration: "none",
                border: `1px solid ${SKIN.crown}55`,
                padding: "8px 14px",
                borderRadius: 8,
              }}
            >
              SIGN IN TO CHALLENGE
            </Link>
          )}
          {sessionUser && role === "audience" && (
            <>
              <button
                type="button"
                onClick={() => claimSeat("A")}
                disabled={!!sideA && sideA.id !== sessionUser.id}
                style={btnStyle(SKIN.sideA)}
              >
                TAKE SEAT A
              </button>
              <button
                type="button"
                onClick={() => claimSeat("B")}
                disabled={!!sideB && sideB.id !== sessionUser.id}
                style={btnStyle(SKIN.sideB)}
              >
                TAKE SEAT B
              </button>
            </>
          )}
          {bothReady && phase === "vs" && (
            <button type="button" onClick={startPerform} style={btnStyle(SKIN.crown)}>
              START PERFORMANCE
            </button>
          )}
          {phase === "perform" && (
            <button type="button" onClick={openVoting} style={btnStyle(SKIN.underlay)}>
              OPEN VOTING
            </button>
          )}
          {phase === "vote" && (
            <>
              <button
                type="button"
                disabled={hasVoted}
                onClick={() => castVote("A")}
                style={btnStyle(SKIN.sideA, hasVoted)}
              >
                VOTE A
              </button>
              <button
                type="button"
                disabled={hasVoted}
                onClick={() => castVote("B")}
                style={btnStyle(SKIN.sideB, hasVoted)}
              >
                VOTE B
              </button>
              <button type="button" onClick={declareWinner} style={btnStyle(SKIN.crown)}>
                REVEAL WINNER
              </button>
            </>
          )}
          <span style={{ fontSize: 10, color: SKIN.textMuted }}>
            Metaphor: {CAP.vrMetaphor} · human participants max {CAP.humanParticipantsMax}
          </span>
        </div>

        {(role === "challenger-a" || (!sideA && sessionUser)) && (
          <ChallengeContentPicker
            side="A"
            maxSelect={3}
            typeFilter={["songs"]}
            challengeLane="song_challenge"
            disabled={role !== "challenger-a"}
            roomId={roomId}
            castBy={sessionUser?.id}
            popup
            onLocked={onLockedA}
          />
        )}
        {(role === "challenger-b" || (!sideB && sessionUser)) && (
          <ChallengeContentPicker
            side="B"
            maxSelect={3}
            typeFilter={["songs"]}
            challengeLane="song_challenge"
            disabled={role !== "challenger-b"}
            roomId={roomId}
            castBy={sessionUser?.id}
            popup
            onLocked={onLockedB}
          />
        )}
      </div>
    </main>
  );
}

function btnStyle(color: string, disabled = false): CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: disabled ? "rgba(255,255,255,0.06)" : `${color}22`,
    color: disabled ? "rgba(255,255,255,0.35)" : color,
    fontWeight: 900,
    fontSize: 10,
    letterSpacing: "0.1em",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
  };
}

