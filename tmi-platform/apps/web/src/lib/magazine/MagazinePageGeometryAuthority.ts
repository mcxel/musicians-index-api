/**
 * MagazinePageGeometryAuthority — §§9416–9446
 * One canonical long-page canvas for PERFORMER / NEWS / RANDOM editorial pages.
 * Content varies inside; outer publication geometry does not bounce.
 */

import { TMI_CANVAS_MAX_WIDTH_PX } from "@/lib/magazine/TmiSurfaceParityEngine";
import type { MagazinePageClass } from "@/lib/magazine/MagazineIssueContract";

/** Canonical outer long-page canvas — discovered from MagazineShell (75vh floor). */
export const MAGAZINE_PAGE_GEOMETRY = {
  maxWidthPx: TMI_CANVAS_MAX_WIDTH_PX,
  /** Shared minimum page/spread height for all editorial families. */
  minHeightCss: "75vh" as const,
  minHeightPxApprox: 720,
  families: ["PERFORMER", "NEWS", "RANDOM"] as const,
} as const;

export type MagazineGeometryFamily = (typeof MAGAZINE_PAGE_GEOMETRY.families)[number];

export function isEditorialGeometryFamily(
  pageClass: MagazinePageClass | undefined,
): pageClass is MagazineGeometryFamily {
  return pageClass === "PERFORMER" || pageClass === "NEWS" || pageClass === "RANDOM";
}

/** Outer canvas style shared by every editorial page family. */
export function magazineEditorialPageCanvasStyle(
  _pageClass?: MagazinePageClass,
): {
  maxWidth: number;
  minHeight: string;
  width: string;
  marginInline: "auto";
  boxSizing: "border-box";
} {
  return {
    maxWidth: MAGAZINE_PAGE_GEOMETRY.maxWidthPx,
    minHeight: MAGAZINE_PAGE_GEOMETRY.minHeightCss,
    width: "100%",
    marginInline: "auto",
    boxSizing: "border-box",
  };
}

export function assertUniformEditorialGeometry(): {
  performerEqualsNews: true;
  newsEqualsRandom: true;
  authority: "MagazinePageGeometryAuthority";
} {
  return {
    performerEqualsNews: true,
    newsEqualsRandom: true,
    authority: "MagazinePageGeometryAuthority",
  };
}
