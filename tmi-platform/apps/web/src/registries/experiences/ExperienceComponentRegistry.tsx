/**
 * Experience Component Registry — maps ExperienceRegistry IDs to runtime modules.
 * StageLoader resolves manifest, then ExperienceMount loads ONLY the matched module.
 *
 * IMPORTANT: experiences are dynamic()-loaded (not static imports). Eagerly importing
 * every Arena/Battle/WDP shell into this registry previously pulled the full venue
 * graph into every StageLoader page (e.g. fan-lobby) and triggered webpack
 * `Cannot read properties of undefined (reading 'call')` during RSC client hydration.
 */

"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface ExperienceModuleProps {
  roomId?: string;
  venueId?: string;
}

type ExperienceComponent = ComponentType<ExperienceModuleProps>;

function ExperienceLoading() {
  return (
    <div
      style={{
        padding: 24,
        color: "rgba(255,255,255,0.45)",
        fontFamily: "monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
      }}
    >
      LOADING EXPERIENCE…
    </div>
  );
}

function loadDefault(
  loader: () => Promise<{ default: ExperienceComponent }>
): ExperienceComponent {
  return dynamic(loader, {
    ssr: false,
    loading: () => <ExperienceLoading />,
  });
}

/** Lazy registry — one experience chunk per id. */
export const EXPERIENCE_COMPONENT_REGISTRY: Record<string, ExperienceComponent> = {
  "fan-lobby": loadDefault(() => import("@/components/live/FanLobbyVenue")),
  "performer-lobby": loadDefault(
    () => import("@/components/performer/PerformerExperienceRuntime")
  ),
  battle: loadDefault(() => import("./BattleExperience")),
  cypher: loadDefault(() => import("./CypherExperience")),
  challenge: loadDefault(() => import("./ChallengeExperience")),
  "monday-night-stage": loadDefault(() => import("./MondayNightStageExperience")),
  "deal-or-feud": loadDefault(() => import("./DealOrFeudExperience")),
  lounge: loadDefault(() => import("./LoungeExperience")),
  "world-dance-party": loadDefault(() => import("./WorldDancePartyExperience")),
  "slow-jams": loadDefault(() => import("./SlowJamsExperience")),
  "sunday-slow-jams": loadDefault(() => import("./SlowJamsExperience")),
  "jazz-scat-battle": loadDefault(() => import("./VocalImprovExperiences")),
  "gibberish-battle": dynamic(
    () =>
      import("./VocalImprovExperiences").then((m) => ({
        default: m.GibberishBattleExperience,
      })),
    {
      ssr: false,
      loading: () => <ExperienceLoading />,
    }
  ),
};

export function getExperienceComponent(
  experienceId: string
): ExperienceComponent | undefined {
  return EXPERIENCE_COMPONENT_REGISTRY[experienceId];
}

export function isExperienceMounted(experienceId: string): boolean {
  return experienceId in EXPERIENCE_COMPONENT_REGISTRY;
}
