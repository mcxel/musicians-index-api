/**
 * EventPulseDistributor
 * Fan-out bus: dispatches sync pulse events from the heartbeat to all
 * registered room subscriber callbacks. Supports category filtering,
 * per-room priority queues, and delivery metrics.
 */

export type PulseCategory =
  | 'beat'          // rhythm / audio beat alignment
  | 'drop'          // big moment — beat drop, crowd surge
  | 'vibe-change'   // vibe preset switched
  | 'crowd-surge'   // audience reaction wave
  | 'sponsor-flash' // sponsor overlay moment
  | 'prize-drop'    // prize / NFT drop moment
  | 'admin'         // operator-triggered event
  | 'reset';        // room-reset signal

export interface SyncPulse {
  id: string;              // unique pulse ID (UUID)
  category: PulseCategory;
  fireAt: number;          // UTC ms — when rooms should execute
  payload: Record<string, unknown>;
  originRoomId?: string;   // room that triggered (if user-initiated)
  broadcastAll: boolean;   // true = all rooms, false = targetRooms only
  targetRooms?: string[];  // specific room IDs (when broadcastAll=false)
  sentAt: number;          // Date.now() when distributor dispatched
}

export type PulseHandler = (pulse: SyncPulse) => void;

interface Subscriber {
  roomId: string;
  categories: Set<PulseCategory> | 'all';
  handler: PulseHandler;
}

const subscribers = new Map<string, Subscriber>();
const deliveryLog: Array<{ pulseId: string; roomId: string; deliveredAt: number }> = [];
const MAX_LOG = 200;

function generateId(): string {
  return `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeRoom(
  roomId: string,
  handler: PulseHandler,
  categories: PulseCategory[] | 'all' = 'all',
): () => void {
  const sub: Subscriber = {
    roomId,
    handler,
    categories: categories === 'all' ? 'all' : new Set(categories),
  };
  subscribers.set(roomId, sub);
  return () => subscribers.delete(roomId);
}

export function unsubscribeRoom(roomId: string): void {
  subscribers.delete(roomId);
}

function shouldDeliver(sub: Subscriber, pulse: SyncPulse): boolean {
  if (!pulse.broadcastAll && !pulse.targetRooms?.includes(sub.roomId)) return false;
  if (sub.categories === 'all') return true;
  return sub.categories.has(pulse.category);
}

export function dispatch(
  category: PulseCategory,
  payload: Record<string, unknown>,
  opts: {
    broadcastAll?: boolean;
    targetRooms?: string[];
    originRoomId?: string;
    fireAt?: number;
  } = {},
): SyncPulse {
  const pulse: SyncPulse = {
    id: generateId(),
    category,
    fireAt: opts.fireAt ?? Date.now(),
    payload,
    originRoomId: opts.originRoomId,
    broadcastAll: opts.broadcastAll ?? true,
    targetRooms: opts.targetRooms,
    sentAt: Date.now(),
  };

  let delivered = 0;
  for (const [, sub] of subscribers) {
    if (!shouldDeliver(sub, pulse)) continue;
    try {
      sub.handler(pulse);
      delivered++;
      deliveryLog.push({ pulseId: pulse.id, roomId: sub.roomId, deliveredAt: Date.now() });
      if (deliveryLog.length > MAX_LOG) deliveryLog.shift();
    } catch {
      // subscriber errors must not block other deliveries
    }
  }

  return pulse;
}

export function getSubscriberCount(): number {
  return subscribers.size;
}

export function getRecentDeliveries(limit = 20) {
  return deliveryLog.slice(-limit);
}

export function getSubscribedRooms(): string[] {
  return [...subscribers.keys()];
}
