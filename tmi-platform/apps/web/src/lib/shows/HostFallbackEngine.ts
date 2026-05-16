/**
 * Host Fallback Engine
 * Replaces absent host with bot host fallback for continuity.
 */

export interface HostRuntimePresence {
  hostId: string;
  showId: string;
  online: boolean;
  checkedAtMs: number;
}

export interface HostFallbackAssignment {
  showId: string;
  primaryHostId: string;
  activeHostId: string;
  fallbackHostId: string;
  usedFallback: boolean;
  reason: 'primary-online' | 'primary-absent';
}

const DEFAULT_FALLBACK_HOST_ID = 'bot-host-sentinel';

export class HostFallbackEngine {
  assign(showId: string, primaryHostId: string, presence: HostRuntimePresence): HostFallbackAssignment {
    const useFallback = !presence.online;
    return {
      showId,
      primaryHostId,
      activeHostId: useFallback ? DEFAULT_FALLBACK_HOST_ID : primaryHostId,
      fallbackHostId: DEFAULT_FALLBACK_HOST_ID,
      usedFallback: useFallback,
      reason: useFallback ? 'primary-absent' : 'primary-online',
    };
  }
}

export const hostFallbackEngine = new HostFallbackEngine();
