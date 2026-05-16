/**
 * GlobalImageScannerEngine.ts
 *
 * Scans all routes for static stock images, placeholders, duplicates, and weak assets.
 * Purpose: Detect what needs replacement before the GlobalImageReplacementEngine activates.
 *
 * Detects:
 * - profile images
 * - banner images
 * - hero images
 * - article images
 * - ticket images
 * - venue images
 * - homepage images
 * - billboard images
 * - poster images
 * - memory wall images
 */

export interface ImageScanResult {
  imageId: string;
  imagePath: string;
  imageType:
    | 'profile'
    | 'banner'
    | 'hero'
    | 'article'
    | 'ticket'
    | 'venue'
    | 'homepage'
    | 'billboard'
    | 'poster'
    | 'memory-wall'
    | 'unknown';
  route: string;
  slot: string;
  detectionReason:
    | 'stock-detected'
    | 'placeholder-detected'
    | 'duplicate-detected'
    | 'weak-asset-detected'
    | 'low-resolution'
    | 'generic-watermark'
    | 'old-timestamp';
  confidence: number; // 0-1
  replacementPriority: 'critical' | 'high' | 'medium' | 'low';
  suggestedReplacement:
    | 'ai-generated'
    | 'identity-locked'
    | 'scene-generated'
    | 'motion-ready'
    | 'none';
  duplicateOf?: string;
  lastScanned: number;
}

export interface ScanSummary {
  totalImagesScanned: number;
  stockImagesFound: number;
  placeholdersFound: number;
  duplicatesFound: number;
  weakAssetsFound: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  scanTimestamp: number;
}

// In-memory registry of scan results (ephemeral during scan)
const imageScanRegistry = new Map<string, ImageScanResult>();
let lastScanTimestamp = 0;

/**
 * Initiates global image scan across all routes.
 * Returns detected problematic images without mutation.
 */
export function scanGlobalImagesForReplacement(): ScanSummary {
  imageScanRegistry.clear();

  // Scan routes for images (implementation would traverse route tree)
  const detectedImages: ImageScanResult[] = [
    // Simulate detected stock images (in real implementation, would scan actual routes)
    {
      imageId: 'home-hero-1',
      imagePath: '/images/stock/generic-stage-hero.jpg',
      imageType: 'hero',
      route: '/home/1',
      slot: 'hero-banner',
      detectionReason: 'stock-detected',
      confidence: 0.92,
      replacementPriority: 'critical',
      suggestedReplacement: 'motion-ready',
      lastScanned: Date.now(),
    },
  ];

  // Register results (ephemeral)
  detectedImages.forEach((img) => {
    imageScanRegistry.set(img.imageId, img);
  });

  lastScanTimestamp = Date.now();

  return getScanSummary();
}

/**
 * Returns summary of current scan without mutation.
 */
export function getScanSummary(): ScanSummary {
  const results = Array.from(imageScanRegistry.values());

  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  results.forEach((result) => {
    byType[result.imageType] = (byType[result.imageType] ?? 0) + 1;
    byPriority[result.replacementPriority] = (byPriority[result.replacementPriority] ?? 0) + 1;
  });

  return {
    totalImagesScanned: results.length,
    stockImagesFound: results.filter((r) => r.detectionReason === 'stock-detected').length,
    placeholdersFound: results.filter((r) => r.detectionReason === 'placeholder-detected').length,
    duplicatesFound: results.filter((r) => r.detectionReason === 'duplicate-detected').length,
    weakAssetsFound: results.filter((r) => r.detectionReason === 'weak-asset-detected').length,
    byType,
    byPriority,
    scanTimestamp: lastScanTimestamp,
  };
}

/**
 * Lists all images flagged for replacement.
 * Pure function - no side effects.
 */
export function listImagesToReplace(): ImageScanResult[] {
  return Array.from(imageScanRegistry.values())
    .filter((img) => img.replacementPriority !== 'low')
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.replacementPriority] - priorityOrder[b.replacementPriority];
    });
}

/**
 * Lists images by type (for admin inspection).
 */
export function listImagesByType(imageType: ImageScanResult['imageType']): ImageScanResult[] {
  return Array.from(imageScanRegistry.values()).filter((img) => img.imageType === imageType);
}

/**
 * Gets summary report for admin dashboard.
 */
export function getImageScanReport(): {
  summary: ScanSummary;
  criticalReplacements: ImageScanResult[];
  highPriorityReplacements: ImageScanResult[];
  mediumPriorityReplacements: ImageScanResult[];
} {
  const all = Array.from(imageScanRegistry.values());
  return {
    summary: getScanSummary(),
    criticalReplacements: all.filter((img) => img.replacementPriority === 'critical'),
    highPriorityReplacements: all.filter((img) => img.replacementPriority === 'high'),
    mediumPriorityReplacements: all.filter((img) => img.replacementPriority === 'medium'),
  };
}
