"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DISMISSED_KEY = "tmi-feedback-dismissed-until";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const until = Number(localStorage.getItem(DISMISSED_KEY) ?? "0");
  return Date.now() < until;
}

function rememberDismissed() {
  localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
}

function isHubRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/hub/fan" || pathname === "/hub/performer" || pathname.startsWith("/hub/");
}

type FeedbackCategory =
  | 'bug'
  | 'video-issue'
  | 'chat-issue'
  | 'login-issue'
  | 'suggestion'
  | 'battle-feedback'
  | 'visual-issue'
  | 'audio-issue'
  | 'feature-request'
  | 'report-user';

const OPTIONS: { id: FeedbackCategory; label: string; icon: string; color: string }[] = [
  { id: "bug",              label: "Something is broken",    icon: "🛠️", color: "#FF2DAA" },
  { id: "video-issue",      label: "Video / camera issue",   icon: "📹", color: "#FF6B35" },
  { id: "chat-issue",       label: "Chat not working",       icon: "💬", color: "#00C8FF" },
  { id: "login-issue",      label: "Login / auth issue",     icon: "🔐", color: "#FF4040" },
  { id: "visual-issue",     label: "Visual / display issue", icon: "👁️", color: "#AA2DFF" },
  { id: "audio-issue",      label: "Audio problem",          icon: "🔊", color: "#FFD700" },
  { id: "battle-feedback",  label: "Battle feedback",        icon: "⚡", color: "#00FF88" },
  { id: "suggestion",       label: "I have a suggestion",    icon: "💡", color: "#00C896" },
  { id: "feature-request",  label: "Feature request",        icon: "✨", color: "#00FFFF" },
  { id: "report-user",      label: "Report a user",          icon: "🚨", color: "#FF4040" },
];

const SEVERITY: Record<FeedbackCategory, 'high' | 'medium' | 'low'> = {
  'bug':             'high',
  'login-issue':     'high',
  'report-user':     'high',
  'video-issue':     'medium',
  'chat-issue':      'medium',
  'audio-issue':     'medium',
  'visual-issue':    'low',
  'battle-feedback': 'low',
  'suggestion':      'low',
  'feature-request': 'low',
};

type PanelState = "collapsed" | "open" | "submitted";

export default function LiveFeedbackPanel() {
  const pathname = usePathname();
  const onHub = isHubRoute(pathname);
  const [dismissed, setDismissed] = useState(false);
  const [hubSessionActive, setHubSessionActive] = useState(false);
  const [explicitOpen, setExplicitOpen] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>("collapsed");
  const [selected, setSelected]     = useState<FeedbackCategory | null>(null);
  const [message, setMessage]       = useState("");
  const [issueCount, setIssueCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDismissed(isDismissed());
  }, []);

  useEffect(() => {
    const onOpenRequest = () => {
      setExplicitOpen(true);
      setPanelState("open");
    };
    window.addEventListener("tmi:open-beta-feedback", onOpenRequest);
    return () => window.removeEventListener("tmi:open-beta-feedback", onOpenRequest);
  }, []);

  useEffect(() => {
    if (!onHub) {
      setHubSessionActive(false);
      return;
    }
    const check = () => {
      setHubSessionActive(
        Boolean(
          document.querySelector("[data-session-control-strip]") ||
            document.querySelector("[data-hub-monitor-stage]"),
        ),
      );
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [onHub]);

  const hubSafe = onHub && hubSessionActive;

  useEffect(() => {
    if (hubSafe && panelState === "open" && !explicitOpen) {
      setPanelState("collapsed");
    }
  }, [hubSafe, panelState, explicitOpen]);

  const handleOpen = useCallback(() => {
    setExplicitOpen(true);
    setPanelState("open");
  }, []);

  const handleCollapse = useCallback(() => {
    setPanelState("collapsed");
    setExplicitOpen(false);
  }, []);

  const handleNotNow = useCallback(() => {
    rememberDismissed();
    setDismissed(true);
    setPanelState("collapsed");
    setExplicitOpen(false);
  }, []);

  async function submit() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected,
          severity: SEVERITY[selected],
          tags: ["BETA_FEEDBACK"],
          message: message.trim() || undefined,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json() as { count?: number };
      setIssueCount(data.count ?? null);
      setPanelState("submitted");
    } catch {
      setPanelState("submitted");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOption = OPTIONS.find((o) => o.id === selected);

  if (dismissed) return null;

  // Position toward center-left of the usable content area, safely above the persistent bottom rail
  // and avoiding collision with bottom navigation docks, side rails, and top headers on all viewports (desktop and 390x844).
  const anchorStyle = {
    bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
    left: "max(16px, env(safe-area-inset-left, 0px))",
    top: "auto" as const,
    right: "auto" as const,
  };


  return (
    <div
      data-live-feedback-panel
      style={{
        position: "fixed",
        ...anchorStyle,
        zIndex: hubSafe ? 350 : 9000,
        fontFamily: "'Inter',sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Collapsed beacon — hub sessions keep clear of session control strip */}
      {panelState === "collapsed" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
          <button
            type="button"
            data-feedback-beacon
            onClick={handleOpen}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 14px",
              background: "rgba(5,5,16,0.92)",
              border: "1px solid rgba(170,45,255,0.4)",
              color: "#AA2DFF",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              borderRadius: 4,
              boxShadow: "0 0 12px rgba(170,45,255,0.15)",
            }}
          >
            📡 BETA FEEDBACK
          </button>
          <button
            type="button"
            onClick={handleNotNow}
            aria-label="Dismiss beta feedback for 7 days"
            style={{
              padding: "8px 10px",
              background: "rgba(5,5,16,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)",
              fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            NOT NOW
          </button>
        </div>
      )}

      {/* Open panel */}
      {panelState === "open" && (
        <div style={{
          width: 280,
          background: "rgba(5,5,16,0.97)",
          border: "1px solid rgba(170,45,255,0.3)",
          backdropFilter: "blur(12px)",
          padding: "16px",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          maxHeight: hubSafe ? "min(55vh, 420px)" : "80vh",
          overflowY: "auto",
          pointerEvents: "auto",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "#AA2DFF" }}>BETA FEEDBACK</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginTop: 1 }}>
                Your report goes directly to the team
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={handleNotNow}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: 0,
                }}
              >
                NOT NOW
              </button>
              <button
                type="button"
                onClick={handleCollapse}
                aria-label="Close beta feedback"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Category grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 12 }}>
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 9px",
                  background: selected === opt.id ? `${opt.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === opt.id ? opt.color : "rgba(255,255,255,0.07)"}`,
                  color: selected === opt.id ? opt.color : "rgba(255,255,255,0.5)",
                  fontSize: 9, fontWeight: selected === opt.id ? 700 : 400,
                  cursor: "pointer", textAlign: "left", borderRadius: 4,
                }}
              >
                <span style={{ fontSize: 11 }}>{opt.icon}</span>
                <span style={{ lineHeight: 1.2 }}>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Optional message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more (optional)..."
            rows={2}
            maxLength={300}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 10, resize: "none", outline: "none",
              fontFamily: "'Inter',sans-serif",
              marginBottom: 10, borderRadius: 4,
            }}
          />

          {/* Severity badge */}
          {selected && (
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SEVERITY:</span>
              <span style={{
                fontSize: 8, fontWeight: 900, letterSpacing: "0.12em",
                color: SEVERITY[selected] === 'high' ? '#FF4040' : SEVERITY[selected] === 'medium' ? '#FFD700' : '#00C896',
                background: SEVERITY[selected] === 'high' ? 'rgba(255,64,64,0.12)' : SEVERITY[selected] === 'medium' ? 'rgba(255,215,0,0.12)' : 'rgba(0,200,150,0.12)',
                border: `1px solid ${SEVERITY[selected] === 'high' ? 'rgba(255,64,64,0.3)' : SEVERITY[selected] === 'medium' ? 'rgba(255,215,0,0.3)' : 'rgba(0,200,150,0.3)'}`,
                borderRadius: 3, padding: "1px 6px",
              }}>
                {SEVERITY[selected].toUpperCase()}
              </span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>· BETA_FEEDBACK</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => void submit()}
            disabled={!selected || submitting}
            style={{
              width: "100%",
              padding: "9px",
              background: selected ? `${selectedOption?.color ?? "#AA2DFF"}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected ? (selectedOption?.color ?? "#AA2DFF") + "50" : "rgba(255,255,255,0.08)"}`,
              color: selected ? (selectedOption?.color ?? "#AA2DFF") : "rgba(255,255,255,0.3)",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
              cursor: selected && !submitting ? "pointer" : "not-allowed",
              textTransform: "uppercase",
              borderRadius: 4,
            }}
          >
            {submitting ? "SENDING..." : "SUBMIT REPORT"}
          </button>
        </div>
      )}

      {/* Submitted */}
      {panelState === "submitted" && (
        <div style={{
          width: 280,
          background: "rgba(5,5,16,0.97)",
          border: "1px solid rgba(0,200,150,0.3)",
          backdropFilter: "blur(12px)",
          padding: "20px 16px",
          textAlign: "center",
          borderRadius: 8,
          pointerEvents: "auto",
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#00C896", marginBottom: 6 }}>Received — thank you.</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 6, lineHeight: 1.5 }}>
            Your report is tagged <strong style={{ color: "#AA2DFF" }}>BETA_FEEDBACK</strong> and routed to
            the observatory. You&apos;re helping shape TMI.
          </div>
          {issueCount && issueCount > 1 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
              {issueCount} users reported this. We&apos;re on it.
            </div>
          )}
          <button
            type="button"
            onClick={() => { handleCollapse(); setSelected(null); setMessage(""); setIssueCount(null); }}
            style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
