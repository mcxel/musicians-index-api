import type { ChampionshipTitle, ChampionshipLineageEntry } from "./types";

export interface TitleLineagePair {
  currentEntry: ChampionshipLineageEntry | null;
  previousEntry: ChampionshipLineageEntry | null;
}

/**
 * Shared lineage-pair resolution for anything that shows "current holder /
 * who they took it from" (belt side plates, history panel). One place so the
 * two never drift on what "previous holder" means.
 */
export function resolveTitleLineagePair(title: ChampionshipTitle): TitleLineagePair {
  const currentEntry =
    title.lineage.find((e) => e.to == null) ?? title.lineage[title.lineage.length - 1] ?? null;
  const currentEntryIndex = currentEntry ? title.lineage.indexOf(currentEntry) : -1;
  const previousEntry = currentEntryIndex > 0 ? title.lineage[currentEntryIndex - 1] : null;
  return { currentEntry, previousEntry };
}
