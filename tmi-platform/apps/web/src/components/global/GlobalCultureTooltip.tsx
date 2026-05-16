"use client";

import { useState } from "react";
import { getMusicMeaningCard } from "@/lib/global/MusicMeaningAssistEngine";

interface GlobalCultureTooltipProps {
  term: string;
  children: React.ReactNode;
}

export default function GlobalCultureTooltip({ term, children }: GlobalCultureTooltipProps) {
  const [visible, setVisible] = useState(false);
  const card = getMusicMeaningCard(term);

  if (!card) return <>{children}</>;

  return (
    <span className="relative inline-block">
      <span
        className="underline decoration-dotted decoration-cyan-400/60 cursor-help"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
      {visible && (
        <span
          className="absolute z-50 bottom-full left-0 mb-2 w-64 rounded-lg p-3 text-xs shadow-xl pointer-events-none"
          style={{ background: "#0a0a14", border: "1px solid rgba(0,255,255,0.25)", color: "#e0e0e0" }}
        >
          <span className="block font-bold text-cyan-400 mb-1">{card.term}</span>
          <span className="block text-white/80 mb-1">{card.meaning}</span>
          <span className="block text-white/50 italic text-[11px]">{card.culturalContext}</span>
          <span className="block mt-1.5 text-white/30 text-[10px]">Origin: {card.origin}</span>
        </span>
      )}
    </span>
  );
}
