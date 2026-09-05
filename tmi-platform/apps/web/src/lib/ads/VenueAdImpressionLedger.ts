/**
 * VenueAdImpressionLedger.ts
 *
 * assigned ≠ viewed. Frustum + % area + duration gates.
 * Anti-fraud: backface, offscreen, background tab, bots, QA.
 * Roles: AUDIENCE / PERFORMER / HOST impressions.
 */

import {
  type ImpressionLedgerEntry,
  type ImpressionViewerRole,
  type ViewabilityFrustumSample,
  VIEWABILITY_THRESHOLDS,
} from "../jumbotron/JumbotronAdContracts";

export class VenueAdImpressionLedger {
  private entries: ImpressionLedgerEntry[] = [];
  private seq = 0;

  public recordAssignment(params: {
    roomId: string;
    inventoryId: string;
    creativeId: string;
    campaignId: string;
    viewerRole: ImpressionViewerRole;
    nowMs?: number;
  }): ImpressionLedgerEntry {
    const assignmentId = `assign-${++this.seq}`;
    const entry: ImpressionLedgerEntry = {
      impressionId: `imp-${this.seq}`,
      assignmentId,
      roomId: params.roomId,
      inventoryId: params.inventoryId,
      creativeId: params.creativeId,
      campaignId: params.campaignId,
      viewerRole: params.viewerRole,
      assignedAtMs: params.nowMs ?? Date.now(),
      viewedAtMs: null,
      viewabilityPassed: false,
      rejectReason: "ASSIGN_ONLY",
    };
    this.entries.push(entry);
    return entry;
  }

  public evaluateViewability(
    assignmentId: string,
    frustum: ViewabilityFrustumSample,
    nowMs = Date.now()
  ): ImpressionLedgerEntry | null {
    const entry = this.entries.find((e) => e.assignmentId === assignmentId);
    if (!entry) return null;

    if (frustum.isBackfaceCulled) {
      return this.reject(entry, "BACKFACE", frustum);
    }
    if (frustum.isOffscreen) {
      return this.reject(entry, "OFFSCREEN", frustum);
    }
    if (frustum.isBackgroundTab) {
      return this.reject(entry, "BACKGROUND_TAB", frustum);
    }
    if (frustum.isBotViewer) {
      return this.reject(entry, "BOT", frustum);
    }
    if (frustum.isQaHarness) {
      return this.reject(entry, "QA_HARNESS", frustum);
    }
    if (frustum.screenAreaPercent < VIEWABILITY_THRESHOLDS.minScreenAreaPercent) {
      return this.reject(entry, "INSUFFICIENT_AREA", frustum);
    }
    if (frustum.continuousVisibleMs < VIEWABILITY_THRESHOLDS.minContinuousVisibleMs) {
      return this.reject(entry, "INSUFFICIENT_DURATION", frustum);
    }
    if (!frustum.isFacingCamera) {
      return this.reject(entry, "BACKFACE", frustum);
    }

    entry.viewabilityPassed = true;
    entry.viewedAtMs = nowMs;
    entry.rejectReason = undefined;
    entry.frustum = frustum;
    return entry;
  }

  private reject(
    entry: ImpressionLedgerEntry,
    reason: NonNullable<ImpressionLedgerEntry["rejectReason"]>,
    frustum: ViewabilityFrustumSample
  ): ImpressionLedgerEntry {
    entry.viewabilityPassed = false;
    entry.viewedAtMs = null;
    entry.rejectReason = reason;
    entry.frustum = frustum;
    return entry;
  }

  public countViewed(): number {
    return this.entries.filter((e) => e.viewabilityPassed && e.viewedAtMs != null).length;
  }

  public countAssigned(): number {
    return this.entries.length;
  }

  public list(): ImpressionLedgerEntry[] {
    return [...this.entries];
  }

  public reset(): void {
    this.entries = [];
    this.seq = 0;
  }
}
