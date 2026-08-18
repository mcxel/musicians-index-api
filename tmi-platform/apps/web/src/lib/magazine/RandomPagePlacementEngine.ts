/**
 * LEGACY weighted random-page picker (home attraction rail).
 * Canonical magazine issue rhythm is P → N → R in MagazineIssueContract
 * + MagazineRotationEngine.buildMagazineIssueSequence — do not treat this
 * pool as the issue reader source of truth.
 */

import {
  DEFAULT_RANDOM_PAGE_POOL,
  RandomPageEntry,
  pickWeightedRandomPage,
} from '@/lib/magazine/MagazineRandomPageEngine';

export type MagazineSequenceSlot = 'artist' | 'news' | 'random';

export interface MagazineRotationStep {
  step: number;
  slot: MagazineSequenceSlot;
  randomPage?: RandomPageEntry;
}

export function buildMagazineRotationSteps(count: number): MagazineRotationStep[] {
  const safeCount = Math.max(1, count);
  const out: MagazineRotationStep[] = [];
  for (let i = 0; i < safeCount; i += 1) {
    const mod = i % 3;
    if (mod === 0) out.push({ step: i + 1, slot: 'artist' });
    else if (mod === 1) out.push({ step: i + 1, slot: 'news' });
    else out.push({ step: i + 1, slot: 'random', randomPage: pickWeightedRandomPage(DEFAULT_RANDOM_PAGE_POOL) });
  }
  return out;
}
