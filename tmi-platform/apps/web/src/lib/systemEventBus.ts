export type SystemEventType =
  | "admin.monitor.select"
  | "admin.monitor.open"
  | "admin.monitor.preview"
  | "big-ace.received"
  | "homepage.artifact.state"
  | "homepage.artifact.click"
  | "homepage.artifact.preview"
  | "homepage.artifact.route"
  | "pipeline.sponsor.open"
  | "pipeline.lobby.open"
  | "pipeline.billboard.open"
  | "pipeline.game.open"
  | "lobby.env.interaction"
  | "lobby.prop.used";

export type SystemEvent = {
  id: string;
  type: SystemEventType;
  timestamp: number;
  actor: string;
  sectionId?: string;
  route?: string;
  message: string;
  eventName?: string;
  artistId?: string;
  performerId?: string;
  sourceHomepage?: string;
  sourceFrame?: string;
};

type EventListener = (event: SystemEvent) => void;

declare global {
  interface Window {
    __TMI_SYSTEM_EVENT_LOG__?: SystemEvent[];
    __TMI_EVENT_LOG?: SystemEvent[];
  }
}

const listeners = new Set<EventListener>();
const eventLog: SystemEvent[] = [];

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function publish(event: Omit<SystemEvent, "id" | "timestamp">) {
  const fullEvent: SystemEvent = {
    id: uid(),
    timestamp: Date.now(),
    ...event,
  };

  eventLog.unshift(fullEvent);
  if (eventLog.length > 120) {
    eventLog.length = 120;
  }

  if (typeof window !== "undefined") {
    window.__TMI_SYSTEM_EVENT_LOG__ = [...eventLog];
    window.__TMI_EVENT_LOG = window.__TMI_SYSTEM_EVENT_LOG__;
    try {
      const stored = JSON.parse(sessionStorage.getItem("__TMI_EVENT_LOG") ?? "[]");
      stored.unshift(fullEvent);
      if (stored.length > 120) stored.length = 120;
      sessionStorage.setItem("__TMI_EVENT_LOG", JSON.stringify(stored));
    } catch {
      // sessionStorage unavailable (SSR or private mode)
    }
  }

  for (const listener of listeners) {
    listener(fullEvent);
  }

  return fullEvent;
}

export function emitSystemEvent(event: Omit<SystemEvent, "id" | "timestamp">) {
  return publish(event);
}

export function emitBigAceEvent(sectionId: string, route: string) {
  return publish({
    type: "big-ace.received",
    actor: "Big Ace",
    sectionId,
    route,
    message: `Big Ace acknowledged ${sectionId} -> ${route}`,
  });
}

export function subscribeSystemEvent(listener: EventListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSystemEventLog() {
  return [...eventLog];
}
