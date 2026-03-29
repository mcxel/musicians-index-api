import type { PageKind } from './types';

const PATTERN: PageKind[] = ['artist', 'article', 'random'];

export function getExpectedNextKind(index: number): PageKind {
  return PATTERN[index % PATTERN.length];
}

export function enforceSequencePattern(kinds: PageKind[]): boolean {
  return kinds.every((kind, index) => kind === getExpectedNextKind(index));
}
