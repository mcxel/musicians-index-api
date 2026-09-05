/**
 * JumbotronObservatory.ts — Canonical Telemetry, Audit & Observability Spine
 *
 * Laws:
 * 1. Every Jumbotron presentation must be fully traceable.
 * 2. Truthful ad / sponsor viewability events only.
 * 3. Track queue depth, drops, preemptions, delivery failures, and stale cleanups.
 */

import type {
  JumbotronDirectorTelemetry,
  JumbotronEvent,
  JumbotronExperienceType,
  DisplayTargetClass,
  JumbotronPriority,
  JumbotronEventType,
} from "./JumbotronContracts";

export interface JumbotronObservatoryMetrics {
  totalPresentations: number;
  completedCount: number;
  preemptionsCount: number;
  droppedEventsCount: number;
  targetUnavailableCount: number;
  renderingFailuresCount: number;
  sponsorDeliveryCount: number;
  truthfulAdViewabilityCount: number;
  rewardPresentationFailuresCount: number;
  staleProgramCleanupCount: number;
  currentQueueDepth: number;
}

export class JumbotronObservatory {
  private static events: JumbotronDirectorTelemetry[] = [];
  private static subscribers: ((event: JumbotronDirectorTelemetry) => void)[] = [];
  private static metrics: JumbotronObservatoryMetrics = {
    totalPresentations: 0,
    completedCount: 0,
    preemptionsCount: 0,
    droppedEventsCount: 0,
    targetUnavailableCount: 0,
    renderingFailuresCount: 0,
    sponsorDeliveryCount: 0,
    truthfulAdViewabilityCount: 0,
    rewardPresentationFailuresCount: 0,
    staleProgramCleanupCount: 0,
    currentQueueDepth: 0,
  };

  public static recordPresentation(telemetry: JumbotronDirectorTelemetry): void {
    JumbotronObservatory.events.push(telemetry);
    if (JumbotronObservatory.events.length > 2000) {
      JumbotronObservatory.events.shift();
    }

    JumbotronObservatory.metrics.totalPresentations++;

    switch (telemetry.result) {
      case "COMPLETED":
        JumbotronObservatory.metrics.completedCount++;
        if (telemetry.sponsorCampaignId) {
          JumbotronObservatory.metrics.sponsorDeliveryCount++;
        }
        if (telemetry.eventType === "CERTIFIED_AD_NETWORK") {
          JumbotronObservatory.metrics.truthfulAdViewabilityCount++;
        }
        break;

      case "PREEMPTED":
        JumbotronObservatory.metrics.preemptionsCount++;
        break;

      case "DROPPED":
        JumbotronObservatory.metrics.droppedEventsCount++;
        break;

      case "TARGET_UNAVAILABLE":
        JumbotronObservatory.metrics.targetUnavailableCount++;
        break;

      case "SETTLEMENT_REJECTED":
        JumbotronObservatory.metrics.rewardPresentationFailuresCount++;
        break;
    }

    for (const sub of JumbotronObservatory.subscribers) {
      try {
        sub(telemetry);
      } catch (err) {
        console.error("[JumbotronObservatory] subscriber notification failed:", err);
      }
    }
  }

  public static updateQueueDepth(depth: number): void {
    JumbotronObservatory.metrics.currentQueueDepth = depth;
  }

  public static recordStaleCleanup(count = 1): void {
    JumbotronObservatory.metrics.staleProgramCleanupCount += count;
  }

  public static recordRenderFailure(): void {
    JumbotronObservatory.metrics.renderingFailuresCount++;
  }

  public static getMetrics(): Readonly<JumbotronObservatoryMetrics> {
    return { ...JumbotronObservatory.metrics };
  }

  public static getHistory(): readonly JumbotronDirectorTelemetry[] {
    return [...JumbotronObservatory.events];
  }

  public static getEventsForSession(sessionId: string): JumbotronDirectorTelemetry[] {
    return JumbotronObservatory.events.filter((e) => e.sessionId === sessionId);
  }

  public static subscribe(fn: (event: JumbotronDirectorTelemetry) => void): () => void {
    JumbotronObservatory.subscribers.push(fn);
    return () => {
      JumbotronObservatory.subscribers = JumbotronObservatory.subscribers.filter((s) => s !== fn);
    };
  }

  public static resetForTesting(): void {
    JumbotronObservatory.events = [];
    JumbotronObservatory.subscribers = [];
    JumbotronObservatory.metrics = {
      totalPresentations: 0,
      completedCount: 0,
      preemptionsCount: 0,
      droppedEventsCount: 0,
      targetUnavailableCount: 0,
      renderingFailuresCount: 0,
      sponsorDeliveryCount: 0,
      truthfulAdViewabilityCount: 0,
      rewardPresentationFailuresCount: 0,
      staleProgramCleanupCount: 0,
      currentQueueDepth: 0,
    };
  }
}
