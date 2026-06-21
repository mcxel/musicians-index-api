"use client";

import { useMemo, useState, type CSSProperties } from "react";
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
}

function modeTitle(mode: DockMode): string {
  if (mode === "chat") return "Chat";
  if (mode === "voice") return "Voice";
  if (mode === "video") return "Video";
  return "Invite";
}

export default function HeadquartersCommunicationDock({ currentUser, accentColor = "#00FFFF" }: HeadquartersCommunicationDockProps) {
  const [mode, setMode] = useState<DockMode | null>(null);

  const inviteMessage = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://themusiciansindex.com";
    return `Join me on TMI: ${base}/messages`;
  }, []);

  const close = () => setMode(null);

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
                <StateCard
                  title="Voice Calls"
                  body="No active voice session yet. Start one from Messages or invite a contact from this hub."
                  ctaLabel="Open Messages"
                  ctaHref="/messages"
                  accentColor={accentColor}
                />
              )}

              {mode === "video" && (
                <StateCard
                  title="Video Calls"
                  body="No active video session yet. Start one from Messages or open a live room."
                  ctaLabel="Open Live Rooms"
                  ctaHref="/live/rooms"
                  accentColor={accentColor}
                />
              )}

              {mode === "invite" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>Share this invite:</div>
                  <div style={{ fontSize: 12, color: "#fff", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", wordBreak: "break-all" }}>
                    {inviteMessage}
                  </div>
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
