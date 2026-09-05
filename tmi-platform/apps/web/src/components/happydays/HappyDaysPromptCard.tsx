"use client";

import React, { useState, useEffect } from "react";
import { getDailyHappyDaysPrompt } from "@/lib/happydays/HappyDaysPromptRegistry";
import type {
  HappyDaysPrompt,
  HappyDaysDestination,
  HappyDaysAttribution,
} from "@/lib/happydays/HappyDaysContracts";
import { logHappyDaysEvent, HAPPY_DAYS_EVENT } from "@/lib/happydays/HappyDaysObservatoryEvents";

export interface HappyDaysPromptCardProps {
  userId?: string;
  displayName?: string;
  userRole?: "fan" | "performer";
  onSubmitted?: () => void;
  onDismiss?: () => void;
}

export default function HappyDaysPromptCard({
  userId = "anon-user",
  displayName = "TMI Member",
  userRole = "fan",
  onSubmitted,
  onDismiss,
}: HappyDaysPromptCardProps) {
  const [prompt, setPrompt] = useState<HappyDaysPrompt>(getDailyHappyDaysPrompt());
  const [response, setResponse] = useState("");
  const [destination, setDestination] = useState<HappyDaysDestination>("magazine");
  const [attribution, setAttribution] = useState<HappyDaysAttribution>("public_name");
  const [attachSong, setAttachSong] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(getDailyHappyDaysPrompt());
    logHappyDaysEvent(HAPPY_DAYS_EVENT.PROMPT_SHOWN, { promptId: prompt.id, role: userRole });
  }, [userRole]);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    logHappyDaysEvent(HAPPY_DAYS_EVENT.PROMPT_DISMISSED, { promptId: prompt.id, role: userRole });
    onDismiss?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/happydays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          response: response.trim(),
          destination,
          attributionPreference: attribution,
          displayName,
          userId,
          userRole,
          attachedTrack:
            attachSong && songTitle.trim()
              ? {
                  title: songTitle.trim(),
                  artist: songArtist.trim() || displayName,
                }
              : undefined,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        onSubmitted?.();
      } else {
        setSubmitError("Reflections can't be submitted yet. Please try again later.");
      }
    } catch {
      setSubmitError("Reflections can't be submitted yet. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(20,12,36,0.96), rgba(8,6,20,0.98))",
        border: "1px solid rgba(255,215,0,0.45)",
        borderRadius: 14,
        padding: "16px 20px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.15)",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss Happy Days prompt"
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>☀️</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#FFD700",
            textTransform: "uppercase",
          }}
        >
          HAPPY DAYS · COMMUNITY MOMENT
        </span>
      </div>

      {isSubmitted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>
            Thank you for sharing your reflection!
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
            {destination === "magazine"
              ? "Your entry has been submitted for consideration in the next TMI Magazine Happy Days spread."
              : "Your reflection has been safely saved."}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>
            {prompt.promptText}
          </div>

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={prompt.placeholderText || "Share a positive reflection..."}
            rows={3}
            style={{
              width: "100%",
              borderRadius: 8,
              background: "rgba(5,5,16,0.75)",
              border: "1px solid rgba(255,215,0,0.3)",
              color: "#fff",
              padding: "10px 12px",
              fontSize: 12,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Attach Song Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setAttachSong(!attachSong)}
              style={{
                background: "transparent",
                border: "none",
                color: attachSong ? "#00FFFF" : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>🎵</span>
              <span>{attachSong ? "Song Attached" : "+ Attach a song that matches this feeling"}</span>
            </button>

            {attachSong && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Song Title"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  style={{
                    borderRadius: 6,
                    background: "rgba(5,5,16,0.85)",
                    border: "1px solid rgba(0,255,255,0.4)",
                    color: "#fff",
                    padding: "6px 10px",
                    fontSize: 11,
                  }}
                />
                <input
                  type="text"
                  placeholder="Artist"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  style={{
                    borderRadius: 6,
                    background: "rgba(5,5,16,0.85)",
                    border: "1px solid rgba(0,255,255,0.4)",
                    color: "#fff",
                    padding: "6px 10px",
                    fontSize: 11,
                  }}
                />
              </div>
            )}
          </div>

          {/* Destination & Attribution Selectors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 8,
              background: "rgba(255,255,255,0.03)",
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>
                Where to share
              </div>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as HappyDaysDestination)}
                style={{
                  width: "100%",
                  borderRadius: 6,
                  background: "#0a0614",
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "#FFD700",
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <option value="magazine">📖 Submit to TMI Magazine</option>
                <option value="friends">👥 Share with Friends</option>
                <option value="private">🔒 Private Journal Only</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>
                Credit as
              </div>
              <select
                value={attribution}
                onChange={(e) => setAttribution(e.target.value as HappyDaysAttribution)}
                style={{
                  width: "100%",
                  borderRadius: 6,
                  background: "#0a0614",
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "#FFD700",
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <option value="public_name">{displayName} (Display Name)</option>
                <option value="tmi_id">TMI ID Badge</option>
                <option value="anonymous_community">Anonymous Community Member</option>
              </select>
            </div>
          </div>

          {/* Non-Clinical Disclaimer */}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.35, fontStyle: "italic" }}>
            ✦ Happy Days is an optional community reflection. It is not healthcare, therapy, or diagnosis.
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.65)",
                borderRadius: 6,
                padding: "7px 14px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !response.trim()}
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                border: "none",
                color: "#050310",
                borderRadius: 6,
                padding: "7px 18px",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: response.trim() && !isSubmitting ? "pointer" : "not-allowed",
                opacity: response.trim() && !isSubmitting ? 1 : 0.5,
              }}
            >
              {isSubmitting ? "SUBMITTING..." : "SHARE REFLECTION"}
            </button>
          </div>
          {submitError && (
            <div role="alert" style={{ marginTop: 8, fontSize: 11, color: "#FF6B6B" }}>
              {submitError}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
