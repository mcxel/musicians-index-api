"use client";

/**
 * VenueToolsQuickPanel — canonical floating shell for VENUE TOOLS.
 * Glassmorphic slide+fade; respects prefers-reduced-motion.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import CompactFloatingQuickPanel from "@/components/hud/CompactFloatingQuickPanel";
import VenueToolsPanel, { type VenueControlRole } from "@/components/hud/panels/VenueToolsPanel";
import { openCanonicalDeepStudio } from "@/lib/workspace/universal/openCanonicalPresentation";

export type { VenueControlRole };

export interface VenueToolsQuickPanelProps {
  role: VenueControlRole;
  userId: string;
  roomId?: string;
  venueId?: string;
  isLoungeHost?: boolean;
  readOnly?: boolean;
  onClose: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function VenueToolsQuickPanel({
  role,
  userId,
  roomId,
  venueId,
  isLoungeHost,
  readOnly,
  onClose,
}: VenueToolsQuickPanelProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0.01 : 0.21;
  const accent = role === "performer" ? "#AA2DFF" : "#00FF88";

  return (
    <motion.div
      key="venue-tools-panel"
      data-venue-tools-panel
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration, ease: EASE }}
      style={{ pointerEvents: "auto" }}
    >
      <CompactFloatingQuickPanel
        title="VENUE TOOLS"
        accentColor={accent}
        onClose={onClose}
        onOpenDeep={() => openCanonicalDeepStudio("room-controls")}
        deepLabel="FULL CONTROLS"
      >
        <VenueToolsPanel
          role={role}
          userId={userId}
          roomId={roomId}
          venueId={venueId}
          isLoungeHost={isLoungeHost}
          readOnly={readOnly}
          accentColor={accent}
        />
      </CompactFloatingQuickPanel>
    </motion.div>
  );
}
