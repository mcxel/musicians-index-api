// Event Bus - Minimal Types
export type EventCallback<T = unknown> = (payload: T) => void;
export interface EventSubscription { unsubscribe: () => void; }
