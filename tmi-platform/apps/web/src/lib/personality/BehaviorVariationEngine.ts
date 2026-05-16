/**
 * BehaviorVariationEngine
 * Prevents hosts and NPCs from repeating identical phrases or actions.
 * Tracks recent outputs and selects varied alternatives from a weighted pool.
 */

export type BehaviorCategory =
  | "greeting"
  | "hype-call"
  | "transition"
  | "crowd-acknowledge"
  | "tip-react"
  | "battle-taunt"
  | "victory-announce"
  | "idle-fill"
  | "vote-prompt"
  | "exit-line";

export interface BehaviorVariant {
  variantId: string;
  text: string;
  weight: number;
  energy: "low" | "mid" | "high" | "explosive";
  cooldownMs: number;
  lastUsedAt: number | null;
  useCount: number;
}

export interface BehaviorPool {
  entityId: string;
  category: BehaviorCategory;
  variants: BehaviorVariant[];
}

export interface BehaviorSelection {
  entityId: string;
  category: BehaviorCategory;
  selected: BehaviorVariant;
  alternativesConsidered: number;
  selectedAt: number;
}

const pools = new Map<string, Map<BehaviorCategory, BehaviorPool>>();

function getPool(entityId: string, category: BehaviorCategory): BehaviorPool | null {
  return pools.get(entityId)?.get(category) ?? null;
}

function setPool(entityId: string, category: BehaviorCategory, pool: BehaviorPool): void {
  if (!pools.has(entityId)) pools.set(entityId, new Map());
  pools.get(entityId)!.set(category, pool);
}

export function registerBehaviorPool(
  entityId: string,
  category: BehaviorCategory,
  variants: Array<{ text: string; weight?: number; energy?: BehaviorVariant["energy"]; cooldownMs?: number }>
): BehaviorPool {
  const pool: BehaviorPool = {
    entityId,
    category,
    variants: variants.map((v, i) => ({
      variantId: `${entityId}_${category}_${i}`,
      text: v.text,
      weight: v.weight ?? 1,
      energy: v.energy ?? "mid",
      cooldownMs: v.cooldownMs ?? 30_000,
      lastUsedAt: null,
      useCount: 0,
    })),
  };
  setPool(entityId, category, pool);
  return pool;
}

export function selectBehavior(
  entityId: string,
  category: BehaviorCategory,
  preferredEnergy?: BehaviorVariant["energy"]
): BehaviorSelection | null {
  const pool = getPool(entityId, category);
  if (!pool || pool.variants.length === 0) return null;

  const now = Date.now();

  // Filter: not on cooldown
  const available = pool.variants.filter(v =>
    v.lastUsedAt === null || now - v.lastUsedAt >= v.cooldownMs
  );

  // If all on cooldown, allow the longest-cooled-down variant
  const candidates = available.length > 0 ? available : pool.variants.sort(
    (a, b) => (a.lastUsedAt ?? 0) - (b.lastUsedAt ?? 0)
  ).slice(0, 1);

  // Apply energy preference boost
  const scored = candidates.map(v => {
    let score = v.weight;
    if (preferredEnergy && v.energy === preferredEnergy) score *= 2;
    score *= 1 / (1 + v.useCount * 0.1); // diminishing returns
    return { v, score };
  });

  // Weighted random selection
  const totalScore = scored.reduce((s, { score }) => s + score, 0);
  let rand = Math.random() * totalScore;
  let selected: BehaviorVariant = candidates[0];
  for (const { v, score } of scored) {
    rand -= score;
    if (rand <= 0) { selected = v; break; }
  }

  // Update usage
  const updatedVariants = pool.variants.map(v =>
    v.variantId === selected.variantId
      ? { ...v, lastUsedAt: now, useCount: v.useCount + 1 }
      : v
  );
  setPool(entityId, category, { ...pool, variants: updatedVariants });

  return {
    entityId,
    category,
    selected,
    alternativesConsidered: candidates.length,
    selectedAt: now,
  };
}

export function injectVariant(
  entityId: string,
  category: BehaviorCategory,
  text: string,
  opts: { weight?: number; energy?: BehaviorVariant["energy"]; cooldownMs?: number } = {}
): void {
  const pool = getPool(entityId, category);
  if (!pool) {
    registerBehaviorPool(entityId, category, [{ text, ...opts }]);
    return;
  }
  const variant: BehaviorVariant = {
    variantId: `${entityId}_${category}_injected_${Date.now()}`,
    text,
    weight: opts.weight ?? 1.5,
    energy: opts.energy ?? "high",
    cooldownMs: opts.cooldownMs ?? 60_000,
    lastUsedAt: null,
    useCount: 0,
  };
  setPool(entityId, category, { ...pool, variants: [...pool.variants, variant] });
}

export function getVariationStats(entityId: string): Record<string, { variants: number; avgUseCount: number }> {
  const entityPools = pools.get(entityId);
  if (!entityPools) return {};
  const stats: Record<string, { variants: number; avgUseCount: number }> = {};
  for (const [category, pool] of entityPools) {
    const avg = pool.variants.reduce((s, v) => s + v.useCount, 0) / pool.variants.length;
    stats[category] = { variants: pool.variants.length, avgUseCount: avg };
  }
  return stats;
}
