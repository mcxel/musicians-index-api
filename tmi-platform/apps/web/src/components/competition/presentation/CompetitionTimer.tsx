"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat } from "./competitionPresentation.types";

interface CompetitionTimerProps {
  format: CompetitionFormat;
  remainingSeconds?: number | null;
}

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Extracted from CompetitionAudienceViewport's "TIME REMAINING" display.
// Renders nothing (not a fabricated 0:00) when no timer data exists yet -
// a competition without an active countdown just doesn't show a clock.
export default function CompetitionTimer({ format, remainingSeconds }: CompetitionTimerProps) {
  const theme = useActiveCompetitionTheme(format);

  if (remainingSeconds == null) return null;

  return (
    <div className="flex flex-col items-center bg-black/50 backdrop-blur px-4 py-1.5 rounded-xl border border-white/10">
      <span className="text-[9px] font-bold text-white/40 tracking-widest uppercase">
        Time Remaining
      </span>
      <span style={{ color: theme.colors.leftFrame }} className="text-xl font-black font-mono">
        {formatClock(remainingSeconds)}
      </span>
    </div>
  );
}
