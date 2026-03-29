import type { RandomPageKind, RandomPageRef } from './types';

const DEFAULT_COOLDOWN = 2;

export function isRandomPageOnCooldown(
  kind: RandomPageKind,
  recentKinds: RandomPageKind[],
  cooldown: number = DEFAULT_COOLDOWN
): boolean {
  return recentKinds.slice(-cooldown).includes(kind);
}

export function selectBalancedRandomPage(
  pages: RandomPageRef[],
  recentKinds: RandomPageKind[],
  cooldown: number = DEFAULT_COOLDOWN
): RandomPageRef | null {
  if (!pages.length) return null;

  const eligible = pages.filter((page) => !isRandomPageOnCooldown(page.randomKind, recentKinds, cooldown));
  if (eligible.length > 0) return eligible[0];

  return pages[0] ?? null;
}
