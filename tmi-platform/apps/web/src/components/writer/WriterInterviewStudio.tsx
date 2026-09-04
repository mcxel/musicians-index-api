"use client";

import { useState, useRef, useCallback } from "react";
import type { InterviewSession, InterviewSessionStatus } from "@/lib/interview/WriterInterviewService";

interface WriterInterviewStudioProps {
  writerId: string;
  onPublished?: (sessionId: string) => void;
}

const ACCENT = "#FF2DAA";
const CYAN = "#00FFFF";
const GREEN = "#00FF88";
const RED = "#FF4466";
const GOLD = "#FFD700";

const STATUS_LABELS: Record<InterviewSessionStatus, string> = {
  PREP:              "Prep",
  WAITING_FOR_GUEST: "Waiting for Guest",
  CONNECTED:         "Guest Connected",
  RECORDING:         "● RECORDING",
  PAUSED:            "⏸ Paused",
  ENDED:             "Ended",
  PROCESSING:        "Processing…",
  READY_FOR_REVIEW:  "Ready for Review",
  PUBLISHED:         "Published",
};

const STATUS_COLOR: Record<InterviewSessionStatus, string> = {
  PREP:              "#888",
  WAITING_FOR_GUEST: GOLD,
  CONNECTED:         GREEN,
  RECORDING:         RED,
  PAUSED:            GOLD,
  ENDED:             "#888",
  PROCESSING:        CYAN,
  READY_FOR_REVIEW:  GREEN,
  PUBLISHED:         ACCENT,
};

export default function WriterInterviewStudio({ writerId, onPublished }: WriterInterviewStudioProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // New session form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [title, setTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createSession = useCallback(async () => {
    if (!guestName.trim() || !title.trim()) {
      setError("Guest name and interview title are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ guestName: guestName.trim(), guestEmail: guestEmail.trim() || undefined, title: title.trim(), articleTargetSlug: articleSlug.trim() || undefined }),
      });
      const data: { ok?: boolean; session?: InterviewSession; error?: string } = await res.json();
      if (!data.ok || !data.session) throw new Error(data.error ?? "Failed to create session");
      setSession(data.session);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating session");
    } finally {
      setCreating(false);
    }
  }, [guestName, guestEmail, title, articleSlug]);

  const transition = useCallback(async (targetStatus: InterviewSessionStatus) => {
    if (!session) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/interview/${session.id}/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: targetStatus }),
      });
      const data: { ok?: boolean; session?: InterviewSession; error?: string } = await res.json();
      if (data.ok && data.session) setSession(data.session);
      else setError(data.error ?? "Transition failed");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }, [session]);

  const saveNotes = useCallback((value: string) => {
    setNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    if (!session) return;
    notesTimer.current = setTimeout(async () => {
      await fetch(`/api/interview/${session.id}/record`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: value }),
      });
    }, 800);
  }, [session]);

  const publish = useCallback(async () => {
    if (!session) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/interview/${session.id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const data: { ok?: boolean; session?: InterviewSession; error?: string } = await res.json();
      if (data.ok && data.session) {
        setSession(data.session);
        onPublished?.(session.id);
      } else {
        setError(data.error ?? "Publish failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }, [session, onPublished]);

  // PRE-SESSION: form to create a new interview
  if (!session) {
    return (
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 16 }}>🎙 NEW INTERVIEW SESSION</div>

        {error && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: `${RED}18`, border: `1px solid ${RED}44`, borderRadius: 8, fontSize: 12, color: RED }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>GUEST NAME *</label>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. Julius Carter"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, padding: "9px 12px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>GUEST EMAIL</label>
            <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="invite link (optional)"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, padding: "9px 12px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>INTERVIEW TITLE *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Julius on Culture, Craft and the New Sound"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, padding: "9px 12px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>LINK TO ARTICLE (SLUG)</label>
            <input value={articleSlug} onChange={(e) => setArticleSlug(e.target.value)} placeholder="e.g. julius-carter-interview-2026"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, padding: "9px 12px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <button type="button" disabled={creating || !guestName.trim() || !title.trim()} onClick={createSession}
          style={{ padding: "12px 28px", background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 9, color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: (creating || !guestName.trim() || !title.trim()) ? "not-allowed" : "pointer", opacity: (creating || !guestName.trim() || !title.trim()) ? 0.5 : 1, letterSpacing: "0.08em" }}
        >
          {creating ? "CREATING…" : "START INTERVIEW SESSION"}
        </button>
      </div>
    );
  }

  const s = session.status;
  const isRecording = s === "RECORDING";
  const canRecord = s === "CONNECTED" || s === "PAUSED";
  const canEnd = s === "RECORDING" || s === "CONNECTED" || s === "PAUSED";
  const canPublish = s === "READY_FOR_REVIEW";

  return (
    <div style={{ background: "rgba(10,10,20,0.95)", border: `1px solid ${STATUS_COLOR[s]}33`, borderRadius: 16, overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{ padding: "12px 20px", background: `${STATUS_COLOR[s]}12`, borderBottom: `1px solid ${STATUS_COLOR[s]}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: STATUS_COLOR[s], fontWeight: 800 }}>{STATUS_LABELS[s]}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginTop: 2 }}>{session.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Guest: {session.guestName}{session.guestEmail ? ` · ${session.guestEmail}` : ""}</div>
        </div>
        {session.inviteToken && s === "WAITING_FOR_GUEST" && (
          <div style={{ fontSize: 10, color: CYAN, background: `${CYAN}10`, border: `1px solid ${CYAN}30`, borderRadius: 8, padding: "6px 10px", fontFamily: "monospace" }}>
            Invite: /join/interview?token={session.inviteToken.slice(0, 12)}…
          </div>
        )}
      </div>

      {/* Two-monitor layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)" }}>
        {/* Writer monitor */}
        <div style={{ padding: 16, background: "#0a0a14" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 10 }}>YOU — WRITER</div>
          <div style={{
            aspectRatio: "16/9", borderRadius: 10, background: "#0d0820",
            border: `2px solid ${isRecording ? RED : "rgba(255,255,255,0.12)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isRecording ? `0 0 18px ${RED}44` : "none",
            transition: "border-color 0.25s, box-shadow 0.25s",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${ACCENT}22`, border: `2px solid ${ACCENT}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: ACCENT, margin: "0 auto 8px" }}>W</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{cameraOff ? "Camera Off" : "Camera Ready"}</div>
            </div>
          </div>
          {/* Mic/camera controls */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => setMicMuted(!micMuted)}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${micMuted ? RED : GREEN}44`, background: micMuted ? `${RED}18` : `${GREEN}10`, color: micMuted ? RED : GREEN, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >{micMuted ? "🎙 MIC OFF" : "🎤 MIC ON"}</button>
            <button type="button" onClick={() => setCameraOff(!cameraOff)}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${cameraOff ? RED : CYAN}44`, background: cameraOff ? `${RED}18` : `${CYAN}10`, color: cameraOff ? RED : CYAN, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >{cameraOff ? "🚫 CAM OFF" : "🎥 CAM ON"}</button>
          </div>
        </div>

        {/* Guest monitor */}
        <div style={{ padding: 16, background: "#08080f" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 10 }}>GUEST — {session.guestName.toUpperCase()}</div>
          <div style={{
            aspectRatio: "16/9", borderRadius: 10, background: "#0d0820",
            border: `2px solid ${s === "CONNECTED" || isRecording ? CYAN : "rgba(255,255,255,0.08)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: (s === "CONNECTED" || isRecording) ? `0 0 14px ${CYAN}33` : "none",
            transition: "border-color 0.25s, box-shadow 0.25s",
          }}>
            {s === "WAITING_FOR_GUEST" || s === "PREP" ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
                Waiting for guest to join…
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${CYAN}22`, border: `2px solid ${CYAN}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: CYAN, margin: "0 auto 8px" }}>{session.guestName.charAt(0).toUpperCase()}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{session.guestName}</div>
              </div>
            )}
          </div>
          {/* Consent indicator */}
          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: session.consentConfirmed ? `${GREEN}14` : "rgba(255,255,255,0.04)", border: `1px solid ${session.consentConfirmed ? GREEN : "rgba(255,255,255,0.1)"}40`, fontSize: 11, color: session.consentConfirmed ? GREEN : "rgba(255,255,255,0.3)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            {session.consentConfirmed ? "✅ Recording consent confirmed" : "⚠️ Consent not yet confirmed"}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div style={{ padding: "14px 20px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {error && (
          <div style={{ width: "100%", marginBottom: 6, padding: "6px 10px", background: `${RED}18`, border: `1px solid ${RED}44`, borderRadius: 6, fontSize: 11, color: RED }}>{error}</div>
        )}

        {/* Status-driven action buttons */}
        {s === "PREP" && (
          <button type="button" disabled={saving} onClick={() => transition("WAITING_FOR_GUEST")}
            style={actionBtn(GOLD, saving)}>📡 INVITE GUEST</button>
        )}
        {s === "WAITING_FOR_GUEST" && (
          <button type="button" disabled={saving} onClick={() => transition("CONNECTED")}
            style={actionBtn(GREEN, saving)}>🔗 MARK CONNECTED</button>
        )}
        {canRecord && (
          <button type="button" disabled={saving} onClick={() => transition("RECORDING")}
            style={actionBtn(RED, saving)}>⏺ {s === "PAUSED" ? "RESUME" : "START RECORDING"}</button>
        )}
        {isRecording && (
          <button type="button" disabled={saving} onClick={() => transition("PAUSED")}
            style={actionBtn(GOLD, saving)}>⏸ PAUSE</button>
        )}
        {canEnd && (
          <button type="button" disabled={saving} onClick={() => transition("ENDED")}
            style={actionBtn("#888", saving)}>⏹ END SESSION</button>
        )}
        {s === "ENDED" && (
          <button type="button" disabled={saving} onClick={() => transition("PROCESSING")}
            style={actionBtn(CYAN, saving)}>⚙️ PROCESS RECORDING</button>
        )}
        {s === "PROCESSING" && (
          <button type="button" disabled={saving} onClick={() => transition("READY_FOR_REVIEW")}
            style={actionBtn(GREEN, saving)}>✅ MARK READY</button>
        )}
        {canPublish && (
          <button type="button" disabled={saving} onClick={publish}
            style={actionBtn(ACCENT, saving)}>🚀 PUBLISH INTERVIEW</button>
        )}

        {session.durationSeconds > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            {Math.floor(session.durationSeconds / 60).toString().padStart(2, "0")}:{(session.durationSeconds % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Notes panel */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 8 }}>INTERVIEW NOTES</div>
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          placeholder="Key quotes, follow-up questions, timestamps…"
          rows={4}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, padding: "10px 12px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
        {session.articleTargetSlug && (
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Linked article: <span style={{ color: ACCENT }}>{session.articleTargetSlug}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function actionBtn(color: string, disabled: boolean): React.CSSProperties {
  return {
    padding: "9px 18px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}18`,
    color: color,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  };
}
