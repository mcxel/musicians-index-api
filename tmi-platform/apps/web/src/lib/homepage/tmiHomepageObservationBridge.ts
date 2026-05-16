import { HOMEPAGE_BELT_SECTIONS } from "@/lib/homepage/tmiHomepageBeltEngine";
import { listHomepageOverlaySyncStates } from "@/lib/homepage/tmiHomepageOverlaySync";

export type TmiHomepageObservationSnapshot = {
  totalPages: number;
  pages: string[];
  overlayBindings: number;
  feedStates: Record<string, number>;
};

export function getHomepageObservationSnapshot(): TmiHomepageObservationSnapshot {
  const feedStates = HOMEPAGE_BELT_SECTIONS.reduce<Record<string, number>>((acc, section) => {
    acc[section.feedState] = (acc[section.feedState] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalPages: HOMEPAGE_BELT_SECTIONS.length,
    pages: HOMEPAGE_BELT_SECTIONS.map((item) => item.route),
    overlayBindings: listHomepageOverlaySyncStates().length,
    feedStates,
  };
}
