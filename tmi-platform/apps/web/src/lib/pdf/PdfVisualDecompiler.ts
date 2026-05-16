/**
 * PdfVisualDecompiler
 * Treats PDFs as "runtime DNA" — decomposes each page into registerable
 * visual shards: panels, zones, text blocks, and image regions.
 * Authority-gated, lineage-tracked, registry-registered.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { addDependency } from "@/lib/registry/HydrationDependencyGraph";

export type PdfShardKind =
  | "cover-panel"
  | "article-panel"
  | "image-region"
  | "text-column"
  | "ad-panel"
  | "sidebar"
  | "pull-quote"
  | "header-zone"
  | "footer-zone"
  | "full-bleed"
  | "unknown-shard";

export interface PdfPageShard {
  shardId: string;
  assetId: string;
  pdfId: string;
  pageNumber: number;
  kind: PdfShardKind;
  boundingBox: { x: number; y: number; w: number; h: number };
  textContent: string | null;
  imageUri: string | null;
  dominantColor: string | null;
  isInteractive: boolean;
  registeredAt: number;
}

export interface PdfDecompileResult {
  pdfId: string;
  sourceUri: string;
  totalPages: number;
  shards: PdfPageShard[];
  rootAssetId: string;
  errors: string[];
  decompiledAt: number;
}

export interface RawPdfPageData {
  pageNumber: number;
  width: number;
  height: number;
  textBlocks: Array<{
    text: string;
    x: number; y: number; w: number; h: number;
    fontSize: number;
    isBold: boolean;
  }>;
  imageRegions: Array<{
    uri: string;
    x: number; y: number; w: number; h: number;
    dominantColor: string;
  }>;
  layoutHint: "cover" | "article" | "ad" | "full-bleed" | "unknown";
}

const DECOMPILER_PRIORITY = 3;
const DECOMPILER_TTL_MS = 60_000;

const decompileLog = new Map<string, PdfDecompileResult>();

function classifyTextShard(block: RawPdfPageData["textBlocks"][0], pageNumber: number): PdfShardKind {
  if (pageNumber === 1 && block.isBold && block.fontSize > 24) return "cover-panel";
  if (block.fontSize > 20 && block.isBold) return "header-zone";
  if (block.fontSize < 10) return "footer-zone";
  if (block.w < 200 && block.fontSize > 14 && block.isBold) return "pull-quote";
  if (block.x > 600) return "sidebar";
  return "text-column";
}

function classifyImageShard(image: RawPdfPageData["imageRegions"][0], hint: RawPdfPageData["layoutHint"]): PdfShardKind {
  if (hint === "cover") return "cover-panel";
  if (hint === "full-bleed") return "full-bleed";
  if (hint === "ad") return "ad-panel";
  if (image.w > 400 && image.h > 400) return "article-panel";
  return "image-region";
}

function buildShardId(pdfId: string, page: number, kind: PdfShardKind, index: number): string {
  return `shard_${pdfId}_p${page}_${kind}_${index}`;
}

function decompilePage(
  pdfId: string,
  page: RawPdfPageData,
  rootAssetId: string
): { shards: PdfPageShard[]; errors: string[] } {
  const shards: PdfPageShard[] = [];
  const errors: string[] = [];

  // Text shards
  page.textBlocks.forEach((block, i) => {
    if (!block.text.trim()) return;
    const kind = classifyTextShard(block, page.pageNumber);
    const shardId = buildShardId(pdfId, page.pageNumber, kind, i);
    const assetId = `pdf_shard_${shardId}`;

    try {
      registerAsset(assetId, "pdf-shard", pdfId, {
        generatorId: "PdfVisualDecompiler",
        metadata: { pageNumber: page.pageNumber, kind, textPreview: block.text.slice(0, 80) },
        tags: ["pdf-shard", kind, pdfId],
      });

      const claim = claimAuthority(assetId, "PdfVisualDecompiler", "generator", {
        exclusive: false, priority: DECOMPILER_PRIORITY, ttlMs: DECOMPILER_TTL_MS,
      });

      if (claim.granted) {
        setHydrationStatus(assetId, "hydrating");
        recordLineage(assetId, "pdf-extraction", "PdfVisualDecompiler", {
          parentAssetId: rootAssetId,
          transforms: ["segment"],
          reconstructable: true,
          metadata: { pageNumber: page.pageNumber, kind },
        });
        addDependency(assetId, rootAssetId, false, 1);
        setHydrationStatus(assetId, "hydrated");
      }

      shards.push({
        shardId, assetId, pdfId,
        pageNumber: page.pageNumber, kind,
        boundingBox: { x: block.x, y: block.y, w: block.w, h: block.h },
        textContent: block.text,
        imageUri: null,
        dominantColor: null,
        isInteractive: false,
        registeredAt: Date.now(),
      });
    } catch (err) {
      errors.push(`text[${i}] p${page.pageNumber}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  // Image shards
  page.imageRegions.forEach((img, i) => {
    const kind = classifyImageShard(img, page.layoutHint);
    const shardId = buildShardId(pdfId, page.pageNumber, kind, page.textBlocks.length + i);
    const assetId = `pdf_shard_${shardId}`;

    try {
      registerAsset(assetId, "pdf-shard", pdfId, {
        generatorId: "PdfVisualDecompiler",
        metadata: { pageNumber: page.pageNumber, kind, imageUri: img.uri },
        tags: ["pdf-shard", kind, "image", pdfId],
      });

      const claim = claimAuthority(assetId, "PdfVisualDecompiler", "generator", {
        exclusive: false, priority: DECOMPILER_PRIORITY, ttlMs: DECOMPILER_TTL_MS,
      });

      if (claim.granted) {
        setHydrationStatus(assetId, "hydrating");
        recordLineage(assetId, "pdf-extraction", "PdfVisualDecompiler", {
          parentAssetId: rootAssetId,
          transforms: ["segment"],
          reconstructable: false,
          metadata: { pageNumber: page.pageNumber, kind, imageUri: img.uri },
        });
        addDependency(assetId, rootAssetId, false, 1);
        setHydrationStatus(assetId, "hydrated");
      }

      shards.push({
        shardId, assetId, pdfId,
        pageNumber: page.pageNumber, kind,
        boundingBox: { x: img.x, y: img.y, w: img.w, h: img.h },
        textContent: null,
        imageUri: img.uri,
        dominantColor: img.dominantColor,
        isInteractive: kind === "ad-panel",
        registeredAt: Date.now(),
      });
    } catch (err) {
      errors.push(`img[${i}] p${page.pageNumber}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  return { shards, errors };
}

export function decompilePdf(
  pdfId: string,
  sourceUri: string,
  pages: RawPdfPageData[]
): PdfDecompileResult {
  const rootAssetId = `pdf_root_${pdfId}`;

  registerAsset(rootAssetId, "pdf-shard", pdfId, {
    generatorId: "PdfVisualDecompiler",
    metadata: { sourceUri, totalPages: pages.length },
    tags: ["pdf-root", pdfId],
  });

  claimAuthority(rootAssetId, "PdfVisualDecompiler", "generator", {
    exclusive: true, priority: 5, ttlMs: DECOMPILER_TTL_MS,
  });

  recordLineage(rootAssetId, "pdf-extraction", "PdfVisualDecompiler", {
    reconstructable: true,
    metadata: { sourceUri, totalPages: pages.length },
  });

  setHydrationStatus(rootAssetId, "hydrated");

  const result: PdfDecompileResult = {
    pdfId, sourceUri,
    totalPages: pages.length,
    shards: [],
    rootAssetId,
    errors: [],
    decompiledAt: Date.now(),
  };

  for (const page of pages) {
    const { shards, errors } = decompilePage(pdfId, page, rootAssetId);
    result.shards.push(...shards);
    result.errors.push(...errors);
  }

  decompileLog.set(pdfId, result);
  return result;
}

export function getDecompileResult(pdfId: string): PdfDecompileResult | null {
  return decompileLog.get(pdfId) ?? null;
}

export function getDecompilerStats(): { totalPdfs: number; totalShards: number; totalErrors: number } {
  let totalShards = 0, totalErrors = 0;
  for (const r of decompileLog.values()) {
    totalShards += r.shards.length;
    totalErrors += r.errors.length;
  }
  return { totalPdfs: decompileLog.size, totalShards, totalErrors };
}
