export type FallbackStrategy = "polling" | "sse" | "long-poll" | "static-snapshot" | "offline-mode";

export interface SocketFallbackState {
  sessionId: string;
  roomId: string;
  strategy: FallbackStrategy;
  activatedAt: string;
  pollIntervalMs: number;
  retryAfterMs: number;
  isActive: boolean;
}

const fallbacks = new Map<string, SocketFallbackState>();

const STRATEGY_DEFAULTS: Record<FallbackStrategy, { pollIntervalMs: number; retryAfterMs: number }> = {
  "polling":          { pollIntervalMs: 5000,  retryAfterMs: 30000  },
  "sse":              { pollIntervalMs: 0,      retryAfterMs: 15000  },
  "long-poll":        { pollIntervalMs: 10000, retryAfterMs: 45000  },
  "static-snapshot":  { pollIntervalMs: 30000, retryAfterMs: 120000 },
  "offline-mode":     { pollIntervalMs: 0,     retryAfterMs: 300000 },
};

export function activateFallback(
  sessionId: string,
  roomId: string,
  strategy: FallbackStrategy = "polling",
): SocketFallbackState {
  const defaults = STRATEGY_DEFAULTS[strategy];
  const state: SocketFallbackState = {
    sessionId,
    roomId,
    strategy,
    activatedAt: new Date().toISOString(),
    pollIntervalMs: defaults.pollIntervalMs,
    retryAfterMs: defaults.retryAfterMs,
    isActive: true,
  };
  fallbacks.set(sessionId, state);
  return state;
}

export function deactivateFallback(sessionId: string): void {
  const state = fallbacks.get(sessionId);
  if (state) fallbacks.set(sessionId, { ...state, isActive: false });
}

export function getFallbackState(sessionId: string): SocketFallbackState | null {
  return fallbacks.get(sessionId) ?? null;
}

export function isUsingFallback(sessionId: string): boolean {
  return fallbacks.get(sessionId)?.isActive === true;
}

export function getActiveFallbacks(): SocketFallbackState[] {
  return [...fallbacks.values()].filter((s) => s.isActive);
}

export function selectOptimalStrategy(latencyMs: number, offlineMode: boolean): FallbackStrategy {
  if (offlineMode) return "offline-mode";
  if (latencyMs < 0)     return "sse";
  if (latencyMs < 200)   return "polling";
  if (latencyMs < 1000)  return "long-poll";
  return "static-snapshot";
}
