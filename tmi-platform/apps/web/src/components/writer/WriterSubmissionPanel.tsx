"use client";

import { useState } from "react";
import type { WriterWorkKind } from "@/types/memory";

interface Props {
  writerId: string;
  onSubmitted?: (title: string, kind: WriterWorkKind) => void;
}

const WORK_KINDS: { value: WriterWorkKind; label: string; icon: string }[] = [
  { value: "article",   label: "TMI Article",   icon: "📰" },
  { value: "interview", label: "Interview",      icon: "🎙️" },
  { value: "review",    label: "Review",         icon: "⭐" },
  { value: "feature",   label: "Feature",        icon: "✨" },
  { value: "past-work", label: "Past Work",      icon: "📂" },
  { value: "image",     label: "Image / Photo",  icon: "🖼️" },
];

export default function WriterSubmissionPanel({ writerId: _writerId, onSubmitted }: Props) {
  const [open,        setOpen]        = useState(false);
  const [kind,        setKind]        = useState<WriterWorkKind>("past-work");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [publication, setPublication] = useState("");
  const [visibility,  setVisibility]  = useState<"public" | "private">("public");
  const [busy,        setBusy]        = useState(false);
  const [success,     setSuccess]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setSuccess("");
    try {
      await fetch("/api/writer/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind, title, description, publication, visibility }),
      });
      onSubmitted?.(title, kind);
      setSuccess(`"${title}" added to your wall.`);
      setTitle(""); setDescription(""); setPublication("");
    } catch {
      // silently fail — optimistic UI still shows card via parent refresh
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "10px 18px",
          background: open ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "#FF2DAA55" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 10,
          color: open ? "#FF2DAA" : "rgba(255,255,255,0.6)",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.12em",
          cursor: "pointer",
        }}
      >
        {open ? "✕ CANCEL" : "+ ADD WORK"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 12, padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 2 }}>ADD WORK TO PORTFOLIO</div>

          {/* Kind picker */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WORK_KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: `1px solid ${kind === k.value ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
                  background: kind === k.value ? "rgba(255,45,170,0.1)" : "transparent",
                  color: kind === k.value ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                {k.icon} {k.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 5 }}>TITLE *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article or work title"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "9px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 5 }}>SHORT DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="One-line context — what it was about"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "9px 12px", color: "#fff", fontSize: 12, resize: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Publication */}
          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 5 }}>PUBLICATION (optional)</label>
            <input
              value={publication}
              onChange={(e) => setPublication(e.target.value)}
              placeholder="e.g. Complex, XXL, Self-published"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "9px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {/* Visibility */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>VISIBILITY:</span>
            {(["public", "private"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${visibility === v ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`, background: visibility === v ? "rgba(255,45,170,0.1)" : "transparent", color: visibility === v ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 9, cursor: "pointer", letterSpacing: "0.1em" }}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>

          {success && <div style={{ fontSize: 11, color: "#00FF88" }}>✓ {success}</div>}

          <button
            type="submit"
            disabled={busy || !title.trim()}
            style={{ padding: "10px 20px", background: busy ? "rgba(255,45,170,0.3)" : "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", cursor: busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "SAVING..." : "ADD TO WALL →"}
          </button>
        </form>
      )}
    </div>
  );
}
