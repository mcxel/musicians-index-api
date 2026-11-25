/**
 * §20982 — canonical normalized event shape every connector produces.
 * "Story isn't just text; it's event + place + people + organizations + topic
 * + sources + rights + timestamps + verification state."
 *
 * This is the evidence packet, not the published article. A NewsEvent becomes
 * publishable TMI editorial content only after passing through verification +
 * rights + (future) editorial-review stages — none of which are wired to this
 * yet. Scope-honest: normalization only, in this slice.
 */

import type { NewsSourceRightsMode } from "./NewsSourceConnectorRegistry";

export type NewsEventVerificationStatus = "DETECTED" | "VERIFYING" | "CONFIRMED" | "PUBLISHED" | "DEVELOPING" | "UPDATED" | "CORRECTED" | "RETRACTED";

export type NewsEventCategory =
  | "EARTHQUAKE"
  | "WILDFIRE"
  | "WEATHER_ALERT"
  | "NATURAL_DISASTER"
  | "CONFLICT"
  | "POLITICS"
  | "SCIENCE"
  | "TECHNOLOGY"
  | "BUSINESS"
  | "HEALTH"
  | "CULTURE"
  | "SPORTS"
  | "OTHER";

export interface NewsEventGeography {
  continent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  /** Only when the source itself supplies real coordinates — never fabricated precision. */
  lat: number | null;
  lon: number | null;
  /** Free-text place description as the source phrased it (e.g. USGS "place"). */
  placeLabel: string | null;
}

export interface NewsEvidenceSource {
  sourceId: string;
  sourcePublisher: string;
  sourceUrl: string;
  sourcePublishedAt: number;
  rightsMode: NewsSourceRightsMode;
}

/**
 * One canonical event. Many evidence sources. Never one TMI event object per
 * publisher report of the same real-world event (§20982 event-clustering law)
 * — clustering itself is NOT implemented in this slice; each connector run
 * currently produces one NewsEvent per source item. A real clustering pass
 * (entity + location + time + semantic similarity) is future work.
 */
export interface NewsEvent {
  eventId: string;
  category: NewsEventCategory;
  headlineFact: string;
  geography: NewsEventGeography;
  occurredAt: number;
  detectedAt: number;
  updatedAt: number;
  verificationStatus: NewsEventVerificationStatus;
  /** Real, source-attributed claims only — never an invented fact. */
  claims: ReadonlyArray<{ text: string; source: NewsEvidenceSource }>;
  evidence: readonly NewsEvidenceSource[];
  confidence: "OFFICIAL_CONFIRMED" | "SINGLE_SOURCE_UNVERIFIED";
}
