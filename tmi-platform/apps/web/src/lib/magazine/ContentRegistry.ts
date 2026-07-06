import type { SpreadDefinition, SpreadType } from "./SpreadDefinition";

/**
 * ContentRegistry — in-memory catalog of registered spreads for the current
 * composition pass. Callers (news feed, live-session lookup, ad slots,
 * commerce) populate this from real data; the registry never invents entries
 * on its own, and getSpreads() returning an empty array is the honest result
 * when nothing real is available (Rule 20 — no fabricated content).
 */
class ContentRegistryImpl {
  private spreads = new Map<string, SpreadDefinition>();

  registerSpread(spread: SpreadDefinition): void {
    this.spreads.set(spread.id, spread);
  }

  registerSpreads(spreads: SpreadDefinition[]): void {
    for (const spread of spreads) this.registerSpread(spread);
  }

  unregisterSpread(id: string): void {
    this.spreads.delete(id);
  }

  getSpreads(): SpreadDefinition[] {
    return Array.from(this.spreads.values());
  }

  getSpreadsByType(type: SpreadType): SpreadDefinition[] {
    return this.getSpreads().filter((spread) => spread.type === type);
  }

  getSpread(id: string): SpreadDefinition | null {
    return this.spreads.get(id) ?? null;
  }

  clear(): void {
    this.spreads.clear();
  }
}

/** Singleton — one registry per process/session, mirrors GlobalLiveSessionRegistry's pattern. */
export const ContentRegistry = new ContentRegistryImpl();

export type { ContentRegistryImpl };
