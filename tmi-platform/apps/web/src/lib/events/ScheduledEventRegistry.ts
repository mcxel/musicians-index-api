/**
 * Minimal scheduled-event glue — canonical timezone windows for flagship shows.
 * Bots and UI read this registry; no parallel scheduler product.
 */

import { getMondayNightStageWindow, type MondayNightStageWindow } from "@/lib/shows/MondayShowtime";
import { getShowHosts } from "@/lib/hosts/HostShowAssignmentEngine";

export type ScheduledEventPhase = MondayNightStageWindow["phase"];

export interface ScheduledEventDefinition {
  eventId: string;
  title: string;
  timezone: string;
  /** RRULE-style hint for bots (Monday weekly 8PM ET live window). */
  recurrence: string;
  entryRoute: string;
  hostShowId: string;
}

const MONDAY_NIGHT_STAGE: ScheduledEventDefinition = {
  eventId: "monday-night-stage",
  title: "Monday Night Stage",
  timezone: "America/New_York",
  recurrence: "FREQ=WEEKLY;BYDAY=MO;BYHOUR=20;BYMINUTE=0",
  entryRoute: "/shows/monday-night-stage",
  hostShowId: "monday-night-stage",
};

const REGISTRY: Record<string, ScheduledEventDefinition> = {
  "monday-night-stage": MONDAY_NIGHT_STAGE,
};

export function getScheduledEventDefinition(eventId: string): ScheduledEventDefinition | undefined {
  return REGISTRY[eventId];
}

export function getMondayNightStageSchedule(from: Date = new Date()): MondayNightStageWindow & {
  definition: ScheduledEventDefinition;
  hosts: ReturnType<typeof getShowHosts>;
} {
  return {
    ...getMondayNightStageWindow(from),
    definition: MONDAY_NIGHT_STAGE,
    hosts: getShowHosts("monday-night-stage"),
  };
}

/**
 * General entry point — returns the normalized schedule phase for any
 * registered event. Components should call this rather than directly calling
 * event-specific window functions.
 */
export type EventScheduleStatus = ScheduledEventPhase;

export function getEventScheduleStatus(eventId: string, from: Date = new Date()): EventScheduleStatus {
  if (eventId === "monday-night-stage") {
    return getMondayNightStageWindow(from).phase;
  }
  return "CLOSED";
}

/** Human-readable label for when the event opens next — for countdown UIs. */
export function getEventNextLabel(eventId: string, from: Date = new Date()): string {
  if (eventId === "monday-night-stage") {
    return getMondayNightStageWindow(from).label;
  }
  return "Check back soon";
}

/** True when the event is live or in preshow (access should be granted). */
export function isEventAccessible(eventId: string, from: Date = new Date()): boolean {
  const phase = getEventScheduleStatus(eventId, from);
  return phase === "LIVE" || phase === "PRESHOW";
}
