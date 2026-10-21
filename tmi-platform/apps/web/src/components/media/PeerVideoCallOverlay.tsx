"use client";

/**
 * PeerVideoCallOverlay — Fan/Performer accepted-call media surface.
 * Reuses useObservatoryPeerCall (same WebRTC authority as Observatory).
 * Rule 35: floating sibling overlay — does not remount Hub monitors.
 * Does NOT convert ObservatoryVideoCallPanel into a public admin surface.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useObservatoryPeerCall } from "@/hooks/useObservatoryPeerCall";
import { useCanonicalMediaPlayerRuntime } from "@/lib/media/canonicalMediaPlayerRuntime";

type CallSession = {
  callId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  status: string;
};

export default function PeerVideoCallOverlay() {
  const [open, setOpen] = useState(false);
  const [meId, setMeId] = useState("");
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const mediaActive =
    !!activeCall &&
    (activeCall.status === "accepted" ||
      activeCall.status === "connected" ||
      activeCall.status === "ringing");

  const { phase, error, localStream, remoteStream } = useObservatoryPeerCall({
    callId: activeCall?.callId ?? null,
    peerId: meId || "anon",
    isCaller,
    active:
      mediaActive &&
      (activeCall?.status === "accepted" || activeCall?.status === "connected"),
  });
  const setPeerCallStream = useCanonicalMediaPlayerRuntime((s) => s.setPeerCallStream);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    setPeerCallStream("b", remoteStream);
  }, [remoteStream, setPeerCallStream]);

  useEffect(() => () => {
    useCanonicalMediaPlayerRuntime.getState().setPeerCallStream("b", null);
  }, []);

  const bindCall = useCallback(async (callId: string, preferCaller?: boolean) => {
    try {
      const res = await fetch(
        `/api/admin/observatory-call?callId=${encodeURIComponent(callId)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) {
        setNote("Could not load call.");
        return;
      }
      const data = (await res.json()) as { call?: CallSession };
      if (!data.call) {
        setNote("Call not found.");
        return;
      }
      const meRes = await fetch("/api/admin/observatory-call", {
        credentials: "include",
        cache: "no-store",
      });
      let uid = meId;
      if (meRes.ok) {
        const meData = (await meRes.json()) as { me?: { userId?: string } };
        if (meData.me?.userId) {
          uid = meData.me.userId;
          setMeId(uid);
        }
      }
      setActiveCall(data.call);
      setIsCaller(
        preferCaller === true
          ? true
          : preferCaller === false
            ? false
            : data.call.callerId === uid,
      );
      setOpen(true);
      setNote(
        data.call.status === "accepted" || data.call.status === "connected"
          ? "Connecting…"
          : "Waiting for peer…",
      );
    } catch {
      setNote("Network error loading call.");
    }
  }, [meId]);

  useEffect(() => {
    const onAccept = (ev: Event) => {
      const detail = (ev as CustomEvent<{ callId?: string }>).detail;
      if (detail?.callId) void bindCall(detail.callId, false);
    };
    const onOutgoing = (ev: Event) => {
      const detail = (ev as CustomEvent<{ callId?: string }>).detail;
      if (detail?.callId) void bindCall(detail.callId, true);
    };
    window.addEventListener("tmi:observatory-call-accept", onAccept);
    window.addEventListener("tmi:peer-call-outgoing", onOutgoing);
    return () => {
      window.removeEventListener("tmi:observatory-call-accept", onAccept);
      window.removeEventListener("tmi:peer-call-outgoing", onOutgoing);
    };
  }, [bindCall]);

  async function endCall() {
    if (activeCall) {
      await fetch("/api/admin/observatory-call", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          callId: activeCall.callId,
          status: "ended",
        }),
      }).catch(() => {});
    }
    setActiveCall(null);
    useCanonicalMediaPlayerRuntime.getState().setPeerCallStream("b", null);
    setOpen(false);
    setNote(null);
  }

  if (!open) return null;

  return (
    <div
      data-testid="peer-video-call-overlay"
      data-peer-call-phase={phase}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 12000,
        width: "min(360px, calc(100vw - 24px))",
        background: "rgba(5,5,16,0.96)",
        border: "1px solid rgba(0,255,255,0.35)",
        borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,0.65)",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "#00FFFF",
        }}
      >
        <span>VIDEO CALL</span>
        <button
          type="button"
          onClick={() => void endCall()}
          data-testid="peer-video-call-end"
          style={{
            fontSize: 10,
            fontWeight: 800,
            background: "rgba(255,45,170,0.2)",
            border: "1px solid rgba(255,45,170,0.5)",
            color: "#FF2DAA",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          END
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 8 }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          data-testid="peer-video-local"
          style={{ width: "100%", aspectRatio: "4/3", background: "#111", borderRadius: 8, objectFit: "cover" }}
        />
        <div data-testid="peer-video-remote-monitor-target" style={{ display: "grid", placeItems: "center", aspectRatio: "4/3", background: "#111", borderRadius: 8, color: "rgba(255,255,255,0.62)", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textAlign: "center" }}>
          REMOTE VIDEO · MONITOR B
        </div>
      </div>
      <div style={{ padding: "6px 12px 10px", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
        {error ? `Error: ${error}` : note ?? `Phase: ${phase}`}
      </div>
    </div>
  );
}
