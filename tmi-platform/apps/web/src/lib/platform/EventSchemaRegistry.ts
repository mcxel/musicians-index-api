/**
 * EventSchemaRegistry — catalogs canonical event names/shapes already in use.
 * Does NOT invent a second event bus. Points at PresentationEvents + existing buses.
 */

export type EventBusOwner =
  | "presentation-events"
  | "event-bus"
  | "runtime-event-bus"
  | "system-event-bus"
  | "dom-custom-event";

export interface EventSchemaEntry {
  name: string;
  bus: EventBusOwner;
  /** TypeScript type / interface name when known */
  payloadType?: string;
  sourceModule: string;
  description: string;
  /** Sample shape keys — documentation only, not a second schema language */
  shapeKeys?: string[];
}

const ENTRIES: EventSchemaEntry[] = [
  // Presentation semantic events (canonical TV grammar)
  {
    name: "BATTLE_START",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Battle runtime starts — Presentation resolves intro phase.",
    shapeKeys: ["roomId", "leftLabel", "rightLabel", "packageId"],
  },
  {
    name: "BATTLE_INTRO",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Battle intro package phase.",
    shapeKeys: ["roomId", "roundLabel"],
  },
  {
    name: "VS_REVEAL",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "VS badge / competitor reveal.",
    shapeKeys: ["leftLabel", "rightLabel"],
  },
  {
    name: "PERFORMER_TURN",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Active performer turn / focus.",
    shapeKeys: ["performerLabel", "cameraCue"],
  },
  {
    name: "PERFORMANCE_START",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Performance segment begins.",
    shapeKeys: ["performerLabel"],
  },
  {
    name: "VOTING_OPEN",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Voting UI surfaces — scores remain real/null only.",
    shapeKeys: ["roomId"],
  },
  {
    name: "VOTING_CLOSE",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Voting window closes.",
  },
  {
    name: "WINNER_DECLARED",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Winner phase — winnerLabel from real result only.",
    shapeKeys: ["winnerLabel"],
  },
  {
    name: "ROUND_COMPLETE",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Round complete / celebration handoff.",
  },
  {
    name: "SHOW_IDLE",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Show returns to idle.",
  },
  {
    name: "CRITICAL_ALERT",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Critical alert overlay — safety / ops.",
    shapeKeys: ["alertMessage"],
  },
  {
    name: "CYPHER_START",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Cypher pack entry (Phase 5.1).",
    shapeKeys: ["roomId", "packageId"],
  },
  {
    name: "CHALLENGE_START",
    bus: "presentation-events",
    payloadType: "PresentationEventPayload",
    sourceModule: "lib/presentation/PresentationEvents.ts",
    description: "Challenge pack entry (Phase 5.1).",
    shapeKeys: ["roomId", "packageId"],
  },
  {
    name: "tmi:presentation:show_package",
    bus: "dom-custom-event",
    payloadType: "ActiveShowPackageSnapshot",
    sourceModule: "lib/presentation/ShowPackageDirector.ts",
    description: "DOM bridge when show package snapshot updates.",
    shapeKeys: ["packId", "phaseId", "mode", "activeSurfaceIds"],
  },
  {
    name: "tmi:presentation:placement_intent",
    bus: "dom-custom-event",
    payloadType: "PlacementIntent",
    sourceModule: "lib/presentation/directors/types.ts",
    description: "Director placement intents for monitors/overlays.",
    shapeKeys: ["directorId", "anchorId", "layer", "surfaceId"],
  },
  {
    name: "tmi:presentation:telemetry",
    bus: "dom-custom-event",
    payloadType: "PresentationDirectorTelemetry",
    sourceModule: "lib/presentation/directors/PresentationTelemetryDirector.ts",
    description: "Aggregated director telemetry for Observatory preview.",
  },
  // Existing EventBus (lib/events/EventBus.ts) — sample of canonical runtime names
  {
    name: "WORKSPACE_ACTIVATED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Workspace activated.",
    shapeKeys: ["type", "timestamp", "data", "source"],
  },
  {
    name: "CAMERA_CHANGED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Scene/camera changed.",
  },
  {
    name: "LIGHTING_CHANGED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Scene lighting changed.",
  },
  {
    name: "AUDIENCE_UPDATED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Audience membership/presence updated.",
  },
  {
    name: "EXPERIENCE_STARTED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Experience runtime started.",
  },
  {
    name: "ROUND_CHANGED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Competition/experience round changed.",
  },
  {
    name: "ERROR_OCCURRED",
    bus: "event-bus",
    payloadType: "EventPayload",
    sourceModule: "lib/events/EventBus.ts",
    description: "Runtime error telemetry.",
  },
  // RuntimeEventBus typed payloads
  {
    name: "VENUE_OPEN",
    bus: "runtime-event-bus",
    payloadType: "VenueOpenedPayload",
    sourceModule: "lib/runtime/RuntimeEventTypes.ts",
    description: "Venue opened with typed capacity/type.",
    shapeKeys: ["venueId", "venueType", "capacity"],
  },
  {
    name: "OVERLAY_DISPLAYED",
    bus: "runtime-event-bus",
    payloadType: "OverlayDisplayedPayload",
    sourceModule: "lib/runtime/RuntimeEventTypes.ts",
    description: "Broadcast overlay displayed.",
    shapeKeys: ["overlayId", "overlayType", "destinations", "holdMs"],
  },
  {
    name: "MEDIA_PLAY",
    bus: "runtime-event-bus",
    payloadType: "MediaPlayPayload",
    sourceModule: "lib/runtime/RuntimeEventTypes.ts",
    description: "Media item play.",
    shapeKeys: ["itemId", "title", "artistName", "sourceType"],
  },
  {
    name: "mainframe.route",
    bus: "dom-custom-event",
    payloadType: "AuditHook",
    sourceModule: "lib/mainframe/MainframeCoordinator.ts",
    description: "Mainframe route audit (thin coordinator).",
    shapeKeys: ["eventName", "actor", "frameworkId"],
  },
];

const BY_NAME = new Map(ENTRIES.map((e) => [e.name, e]));

export function listEventSchemas(): EventSchemaEntry[] {
  return [...ENTRIES];
}

export function getEventSchema(name: string): EventSchemaEntry | undefined {
  return BY_NAME.get(name);
}

export function listEventSchemasByBus(bus: EventBusOwner): EventSchemaEntry[] {
  return ENTRIES.filter((e) => e.bus === bus);
}

export const EventSchemaRegistry = {
  list: listEventSchemas,
  get: getEventSchema,
  byBus: listEventSchemasByBus,
};

export default EventSchemaRegistry;
