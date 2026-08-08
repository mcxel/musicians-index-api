"use client";

/**
 * Observatory ↔ Observatory video chat for Marcel / Justin / Jay Paul.
 * Pick a governance contact → ring → real WebRTC when accepted.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useObservatoryPeerCall } from "@/hooks/useObservatoryPeerCall";

type Contact = {
  userId: string;
  memberId: string;
  displayName: string;
  online: boolean;
  adminHub: string;
};

type CallSession = {
  callId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  status: string;
};

export default function ObservatoryVideoCallPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [meId, setMeId] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [incoming, setIncoming] = useState<CallSession[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const mediaActive =
    !!activeCall &&
    (activeCall.status === "accepted" ||
      activeCall.status === "connected" ||
      activeCall.status === "ringing");

  const { phase, error, localStream, remoteStream } = useObservatoryPeerCall({
    callId: activeCall?.callId ?? null,
    peerId: meId || "anon",
    isCaller,
    active: mediaActive && (activeCall?.status === "accepted" || activeCall?.status === "connected"),
  });

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/observatory-call?path=${encodeURIComponent(pathname ?? "")}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        me?: { userId: string };
        contacts?: Contact[];
        incoming?: CallSession[];
        active?: CallSession[];
      };
      if (data.me?.userId) setMeId(data.me.userId);
      setContacts(data.contacts ?? []);
      setIncoming(data.incoming ?? []);
      if (!activeCall && data.active?.[0]) {
        const c = data.active[0];
        setActiveCall(c);
        setIsCaller(c.callerId === data.me?.userId);
      }
    } catch {
      /* ignore */
    }
  }, [pathname, activeCall]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => {
      void refresh();
      void fetch("/api/admin/observatory-call", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat", path: pathname }),
      });
    }, 12_000);
    const onAccept = (ev: Event) => {
      const detail = (ev as CustomEvent<{ callId?: string }>).detail;
      if (detail?.callId) {
        setOpen(true);
        void respond(detail.callId, "accepted");
      }
    };
    window.addEventListener("tmi:observatory-call-accept", onAccept);
    return () => {
      clearInterval(t);
      window.removeEventListener("tmi:observatory-call-accept", onAccept);
    };
  }, [refresh, pathname]);

  async function startCall(contact: Contact) {
    setStatusNote(null);
    setOpen(true);
    const res = await fetch("/api/admin/observatory-call", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        calleeId: contact.userId,
        calleeName: contact.displayName,
      }),
    });
    const data = (await res.json()) as {
      call?: CallSession;
      calleeOnline?: boolean;
      error?: string;
    };
    if (!res.ok || !data.call) {
      setStatusNote(data.error ?? "Could not start call.");
      return;
    }
    setActiveCall(data.call);
    setIsCaller(true);
    if (data.call.status === "offline" || data.calleeOnline === false) {
      setStatusNote(`${contact.displayName} appears offline. Invite sent — they can join when online.`);
    } else {
      setStatusNote(`Ringing ${contact.displayName}…`);
    }
  }

  async function respond(callId: string, status: "accepted" | "declined" | "ended") {
    const res = await fetch("/api/admin/observatory-call", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", callId, status }),
    });
    const data = (await res.json()) as { call?: CallSession };
    if (data.call) {
      if (status === "accepted") {
        setActiveCall(data.call);
        setIsCaller(false);
        setOpen(true);
        setStatusNote("Connecting WebRTC…");
      } else {
        setActiveCall(null);
        setStatusNote(status === "declined" ? "Call declined." : "Call ended.");
      }
    }
  }

  async function endActive() {
    if (activeCall) await respond(activeCall.callId, "ended");
    setActiveCall(null);
  }

  // When caller sees accepted, flip to media
  useEffect(() => {
    if (!activeCall || !isCaller) return;
    if (activeCall.status === "ringing") {
      const t = setInterval(async () => {
        const res = await fetch(
          `/api/admin/observatory-call?callId=${encodeURIComponent(activeCall.callId)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { call?: CallSession };
        if (data.call) {
          setActiveCall(data.call);
          if (data.call.status === "accepted" || data.call.status === "connected") {
            setStatusNote("Callee joined — establishing video…");
          } else if (data.call.status === "declined" || data.call.status === "ended") {
            setStatusNote(`Call ${data.call.status}.`);
            setActiveCall(null);
          }
        }
      }, 2000);
      return () => clearInterval(t);
    }
  }, [activeCall, isCaller]);

  return (
    <>
      {/* Incoming toast */}
      {incoming.length > 0 && !open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 18,
            zIndex: 140,
            background: "rgba(8,6,20,0.96)",
            border: "1px solid rgba(255,45,170,0.55)",
            borderRadius: 12,
            padding: 14,
            width: 280,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.12em" }}>
            INCOMING VIDEO CHAT
          </div>
          {incoming.map((c) => (
            <div key={c.callId} style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{c.callerName}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => void respond(c.callId, "accepted")}
                  style={pillBtn("#00FF88")}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => void respond(c.callId, "declined")}
                  style={pillBtn("#ff4d6d")}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Launcher */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          void refresh();
        }}
        title="Observatory video chat"
        style={{
          position: "fixed",
          bottom: 22,
          right: 18,
          zIndex: 130,
          borderRadius: 999,
          border: "1px solid rgba(0,255,255,0.45)",
          background: "rgba(6,8,20,0.92)",
          color: "#00FFFF",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.1em",
          padding: "10px 14px",
          cursor: "pointer",
          boxShadow: "0 0 18px rgba(0,255,255,0.2)",
        }}
      >
        📹 OBS VIDEO
        {incoming.length > 0 ? ` · ${incoming.length}` : ""}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            right: 18,
            zIndex: 135,
            width: 340,
            maxHeight: "72vh",
            overflow: "auto",
            background: "linear-gradient(160deg, rgba(6,7,13,0.98), rgba(10,6,20,0.99))",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 14,
            padding: 14,
            boxShadow: "0 16px 48px rgba(0,0,0,0.65)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>
              OBSERVATORY VIDEO CHAT
            </div>
            <button type="button" onClick={() => setOpen(false)} style={{ ...pillBtn("#888"), padding: "2px 8px" }}>
              ✕
            </button>
          </div>

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "8px 0 12px" }}>
            Call Marcel, Justin, or Jay Paul on their Observatory. Real WebRTC — honest ringing if offline.
          </div>

          {!activeCall && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contacts.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  No other governance accounts found in the database yet.
                </div>
              ) : (
                contacts.map((c) => (
                  <button
                    key={c.userId}
                    type="button"
                    onClick={() => void startCall(c)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: c.online ? "#00FF88" : "#555",
                        boxShadow: c.online ? "0 0 6px #00FF88" : "none",
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 800 }}>{c.displayName}</span>
                    <span style={{ fontSize: 9, color: c.online ? "#00FF88" : "#666" }}>
                      {c.online ? "ONLINE" : "OFFLINE"}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {activeCall && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700", marginBottom: 6 }}>
                {isCaller ? activeCall.calleeName : activeCall.callerName}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                {statusNote ?? activeCall.status}
                {phase !== "idle" ? ` · RTC: ${phase}` : ""}
              </div>
              {error && (
                <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 8 }}>{error}</div>
              )}

              {(activeCall.status === "accepted" ||
                activeCall.status === "connected" ||
                phase === "connected" ||
                phase === "signaling") && (
                <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      minHeight: 140,
                      background: "#050510",
                      borderRadius: 8,
                      border: "1px solid rgba(0,255,255,0.25)",
                    }}
                  />
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: 100,
                      height: 72,
                      objectFit: "cover",
                      background: "#050510",
                      borderRadius: 6,
                      border: "1px solid rgba(255,215,0,0.35)",
                      justifySelf: "end",
                    }}
                  />
                </div>
              )}

              {activeCall.status === "ringing" && isCaller && (
                <div style={{ fontSize: 11, color: "#FFD700", marginBottom: 10 }}>Waiting for accept…</div>
              )}

              <button type="button" onClick={() => void endActive()} style={pillBtn("#ff4d6d")}>
                End Call
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function pillBtn(color: string): CSSProperties {
  return {
    borderRadius: 8,
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    fontSize: 10,
    fontWeight: 800,
    padding: "6px 12px",
    cursor: "pointer",
  };
}
