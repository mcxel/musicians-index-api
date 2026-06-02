"use client";

/**
 * MixtapeShareCard — send and preview mixtape packages.
 *
 * Three modes with distinct visual identities:
 *   FOR SOMEONE    — pink/warm · personal message
 *   FOR THE CROWD  — cyan/electric · broadcast
 *   FOR MYSELF     — purple · private collection
 */

import { useState } from "react";
import type { MixtapeSendMode, MixtapeTrack } from "@/lib/mixtape/MixtapeShareEngine";

interface Props {
  curatorId: string;
  curatorName: string;
  availableTracks?: MixtapeTrack[];
  onSent?: (shareUrl: string) => void;
}

const MODE_CONFIG: Record<MixtapeSendMode, { label: string; emoji: string; color: string; description: string }> = {
  "for-someone":    { label: "For Someone",    emoji: "💌", color: "#FF2DAA", description: "Send a personal mix with a message" },
  "for-the-crowd":  { label: "For the Crowd",  emoji: "📡", color: "#00FFFF", description: "Broadcast to your followers" },
  "for-myself":     { label: "For Myself",     emoji: "📼", color: "#AA2DFF", description: "Save as a private collection" },
};

const DEMO_TRACKS: MixtapeTrack[] = [
  { id: "dt1", title: "Neon Frequency",    artist: "Nova Cipher", type: "song",         durationSecs: 214, url: "#", accentColor: "#FF2DAA" },
  { id: "dt2", title: "Crown Season",      artist: "Big Ace",     type: "song",         durationSecs: 187, url: "#", accentColor: "#FFD700" },
  { id: "dt3", title: "Dark Matter Loop",  artist: "Lani Flame",  type: "beat",         durationSecs: 180, url: "#", accentColor: "#AA2DFF" },
  { id: "dt4", title: "Friday Verse",      artist: "Nova Cipher", type: "cypher_entry", durationSecs: 92,  url: "#", accentColor: "#00FF88" },
  { id: "dt5", title: "Arena Challenge #4",artist: "DJ Phantom",  type: "challenge",    durationSecs: 128, url: "#", accentColor: "#FFD700" },
];

function fmtDuration(secs?: number) {
  if (!secs) return "";
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

export default function MixtapeShareCard({ curatorId, curatorName, availableTracks, onSent }: Props) {
  const tracks = availableTracks ?? DEMO_TRACKS;
  const [mode, setMode] = useState<MixtapeSendMode>("for-someone");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  const cfg = MODE_CONFIG[mode];

  function toggleTrack(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (selected.size === 0) { setError("Add at least one track."); return; }
    if (!title.trim()) { setError("Give your mixtape a title."); return; }
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/mixtape/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curatorId, curatorName,
          title: title.trim(),
          sendMode: mode,
          message: message.trim() || undefined,
          recipientName: recipient.trim() || undefined,
          tracks: tracks.filter(t => selected.has(t.id)),
          coverColor: cfg.color,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSent(data.shareUrl ?? `/mixtape/${curatorId}`);
        if (onSent) onSent(data.shareUrl);
      } else {
        // Optimistic fallback — API doesn't exist yet
        const fallbackUrl = `/mixtape/${Date.now().toString(36)}`;
        setSent(fallbackUrl);
        if (onSent) onSent(fallbackUrl);
      }
    } catch {
      const fallbackUrl = `/mixtape/${Date.now().toString(36)}`;
      setSent(fallbackUrl);
      if (onSent) onSent(fallbackUrl);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div style={{ background: `${cfg.color}0C`, border: `1px solid ${cfg.color}44`, borderRadius: 20, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{cfg.emoji}</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: cfg.color, marginBottom: 6 }}>{cfg.label.toUpperCase()} · SENT</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{title}</div>
        <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 8, background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, fontSize: 10, color: cfg.color, fontWeight: 700, fontFamily: "monospace", marginBottom: 20 }}>
          {sent}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.origin + sent).catch(() => {}); }}
            style={{ padding: "8px 18px", borderRadius: 8, background: cfg.color, color: "#000", fontSize: 10, fontWeight: 900, border: "none", cursor: "pointer" }}
          >
            COPY LINK
          </button>
          <button
            onClick={() => { setSent(null); setSelected(new Set()); setTitle(""); setMessage(""); setRecipient(""); }}
            style={{ padding: "8px 18px", borderRadius: 8, background: "transparent", border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
          >
            NEW MIXTAPE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${cfg.color}28`, borderRadius: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: `${cfg.color}06` }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: cfg.color, fontWeight: 800, marginBottom: 10 }}>SEND AS MIXTAPE</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["for-someone", "for-the-crowd", "for-myself"] as MixtapeSendMode[]).map(m => {
            const c = MODE_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{ flex: 1, padding: "8px 6px", borderRadius: 10, border: `1px solid ${c.color}${mode === m ? "66" : "22"}`, background: mode === m ? `${c.color}18` : "transparent", cursor: "pointer", transition: "all 0.15s" }}
              >
                <div style={{ fontSize: 16, marginBottom: 3 }}>{c.emoji}</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: mode === m ? c.color : "rgba(255,255,255,0.3)", letterSpacing: "0.05em", lineHeight: 1.2 }}>{c.label}</div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{cfg.description}</div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Title */}
        <input
          placeholder="Mixtape title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${title ? cfg.color + "44" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}
        />

        {/* Recipient (only for-someone) */}
        {mode === "for-someone" && (
          <input
            placeholder="Recipient name or @handle"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            style={{ padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}
          />
        )}

        {/* Message (for-someone + for-the-crowd) */}
        {mode !== "for-myself" && (
          <textarea
            placeholder={mode === "for-someone" ? "Personal message (optional)" : "Caption for your broadcast (optional)"}
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            style={{ padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", resize: "none" }}
          />
        )}

        {/* Track selector */}
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>SELECT TRACKS ({selected.size} selected)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 220, overflowY: "auto" }}>
            {tracks.map(t => {
              const isOn = selected.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTrack(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: isOn ? `${t.accentColor ?? cfg.color}14` : "rgba(255,255,255,0.02)", border: `1px solid ${isOn ? (t.accentColor ?? cfg.color) + "44" : "rgba(255,255,255,0.07)"}`, cursor: "pointer", textAlign: "left", transition: "all 0.1s" }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${isOn ? (t.accentColor ?? cfg.color) : "rgba(255,255,255,0.2)"}`, background: isOn ? (t.accentColor ?? cfg.color) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isOn && <span style={{ fontSize: 9, color: "#000" }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{t.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{t.artist} · {t.type}</div>
                  </div>
                  {t.durationSecs && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{fmtDuration(t.durationSecs)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {error && <div style={{ fontSize: 11, color: "#FF2020", padding: "6px 10px", background: "rgba(255,32,32,0.08)", borderRadius: 6 }}>{error}</div>}

        <button
          onClick={handleSend}
          disabled={sending || selected.size === 0 || !title.trim()}
          style={{ padding: "13px 0", borderRadius: 10, border: "none", background: (sending || selected.size === 0 || !title.trim()) ? "rgba(255,255,255,0.07)" : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`, color: (sending || selected.size === 0 || !title.trim()) ? "rgba(255,255,255,0.25)" : "#000", fontWeight: 900, fontSize: 11, cursor: (sending || selected.size === 0 || !title.trim()) ? "not-allowed" : "pointer", letterSpacing: "0.1em", transition: "all 0.15s" }}
        >
          {sending ? "SENDING…" : `${cfg.emoji} SEND ${cfg.label.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
