/**
 * PresentationScheduler — Priority queue & conflict resolution scheduler.
 * Ensures critical winner reveals & safety alerts take precedence over routine sponsor segments,
 * queues low-priority animations, and cancels orphaned playback on performer disconnect.
 */

import PresentationStateMachine from "./PresentationStateMachine";
import PresentationTimelineEngine from "./PresentationTimelineEngine";

export type PackagePriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface ScheduledPackage {
  id: string;
  packageId: string;
  priority: PackagePriority;
  customData?: Record<string, unknown>;
  queuedAt: number;
}

const PRIORITY_ORDER: Record<PackagePriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

class PresentationSchedulerClass {
  private queue: ScheduledPackage[] = [];
  private isProcessing: boolean = false;

  public schedulePackage(
    packageId: string,
    priority: PackagePriority = "NORMAL",
    customData?: Record<string, unknown>
  ): string {
    const item: ScheduledPackage = {
      id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      packageId,
      priority,
      customData,
      queuedAt: Date.now(),
    };

    // If critical priority, stop current playing timeline and execute immediately
    if (priority === "CRITICAL") {
      PresentationTimelineEngine.stopCurrent();
      this.queue.unshift(item);
      this.processNext();
      return item.id;
    }

    this.queue.push(item);
    // Sort queue by priority descending, then queuedAt ascending
    this.queue.sort((a, b) => {
      const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (pDiff !== 0) return pDiff;
      return a.queuedAt - b.queuedAt;
    });

    this.processNext();
    return item.id;
  }

  public processNext() {
    if (this.isProcessing) return;

    const currentPlayback = PresentationTimelineEngine.getPlaybackState();
    if (currentPlayback && currentPlayback.status === "PLAYING") {
      // Currently busy running a package; wait for completion notification
      return;
    }

    if (this.queue.length === 0) return;

    const nextItem = this.queue.shift();
    if (!nextItem) return;

    this.isProcessing = true;

    // Execute package via PresentationTimelineEngine
    PresentationTimelineEngine.playPackage(nextItem.packageId, nextItem.customData);

    // Watch for playback finish to process next item in queue
    const checkInterval = window.setInterval(() => {
      const state = PresentationTimelineEngine.getPlaybackState();
      if (!state || state.status === "COMPLETED") {
        window.clearInterval(checkInterval);
        this.isProcessing = false;
        this.processNext();
      }
    }, 250);
  }

  public cancelAll() {
    this.queue = [];
    PresentationTimelineEngine.stopCurrent();
    PresentationStateMachine.transitionTo("IDLE");
    this.isProcessing = false;
  }

  public getQueue(): ScheduledPackage[] {
    return [...this.queue];
  }
}

export const PresentationScheduler = new PresentationSchedulerClass();
export default PresentationScheduler;
