/**
 * One shape authority for every page magnet.
 * A heart-shaped note and a heart-shaped photo use this registry.
 * They are not separate components.
 */

import type { PublicPageMask } from "./publicPageDocument";

export type PublicPageShapeGroup = "BASIC" | "PERSONAL" | "CREATIVE" | "FRAME";
export type PublicPageShapeResize = "FREE" | "PRESERVE";

export interface PublicPageShape {
  shapeId: PublicPageMask;
  label: string;
  group: PublicPageShapeGroup;
  /** Content stays inside this inset. The points of a heart are not a text area. */
  inset: string;
  resize: PublicPageShapeResize;
  radius?: string;
  clipPath?: string;
}

export const PUBLIC_PAGE_SHAPES: readonly PublicPageShape[] = [
  { shapeId: "RECTANGLE", label: "Rectangle", group: "BASIC", inset: "8%", resize: "FREE", radius: "0" },
  { shapeId: "ROUNDED", label: "Rounded", group: "BASIC", inset: "8%", resize: "FREE", radius: "16px" },
  { shapeId: "SQUARE", label: "Square", group: "BASIC", inset: "8%", resize: "PRESERVE", radius: "0" },
  { shapeId: "CIRCLE", label: "Circle", group: "BASIC", inset: "18%", resize: "PRESERVE", radius: "50%" },
  { shapeId: "OVAL", label: "Oval", group: "BASIC", inset: "16% 12%", resize: "FREE", radius: "50%" },
  { shapeId: "PILL", label: "Pill", group: "BASIC", inset: "12% 16%", resize: "FREE", radius: "999px" },
  { shapeId: "HEART", label: "Heart", group: "PERSONAL", inset: "22% 16% 28%", resize: "PRESERVE", clipPath: "url(#tmi-shape-heart)" },
  { shapeId: "STAR", label: "Star", group: "PERSONAL", inset: "28% 22% 24%", resize: "PRESERVE", clipPath: "polygon(50% 4%, 61% 36%, 96% 36%, 68% 56%, 78% 90%, 50% 70%, 22% 90%, 32% 56%, 4% 36%, 39% 36%)" },
  { shapeId: "CLOUD", label: "Cloud", group: "PERSONAL", inset: "22% 14% 18%", resize: "FREE", radius: "40% 46% 42% 48%" },
  { shapeId: "SPEECH_BUBBLE", label: "Speech bubble", group: "PERSONAL", inset: "10% 10% 22%", resize: "FREE", clipPath: "polygon(4% 4%, 96% 4%, 96% 72%, 28% 72%, 10% 96%, 16% 72%, 4% 72%)" },
  { shapeId: "NOTE", label: "Note", group: "PERSONAL", inset: "10% 8% 14%", resize: "FREE", radius: "2px 18px 2px 2px" },
  { shapeId: "DIAMOND", label: "Diamond", group: "CREATIVE", inset: "28%", resize: "PRESERVE", clipPath: "polygon(50% 4%, 96% 50%, 50% 96%, 4% 50%)" },
  { shapeId: "HEXAGON", label: "Hexagon", group: "CREATIVE", inset: "16% 18%", resize: "PRESERVE", clipPath: "polygon(25% 6%, 75% 6%, 98% 50%, 75% 94%, 25% 94%, 2% 50%)" },
  { shapeId: "BURST", label: "Burst", group: "CREATIVE", inset: "26%", resize: "PRESERVE", clipPath: "polygon(50% 0%, 58% 18%, 78% 8%, 74% 30%, 98% 34%, 82% 50%, 98% 66%, 74% 70%, 78% 92%, 58% 82%, 50% 100%, 42% 82%, 22% 92%, 26% 70%, 2% 66%, 18% 50%, 2% 34%, 26% 30%, 22% 8%, 42% 18%)" },
  { shapeId: "TICKET", label: "Ticket", group: "CREATIVE", inset: "12% 10%", resize: "FREE", clipPath: "polygon(0 8%, 8% 8%, 8% 0, 92% 0, 92% 8%, 100% 8%, 100% 92%, 92% 92%, 92% 100%, 8% 100%, 8% 92%, 0 92%)" },
  { shapeId: "POLAROID", label: "Polaroid", group: "FRAME", inset: "6% 6% 22%", resize: "FREE", radius: "4px" },
  { shapeId: "TORN_PAPER", label: "Torn paper", group: "FRAME", inset: "10% 8%", resize: "FREE", clipPath: "polygon(0 2%, 8% 0, 16% 3%, 28% 0, 40% 2%, 52% 0, 64% 3%, 76% 0, 88% 2%, 100% 0, 100% 96%, 92% 100%, 80% 97%, 68% 100%, 56% 96%, 44% 100%, 32% 97%, 20% 100%, 8% 96%, 0 100%)" },
  { shapeId: "FRAME", label: "Frame", group: "FRAME", inset: "12%", resize: "FREE", radius: "6px" },
  { shapeId: "APPROVED_MASK", label: "Approved mask", group: "FRAME", inset: "12%", resize: "FREE", radius: "16px" },
];

/** Smooth lobes and a single lower taper. Normalized to a 100×100 viewBox. */
export const HEART_CONTOUR_PATH =
  "M 50 86 C 22 64 4 48 16 32 C 26 18 40 22 50 36 C 60 22 74 18 84 32 C 96 48 78 64 50 86 Z";

export const HEART_CLIP_ID = "tmi-shape-heart";

const RECTANGULAR_CARD_MASKS = new Set(["NONE", "RECTANGLE", "ROUNDED", "SQUARE"]);

/** A white Polaroid or Card box is only legal on a rectangular mask. */
export function rectangularCardFrameAllowed(mask: string | undefined): boolean {
  if (!mask) return true;
  return RECTANGULAR_CARD_MASKS.has(mask);
}

const BY_ID = new Map(PUBLIC_PAGE_SHAPES.map((shape) => [shape.shapeId, shape]));

export function publicPageShape(shapeId: string | undefined): PublicPageShape | null {
  if (!shapeId) return PUBLIC_PAGE_SHAPES[1] ?? null;
  return BY_ID.get(shapeId as PublicPageMask) ?? null;
}

/** Starter names only. Every one of these is the same writing box. */
export const WRITING_LABELS = [
  "About Me",
  "My Story",
  "What's on My Mind",
  "From My Heart",
  "Happy Days",
  "Memories",
  "My Journal",
  "My Thoughts",
  "My Comments",
  "Life Lately",
  "Today",
  "Dear Diary",
  "Shout-Outs",
  "Thank You",
  "People I Love",
  "Family",
  "My Kids",
  "My Friends",
  "My Crew",
  "In Memory Of",
  "Inspirations",
  "Dreams & Goals",
  "Things I Love",
  "Things I Don't Like",
  "Interests",
  "Favorites",
  "Music I Love",
  "Movies & Shows",
  "Books",
  "Places",
  "Hobbies",
  "Quotes",
  "Lyrics That Inspire Me",
  "Advice",
  "Lessons Learned",
  "Accomplishments",
  "Throwbacks",
  "Funny Moments",
  "Best Days",
  "Current Mood",
  "Announcements",
  "Updates",
  "My Rules",
  "Questions & Answers",
  "Fan Message",
  "Artist Note",
  "Behind the Music",
  "Behind the Scenes",
  "Tour Stories",
  "Studio Stories",
  "Creative Notes",
  "Credits",
  "Dedications",
  "Custom",
] as const;

export const APPROVED_PAGE_FONTS = [
  { id: "INTER", label: "Plain" },
  { id: "GROTESK", label: "Grotesk" },
  { id: "EDITORIAL", label: "Editorial" },
  { id: "DISPLAY", label: "Display" },
  { id: "MONO", label: "Mono" },
  { id: "SCRIPT", label: "Script" },
  { id: "CONDENSED", label: "Condensed" },
  { id: "ROUNDED", label: "Rounded" },
] as const;
