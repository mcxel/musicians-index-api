import type { TmiHomepageBeltKey } from "@/lib/homepage/tmiHomepageBeltEngine";

export type TmiHomepageBotTelemetryEvent = {
  id: string;
  page: TmiHomepageBeltKey;
  action: "hover" | "click" | "route" | "fallback";
  target: string;
  at: number;
};

const EVENTS: TmiHomepageBotTelemetryEvent[] = [];

export function emitHomepageBotTelemetry(event: Omit<TmiHomepageBotTelemetryEvent, "id" | "at">): TmiHomepageBotTelemetryEvent {
  const built: TmiHomepageBotTelemetryEvent = {
    id: `hp-bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    ...event,
  };
  EVENTS.unshift(built);
  if (EVENTS.length > 500) EVENTS.length = 500;
  return built;
}

export function listHomepageBotTelemetry(limit = 50): TmiHomepageBotTelemetryEvent[] {
  return EVENTS.slice(0, Math.max(1, limit));
}
