/**
 * FaceScanLearningLedger — privacy-safe correction signals for bounded improvement.
 *
 * LEARNING != silent production rewrite.
 * Records INITIAL FIT vs USER-APPROVED FINAL FIT deltas.
 * Raw face imagery is NOT stored here.
 * Candidate promotion requires Admin/QA — never auto-publishes.
 */

import {
  APPEARANCE_FIT_VERSION,
  FACE_FIT_VERSION,
  LANDMARK_VERSION,
  RIG_FACE_VERSION,
  computeShapeCorrectionDelta,
  shapeDeltaToCorrectionCategories,
  type AvatarFaceIdentityProfile,
  type FaceCorrectionCategory,
  type FaceIdentityShapeCoefficients,
} from "@/lib/avatar/AvatarFaceIdentityContract";

export const FACE_SCAN_LEARNING_CONSENT_KEY = "tmi_face_scan_learning_consent";
export const FACE_SCAN_CORRECTION_LEDGER_KEY = "tmi_face_scan_correction_ledger_v1";

export type FaceScanLearningConsent = {
  /** Explicit opt-in to contribute anonymized correction stats (NOT raw imagery). */
  aggregateCorrectionStats: boolean;
  updatedAt: number;
};

export type FaceScanCorrectionRecord = {
  recordId: string;
  scanSessionId: string;
  faceFitVersion: string;
  landmarkVersion: string;
  appearanceFitVersion: string;
  rigVersion: string;
  categories: FaceCorrectionCategory[];
  /** Non-identifying numeric deltas only — no image, no landmarks dump. */
  shapeDelta: Partial<Record<keyof FaceIdentityShapeCoefficients, number>>;
  recapture: boolean;
  acceptedWithoutEdit: boolean;
  createdAt: number;
};

export type FaceScanErrorFamily =
  | "LOW_LIGHT"
  | "OVEREXPOSURE"
  | "MOTION_BLUR"
  | "PARTIAL_FACE"
  | "SIDE_ANGLE"
  | "QUALITY_FAIL"
  | "SAVE_FAIL"
  | "OTHER";

export type FaceScanErrorLedgerEntry = {
  entryId: string;
  family: FaceScanErrorFamily;
  faceFitVersion: string;
  frequency: number;
  lastSeenAt: number;
  proposedFix?: string;
  qaStatus: "OPEN" | "CANDIDATE" | "QA" | "RELEASED" | "ROLLED_BACK";
};

let memoryConsent: FaceScanLearningConsent = {
  aggregateCorrectionStats: false,
  updatedAt: 0,
};
let memoryCorrections: FaceScanCorrectionRecord[] = [];
let memoryErrors: FaceScanErrorLedgerEntry[] = [];

export function readFaceScanLearningConsent(): FaceScanLearningConsent {
  if (typeof window === "undefined") return memoryConsent;
  try {
    const raw = window.localStorage.getItem(FACE_SCAN_LEARNING_CONSENT_KEY);
    if (!raw) return memoryConsent;
    return JSON.parse(raw) as FaceScanLearningConsent;
  } catch {
    return memoryConsent;
  }
}

export function setFaceScanLearningConsent(aggregateCorrectionStats: boolean): FaceScanLearningConsent {
  memoryConsent = { aggregateCorrectionStats, updatedAt: Date.now() };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(FACE_SCAN_LEARNING_CONSENT_KEY, JSON.stringify(memoryConsent));
    } catch { /* quota */ }
  }
  return memoryConsent;
}

/** Record INITIAL→APPROVED delta. Never stores raw capture. Never rewrites production models. */
export function recordFaceScanCorrection(opts: {
  scanSessionId: string;
  initial: FaceIdentityShapeCoefficients;
  approved: FaceIdentityShapeCoefficients;
  recapture?: boolean;
}): FaceScanCorrectionRecord | null {
  const consent = readFaceScanLearningConsent();
  if (!consent.aggregateCorrectionStats) return null;

  const shapeDelta = computeShapeCorrectionDelta(opts.initial, opts.approved);
  const categories = shapeDeltaToCorrectionCategories(shapeDelta);
  const acceptedWithoutEdit = categories.length === 0;
  const record: FaceScanCorrectionRecord = {
    recordId: `fscr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    scanSessionId: opts.scanSessionId,
    faceFitVersion: FACE_FIT_VERSION,
    landmarkVersion: LANDMARK_VERSION,
    appearanceFitVersion: APPEARANCE_FIT_VERSION,
    rigVersion: RIG_FACE_VERSION,
    categories,
    shapeDelta,
    recapture: Boolean(opts.recapture),
    acceptedWithoutEdit,
    createdAt: Date.now(),
  };
  memoryCorrections = [...memoryCorrections.slice(-199), record];
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        FACE_SCAN_CORRECTION_LEDGER_KEY,
        JSON.stringify(memoryCorrections.slice(-50)),
      );
    } catch { /* ignore */ }
  }
  return record;
}

export function recordFaceScanErrorFamily(family: FaceScanErrorFamily): FaceScanErrorLedgerEntry {
  const existing = memoryErrors.find(
    (e) => e.family === family && e.faceFitVersion === FACE_FIT_VERSION,
  );
  if (existing) {
    existing.frequency += 1;
    existing.lastSeenAt = Date.now();
    return existing;
  }
  const entry: FaceScanErrorLedgerEntry = {
    entryId: `fsef_${family}_${Date.now().toString(36)}`,
    family,
    faceFitVersion: FACE_FIT_VERSION,
    frequency: 1,
    lastSeenAt: Date.now(),
    qaStatus: "OPEN",
  };
  memoryErrors.push(entry);
  return entry;
}

export function aggregateCorrectionHeatmap(
  records: FaceScanCorrectionRecord[] = memoryCorrections,
): Record<FaceCorrectionCategory, number> {
  const counts: Partial<Record<FaceCorrectionCategory, number>> = {};
  let total = 0;
  for (const r of records) {
    for (const c of r.categories) {
      counts[c] = (counts[c] ?? 0) + 1;
      total += 1;
    }
  }
  const out = {} as Record<FaceCorrectionCategory, number>;
  for (const [k, v] of Object.entries(counts)) {
    out[k as FaceCorrectionCategory] = total ? Math.round((v! / total) * 1000) / 10 : 0;
  }
  return out;
}

export function listFaceScanCorrections(): FaceScanCorrectionRecord[] {
  return [...memoryCorrections];
}

export function listFaceScanErrorFamilies(): FaceScanErrorLedgerEntry[] {
  return [...memoryErrors];
}

/** Champion/candidate — candidates never auto-promote. */
export type FaceFitReleaseChannel = "CHAMPION" | "CANDIDATE";

export function getActiveFaceFitVersions(channel: FaceFitReleaseChannel = "CHAMPION") {
  return {
    channel,
    faceFitVersion: FACE_FIT_VERSION,
    landmarkVersion: LANDMARK_VERSION,
    appearanceFitVersion: APPEARANCE_FIT_VERSION,
    rigVersion: RIG_FACE_VERSION,
    silentRewriteAllowed: false as const,
    autoPromoteAllowed: false as const,
  };
}

export function snapshotApprovedIdentityForCalibration(
  profile: AvatarFaceIdentityProfile,
): Pick<AvatarFaceIdentityProfile, "identityId" | "revision" | "shapeCoefficients" | "appearance" | "approvedAt"> {
  return {
    identityId: profile.identityId,
    revision: profile.revision,
    shapeCoefficients: { ...profile.shapeCoefficients },
    appearance: { ...profile.appearance },
    approvedAt: profile.approvedAt,
  };
}
