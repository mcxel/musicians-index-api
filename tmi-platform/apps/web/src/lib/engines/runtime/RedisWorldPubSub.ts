/**
 * RedisWorldPubSub
 * Abstraction over Redis pub/sub with in-memory fallback.
 * Works in development with zero configuration.
 * In production: set REDIS_URL in .env.local — the adapter auto-upgrades.
 *
 * Consumers never know which transport is active.
 */

export type PubSubMessage = {
  channel: string;
  data: Record<string, unknown>;
  publishedAt: number;
};

export type MessageHandler = (message: PubSubMessage) => void;

// ── In-memory adapter ────────────────────────────────────────────────────────

class InMemoryPubSub {
  private subs = new Map<string, Set<MessageHandler>>();
  private log: PubSubMessage[] = [];
  private readonly MAX_LOG = 500;

  publish(channel: string, data: Record<string, unknown>): void {
    const msg: PubSubMessage = { channel, data, publishedAt: Date.now() };
    this.log.push(msg);
    if (this.log.length > this.MAX_LOG) this.log.shift();

    const handlers = this.subs.get(channel);
    if (!handlers) return;
    for (const h of handlers) {
      try { h(msg); } catch { /* handler errors don't block other subscribers */ }
    }
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.subs.has(channel)) this.subs.set(channel, new Set());
    this.subs.get(channel)!.add(handler);
    return () => this.subs.get(channel)?.delete(handler);
  }

  getRecentMessages(channel: string, limit = 20): PubSubMessage[] {
    return this.log.filter((m) => m.channel === channel).slice(-limit);
  }

  getChannelCount(): number {
    return this.subs.size;
  }

  getSubscriberCount(): number {
    let n = 0;
    for (const s of this.subs.values()) n += s.size;
    return n;
  }
}

// ── Redis adapter (lazy-loaded, only when REDIS_URL present) ─────────────────

// We type just what we need from ioredis to avoid a hard dependency.
interface RedisLike {
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string): Promise<unknown>;
  on(event: 'message', handler: (channel: string, message: string) => void): void;
  quit(): Promise<string>;
}

class RedisPubSub {
  private pub: RedisLike;
  private sub: RedisLike;
  private subs = new Map<string, Set<MessageHandler>>();
  private log: PubSubMessage[] = [];
  private readonly MAX_LOG = 500;

  constructor(pub: RedisLike, sub: RedisLike) {
    this.pub = pub;
    this.sub = sub;
    this.sub.on('message', (channel, raw) => {
      let data: Record<string, unknown>;
      try { data = JSON.parse(raw) as Record<string, unknown>; }
      catch { data = { raw }; }
      const msg: PubSubMessage = { channel, data, publishedAt: Date.now() };
      this.log.push(msg);
      if (this.log.length > this.MAX_LOG) this.log.shift();
      const handlers = this.subs.get(channel);
      if (!handlers) return;
      for (const h of handlers) {
        try { h(msg); } catch { /* ignore */ }
      }
    });
  }

  publish(channel: string, data: Record<string, unknown>): void {
    void this.pub.publish(channel, JSON.stringify(data));
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.subs.has(channel)) {
      this.subs.set(channel, new Set());
      void this.sub.subscribe(channel);
    }
    this.subs.get(channel)!.add(handler);
    return () => this.subs.get(channel)?.delete(handler);
  }

  getRecentMessages(channel: string, limit = 20): PubSubMessage[] {
    return this.log.filter((m) => m.channel === channel).slice(-limit);
  }

  getChannelCount(): number { return this.subs.size; }
  getSubscriberCount(): number {
    let n = 0;
    for (const s of this.subs.values()) n += s.size;
    return n;
  }
}

// ── Singleton transport ──────────────────────────────────────────────────────

let transport: InMemoryPubSub | RedisPubSub | null = null;
let transportType: 'memory' | 'redis' = 'memory';

async function getTransport(): Promise<InMemoryPubSub | RedisPubSub> {
  if (transport) return transport;

  const redisUrl = process.env['REDIS_URL'];
  if (redisUrl) {
    try {
      // webpackIgnore: true keeps ioredis out of client bundles — only resolves at Node.js runtime
      const { default: Redis } = (await import(/* webpackIgnore: true */ 'ioredis')) as { default: new (url: string) => RedisLike };
      const pub = new Redis(redisUrl);
      const sub = new Redis(redisUrl);
      transport = new RedisPubSub(pub, sub);
      transportType = 'redis';
      return transport;
    } catch {
      // ioredis not installed or connection failed — fall through to memory
    }
  }

  transport = new InMemoryPubSub();
  transportType = 'memory';
  return transport;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function pubSubPublish(channel: string, data: Record<string, unknown>): Promise<void> {
  const t = await getTransport();
  t.publish(channel, data);
}

export async function pubSubSubscribe(channel: string, handler: MessageHandler): Promise<() => void> {
  const t = await getTransport();
  return t.subscribe(channel, handler);
}

export async function getPubSubMessages(channel: string, limit = 20): Promise<PubSubMessage[]> {
  const t = await getTransport();
  return t.getRecentMessages(channel, limit);
}

export function getPubSubTransportType(): 'memory' | 'redis' {
  return transportType;
}

export async function getPubSubStats(): Promise<{ transport: string; channels: number; subscribers: number }> {
  const t = await getTransport();
  return { transport: transportType, channels: t.getChannelCount(), subscribers: t.getSubscriberCount() };
}

// Named channels
export const CHANNELS = {
  WORLD_STATE:    'tmi:world-state',
  PULSE:          'tmi:pulse',
  SNAPSHOT:       'tmi:snapshot',
  HEALTH:         'tmi:health',
  ALERT:          'tmi:alert',
  CHECKPOINT:     'tmi:checkpoint',
} as const;
