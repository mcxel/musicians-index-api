"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import InboxPanel from "@/components/messaging/InboxPanel";

type DockMode = "chat" | "voice" | "video" | "invite";

interface DockUser {
  userId: string;
  displayName: string;
  role: "fan" | "artist" | "admin" | "sponsor";
  avatarUrl?: string;
}

interface HeadquartersCommunicationDockProps {
  currentUser: DockUser;
  accentColor?: string;
  inviteCandidates?: Array<{ userId: string; displayName: string }>;
}

function modeTitle(mode: DockMode): string {
  if (mode === "chat") return "Chat";
  if (mode === "voice") return "Voice";
  if (mode === "video") return "Video";
  return "Invite";
}

export default function HeadquartersCommunicationDock({
  currentUser,
  accentColor = "#00FFFF",
  inviteCandidates = [],
}: HeadquartersCommunicationDockProps) {
  const [mode, setMode] = useState<DockMode | null>(null);
  const [videoState, setVideoState] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [voiceState, setVoiceState] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);
  const [voiceMicEnabled, setVoiceMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [inviteUserId, setInviteUserId] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const inviteMessage = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://themusiciansindex.com";
    return `Join me on TMI: ${base}/live/lobby`;
  }, []);

  const stopStreamTracks = (activeStream: MediaStream | null) => {
    if (!activeStream) return;
    activeStream.getTracks().forEach((t) => t.stop());
  };

  const startVideoCall = async () => {
    if (videoState === "active" || videoState === "connecting") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setVideoState("error");
      setVideoError("Camera/mic APIs are unavailable in this browser.");
      return;
    }

    try {
      setVideoState("connecting");
      setVideoError(null);
      const local = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(local);
      setCameraEnabled(true);
      setMicEnabled(true);
      setVideoState("active");
    } catch {
      setVideoState("error");
      setVideoError("Camera or microphone permission was denied.");
    }
  };

  const endVideoCall = () => {
    stopStreamTracks(stream);
    setStream(null);
    setVideoState("idle");
    setCameraEnabled(true);
    setMicEnabled(true);
    setVideoError(null);
  };

  const toggleCamera = () => {
    if (!stream) return;
    const next = !cameraEnabled;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraEnabled(next);
  };

  const toggleMic = () => {
    if (!stream) return;
    const next = !micEnabled;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicEnabled(next);
  };

  const startVoiceCall = async () => {
    if (voiceState === "active" || voiceState === "connecting") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setVoiceState("error");
      setVoiceError("Microphone APIs are unavailable in this browser.");
      return;
    }

    try {
      setVoiceState("connecting");
      setVoiceError(null);
      const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setVoiceStream(local);
      setVoiceMicEnabled(true);
      setVoiceState("active");
    } catch {
      setVoiceState("error");
      setVoiceError("Microphone permission was denied.");
    }
  };

  const endVoiceCall = () => {
    stopStreamTracks(voiceStream);
    setVoiceStream(null);
    setVoiceState("idle");
    setVoiceMicEnabled(true);
    setVoiceError(null);
  };

  const toggleVoiceMic = () => {
    if (!voiceStream) return;
    const next = !voiceMicEnabled;
    voiceStream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setVoiceMicEnabled(next);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const close = () => {
    if (mode === "voice") {
      endVoiceCall();
    }
    if (mode === "video") {
      endVideoCall();
    }
    setMode(null);
  };

  useEffect(() => {
    return () => {
      stopStreamTracks(stream);
      stopStreamTracks(voiceStream);
    };
  }, [stream, voiceStream]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 22,
          zIndex: 120,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "rgba(6,8,20,0.88)",
          border: `1px solid ${accentColor}44`,
          borderRadius: 999,
          padding: "8px 10px",
          backdropFilter: "blur(10px)",
          boxShadow: `0 0 18px ${accentColor}33`,
        }}
      >
        <button onClick={() => setMode("chat")} style={btnStyle(accentColor)} title="Open chat">💬</button>
        <button onClick={() => setMode("voice")} style={btnStyle(accentColor)} title="Open voice">🎤</button>
        <button onClick={() => setMode("video")} style={btnStyle(accentColor)} title="Open video">🎥</button>
        <button onClick={() => setMode("invite")} style={btnStyle(accentColor)} title="Invite">🔗</button>
      </div>

      {mode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 130,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={close}
        >
          <div
            style={{
              width: "min(980px, 100%)",
              maxHeight: "90vh",
              overflow: "auto",
              background: "linear-gradient(180deg, rgba(8,10,26,0.98), rgba(5,6,18,0.98))",
              border: `1px solid ${accentColor}44`,
              borderRadius: 14,
              boxShadow: `0 0 30px ${accentColor}22`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: accentColor, textTransform: "uppercase" }}>
                {modeTitle(mode)} Hub
              </div>
              <button onClick={close} style={{ ...btnStyle(accentColor), width: 30, height: 30 }}>✕</button>
            </div>

            <div style={{ padding: 12 }}>
              {mode === "chat" && (
                <InboxPanel
                  currentUser={{
                    userId: currentUser.userId,
                    displayName: currentUser.displayName,
                    role: currentUser.role,
                    avatarUrl: currentUser.avatarUrl ?? "",
                  }}
                />
              )}

              {mode === "voice" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, marginBottom: 8 }}>Voice Calls</div>

                  {voiceState !== "active" ? (
                    <>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
                        {voiceState === "error"
                          ? voiceError ?? "Unable to start voice call."
                          : "Start a voice call from HQ. Mute and end controls stay available in this panel."}
                      </div>
                      <button
                        onClick={() => void startVoiceCall()}
                        style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}
                      >
                        {voiceState === "connecting" ? "Connecting..." : "Start Voice Call"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>
                        Voice link active. Microphone is {voiceMicEnabled ? "on" : "muted"}.
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={toggleVoiceMic} style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}>
                          {voiceMicEnabled ? "Mute Mic" : "Unmute Mic"}
                        </button>
                        <button
                          onClick={endVoiceCall}
                          style={{
                            ...btnStyle("#ff4d6d"),
                            width: "auto",
                            borderRadius: 8,
                            padding: "6px 10px",
                            fontSize: 10,
                            fontWeight: 800,
                            border: "1px solid rgba(255,77,109,0.7)",
                            color: "#ff4d6d",
                          }}
                        >
                          End Voice Call
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {mode === "video" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, marginBottom: 8 }}>Video Calls</div>

                  {videoState !== "active" ? (
                    <>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
                        {videoState === "error"
                          ? videoError ?? "Unable to start video call."
                          : "Start a video call from HQ. End call remains available in this panel."}
                      </div>
                      <button
                        onClick={() => void startVideoCall()}
                        style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}
                      >
                        {videoState === "connecting" ? "Connecting..." : "Start Video Call"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${accentColor}44` }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", maxHeight: 320, background: "#050510", display: "block" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={toggleCamera} style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}>
                          {cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
                        </button>
                        <button onClick={toggleMic} style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}>
                          {micEnabled ? "Mute Mic" : "Unmute Mic"}
                        </button>
                        <button
                          onClick={endVideoCall}
                          style={{
                            ...btnStyle("#ff4d6d"),
                            width: "auto",
                            borderRadius: 8,
                            padding: "6px 10px",
                            fontSize: 10,
                            fontWeight: 800,
                            border: "1px solid rgba(255,77,109,0.7)",
                            color: "#ff4d6d",
                          }}
                        >
                          End Video Call
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {mode === "invite" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>Share this invite:</div>
                  <div style={{ fontSize: 12, color: "#fff", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", wordBreak: "break-all" }}>
                    {inviteMessage}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => void navigator.clipboard?.writeText(inviteMessage)}
                      style={{ ...btnStyle(accentColor), width: "auto", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800 }}
                    >
                      Copy Invite Link
                    </button>
                    <a href={`/messages/new?subject=${encodeURIComponent("Join me live")}&body=${encodeURIComponent(inviteMessage)}`} style={{ ...linkBtnStyle(accentColor) }}>
                      Send Invite Message
                    </a>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Invite friend by user ID</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        value={inviteUserId}
                        onChange={(event) => setInviteUserId(event.target.value)}
                        placeholder="friend_user_id"
                        style={{
                          flex: "1 1 220px",
                          minWidth: 180,
                          background: "rgba(0,0,0,0.35)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          borderRadius: 8,
                          color: "#fff",
                          padding: "8px 10px",
                          fontSize: 11,
                        }}
                      />
                      <a
                        href={inviteUserId.trim() ? `/messages/new?to=${encodeURIComponent(inviteUserId.trim())}&subject=${encodeURIComponent("Live room invite")}&body=${encodeURIComponent(inviteMessage)}` : "/messages/new"}
                        style={{ ...linkBtnStyle(accentColor) }}
                      >
                        Invite Friend
                      </a>
                    </div>
                  </div>

                  {inviteCandidates.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Quick invite</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {inviteCandidates.slice(0, 8).map((candidate) => (
                          <a
                            key={candidate.userId}
                            href={`/messages/new?to=${encodeURIComponent(candidate.userId)}&subject=${encodeURIComponent("Live room invite")}&body=${encodeURIComponent(inviteMessage)}`}
                            style={{ ...linkBtnStyle(accentColor), fontSize: 9 }}
                          >
                            Invite {candidate.displayName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StateCard({ title, body, ctaLabel, ctaHref, accentColor }: { title: string; body: string; ctaLabel: string; ctaHref: string; accentColor: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>{body}</div>
      <a href={ctaHref} style={{ display: "inline-block", textDecoration: "none", fontSize: 10, fontWeight: 800, color: accentColor, border: `1px solid ${accentColor}55`, borderRadius: 8, padding: "6px 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {ctaLabel}
      </a>
    </div>
  );
}

function btnStyle(accentColor: string): CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: `1px solid ${accentColor}66`,
    background: "rgba(255,255,255,0.04)",
    color: accentColor,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
  };
}

function linkBtnStyle(accentColor: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: 10,
    fontWeight: 800,
    color: accentColor,
    border: `1px solid ${accentColor}66`,
    borderRadius: 8,
    padding: "6px 10px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.04)",
  };
}
