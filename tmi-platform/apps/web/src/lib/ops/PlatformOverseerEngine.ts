/**
 * PlatformOverseerEngine
 * Server-side singleton controlling platform launch state.
 * Flags reset on cold start (by design — deliberate toggles only).
 */

export type PlatformVisibility = 'private' | 'soft-launch' | 'public';

export interface OverseerFlags {
  onboardingOpen:  boolean;
  invitesAllowed:  boolean;
  visibility:      PlatformVisibility;
  telemetryOn:     boolean;
}

export interface OverseerSnapshot extends OverseerFlags {
  updatedAt: number;
  updatedBy: string;
}

class PlatformOverseerEngine {
  private flags: OverseerFlags = {
    onboardingOpen: false,
    invitesAllowed: false,
    visibility:     'private',
    telemetryOn:    false,
  };
  private history: OverseerSnapshot[] = [];

  getFlags(): OverseerFlags {
    return { ...this.flags };
  }

  getSnapshot(): OverseerSnapshot {
    const last = this.history.at(-1);
    return { ...this.flags, updatedAt: last?.updatedAt ?? 0, updatedBy: last?.updatedBy ?? 'system' };
  }

  setFlags(partial: Partial<OverseerFlags>, updatedBy: string): OverseerSnapshot {
    this.flags = { ...this.flags, ...partial };
    const snap: OverseerSnapshot = { ...this.flags, updatedAt: Date.now(), updatedBy };
    this.history.push(snap);
    if (this.history.length > 50) this.history.shift();
    return snap;
  }

  activateSoftLaunch(updatedBy: string): OverseerSnapshot {
    return this.setFlags({ onboardingOpen: true, invitesAllowed: true, visibility: 'soft-launch', telemetryOn: true }, updatedBy);
  }

  activatePublic(updatedBy: string): OverseerSnapshot {
    return this.setFlags({ onboardingOpen: true, invitesAllowed: true, visibility: 'public', telemetryOn: true }, updatedBy);
  }

  lockDown(updatedBy: string): OverseerSnapshot {
    return this.setFlags({ onboardingOpen: false, invitesAllowed: false, visibility: 'private', telemetryOn: false }, updatedBy);
  }

  isSoftLaunchReady(): boolean {
    return this.flags.onboardingOpen && this.flags.invitesAllowed && this.flags.visibility !== 'private';
  }

  getHistory(): OverseerSnapshot[] {
    return [...this.history].reverse().slice(0, 20);
  }
}

export const platformOverseer = new PlatformOverseerEngine();
