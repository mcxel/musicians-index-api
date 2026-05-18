"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "requesting" | "active" | "denied" | "unavailable";

export default function LocalCameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<State>("idle");
  const [muted, setMuted] = useState(false);
  const [hidden, setHidden] = useState(false);

  async function enable() {
    if (state === "requesting") return;
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("active");
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      setState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "unavailable");
    }
  }

  function toggleMic() {
    const stream = streamRef.current;
    if (!stream) return;
    const newMuted = !muted;
    stream.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setMuted(newMuted);
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const pip: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 16,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  };

  // Collapsed pill when hidden
  if (hidden) {
    return (
      <div style={pip}>
        <button
          onClick={() => setHidden(false)}
          style={{
            padding: "5px 10px", borderRadius: 20, border: "1px solid rgba(0,255,255,0.3)",
            background: "rgba(6,4,16,0.85)", color: "#00FFFF",
            fontSize: 10, fontWeight: 800, cursor: "pointer", backdropFilter: "blur(8px)",
          }}
          title="Show camera"
        >
          📷
        </button>
      </div>
    );
  }

  return (
    <div style={pip}>
      {/* Video tile */}
      <div style={{
        width: 120, height: 90, borderRadius: 10, overflow: "hidden",
        background: "#0d0820",
        border: state === "active" ? "2px solid #00FF88" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: state === "active" ? "0 0 14px rgba(0,255,136,0.3)" : "none",
        position: "relative",
      }}>
        {state === "active" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            {state === "idle" && (
              <button
                onClick={enable}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.3)",
                  background: "rgba(0,255,255,0.1)", color: "#00FFFF",
                  fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em",
                }}
              >
                📷 GO LIVE
              </button>
            )}
            {state === "requesting" && (
              <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em" }}>CONNECTING…</span>
            )}
            {state === "denied" && (
              <>
                <span style={{ fontSize: 18 }}>🚫</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.3 }}>Camera<br/>blocked</span>
              </>
            )}
            {state === "unavailable" && (
              <>
                <span style={{ fontSize: 18 }}>📵</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.3 }}>No camera<br/>found</span>
              </>
            )}
          </div>
        )}

        {/* Live badge */}
        {state === "active" && (
          <div style={{
            position: "absolute", top: 4, left: 4,
            display: "flex", alignItems: "center", gap: 3,
            background: "rgba(0,0,0,0.7)", borderRadius: 4,
            padding: "2px 5px", fontSize: 7, fontWeight: 900, color: "#00FF88",
            letterSpacing: "0.1em",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 4px #00FF88" }} />
            LIVE
          </div>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 4 }}>
        {state === "active" && (
          <button
            onClick={toggleMic}
            style={{
              padding: "4px 8px", borderRadius: 6, border: "none",
              background: muted ? "rgba(255,80,80,0.25)" : "rgba(255,255,255,0.08)",
              color: muted ? "#FF5050" : "rgba(255,255,255,0.6)",
              fontSize: 12, cursor: "pointer",
            }}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🎙️"}
          </button>
        )}
        <button
          onClick={() => setHidden(true)}
          style={{
            padding: "4px 8px", borderRadius: 6, border: "none",
            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)",
            fontSize: 10, cursor: "pointer",
          }}
          title="Hide"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
