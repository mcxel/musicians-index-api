/**
 * AdDiversityAuthority.ts — session-scoped duplicate suppression for ad slots
 * (§6403–§6407, §6437–§6441).
 *
 * The canonical waterfall (SponsorRegistry.getAdSlotForZone: paid → platform →
 * adnetwork → advertise-cta) already guarantees no empty inventory. This module
 * adds the missing piece: when MULTIPLE slots on the same page/session share a
 * zone, neighboring slots should not unnecessarily render the SAME creative or
 * the SAME network when a legitimate alternative exists.
 *
 * Laws honored:
 *  - §6406/§6437  Suppress unnecessary duplicate creatives across nearby slots.
 *  - §6404/§6438  Waterfall order preserved — direct/paid sponsor still wins;
 *    duplicate suppression NEVER removes a paid sponsor to force diversity.
 *  - §6407/§6441  NO impression manipulation — no refresh/hidden/stacked/offscreen
 *    behavior. This only chooses among already-eligible alternatives.
 *  - §6405/§6439  Business signup alone does NOT take over a slot — this module
 *    does not create/remove sponsorships; it only reads the active set.
 *  - §6440        When a paid sponsor is no longer active, the slot becomes
 *    eligible for the next waterfall source automatically (no deploy needed).
 *
 * Pure data/logic. No DOM, no fetch, no impression side-effects.
 */

import {
  getActiveSponsorForZone,
  getAdSlotForZone,
  type AdSlotDescriptor,
} from "@/lib/commerce/SponsorRegistry";

/** Identity of a served creative for duplicate comparison. */
export interface ServedCreative {
  zone: string;
  /** "paid:{sponsorId}" | "platform:{headline}" | "adnetwork:{network}" | "advertise-cta" */
  creativeKey: string;
  type: AdSlotDescriptor["type"];
}

function creativeKeyFor(zone: string, d: AdSlotDescriptor): string {
  if (d.type === "paid" && d.sponsor) return `paid:${d.sponsor.sponsorId}`;
  if (d.type === "platform" && d.platformPromo) return `platform:${d.platformPromo.headline}`;
  if (d.type === "adnetwork") return `adnetwork:${d.adSlotKey ?? "default"}`;
  return "advertise-cta";
}

// ─────────────────────────────────────────────────────────────────────────────
// Session duplicate registry (in-memory; per page-view/session scope)
// ─────────────────────────────────────────────────────────────────────────────

/** creatives served so far in this session scope, keyed by an arbitrary scope id. */
const sessionServed = new Map<string, Set<string>>();

function servedSet(scopeId: string): Set<string> {
  if (!sessionServed.has(scopeId)) sessionServed.set(scopeId, new Set());
  return sessionServed.get(scopeId)!;
}

/** Test/reset helper. */
export function resetAdDiversityScope(scopeId: string): void {
  sessionServed.delete(scopeId);
}

export interface AdSlotResolution {
  descriptor: AdSlotDescriptor;
  creativeKey: string;
  /** True when a duplicate was suppressed in favor of an alternative. */
  suppressedDuplicate: boolean;
}

/**
 * Resolve the slot for `zone` within `scopeId` (a page/region/session), suppressing
 * a creative already served in this scope when a legitimate alternative exists.
 *
 * Rules:
 *  - PAID sponsor: NEVER suppressed (direct-takeover priority §6404). Served as-is.
 *  - PLATFORM promo: if this exact promo already served in scope, advance to the
 *    next platform promo (rotation) before considering adnetwork/advertise-cta.
 *  - ADNETWORK: if the same adSlotKey already served in scope, allow the caller's
 *    per-instance network rotation to pick a different network (the descriptor
 *    only carries a slot-key hint; the physical network pick stays in UnifiedAdSlot).
 *  - advertise-cta is the honest last resort and is never suppressed.
 */
export function resolveAdSlotWithDiversity(scopeId: string, zone: string): AdSlotResolution {
  // Tier 1: paid sponsor is authoritative — never suppress for diversity.
  const paid = getActiveSponsorForZone(zone);
  if (paid) {
    const key = `paid:${paid.sponsorId}`;
    servedSet(scopeId).add(key);
    return { descriptor: { type: "paid", sponsor: paid }, creativeKey: key, suppressedDuplicate: false };
  }

  const served = servedSet(scopeId);

  // Ask the canonical waterfall for the next descriptor.
  const first = getAdSlotForZone(zone);
  const firstKey = creativeKeyFor(zone, first);

  if (first.type === "platform" && first.platformPromo) {
    if (!served.has(firstKey)) {
      served.add(firstKey);
      return { descriptor: first, creativeKey: firstKey, suppressedDuplicate: false };
    }
    // Duplicate platform promo — rotate to a different promo (up to pool size).
    for (let i = 0; i < 8; i++) {
      const next = getAdSlotForZone(zone);
      const nextKey = creativeKeyFor(zone, next);
      if (next.type === "platform" && next.platformPromo && !served.has(nextKey)) {
        served.add(nextKey);
        return { descriptor: next, creativeKey: nextKey, suppressedDuplicate: true };
      }
      // If the waterfall moved off platform (adnetwork/advertise-cta), accept it.
      if (next.type !== "platform") {
        served.add(nextKey);
        return { descriptor: next, creativeKey: nextKey, suppressedDuplicate: true };
      }
    }
    // All promos already served in scope — fall through to adnetwork honestly.
    const fallback: AdSlotDescriptor = { type: "adnetwork", adSlotKey: "sponsorFallback" };
    const fbKey = creativeKeyFor(zone, fallback);
    served.add(fbKey);
    return { descriptor: fallback, creativeKey: fbKey, suppressedDuplicate: true };
  }

  // adnetwork / advertise-cta: serve, and record so a neighbor with the SAME zone
  // can rotate to a different network via the caller's per-instance seed.
  if (!served.has(firstKey)) {
    served.add(firstKey);
    return { descriptor: first, creativeKey: firstKey, suppressedDuplicate: false };
  }
  // Same network already served in scope — still serve (adnetwork fill is legitimate),
  // but flag so the caller's network rotation picks a different network seed.
  return { descriptor: first, creativeKey: firstKey, suppressedDuplicate: true };
}
