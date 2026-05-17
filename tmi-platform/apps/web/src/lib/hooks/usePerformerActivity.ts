"use client";
import { useState, useEffect } from "react";

export type PerformerActivityState = "spotlight" | "active" | "idle";

export interface PerformerActivityResult {
  score: number;
  state: PerformerActivityState;
  isSpeaking: boolean;
  hasCameraOn: boolean;
}

// Scoring weights
// isSpeaking:     3 pts
// hasCameraOn:    1 pt
// interactionCount (clap/tip/vote/click): 2 pts each, max 4 interactions = 8 pts
// Thresholds: >= 5 → spotlight, >= 2 → active, else → idle

function scoreToState(score: number): PerformerActivityState {
  if (score >= 5) return "spotlight";
  if (score >= 2) return "active";
  return "idle";
}

function seedFrom(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) & 0xffff;
  return s;
}

export function usePerformerActivity(
  performerId: string,
  _roomId: string
): PerformerActivityResult {
  const seed = seedFrom(performerId);

  const [isSpeaking, setIsSpeaking] = useState(() => seed % 5 < 2);
  const [hasCameraOn] = useState(() => seed % 4 !== 0);
  const [interactionCount, setInteractionCount] = useState(() => seed % 3);

  useEffect(() => {
    // Vary tick interval per performer so tiles don't all flip in sync
    const intervalMs = 2600 + (seed % 2200);
    const id = setInterval(() => {
      setIsSpeaking((prev) => (Math.random() > 0.42 ? !prev : prev));
      setInteractionCount((prev) => {
        // Decay by 1 each tick unless fresh interaction arrives
        const gained = Math.random() > 0.55 ? 1 : 0;
        return Math.max(0, Math.min(4, prev - 1 + gained));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [seed]);

  // Cap interactions at 3 so real performance (speaking) always outweighs spam clicks
  const score = (isSpeaking ? 3 : 0) + (hasCameraOn ? 1 : 0) + Math.min(interactionCount, 3) * 2;

  return {
    score,
    state: scoreToState(score),
    isSpeaking,
    hasCameraOn,
  };
}
