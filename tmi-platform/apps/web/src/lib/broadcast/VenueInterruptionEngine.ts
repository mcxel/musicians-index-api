/**
 * VenueInterruptionEngine
 * Manages global, high-urgency platform flashes. 
 * Interrupts active pages and lobbies with "Breaking" venue alerts.
 */

export type InterruptionSeverity = 'info' | 'hype' | 'breaking' | 'world-premiere';

export interface VenueInterruption {
  id: string;
  message: string;
  severity: InterruptionSeverity;
  targetHref: string;
  expiresAt: number;
}

export class VenueInterruptionEngine {
  private static _instance: VenueInterruptionEngine;
  private activeInterruptions: Map<string, VenueInterruption> = new Map();

  public static getInstance(): VenueInterruptionEngine {
    if (!this._instance) {
      this._instance = new VenueInterruptionEngine();
    }
    return this._instance;
  }

  /**
   * Dispatches a global flash. Subscribed clients (like the Home1 Marquee or Room HUDs)
   * will instantly overlay this text using the `tmiAlertGlitch` animation.
   */
  public triggerGlobalFlash(message: string, severity: InterruptionSeverity, href: string, durationMs: number = 15000) {
    const id = `flash-${Date.now()}`;
    const interruption: VenueInterruption = {
      id,
      message,
      severity,
      targetHref: href,
      expiresAt: Date.now() + durationMs
    };

    this.activeInterruptions.set(id, interruption);
    
    // In production: Push this payload over WebSockets to all connected clients
    console.log(`[GLOBAL FLASH TRIGGERED]: ${message} [${severity.toUpperCase()}]`);
  }

  public getActiveInterruptions(): VenueInterruption[] {
    const now = Date.now();
    return Array.from(this.activeInterruptions.values()).filter(int => int.expiresAt > now);
  }
}