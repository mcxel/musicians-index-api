"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useActiveCompetitionTheme } from "@/lib/competition/ThemeRegistry";
import type { CompetitionFormat, CompetitionParticipantView } from "./competitionPresentation.types";

interface CompetitionVSOverlayProps {
  format: CompetitionFormat;
  leftParticipant?: CompetitionParticipantView | null;
  rightParticipant?: CompetitionParticipantView | null;
}

function ParticipantTag({
  participant,
  color,
  align,
}: {
  participant?: CompetitionParticipantView | null;
  color: string;
  align: "left" | "right";
}) {
  return (
    <div
      style={{
        borderColor: color,
        boxShadow: `0 0 20px ${color}33`,
        alignItems: align === "left" ? "flex-start" : "flex-end",
      }}
      className="flex flex-col px-3.5 py-2 rounded-xl bg-black/70 backdrop-blur-xl border"
    >
      {participant ? (
        <>
          <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">
            {align === "left" ? "CHALLENGER A" : "CHALLENGER B"}
          </span>
          <span className="text-white font-extrabold text-sm tracking-wide">
            {participant.displayName}
          </span>
          {participant.score != null && (
            <span style={{ color }} className="font-mono text-xs font-bold mt-0.5">
              {participant.score} PTS
            </span>
          )}
        </>
      ) : (
        <span className="text-[10px] font-bold text-white/35 tracking-wide">
          Waiting for competitor…
        </span>
      )}
    </div>
  );
}

// VS clash emblem + participant name/score tags. Extracted from
// TmiVersusBattleArena's emblem treatment as a lightweight, theme-aware
// overlay - it never renders video itself (that's owned by the real venue
// renderer underneath), and never invents a participant when one is absent.
export default function CompetitionVSOverlay({
  format,
  leftParticipant,
  rightParticipant,
}: CompetitionVSOverlayProps) {
  const theme = useActiveCompetitionTheme(format);
  const showClash = format === "BATTLE";

  return (
    <div className="flex items-start justify-between w-full px-4">
      <ParticipantTag participant={leftParticipant} color={theme.colors.leftFrame} align="left" />

      {showClash && (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            style={{
              boxShadow: `0 0 40px ${theme.colors.glowLeft}`,
              borderColor: theme.colors.leftFrame,
            }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-black/90 border-4 shrink-0"
          >
            <span
              style={{ fontFamily: theme.typography.heading }}
              className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500"
            >
              VS
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      <ParticipantTag participant={rightParticipant} color={theme.colors.rightFrame} align="right" />
    </div>
  );
}
