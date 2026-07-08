"use client";

import React, { useState } from "react";
import type { SubmissionType } from "@/lib/submissions/SubmissionEngine";
import { StudioGuide } from "./StudioGuide";

interface TrackUploaderProps {
  submissionType: SubmissionType;
  submitterId?: string;
  onSubmissionSuccess: (submissionId: string) => void;
}

export function TrackUploader({ submissionType, submitterId, onSubmissionSuccess }: TrackUploaderProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGuideVisible, setGuideVisible] = useState(true);

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
        onClose={() => setGuideVisible(false)}
        title="Your First Submission"
        message="Welcome to the Studio! Upload your track URL here to get it into the Stream & Win Radio rotation. Every submission earns you XP."
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = { background: '#222', border: '1px solid #444', color: 'white', padding: '12px', borderRadius: '4px', fontSize: '14px' };
const buttonStyle: React.CSSProperties = { background: '#00C8FF', color: '#050510', border: 'none', padding: '12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' };