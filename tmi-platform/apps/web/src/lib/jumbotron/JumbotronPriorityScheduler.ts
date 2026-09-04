/**
 * JumbotronPriorityScheduler.ts — Strict Priority Queue & Preemption Scheduler
 *
 * Laws:
 * 1. P1 Safety > P2 Live Critical > P3 Gift/Reward > P4 Direct Sponsor > P5 Ads/House > P6 Ambient.
 * 2. Higher priority preempts lower priority immediately.
 * 3. Preempted contracted sponsors resume after critical moments pass.
 * 4. High-frequency telemetry updates (e.g. crowd meter) coalesce safely.
 */

import {
  JumbotronPriority,
  type JumbotronEvent,
  type JumbotronEventType,
} from "./JumbotronContracts";
import { JumbotronObservatory } from "./JumbotronObservatory";

export interface ActivePresentationState {
  event: JumbotronEvent;
  startedAtMs: number;
  expectedEndMs: number;
  isPaused: boolean;
  remainingMs: number;
}

export class JumbotronPriorityScheduler {
  private queue: JumbotronEvent[] = [];
  private activePresentation: ActivePresentationState | null = null;
  private preemptedStack: ActivePresentationState[] = [];

  constructor(public readonly sessionId: string) {}

  /**
   * Enqueues an event and evaluates immediate preemption if higher priority.
   */
  public enqueue(event: JumbotronEvent, nowMs = Date.now()): {
    queued: boolean;
    preemptedActive: boolean;
    reason: string;
  } {
    // 1. Stale event protection
    if (event.expiresAtMs && event.expiresAtMs <= nowMs) {
      JumbotronObservatory.recordPresentation({
        traceId: event.traceId,
        sessionId: this.sessionId,
        experienceType: event.experienceType,
        target: event.targetClass,
        priority: event.priority,
        eventType: event.eventType,
        sourceEventId: event.sourceEventId,
        templateId: event.templateId ?? "default",
        startedAtMs: nowMs,
        endedAtMs: nowMs,
        result: "DROPPED",
        latencyMs: 0,
      });
      return { queued: false, preemptedActive: false, reason: "Event already expired" };
    }

    // 2. Coalescing logic for high-frequency updates (e.g. crowd meter, ambient ticks)
    if (event.eventType === "AUDIENCE_CROWD_METER" || event.eventType === "ROUND_TIMER_TICK") {
      const existingIdx = this.queue.findIndex(
        (e) => e.eventType === event.eventType && e.targetClass === event.targetClass
      );
      if (existingIdx !== -1) {
        this.queue[existingIdx] = { ...event, isCoalesced: true };
        JumbotronObservatory.updateQueueDepth(this.queue.length);
        return { queued: true, preemptedActive: false, reason: "Coalesced into pending update" };
      }
    }

    // 3. Insert in strict priority order (lower numeric value = higher priority)
    this.queue.push(event);
    this.sortQueue();
    JumbotronObservatory.updateQueueDepth(this.queue.length);

    // 4. Preemption Evaluation
    if (this.activePresentation) {
      if (event.priority < this.activePresentation.event.priority) {
        // Incoming event has strictly higher priority -> Preempt active presentation
        const active = this.activePresentation;
        const elapsed = nowMs - active.startedAtMs;
        const remaining = Math.max(0, active.event.durationMs - elapsed);

        JumbotronObservatory.recordPresentation({
          traceId: active.event.traceId,
          sessionId: this.sessionId,
          experienceType: active.event.experienceType,
          target: active.event.targetClass,
          priority: active.event.priority,
          eventType: active.event.eventType,
          sourceEventId: active.event.sourceEventId,
          templateId: active.event.templateId ?? "default",
          sponsorCampaignId: active.event.sponsorCampaignId,
          rewardTransactionId: active.event.rewardTruth?.sourceTransactionId,
          startedAtMs: active.startedAtMs,
          endedAtMs: nowMs,
          preemptedByPriority: event.priority,
          preemptedByEventId: event.id,
          result: "PREEMPTED",
          latencyMs: elapsed,
        });

        // If active event is a contracted sponsor or has significant time remaining, save to resume
        if (
          remaining > 2000 &&
          (active.event.priority === JumbotronPriority.P4_CONTRACTED_DIRECT_SPONSOR ||
            active.event.priority === JumbotronPriority.P3_TRANSACTION_REWARD_GIFT)
        ) {
          this.preemptedStack.push({
            ...active,
            isPaused: true,
            remainingMs: remaining,
          });
        }

        this.activePresentation = null;
        return {
          queued: true,
          preemptedActive: true,
          reason: `Preempted active ${JumbotronPriority[active.event.priority]} with higher priority ${JumbotronPriority[event.priority]}`,
        };
      }
    }

    return { queued: true, preemptedActive: false, reason: "Enqueued in priority order" };
  }

  /**
   * Takes the next highest priority event to air.
   */
  public takeNext(nowMs = Date.now()): JumbotronEvent | null {
    // 1. Purge stale items from queue
    this.cleanStaleItems(nowMs);

    // 2. Check if we have pending queue events
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      JumbotronObservatory.updateQueueDepth(this.queue.length);
      this.activePresentation = {
        event: next,
        startedAtMs: nowMs,
        expectedEndMs: nowMs + next.durationMs,
        isPaused: false,
        remainingMs: next.durationMs,
      };
      return next;
    }

    // 3. If queue is empty, check if we have a paused contracted sponsor on the preempted stack
    if (this.preemptedStack.length > 0) {
      const resumed = this.preemptedStack.pop()!;
      const resumedEvent: JumbotronEvent = {
        ...resumed.event,
        durationMs: resumed.remainingMs,
      };
      this.activePresentation = {
        event: resumedEvent,
        startedAtMs: nowMs,
        expectedEndMs: nowMs + resumed.remainingMs,
        isPaused: false,
        remainingMs: resumed.remainingMs,
      };
      return resumedEvent;
    }

    this.activePresentation = null;
    return null;
  }

  /**
   * Releases current presentation upon completion.
   */
  public releaseActive(nowMs = Date.now()): void {
    if (!this.activePresentation) return;

    const active = this.activePresentation;
    const elapsed = nowMs - active.startedAtMs;

    JumbotronObservatory.recordPresentation({
      traceId: active.event.traceId,
      sessionId: this.sessionId,
      experienceType: active.event.experienceType,
      target: active.event.targetClass,
      priority: active.event.priority,
      eventType: active.event.eventType,
      sourceEventId: active.event.sourceEventId,
      templateId: active.event.templateId ?? "default",
      sponsorCampaignId: active.event.sponsorCampaignId,
      rewardTransactionId: active.event.rewardTruth?.sourceTransactionId,
      startedAtMs: active.startedAtMs,
      endedAtMs: nowMs,
      result: "COMPLETED",
      latencyMs: elapsed,
    });

    this.activePresentation = null;
  }

  public getActivePresentation(): ActivePresentationState | null {
    return this.activePresentation;
  }

  public getQueue(): readonly JumbotronEvent[] {
    return [...this.queue];
  }

  public getPreemptedStack(): readonly ActivePresentationState[] {
    return [...this.preemptedStack];
  }

  public clear(): void {
    this.queue = [];
    this.activePresentation = null;
    this.preemptedStack = [];
    JumbotronObservatory.updateQueueDepth(0);
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Primary: Priority ASC (1 is highest, 6 is lowest)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Secondary: FIFO by createdAtMs ASC
      return a.createdAtMs - b.createdAtMs;
    });
  }

  private cleanStaleItems(nowMs: number): void {
    const beforeCount = this.queue.length;
    this.queue = this.queue.filter((item) => {
      if (item.expiresAtMs && item.expiresAtMs <= nowMs) {
        JumbotronObservatory.recordStaleCleanup(1);
        return false;
      }
      return true;
    });
    if (this.queue.length !== beforeCount) {
      JumbotronObservatory.updateQueueDepth(this.queue.length);
    }
  }
}
