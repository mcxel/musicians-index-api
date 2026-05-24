import type { MemoryItem } from './MemoryWallEngine';

export interface MemoryCardLayout {
  memoryId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  cardWidth: number;
  cardHeight: number;
  isSponsored: boolean;
  isPinned: boolean;
}

const CARD_W = 200;
const CARD_H = 200;
const COL_STRIDE = 236;
const ROW_STRIDE = 228;

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ 0x12345678) >>> 0;
    return (s & 0xffff) / 0xffff;
  };
}

export function generateMemoryLayout(
  memories: MemoryItem[],
  cols = 4,
): MemoryCardLayout[] {
  return memories.map((m, i) => {
    const rand = seeded(hashStr(m.memoryId) + i);
    const isPinned = m.pinnedAt !== undefined && m.pinnedAt !== null;
    const isSponsored = m.contentType === 'sponsored';
    const engagement = m.likes + m.shares;

    const col = i % cols;
    const row = Math.floor(i / cols);

    const xJitter = (rand() - 0.5) * 32;
    const yJitter = (rand() - 0.5) * 24;
    const rotation = (rand() - 0.5) * 14;

    const x = col * COL_STRIDE + xJitter;
    const y = row * ROW_STRIDE + yJitter;

    let scale = 1.0;
    if (isPinned)          scale = 1.14;
    else if (engagement > 10) scale = 1.06;
    else if (isSponsored)  scale = 0.92;

    let zIndex = 10 + i;
    if (isPinned)          zIndex = 200;
    else if (engagement > 10) zIndex = 80 + i;

    return {
      memoryId: m.memoryId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      rotation,
      scale,
      zIndex,
      cardWidth: isPinned ? 230 : CARD_W,
      cardHeight: CARD_H,
      isSponsored,
      isPinned,
    };
  });
}

// Injects SPONSORED nodes at controlled intervals — never adjacent
export function injectSponsoredNodes(
  memories: MemoryItem[],
  sponsoredNodes: MemoryItem[],
  seed = 7,
): MemoryItem[] {
  if (sponsoredNodes.length === 0) return memories;
  const result: MemoryItem[] = [];
  const rand = seeded(seed);
  let nextInject = 5 + Math.floor(rand() * 4);
  let sIdx = 0;
  let lastSponsoredAt = -99;

  for (let i = 0; i < memories.length; i++) {
    result.push(memories[i]);
    if (i >= nextInject && i - lastSponsoredAt >= 5 && sIdx < sponsoredNodes.length) {
      result.push(sponsoredNodes[sIdx % sponsoredNodes.length]);
      sIdx++;
      lastSponsoredAt = result.length - 1;
      nextInject = result.length + 5 + Math.floor(rand() * 4);
    }
  }
  return result;
}

export function canvasHeight(itemCount: number, cols = 4): number {
  const rows = Math.ceil(itemCount / cols);
  return rows * ROW_STRIDE + CARD_H + 40;
}
