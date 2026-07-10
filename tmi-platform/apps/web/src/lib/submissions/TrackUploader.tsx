"use client";

import React, { useEffect, useState } from "react";
import type { SubmissionType } from "@/lib/submissions/SubmissionEngine";
import { StudioGuide } from "./StudioGuide";

interface TrackUploaderProps {
  submissionType: SubmissionType;
  submitterId?: string;
  onSubmissionSuccess: (submissionId: string) => void;
}

const GUIDE_SEEN_KEY = "tmi_studio_guide_first_submission_seen";

export function TrackUploader({ submissionType, submitterId, onSubmissionSuccess }: TrackUploaderProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Defaults hidden to match SSR output; a real "has this user already been
  // shown this" check only happens client-side after mount. Previously this
  // was `useState(true)` with no persistence at all, so the guide reappeared
  // on every single page load regardless of whether it had been dismissed
  // or the user had already submitted — it never actually tracked "first."
  const [isGuideVisible, setGuideVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadySeen = window.localStorage.getItem(GUIDE_SEEN_KEY);
    if (!alreadySeen) setGuideVisible(true);
  }, []);

  const dismissGuide = () => {
    setGuideVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!submitterId) {
      setError("Session required — please log in to submit.");
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitterId,
          title,
          url,
          type: submissionType,
          genre: "Hip-Hop",
        }),
      });
      const result = await res.json().catch(() => ({}));

      if (res.ok && result.submissionId) {
        onSubmissionSuccess(result.submissionId);
        setTitle("");
        setUrl("");
        dismissGuide();
      } else {
        setError(`Submission failed: ${result.error ?? "unknown error"}`);
      }
    } catch {
      setError("Submission failed: network error");
    }
  };

  return (
    <div style={{ background: "#1a1a2e", padding: "24px", borderRadius: "8px" }}>
      <h3 style={{ color: "#00C8FF", marginTop: 0 }}>Submit New {submissionType}</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input type="text" placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        <input type="url" placeholder="https://soundcloud.com/..." value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} />
        <button type="submit" style={buttonStyle}>Submit to Radio</button>
        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
      </form>
       <StudioGuide
        isVisible={isGuideVisible}
        onClose={dismissGuide}
        title="Your First Submission"
        message="Welcome to the Studio! Upload your track URL here to get it into the Stream & Win Radio rotation. Every submission earns you XP."
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = { background: '#222', border: '1px solid #444', color: 'white', padding: '12px', borderRadius: '4px', fontSize: '14px' };
const buttonStyle: React.CSSProperties = { background: '#00C8FF', color: '#050510', border: 'none', padding: '12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' };