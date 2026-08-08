"use client";

/**
 * Real peer-to-peer WebRTC for Observatory admin video chat.
 * Signaling via /api/rtc/signal (roomId = callId). Not a fake connected state.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type PeerCallPhase =
  | "idle"
  | "getting_media"
  | "signaling"
  | "connected"
  | "ended"
  | "error";

const ICE: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const POLL_MS = 800;

export function useObservatoryPeerCall(opts: {
  callId: string | null;
  peerId: string;
  /** Caller creates offer; callee waits for offer then answers. */
  isCaller: boolean;
  active: boolean;
}) {
  const { callId, peerId, isCaller, active } = opts;
  const [phase, setPhase] = useState<PeerCallPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenRef = useRef(new Set<string>());
  const makingOffer = useRef(false);

  const teardown = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    seenRef.current.clear();
  }, []);

  const postSignal = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!callId) return;
      await fetch("/api/rtc/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: callId, peerId, payload }),
      });
    },
    [callId, peerId],
  );

  useEffect(() => {
    if (!active || !callId || !peerId) {
      teardown();
      setPhase("idle");
      return;
    }

    let alive = true;

    (async () => {
      setPhase("getting_media");
      setError(null);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        setPhase("error");
        setError("Camera/microphone permission denied or unavailable.");
        return;
      }
      if (!alive) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      localRef.current = stream;
      setLocalStream(stream);
      setPhase("signaling");

      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        const remote = e.streams[0] ?? new MediaStream([e.track]);
        setRemoteStream(remote);
        setPhase("connected");
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          void postSignal({
            type: "ice",
            candidate: e.candidate.toJSON(),
            from: peerId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          setPhase("error");
          setError("Peer connection failed.");
        } else if (pc.connectionState === "connected") {
          setPhase("connected");
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "closed") {
          setPhase("ended");
        }
      };

      if (isCaller) {
        makingOffer.current = true;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await postSignal({
            type: "offer",
            sdp: offer.sdp,
            from: peerId,
          });
        } finally {
          makingOffer.current = false;
        }
      }

      const handlePayload = async (m: Record<string, unknown>) => {
        const key = JSON.stringify(m);
        if (seenRef.current.has(key)) return;
        seenRef.current.add(key);
        if (seenRef.current.size > 200) {
          seenRef.current = new Set(Array.from(seenRef.current).slice(-80));
        }

        if (m.type === "offer" && !isCaller && m.sdp) {
          await pc.setRemoteDescription({ type: "offer", sdp: String(m.sdp) });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await postSignal({ type: "answer", sdp: answer.sdp, from: peerId });
        } else if (m.type === "answer" && isCaller && m.sdp) {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription({ type: "answer", sdp: String(m.sdp) });
          }
        } else if (m.type === "ice" && m.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(m.candidate as RTCIceCandidateInit));
          } catch {
            /* ignore late ICE */
          }
        }
      };

      const poll = async () => {
        try {
          const res = await fetch(
            `/api/rtc/signal?roomId=${encodeURIComponent(callId)}&peerId=${encodeURIComponent(peerId)}`,
          );
          if (!res.ok) return;
          const data = (await res.json()) as { messages?: Record<string, unknown>[] };
          for (const msg of data.messages ?? []) {
            await handlePayload(msg);
          }
        } catch {
          /* non-fatal */
        }
      };

      await poll();
      pollRef.current = setInterval(() => {
        void poll();
      }, POLL_MS);
    })().catch((err) => {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Call failed");
    });

    return () => {
      alive = false;
      teardown();
      setPhase("ended");
    };
  }, [active, callId, peerId, isCaller, postSignal, teardown]);

  return { phase, error, localStream, remoteStream, teardown };
}
