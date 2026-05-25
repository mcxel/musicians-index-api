"use client";

/**
 * TMIVideoRoom.tsx
 * Daily.co iframe-based video room component for The Musician's Index.
 *
 * Drop at: apps/web/src/components/video/TMIVideoRoom.tsx
 *
 * Handles:
 *  - Fetching a Daily room + token from /api/video/rooms
 *  - Loading the @daily-co/daily-js SDK dynamically
 *  - Creating the iframe call object and joining the room
 *  - Participant grid rendering
 *  - Performer vs viewer role enforcement
 *  - PiP mode (picture-in-picture for fan dashboard overlay)
 *  - Graceful fallback when DAILY_API_KEY is missing
 *
 * Install Daily SDK:
 *   pnpm add @daily-co/daily-js --filter web
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type VideoRoomRole = "host" | "participant" | "viewer";
export type RoomType = "battle" | "cypher" | "stage" | "backstage" | "venue" | "chat" | "admin";

export interface VideoRoomParticipant {
  session_id: string;
  user_name: string;
  local: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
}

export interface TMIVideoRoomProps {
  roomId: string;
  roomType?: RoomType;
  userId: string;
  userName: string;
  role: VideoRoomRole;
  isPiP?: boolean;               // mini overlay mode for fan dashboard
  showControls?: boolean;
  onJoined?: (participantCount: number) => void;
  onLeft?: () => void;
  onError?: (err: string) => void;
  onParticipantUpdate?: (participants: VideoRoomParticipant[]) => void;
  className?: string;
}

interface RoomData {
  name: string;
  url: string;
  token: string;
  joinUrl: string;
}

/* ─── Role enforcement ── */
const ROLE_CONFIG: Record<VideoRoomRole, { startVideoOff: boolean; startAudioOff: boolean; label: string; color: string }> = {
  host:        { startVideoOff: false, startAudioOff: false, label: "HOST",        color: "#f59e0b" },
  participant: { startVideoOff: false, startAudioOff: false, label: "LIVE",        color: "#ef4444" },
  viewer:      { startVideoOff: true,  startAudioOff: true,  label: "WATCHING",    color: "#06b6d4" },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function TMIVideoRoom({
  roomId,
  roomType = "stage",
  userId,
  userName,
  role,
  isPiP = false,
  showControls = true,
  onJoined,
  onLeft,
  onError,
  onParticipantUpdate,
  className = "",
}: TMIVideoRoomProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  const [roomData,     setRoomData]     = useState<RoomData | null>(null);
  const [state,        setState]        = useState<"loading" | "joining" | "joined" | "left" | "error">("loading");
  const [errorMsg,     setErrorMsg]     = useState<string>("");
  const [participants, setParticipants] = useState<VideoRoomParticipant[]>([]);
  const [localMuted,   setLocalMuted]   = useState(false);
  const [localVideoOff,setLocalVideoOff]= useState(ROLE_CONFIG[role].startVideoOff);
  const [network,      setNetwork]      = useState<"good" | "low" | "very-low">("good");

  const roleConfig = ROLE_CONFIG[role];

  /* ── Fetch room + token from our API ── */
  useEffect(() => {
    async function fetchRoom() {
      try {
        const resp = await fetch("/api/video/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: roomType,
            roomId,
            userId,
            userName,
            role,
            expiryMinutes: 180,
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Unknown error" }));
          if (resp.status === 503) {
            setErrorMsg("Video not configured — DAILY_API_KEY missing from environment");
          } else {
            setErrorMsg(err.error ?? "Failed to initialize video room");
          }
          setState("error");
          onError?.(errorMsg);
          return;
        }

        const data = await resp.json();
        setRoomData({
          name:    data.room.name,
          url:     data.room.url,
          token:   data.token,
          joinUrl: data.joinUrl,
        });
      } catch (err) {
        setErrorMsg("Network error — could not reach video API");
        setState("error");
      }
    }
    fetchRoom();
  }, [roomId, roomType, userId, userName, role]);

  /* ── Initialize Daily call object once room data is ready ── */
  useEffect(() => {
    if (!roomData || !containerRef.current) return;

    async function initDaily() {
      setState("joining");
      try {
        // Dynamically import Daily SDK to avoid SSR issues
        const DailyIframe = (await import("@daily-co/daily-js")).default;

        // Create call object (embedded mode — no separate iframe URL needed)
        const callObject = DailyIframe.createCallObject({
          url: roomData!.url,
          token: roomData!.token,
          startVideoOff: ROLE_CONFIG[role].startVideoOff,
          startAudioOff: ROLE_CONFIG[role].startAudioOff,
        });

        callObjectRef.current = callObject;

        /* ── Event listeners ── */
        callObject.on("joined-meeting", (evt: any) => {
          setState("joined");
          const count = Object.keys(evt.participants ?? {}).length;
          onJoined?.(count);
        });

        callObject.on("left-meeting", () => {
          setState("left");
          onLeft?.();
        });

        callObject.on("error", (evt: any) => {
          setErrorMsg(evt.errorMsg ?? "Daily.co error");
          setState("error");
          onError?.(evt.errorMsg);
        });

        callObject.on("participant-joined", updateParticipants);
        callObject.on("participant-left", updateParticipants);
        callObject.on("participant-updated", updateParticipants);

        callObject.on("network-quality-change", (evt: any) => {
          if (evt.quality === "very-low") setNetwork("very-low");
          else if (evt.quality === "low")  setNetwork("low");
          else                             setNetwork("good");
        });

        function updateParticipants() {
          const ps = callObject.participants();
          const list: VideoRoomParticipant[] = Object.values(ps).map((p: any) => ({
            session_id: p.session_id,
            user_name:  p.user_name ?? "Anonymous",
            local:      p.local,
            audio:      p.audio,
            video:      p.video,
            screen:     p.screen,
          }));
          setParticipants(list);
          onParticipantUpdate?.(list);
        }

        /* ── Join ── */
        await callObject.join({ url: roomData!.url, token: roomData!.token });

      } catch (err) {
        setErrorMsg(String(err));
        setState("error");
      }
    }

    initDaily();

    return () => {
      callObjectRef.current?.leave().catch(() => {});
      callObjectRef.current?.destroy().catch(() => {});
      callObjectRef.current = null;
    };
  }, [roomData]);

  /* ── Controls ── */
  const toggleMic = useCallback(() => {
    const co = callObjectRef.current;
    if (!co) return;
    if (localMuted) {
      co.setLocalAudio(true);
      setLocalMuted(false);
    } else {
      co.setLocalAudio(false);
      setLocalMuted(true);
    }
  }, [localMuted]);

  const toggleCamera = useCallback(() => {
    const co = callObjectRef.current;
    if (!co) return;
    if (localVideoOff) {
      co.setLocalVideo(true);
      setLocalVideoOff(false);
    } else {
      co.setLocalVideo(false);
      setLocalVideoOff(true);
    }
  }, [localVideoOff]);

  const leaveRoom = useCallback(() => {
    callObjectRef.current?.leave().catch(() => {});
    setState("left");
    onLeft?.();
  }, [onLeft]);

  /* ── Render: error state ── */
  if (state === "error") {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#0a0a12] rounded-xl border border-red-500/30 p-6 gap-3 ${className}`}>
        <p className="text-red-400 font-bold text-sm">Video Unavailable</p>
        <p className="text-white/40 text-xs text-center max-w-xs">{errorMsg}</p>
        {errorMsg.includes("DAILY_API_KEY") && (
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-400/80 max-w-sm text-center">
            Add <code className="font-mono">DAILY_API_KEY</code> to Vercel →<br />
            Settings → Environment Variables
          </div>
        )}
      </div>
    );
  }

  /* ── Render: left state ── */
  if (state === "left") {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#0a0a12] rounded-xl border border-white/10 p-8 gap-4 ${className}`}>
        <p className="text-white/60 font-bold">You left the room</p>
        <Link
          href="/home/5"
          className="text-[10px] font-black px-4 py-2 bg-cyan-600 text-black rounded-lg uppercase tracking-wider hover:bg-cyan-500"
        >
          Back to Stage 5
        </Link>
      </div>
    );
  }

  /* ── PiP mode ── */
  if (isPiP) {
    return (
      <div className={`relative ${className}`} style={{ width: 160, height: 120 }}>
        <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-white/20">
          {state === "joined" ? (
            <div
              id={`daily-pip-${roomId}`}
              ref={containerRef}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {state === "joined" && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
        <button
          onClick={leaveRoom}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white/60 hover:text-white text-[8px] flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    );
  }

  /* ── Full room render ── */
  return (
    <div className={`relative bg-[#05050c] rounded-xl overflow-hidden flex flex-col ${className}`}>
      {/* ── Top status bar ── */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest"
            style={{ background: roleConfig.color + "33", color: roleConfig.color }}
          >
            {roleConfig.label}
          </span>
          <span className="text-white/50 text-[9px] font-mono">
            {roomData?.name ?? roomId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {network !== "good" && (
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${network === "very-low" ? "text-red-400 bg-red-900/30" : "text-yellow-400 bg-yellow-900/30"}`}>
              {network === "very-low" ? "POOR SIGNAL" : "LOW SIGNAL"}
            </span>
          )}
          <span className="text-white/40 text-[9px]">
            {participants.length} in room
          </span>
        </div>
      </div>

      {/* ── Daily.co call container ── */}
      <div
        ref={containerRef}
        id={`daily-room-${roomId}`}
        className="flex-1 min-h-[300px]"
        style={{ background: "#000" }}
      />

      {/* ── Loading overlay ── */}
      {(state === "loading" || state === "joining") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-30">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
            {state === "loading" ? "Preparing room..." : "Joining..."}
          </p>
        </div>
      )}

      {/* ── Controls bar ── */}
      {showControls && state === "joined" && (
        <div className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-t from-black/90 to-transparent">
          {/* Mic */}
          {role !== "viewer" && (
            <button
              onClick={toggleMic}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                localMuted
                  ? "bg-red-600 border-red-500 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {localMuted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </button>
          )}

          {/* Camera */}
          {role !== "viewer" && (
            <button
              onClick={toggleCamera}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                localVideoOff
                  ? "bg-red-600 border-red-500 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {localVideoOff ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6.5l-4-4-1.45 1.45L17 5.41 17 12.5l4 4V6.5zm-6 6l-4-4H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9.5l-3-3zM4 18v-7.5h7.5L4 18z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              )}
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Leave */}
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-500 text-white text-[9px] font-black px-3 py-2 rounded-lg uppercase tracking-wider transition-colors"
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}
