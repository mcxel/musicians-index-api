import type { SpreadDefinition } from "./SpreadDefinition";

/**
 * CompositionEngine — turns a flat set of registered spreads into an ordered
 * manifest for one viewing session, per simple editorial rules:
 *   - at most `maxAdsPerEditorialWindow` ad/sponsored spreads per
 *     `editorialWindowSize` editorial spreads consumed
 *   - a live spread is injected at least every `liveInjectionInterval`
 *     spreads whenever live content is available
 *   - fresher content (recent `freshness` timestamp) sorts earlier within
 *     its bucket
 *   - sponsored/ad spreads are drawn from their own queue, never invented
 *
 * This is a pure function of its inputs. If the registry has no live
 * content, no live spreads appear — the engine never fabricates a spread to
 * fill a gap (Rule 20). Callers that want "no empty surface" behavior
 * (Rule 14) supply an Opportunity/platform-promotion spread as a normal
 * registered entry with monetization: "editorial", not a special case here.
 */

export interface CompositionOptions {
  /** Max ad/sponsored spreads allowed per editorial window. Default 1. */
  maxAdsPerEditorialWindow?: number;
  /** How many editorial spreads make up one "window" for the ad cap. Default 3. */
  editorialWindowSize?: number;
  /** Max spreads between live injections when live content exists. Default 4. */
  liveInjectionInterval?: number;
  /** Override "now" for freshness scoring/testing. Defaults to Date.now(). */
  now?: number;
}

const DEFAULT_OPTIONS: Required<Omit<CompositionOptions, "now">> = {
  maxAdsPerEditorialWindow: 1,
  editorialWindowSize: 3,
  liveInjectionInterval: 4,
};

const FRESHNESS_DECAY_HOURS = 72;

function isAdOrSponsored(spread: SpreadDefinition): boolean {
  return spread.monetization === "ad" || spread.monetization === "sponsored";
}

function freshnessScore(spread: SpreadDefinition, now: number): number {
  const ageHours = Math.max(0, now - spread.freshness) / (1000 * 60 * 60);
  return Math.max(0, 1 - ageHours / FRESHNESS_DECAY_HOURS);
}

function rankScore(spread: SpreadDefinition, now: number): number {
  const weight = spread.weight ?? 1;
  return spread.priority * 2 + freshnessScore(spread, now) * 3 + weight;
}

function byRankDesc(now: number) {
  return (a: SpreadDefinition, b: SpreadDefinition) => rankScore(b, now) - rankScore(a, now);
}

/**
 * Composes an ordered manifest from the given spreads. Pass spreads pulled
 * from ContentRegistry.getSpreads() (already filtered to the viewer's role
 * by the caller, if role targeting matters for that call site).
 */
export function composeManifest(
  spreads: SpreadDefinition[],
  options: CompositionOptions = {}
): SpreadDefinition[] {
  const now = options.now ?? Date.now();
  const editorialWindowSize = options.editorialWindowSize ?? DEFAULT_OPTIONS.editorialWindowSize;
  const maxAdsPerWindow = options.maxAdsPerEditorialWindow ?? DEFAULT_OPTIONS.maxAdsPerEditorialWindow;
  const liveInterval = options.liveInjectionInterval ?? DEFAULT_OPTIONS.liveInjectionInterval;

  const eligible = spreads.filter((s) => s.availability !== "liveOnly" || s.isLive === true);

  const live = eligible.filter((s) => s.type === "live").sort(byRankDesc(now));
  const ads = eligible.filter(isAdOrSponsored).sort(byRankDesc(now));
  const editorial = eligible
    .filter((s) => !isAdOrSponsored(s) && s.type !== "live")
    .sort(byRankDesc(now));

  const manifest: SpreadDefinition[] = [];
  const used = new Set<string>();

  let editorialIndex = 0;
  let adIndex = 0;
  let liveIndex = 0;
  let spreadsSinceLive = 0;
  let editorialSinceAd = 0;

  const push = (spread: SpreadDefinition | undefined): boolean => {
    if (!spread || used.has(spread.id)) return false;
    manifest.push(spread);
    used.add(spread.id);
    return true;
  };

  const hasRemaining = () =>
    editorialIndex < editorial.length || adIndex < ads.length || liveIndex < live.length;

  while (hasRemaining()) {
    // Overdue for live content — inject it if available.
    if (live.length > 0 && spreadsSinceLive >= liveInterval && liveIndex < live.length) {
      if (push(live[liveIndex++])) {
        spreadsSinceLive = 0;
        continue;
      }
    }

    // Normal path: pull the next editorial spread.
    if (editorialIndex < editorial.length) {
      const added = push(editorial[editorialIndex++]);
      if (added) {
        spreadsSinceLive += 1;
        editorialSinceAd += 1;

        // Enough editorial spreads consumed — consider slotting in one ad,
        // bounded by how many ad-windows we've actually completed so far.
        if (editorialSinceAd >= editorialWindowSize && adIndex < ads.length) {
          const adsPlaced = manifest.filter(isAdOrSponsored).length;
          const windowsCompleted = Math.ceil(manifest.length / editorialWindowSize);
          if (adsPlaced < windowsCompleted * maxAdsPerWindow) {
            if (push(ads[adIndex++])) {
              editorialSinceAd = 0;
              spreadsSinceLive += 1;
            }
          }
        }
        continue;
      }
    }

    // Editorial queue exhausted — drain whatever real content is left rather
    // than stopping early or fabricating filler.
    if (liveIndex < live.length && push(live[liveIndex++])) {
      spreadsSinceLive = 0;
      continue;
    }
    if (adIndex < ads.length && push(ads[adIndex++])) {
      continue;
    }

    break;
  }

  return manifest;
}
