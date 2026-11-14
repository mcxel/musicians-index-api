"use client";

import React, { useState, useEffect } from "react";
import type {
  HappyDaysDestination,
  HappyDaysAttribution,
  PublicPresentationChoice,
} from "@/lib/happydays/HappyDaysContracts";
import { logHappyDaysEvent, HAPPY_DAYS_EVENT } from "@/lib/happydays/HappyDaysObservatoryEvents";
import { publicationDateKeyFromInstant } from "@/lib/happydays/HappyDaysPromptRegistry";
import {
  advanceSocialMoment,
  applyPublicationDate,
  blurSocialMoment,
  clearSocialMomentDraft,
  createSocialMomentPresentation,
  focusSocialMoment,
  rotationPinned,
  setReducedMotion,
  writeSocialMomentDraft,
  type SocialMomentPresentation,
} from "@/lib/happydays/socialMomentPresentation";

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
  onDismiss,
}: HappyDaysPromptCardProps) {
  const [moment, setMoment] = useState<SocialMomentPresentation>(() => createSocialMomentPresentation(Date.now()));
  const [destination, setDestination] = useState<HappyDaysDestination>("magazine");
  const [attribution, setAttribution] = useState<HappyDaysAttribution>("public_name");
  const [presentationChoice, setPresentationChoice] = useState<PublicPresentationChoice>("NAME_ONLY");
  const [attachSong, setAttachSong] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const response = moment.drafts[moment.channel]?.text ?? "";
  const pinned = rotationPinned(moment);
  const accent = moment.channel === "HAPPY_DAYS" ? "#FFD700" : "#00FFFF";

  useEffect(() => {
    logHappyDaysEvent(HAPPY_DAYS_EVENT.PROMPT_SHOWN, { promptId: moment.promptId, role: userRole });
  }, [moment.promptId, userRole]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setMoment((current) => setReducedMotion(current, media.matches));
    applyMotion();
    media.addEventListener("change", applyMotion);
    const timer = window.setInterval(() => {
      const now = Date.now();
      setMoment((current) =>
        advanceSocialMoment(applyPublicationDate(current, publicationDateKeyFromInstant(new Date(now))), now),
      );
    }, 1000);
    return () => {
      media.removeEventListener("change", applyMotion);
      window.clearInterval(timer);
    };
  }, []);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    logHappyDaysEvent(HAPPY_DAYS_EVENT.PROMPT_DISMISSED, { promptId: moment.promptId, role: userRole });
    onDismiss?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;
    setSubmissionNotice(
      destination === "magazine"
        ? "Submit to TMI Magazine is not connected yet. This draft stays on today's question."
        : "Saving this reflection is not connected yet. This draft stays on today's question.",
    );
  };

  const handleClear = () => {
    setMoment((current) => clearSocialMomentDraft(current, Date.now()));
    setSubmissionNotice(null);
  };

  return (
    <div
      data-testid="social-moment-card"
      data-social-channel={moment.channel}
      data-prompt-id={moment.promptId}
      data-publication-date={moment.publicationDateKey}
      data-rotation-pinned={pinned ? "yes" : "no"}
      data-motion={moment.motion}
      data-has-member={userId && userId !== "anon-user" ? "yes" : "no"}
      style={{
        background: "linear-gradient(135deg, rgba(20,12,36,0.96), rgba(8,6,20,0.98))",
        border: `1px solid ${accent}73`,
        borderRadius: 14,
        padding: "16px 20px",
        color: "#fff",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${accent}26`,
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
        <span style={{ fontSize: 18 }}>{moment.channel === "HAPPY_DAYS" ? "☀️" : "💬"}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {moment.channel === "HAPPY_DAYS" ? "HAPPY DAYS" : "COMMUNITY GOSSIP"}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <style>{`@keyframes tmiSocialMomentSlide{from{opacity:.4;transform:translateX(10px)}to{opacity:1;transform:none}}`}</style>
          <div
            key={`${moment.channel}:${moment.promptId}`}
            data-testid="social-moment-prompt"
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.35,
              animation: moment.motion === "slide" ? "tmiSocialMomentSlide 280ms ease" : "none",
            }}
          >
            {moment.promptText}
          </div>

          <textarea
            data-testid="social-moment-draft"
            value={response}
            onFocus={() => setMoment((current) => focusSocialMoment(current))}
            onBlur={() => setMoment((current) => blurSocialMoment(current, Date.now()))}
            onChange={(e) => setMoment((current) => writeSocialMomentDraft(current, e.target.value))}
            placeholder={moment.channel === "HAPPY_DAYS" ? "Share a positive reflection..." : "Tell the scene what you know..."}
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
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>
                Public presentation
              </div>
              <select
                data-testid="social-moment-presentation"
                value={presentationChoice}
                onChange={(e) => setPresentationChoice(e.target.value as PublicPresentationChoice)}
                style={{
                  width: "100%",
                  borderRadius: 6,
                  background: "#0a0614",
                  border: `1px solid ${accent}55`,
                  color: accent,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <option value="PHOTO_AND_NAME">Photo + Name</option>
                <option value="NAME_ONLY">Name Only</option>
                <option value="QUOTE_ONLY">Quote Only</option>
              </select>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                Not saved. Quote Only still keeps an internal member record once submission is connected.
              </div>
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
              type="button"
              data-testid="social-moment-clear"
              onClick={handleClear}
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
              Clear
            </button>
            <button
              type="submit"
              data-testid="social-moment-share"
              disabled={!response.trim()}
              style={{
                background: `linear-gradient(135deg, ${accent}, #FF2DAA)`,
                border: "none",
                color: "#050310",
                borderRadius: 6,
                padding: "7px 18px",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: response.trim() ? "pointer" : "not-allowed",
                opacity: response.trim() ? 1 : 0.5,
              }}
            >
              SHARE REFLECTION
            </button>
          </div>
          {submissionNotice && (
            <div data-testid="social-moment-submission-state" role="status" style={{ marginTop: 8, fontSize: 11, color: "#FFB454" }}>
              {submissionNotice}
            </div>
          )}
        </form>
    </div>
  );
}
