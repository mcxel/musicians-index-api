"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat } from "./competitionPresentation.types";

interface CompetitionHUDProps {
  format: CompetitionFormat;
  roomId: string;
  roundLabel?: string | null;
}

// Extracted from CompetitionAudienceViewport's "Dynamic Event Masthead"
// (format + room id strip). Presentation-only - no fetching, no owned state.
export default function CompetitionHUD({ format, roomId, roundLabel }: CompetitionHUDProps) {
  const theme = useActiveCompetitionTheme(format);

  return (
    <div
      className="flex justify-between items-center bg-black/45 backdrop-blur px-4 py-2 rounded-lg border border-white/10"
      style={{ pointerEvents: "none" }}
    >
      <div className="text-[10px] font-black tracking-widest text-white/70">
        FORMAT: <span style={{ color: theme.colors.leftFrame }}>{format}</span>
      </div>
      {roundLabel ? (
        <div
          style={{ fontFamily: theme.typography.heading, color: theme.colors.leftFrame }}
          className="text-sm font-black italic tracking-wide"
        >
          {roundLabel}
        </div>
      ) : null}
      <div className="text-[10px] font-bold tracking-wider font-mono text-white/50">
        ROOM_ID: {roomId}
      </div>
    </div>
  );
}
