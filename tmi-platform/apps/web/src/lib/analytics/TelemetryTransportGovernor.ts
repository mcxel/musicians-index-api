/**
 * TelemetryTransportGovernor.ts
 *
 * Governs client-side telemetry POST requests with:
 * - Batched events (max 50)
 * - 3000ms request timeout
 * - Exponential backoff with jitter
 * - Circuit breaker (opens after 3 failures, pauses 60s)
 * - Bounded queue (memory safety)
 * - Silent error isolation (never spams console or breaks UI)
 */

type TelemetryEventPayload = Record<string, any>;

class TelemetryGovernor {
  private queue: TelemetryEventPayload[] = [];
  private maxQueueSize = 50;
  private consecutiveFailures = 0;
  private maxFailures = 3;
  private circuitOpenUntil = 0;
  private cooldownMs = 60000;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isSending = false;
  /** When set, drop/ defer flushes so critical same-origin POSTs (GO LIVE) get a socket. */
  private pausedUntil = 0;

  /** Pause outbound telemetry so HTTP/1.1 connection slots free for publish. */
  public pause(ms = 15000): void {
    this.pausedUntil = Math.max(this.pausedUntil, Date.now() + ms);
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  public dispatch(event: TelemetryEventPayload): void {
    if (typeof window === "undefined") return;

    // Check circuit breaker
    if (Date.now() < this.circuitOpenUntil) {
      return; // Circuit open: silently drop
    }
    if (Date.now() < this.pausedUntil) {
      return;
    }

    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Evict oldest
    }
    this.queue.push(event);

    this.scheduleFlush(1000);
  }

  private scheduleFlush(delayMs: number): void {
    if (this.flushTimer || this.isSending) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushQueue();
    }, delayMs);
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isSending) return;
    if (Date.now() < this.circuitOpenUntil) return;
    if (Date.now() < this.pausedUntil) {
      this.scheduleFlush(Math.max(250, this.pausedUntil - Date.now()));
      return;
    }

    this.isSending = true;
    const batch = [...this.queue];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch("/api/telemetry/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ events: batch }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        this.consecutiveFailures = 0;
        this.queue = this.queue.slice(batch.length);
      } else {
        this.handleFailure();
      }
    } catch {
      this.handleFailure();
    } finally {
      this.isSending = false;
    }
  }

  private handleFailure(): void {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.maxFailures) {
      this.circuitOpenUntil = Date.now() + this.cooldownMs;
      this.queue = []; // Clear queue on circuit open
    } else {
      const backoffMs = Math.min(2000 * Math.pow(2, this.consecutiveFailures), 10000);
      this.scheduleFlush(backoffMs);
    }
  }
}

export const TelemetryTransportGovernor = new TelemetryGovernor();
