/**
 * Magazine media player fallback:
 * live → video → animated → editorial image → honest empty
 * NEVER blueprint / curated home1–home3 fallback tiles.
 */

import type {
  MagazineMediaSurface,
  UnifiedMediaRecord,
} from "./UnifiedMediaRecord";

export type ResolvedMagazineMedia = {
  surface: MagazineMediaSurface;
  src: string | null;
  mutedRequired: boolean;
  honestEmptyMessage: string | null;
};

export function resolveMagazineMediaPresentation(
  record: UnifiedMediaRecord | null | undefined,
): ResolvedMagazineMedia {
  if (!record) {
    return {
      surface: "empty",
      src: null,
      mutedRequired: true,
      honestEmptyMessage: "No magazine media available.",
    };
  }

  if (record.liveUrl) {
    return {
      surface: "live",
      src: record.liveUrl,
      mutedRequired: true,
      honestEmptyMessage: null,
    };
  }

  if (record.videoUrl) {
    return {
      surface: "video",
      src: record.videoUrl,
      mutedRequired: true,
      honestEmptyMessage: null,
    };
  }

  if (record.animatedUrl) {
    return {
      surface: "animated",
      src: record.animatedUrl,
      mutedRequired: true,
      honestEmptyMessage: null,
    };
  }

  if (record.editorialImageUrl) {
    return {
      surface: "editorial_image",
      src: record.editorialImageUrl,
      mutedRequired: true,
      honestEmptyMessage: null,
    };
  }

  return {
    surface: "empty",
    src: null,
    mutedRequired: true,
    honestEmptyMessage: "No media available for this story.",
  };
}
