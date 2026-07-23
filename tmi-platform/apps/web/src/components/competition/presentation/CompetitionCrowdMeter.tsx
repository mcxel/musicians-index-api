"use client";

import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat } from "./competitionPresentation.types";

interface CompetitionCrowdMeterProps {
  format: CompetitionFormat;
  crowdEnergy?: number | null;
}

// CompetitionAudienceViewport tracked a crowdEnergy value (0-100) but never
// had a dedicated visual meter for it - this gives that real signal an
// honest presentation. Renders nothing when no energy signal exists yet.
export default function CompetitionCrowdMeter({ format, crowdEnergy }: CompetitionCrowdMeterProps) {
  const theme = useActiveCompetitionTheme(format);

  if (crowdEnergy == null) return null;

  const pct = Math.max(0, Math.min(100, crowdEnergy));

  return (
    <div className="flex flex-col gap-1 w-40">
      <span className="text-[8px] font-bold text-white/40 tracking-widest uppercase">
        Crowd Energy
      </span>
      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${theme.colors.leftFrame}, ${theme.colors.rightFrame})` }}
          className="h-full rounded-full transition-all duration-500"
        />
      </div>
    </div>
  );
}
