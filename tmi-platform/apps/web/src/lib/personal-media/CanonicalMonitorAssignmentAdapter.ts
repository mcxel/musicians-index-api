/**
 * Canonical Monitor A/B assignment consumer.
 *
 * Existing monitor slots read PersonalMediaRouter.getAssignment() instead of
 * opening a second <video> pipeline. Live WebRTC device continuity stays OPEN.
 */

import {
  defaultPersonalMediaRouter,
  type PersonalMediaRouter,
} from "./PersonalMediaRouter";
import {
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  type MonitorTarget,
  type ParticipantMediaIdentity,
} from "./types";

export type CanonicalMonitorAssignmentConsumption = {
  identity: ParticipantMediaIdentity | null;
  target: MonitorTarget;
  streamReconnected: false;
  createdVideoElement: false;
  source: "PersonalMediaRouter.getAssignment";
};

export function consumeCanonicalMonitorAssignment(
  target: MonitorTarget,
  router: PersonalMediaRouter = defaultPersonalMediaRouter,
): CanonicalMonitorAssignmentConsumption {
  return {
    identity: router.getAssignment(target),
    target,
    streamReconnected: false,
    createdVideoElement: false,
    source: "PersonalMediaRouter.getAssignment",
  };
}

export function consumeCanonicalMonitorAB(
  router: PersonalMediaRouter = defaultPersonalMediaRouter,
): {
  monitorA: CanonicalMonitorAssignmentConsumption;
  monitorB: CanonicalMonitorAssignmentConsumption;
} {
  return {
    monitorA: consumeCanonicalMonitorAssignment(DEFAULT_MONITOR_A, router),
    monitorB: consumeCanonicalMonitorAssignment(DEFAULT_MONITOR_B, router),
  };
}
