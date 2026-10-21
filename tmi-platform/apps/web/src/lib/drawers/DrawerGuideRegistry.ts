/**
 * DrawerGuideRegistry — locked coaching copy per UniversalDrawerModuleId.
 * Persist visits by user+persona+drawer+guideVersion (local for now; server later).
 */

import type { UniversalDrawerModuleId } from "./UniversalDrawerRegistry";

export const DRAWER_GUIDE_VERSION = 1 as const;

export type DrawerGuideDef = {
  drawerId: UniversalDrawerModuleId;
  title: string;
  purpose: string;
  value: string;
  firstAction: string;
  /** Auto-show only for the first N meaningful opens */
  autoShowLimit: number;
};

export const DRAWER_GUIDE_REGISTRY: Partial<Record<UniversalDrawerModuleId, DrawerGuideDef>> = {
  lobby: {
    drawerId: "lobby",
    title: "Lobby Wall",
    purpose: "Discover live rooms, battles, cyphers, lounges, and games.",
    value: "Watch or join the exact live session — not a generic Home maze.",
    firstAction: "Pick a live card, then WATCH or JOIN if you are eligible.",
    autoShowLimit: 2,
  },
  messaging: {
    drawerId: "messaging",
    title: "Messages",
    purpose: "Private and room conversations in one communications rail.",
    value: "Chat without destroying monitors, WebRTC, or your workspace.",
    firstAction: "Tap the composer and send a real message.",
    autoShowLimit: 2,
  },
  sponsors: {
    drawerId: "sponsors",
    title: "Sponsors",
    purpose: "Build legitimate sponsor relationships — local and TMI opportunities.",
    value: "Discover, connect, promote, and track authorized sponsorship economics.",
    firstAction: "Open Discover / Local Opportunities. No payout promises unless payment authority confirms them.",
    autoShowLimit: 2,
  },
  store: {
    drawerId: "store",
    title: "Store",
    purpose: "Role-specific marketplace for assets you can own and equip.",
    value: "Purchase → own → equip → see it on your avatar or venue.",
    firstAction: "Browse a category and preview before buying.",
    autoShowLimit: 2,
  },
  tmi_store: {
    drawerId: "tmi_store",
    title: "TMI Store",
    purpose: "Platform cosmetics, venue skins, and seasonal drops.",
    value: "Owned items stay owned even if your subscription changes.",
    firstAction: "Open Owned to equip something you already have.",
    autoShowLimit: 2,
  },
  marketplace: {
    drawerId: "marketplace",
    title: "Artist Shop",
    purpose: "Commerce for the performer you are viewing right now.",
    value: "Shop A never leaves stale products when you move to Performer B.",
    firstAction: "Browse this artist's merch, digital goods, or YoPho items.",
    autoShowLimit: 2,
  },
  playlist: {
    drawerId: "playlist",
    title: "Playlist / Send a Vibe",
    purpose: "Build mixtapes for someone, a crowd, or yourself.",
    value: "Share with deep links and QR — exact destination, not Home.",
    firstAction: "Create a playlist and name the vibe.",
    autoShowLimit: 2,
  },
  yopho: {
    drawerId: "yopho",
    title: "YoPho",
    purpose: "Creative composition workstation for cards and profile art.",
    value: "Layers, motion, and publish — not a flattened one-off export.",
    firstAction: "Open a canvas and place your first layer.",
    autoShowLimit: 2,
  },
  memory: {
    drawerId: "memory",
    title: "Memory Wall",
    purpose: "Keep tickets, polaroids, battles, and moments as a scrapbook.",
    value: "Capture without interrupting the live session.",
    firstAction: "Open Capture Moment on an eligible surface.",
    autoShowLimit: 2,
  },
  booking: {
    drawerId: "booking",
    title: "Booking & Tickets",
    purpose: "Performer touring console — opportunities, passes, comps, settlement.",
    value: "Professional logistics in one drawer, not a generic card grid.",
    firstAction: "Open Opportunities or My Shows.",
    autoShowLimit: 2,
  },
  appearance: {
    drawerId: "appearance",
    title: "Avatar",
    purpose: "Customize your Fan bobblehead identity.",
    value: "One avatar identity follows you into lobbies and venues.",
    firstAction: "Change an item and save/equip.",
    autoShowLimit: 2,
  },
  live_destinations: {
    drawerId: "live_destinations",
    title: "Cast / Destinations",
    purpose: "Send program output to supported external destinations.",
    value: "Only real capable providers appear as working controls.",
    firstAction: "Review destination status before going live.",
    autoShowLimit: 2,
  },
};

export function getDrawerGuide(drawerId: UniversalDrawerModuleId): DrawerGuideDef | null {
  return DRAWER_GUIDE_REGISTRY[drawerId] ?? null;
}

function storageKey(userId: string, persona: string, drawerId: string): string {
  return `tmi.drawerGuide.v${DRAWER_GUIDE_VERSION}.${userId}.${persona}.${drawerId}`;
}

export function readDrawerGuideVisits(userId: string, persona: string, drawerId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(storageKey(userId || "anon", persona || "fan", drawerId));
    const n = Number(raw ?? "0");
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function recordDrawerGuideVisit(userId: string, persona: string, drawerId: string): number {
  const next = readDrawerGuideVisits(userId, persona, drawerId) + 1;
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(storageKey(userId || "anon", persona || "fan", drawerId), String(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function shouldAutoShowDrawerGuide(
  userId: string,
  persona: string,
  drawerId: UniversalDrawerModuleId,
): boolean {
  const guide = getDrawerGuide(drawerId);
  if (!guide) return false;
  return readDrawerGuideVisits(userId, persona, drawerId) < guide.autoShowLimit;
}
