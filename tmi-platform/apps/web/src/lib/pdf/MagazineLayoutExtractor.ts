/**
 * MagazineLayoutExtractor
 * Converts PDF shards into structured magazine layout records:
 * articles, spreads, features, and ad placements.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { addDependency } from "@/lib/registry/HydrationDependencyGraph";
import type { PdfPageShard, PdfDecompileResult } from "@/lib/pdf/PdfVisualDecompiler";

export type LayoutBlockType =
  | "feature-article"
  | "short-read"
  | "photo-spread"
  | "ad-placement"
  | "pull-quote-block"
  | "sidebar-editorial"
  | "cover-layout"
  | "table-of-contents";

export interface MagazineLayoutBlock {
  blockId: string;
  assetId: string;
  pdfId: string;
  type: LayoutBlockType;
  pageRange: [number, number];
  shardIds: string[];
  headline: string | null;
  bodyPreview: string | null;
  imageUri: string | null;
  dominantColor: string | null;
  isSponsored: boolean;
  adTarget: string | null;
  wordCount: number;
  readTimeSeconds: number;
  registeredAt: number;
}

export interface MagazineLayout {
  layoutId: string;
  pdfId: string;
  blocks: MagazineLayoutBlock[];
  coverBlock: MagazineLayoutBlock | null;
  featureCount: number;
  adCount: number;
  rootAssetId: string;
  extractedAt: number;
}

const WORDS_PER_SECOND = 3.5;

const layoutLog = new Map<string, MagazineLayout>();

function estimateType(shards: PdfPageShard[]): LayoutBlockType {
  const hasImage = shards.some(s => s.imageUri !== null);
  const hasText = shards.some(s => s.textContent !== null);
  const isPage1 = shards.some(s => s.pageNumber === 1);
  const hasAd = shards.some(s => s.kind === "ad-panel");
  const hasPullQuote = shards.some(s => s.kind === "pull-quote");
  const textOnly = shards.every(s => s.imageUri === null);

  if (isPage1 && hasImage) return "cover-layout";
  if (hasAd) return "ad-placement";
  if (hasPullQuote && hasText) return "pull-quote-block";
  if (hasImage && !hasText) return "photo-spread";
  if (hasImage && hasText) return "feature-article";
  if (textOnly && hasText) return "short-read";
  return "short-read";
}

function extractHeadline(shards: PdfPageShard[]): string | null {
  const headerShard = shards.find(s => s.kind === "header-zone" && s.textContent);
  if (headerShard) return headerShard.textContent;
  const coverShard = shards.find(s => s.kind === "cover-panel" && s.textContent);
  if (coverShard) return coverShard.textContent?.slice(0, 100) ?? null;
  return null;
}

function extractBodyPreview(shards: PdfPageShard[]): string | null {
  const textShards = shards.filter(s => s.kind === "text-column" && s.textContent);
  if (!textShards.length) return null;
  return textShards.map(s => s.textContent).join(" ").slice(0, 200);
}

function countWords(shards: PdfPageShard[]): number {
  return shards
    .filter(s => s.textContent)
    .reduce((acc, s) => acc + (s.textContent?.split(/\s+/).length ?? 0), 0);
}

function groupShardsByPage(shards: PdfPageShard[]): Map<number, PdfPageShard[]> {
  const map = new Map<number, PdfPageShard[]>();
  for (const shard of shards) {
    const page = shard.pageNumber;
    if (!map.has(page)) map.set(page, []);
    map.get(page)!.push(shard);
  }
  return map;
}

function buildBlock(
  pdfId: string,
  pageShards: PdfPageShard[],
  blockIndex: number,
  rootAssetId: string
): MagazineLayoutBlock {
  const type = estimateType(pageShards);
  const pages = [...new Set(pageShards.map(s => s.pageNumber))].sort((a, b) => a - b);
  const pageRange: [number, number] = [pages[0], pages[pages.length - 1]];
  const blockId = `layout_block_${pdfId}_${blockIndex}`;
  const assetId = `magazine_block_${blockId}`;

  const headline = extractHeadline(pageShards);
  const bodyPreview = extractBodyPreview(pageShards);
  const imageUri = pageShards.find(s => s.imageUri)?.imageUri ?? null;
  const dominantColor = pageShards.find(s => s.dominantColor)?.dominantColor ?? null;
  const wordCount = countWords(pageShards);
  const readTimeSeconds = Math.round(wordCount / WORDS_PER_SECOND);
  const isSponsored = type === "ad-placement";

  registerAsset(assetId, "magazine-panel", pdfId, {
    generatorId: "MagazineLayoutExtractor",
    metadata: { type, pageRange, headline, wordCount },
    tags: ["magazine-block", type, pdfId],
  });

  setHydrationStatus(assetId, "hydrating");

  recordLineage(assetId, "pdf-extraction", "MagazineLayoutExtractor", {
    parentAssetId: rootAssetId,
    ancestorIds: pageShards.map(s => s.assetId),
    transforms: ["reconstruct", "segment"],
    reconstructable: true,
    metadata: { type, pageRange, pdfId },
  });

  for (const shard of pageShards) {
    addDependency(assetId, shard.assetId, false, 1);
  }

  setHydrationStatus(assetId, "hydrated");

  return {
    blockId, assetId, pdfId, type, pageRange,
    shardIds: pageShards.map(s => s.shardId),
    headline, bodyPreview, imageUri, dominantColor,
    isSponsored, adTarget: isSponsored ? "general" : null,
    wordCount, readTimeSeconds,
    registeredAt: Date.now(),
  };
}

export function extractMagazineLayout(decompileResult: PdfDecompileResult): MagazineLayout {
  const { pdfId, shards, rootAssetId } = decompileResult;
  const layoutId = `layout_${pdfId}`;

  const byPage = groupShardsByPage(shards);
  const sortedPages = [...byPage.keys()].sort((a, b) => a - b);

  const blocks: MagazineLayoutBlock[] = [];

  sortedPages.forEach((page, i) => {
    const pageShards = byPage.get(page)!;
    if (pageShards.length === 0) return;
    blocks.push(buildBlock(pdfId, pageShards, i, rootAssetId));
  });

  const coverBlock = blocks.find(b => b.type === "cover-layout") ?? null;
  const featureCount = blocks.filter(b => b.type === "feature-article").length;
  const adCount = blocks.filter(b => b.type === "ad-placement").length;

  const layout: MagazineLayout = {
    layoutId, pdfId, blocks, coverBlock, featureCount, adCount,
    rootAssetId, extractedAt: Date.now(),
  };

  layoutLog.set(pdfId, layout);
  return layout;
}

export function getMagazineLayout(pdfId: string): MagazineLayout | null {
  return layoutLog.get(pdfId) ?? null;
}

export function getLayoutBlock(blockId: string): MagazineLayoutBlock | null {
  for (const layout of layoutLog.values()) {
    const block = layout.blocks.find(b => b.blockId === blockId);
    if (block) return block;
  }
  return null;
}

export function getLayoutStats(): { totalLayouts: number; totalBlocks: number; totalAds: number; totalFeatures: number } {
  let totalBlocks = 0, totalAds = 0, totalFeatures = 0;
  for (const l of layoutLog.values()) {
    totalBlocks += l.blocks.length;
    totalAds += l.adCount;
    totalFeatures += l.featureCount;
  }
  return { totalLayouts: layoutLog.size, totalBlocks, totalAds, totalFeatures };
}
