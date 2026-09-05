"use client";

/**
 * VenueToolsPanelHost — mounts animated VENUE TOOLS floating panel from compact quick-panel store.
 * Shared by CommandCenterShell (CompactQuickPanelHost) and lounge/live venue surfaces.
 */

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import VenueToolsQuickPanel, {
  type VenueControlRole,
} from "@/components/hud/panels/VenueToolsQuickPanel";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { isVenueToolsReadOnly, resolveVenueToolsPolicy } from "@/lib/venue/VenueToolsRegistry";

export interface VenueToolsPanelHostProps {
  userId: string;
  role: VenueControlRole;
  /** Fallback room id when store context is empty */
  defaultRoomId?: string;
  readOnly?: boolean;
}

export default function VenueToolsPanelHost({
  userId,
  role,
  defaultRoomId,
  readOnly,
}: VenueToolsPanelHostProps) {
  const activePanel = useCompactQuickPanelStore((s) => s.activePanel);
  const closePanel = useCompactQuickPanelStore((s) => s.closePanel);
  const venueContext = useCompactQuickPanelStore((s) => s.venueContext);
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? undefined);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const venuePolicy = resolveVenueToolsPolicy({
    role,
    isLive: isLivePublished,
    isGoLiveContext: Boolean(hubRoomId ?? defaultRoomId),
    isLoungeHost: venueContext?.isLoungeHost,
  });

  if (activePanel !== "venue") return null;

  const resolvedRoomId = venueContext?.roomId ?? hubRoomId ?? defaultRoomId;

  return (
    <AnimatePresence mode="wait">
      <VenueToolsQuickPanel
        role={role}
        userId={userId}
        roomId={resolvedRoomId}
        isLoungeHost={venueContext?.isLoungeHost}
        readOnly={readOnly ?? venueContext?.readOnly ?? isVenueToolsReadOnly(venuePolicy)}
        onClose={closePanel}
      />
    </AnimatePresence>
  );
}
