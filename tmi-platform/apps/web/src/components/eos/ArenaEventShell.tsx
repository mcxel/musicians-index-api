"use client";

/**
 * EOS ArenaEventShell — layered competition orchestrator (Phase 4 Pass 4.1).
 *
 * 10-layer stack (composition, not duplication):
 *   Environment → Lighting → Stage → Performers → Audience
 *   → Competition Widgets → HUD → Command Center
 *
 * Delegates venue/WebRTC to LiveArenaEventShell; widgets from RuntimeManifest.
 */

import LiveArenaEventShell, {
  type ArenaEventType,
  type ArenaLiveState,
} from "@/components/live/ArenaEventShell";
import FlightDeckBezel from "@/components/ui/FlightDeckBezel";
import ExperienceWidgetLayer, {
  competitionFormatFromCategory,
} from "@/components/eos/ExperienceWidgetLayer";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import { resolveFlightDeckTheme } from "@/registries/eos/ThemeRegistry";
import type { ExperienceCategory } from "@/core/eos/types";

export interface EosArenaEventShellConfig {
  roomId: string;
  eventType: ArenaEventType;
  mode?: "audience" | "performer";
  liveState?: ArenaLiveState;
  watcherCount?: number;
  /** Skip built-in presentation — EOS widget layer owns HUD */
  suppressLivePresentation?: boolean;
  venueEnvironment?: "indoor" | "outdoor" | null;
  venueSkinId?: string | null;
  specialYearlyOutdoor?: boolean;
}

const CATEGORY_TO_EVENT: Partial<Record<ExperienceCategory, ArenaEventType>> = {
  BATTLE: "battle",
  CYPHER: "cypher",
  CHALLENGE: "challenge",
  STAGE_SHOW: "monday-stage",
  LIVE_SHOWCASE: "monday-stage",
  GAME_SHOW: "deal-or-feud",
  LOUNGE: "lounge",
  DANCE_PARTY: "world-dance-party",
  CONCERT: "concert",
};

export interface EosArenaEventShellProps {
  config: EosArenaEventShellConfig;
}

export default function EosArenaEventShell({ config }: EosArenaEventShellProps) {
  const manifest = useExperienceRuntime();
  const { experience, role } = manifest;
  const bezelTheme = resolveFlightDeckTheme(
    role === "admin" ? "admin" : role === "performer" ? "performer" : "fan"
  );
  const format = competitionFormatFromCategory(experience.category);
  const eventType = config.eventType ?? CATEGORY_TO_EVENT[experience.category] ?? "battle";

  return (
    <FlightDeckBezel
      title={`${experience.title.toUpperCase()} · ${config.roomId}`}
      themeId={bezelTheme}
      flush
      style={{ minHeight: "min(80vh, 720px)" }}
    >
      <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
        <LiveArenaEventShell
          roomId={config.roomId}
          eventType={eventType}
          mode={config.mode ?? "audience"}
          liveState={config.liveState ?? "live"}
          watcherCount={config.watcherCount}
          suppressPresentation
          venueEnvironment={config.venueEnvironment}
          venueSkinId={config.venueSkinId}
          specialYearlyOutdoor={config.specialYearlyOutdoor}
        />
        <ExperienceWidgetLayer
          widgets={manifest.widgets}
          roomId={config.roomId}
          format={format}
          accentColor="#00FFFF"
          featureFlags={experience.featureFlags}
          cypherKing={experience.featureFlags?.some((f) =>
            f.toLowerCase().includes("cypher_king") || f.toLowerCase().includes("cypher-king"),
          )}
        />
      </div>
    </FlightDeckBezel>
  );
}
