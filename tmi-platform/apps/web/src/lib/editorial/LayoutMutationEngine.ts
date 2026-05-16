/**
 * LayoutMutationEngine
 * Controls which layout template renders for a given article/profile route.
 * Templates rotate deterministically — never random chaos, always approved structure.
 *
 * Template A — Standard Feature: hero → text → video → poll
 * Template B — Split Spread:     video → quote → live preview → article
 * Template C — Cinematic:        full-width image → side rail → sponsor stack
 * Template D — News Stack:       compact headline grid → trending strip → CTA
 * Template E — Interview Spread: pull quote → profile → Q&A blocks → related
 */

export type LayoutTemplate = "A" | "B" | "C" | "D" | "E";

import { dropOffAnalysisEngine } from '@/lib/learning/DropOffAnalysisEngine';
import { contentInterestEngine } from '@/lib/learning/ContentInterestEngine';

export interface LayoutConfig {
  template: LayoutTemplate;
  label: string;
  heroRatio: "16/9" | "21/9" | "4/3" | "1/1";
  showSponsorRail: boolean;
  showPollModule: boolean;
  showLivePreview: boolean;
  showRelatedArtists: boolean;
  columnCount: 1 | 2 | 3;
  accentPosition: "top" | "bottom" | "left" | "full";
}

const TEMPLATES: Record<LayoutTemplate, LayoutConfig> = {
  A: {
    template: "A",
    label: "Standard Feature",
    heroRatio: "16/9",
    showSponsorRail: true,
    showPollModule: true,
    showLivePreview: false,
    showRelatedArtists: true,
    columnCount: 1,
    accentPosition: "top",
  },
  B: {
    template: "B",
    label: "Split Editorial Spread",
    heroRatio: "4/3",
    showSponsorRail: false,
    showPollModule: false,
    showLivePreview: true,
    showRelatedArtists: true,
    columnCount: 2,
    accentPosition: "left",
  },
  C: {
    template: "C",
    label: "Cinematic Full-Width",
    heroRatio: "21/9",
    showSponsorRail: true,
    showPollModule: false,
    showLivePreview: false,
    showRelatedArtists: false,
    columnCount: 1,
    accentPosition: "full",
  },
  D: {
    template: "D",
    label: "News Stack Feed",
    heroRatio: "16/9",
    showSponsorRail: false,
    showPollModule: true,
    showLivePreview: false,
    showRelatedArtists: true,
    columnCount: 3,
    accentPosition: "bottom",
  },
  E: {
    template: "E",
    label: "Interview Spread",
    heroRatio: "1/1",
    showSponsorRail: false,
    showPollModule: false,
    showLivePreview: true,
    showRelatedArtists: true,
    columnCount: 2,
    accentPosition: "left",
  },
};

const TEMPLATE_ORDER: LayoutTemplate[] = ["A", "B", "C", "D", "E"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getLayoutForRoute(slug: string): LayoutConfig {
  const hotspot = dropOffAnalysisEngine.getHotspots(20).find((item) => item.route === slug);
  if (hotspot && hotspot.dropoffRate > 35) {
    return TEMPLATES.D;
  }

  const highInterest = contentInterestEngine
    .getTopContent(50)
    .some((item) => item.contentId === slug && item.score > 20);
  if (highInterest) {
    return TEMPLATES.C;
  }

  const index = hashString(slug) % TEMPLATE_ORDER.length;
  return TEMPLATES[TEMPLATE_ORDER[index]];
}

export function rotateLayout(current: LayoutTemplate): LayoutConfig {
  const idx = TEMPLATE_ORDER.indexOf(current);
  const next = TEMPLATE_ORDER[(idx + 1) % TEMPLATE_ORDER.length];
  return TEMPLATES[next];
}

export function getLayoutConfig(template: LayoutTemplate): LayoutConfig {
  return TEMPLATES[template];
}

export function getAllLayouts(): LayoutConfig[] {
  return TEMPLATE_ORDER.map(t => TEMPLATES[t]);
}
