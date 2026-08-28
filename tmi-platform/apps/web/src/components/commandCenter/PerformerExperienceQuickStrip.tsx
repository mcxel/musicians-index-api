"use client";

/**
 * PerformerExperienceQuickStrip — Mini experience launchers below primary session strip.
 * GO LIVE lives only on CommandCenterSessionControlStrip (one button — no duplicate).
 */

import React, { useState } from "react";
import { presentInstantGoLiveInPlace } from "@/lib/dock/presentInstantGoLiveInPlace";

const EXPERIENCES = [
  { id: "mini-concert", label: "⭐ MINI CONCERT", experience: "mini-concert" },
  { id: "mini-battle", label: "⭐ MINI BATTLE", experience: "mini-battle" },
  { id: "mini-cypher", label: "⭐ MINI CYPHER", experience: "mini-cypher" },
] as const;

export default function PerformerExperienceQuickStrip() {
  const [launching, setLaunching] = useState<string | null>(null);
  const [error, setError] = useState("");

  const launch = async (experience: string, id: string) => {
    if (launching) return;
    setLaunching(id);
    setError("");
    try {
      const result = await presentInstantGoLiveInPlace({
        role: "PERFORMER",
        preferredExperience: experience,
        publishSession: true,
      });
      if (!result.ok) {
        setError(result.error ?? "Launch failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed.");
    } finally {
      setLaunching(null);
    }
  };

  return (
    <div
      data-performer-experience-strip
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        overflowX: "auto",
        background: "rgba(5, 5, 20, 0.88)",
        borderBottom: "1px solid rgba(170,45,255,0.18)",
        scrollbarWidth: "none",
      }}
    >
      {EXPERIENCES.map((exp) => (
        <button
          key={exp.id}
          type="button"
          data-testid={`tmi-performer-exp-${exp.id}`}
          disabled={Boolean(launching)}
          onClick={() => void launch(exp.experience, exp.id)}
          style={{
            flexShrink: 0,
            padding: "5px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(170,45,255,0.35)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.06em",
            cursor: launching ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: launching && launching !== exp.id ? 0.55 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {launching === exp.id ? "LAUNCHING…" : exp.label}
        </button>
      ))}
      {error ? (
        <span style={{ fontSize: 9, color: "#FF4444", fontWeight: 700, flexShrink: 0 }}>{error}</span>
      ) : null}
    </div>
  );
}
