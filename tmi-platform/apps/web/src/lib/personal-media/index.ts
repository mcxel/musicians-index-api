export type { MonitorTarget, ParticipantMediaIdentity, MonitorSlotId } from "./types";
export {
  DEFAULT_MONITOR_A,
  DEFAULT_MONITOR_B,
  MONITOR_A_ID,
  MONITOR_B_ID,
  SLOT_MAIN,
  SPLIT_SLOT_IDS,
  listAddressableMonitorTargets,
  monitorSlotKey,
  PERSONAL_MEDIA_LAW,
} from "./types";

export {
  AUDIO_RESOLUTION_ORDER,
  DEFAULT_PROXIMITY_RANGE_METERS,
  resolvePersonalAudio,
  isWithinProximity,
} from "./audioResolution";
export type { AudioResolutionLayer, PersonalAudioResolution } from "./audioResolution";

export { PersonalMediaRouter, createPersonalMediaRouter, defaultPersonalMediaRouter } from "./PersonalMediaRouter";
export type { PersonalMediaViewSnapshot, PersonalMediaRouterOptions } from "./PersonalMediaRouter";

export {
  PersonalMediaCommandBus,
  createPersonalMediaCommandBus,
  defaultPersonalMediaCommandBus,
  PERSONAL_MEDIA_COMMANDS,
} from "./PersonalMediaCommandBus";
export type { PersonalMediaCommand, PersonalMediaCommandPayloadMap } from "./PersonalMediaCommandBus";

export { createCountingMediaTransport } from "./mediaTransport";
export type { PersonalMediaTransport } from "./mediaTransport";

export { createCountingRoomAuthorityPort } from "./roomAuthorityPort";

export { LIVE_LOUNGE_MEDIA_ROUTING_CERT } from "./certification";

export { getParticipantMediaMenu, labelMonitorTarget } from "./contextActions";
export type { ParticipantMediaMenuItem } from "./contextActions";

export {
  adaptRoomParticipantToMediaIdentity,
  registerAndAdaptParticipant,
} from "./CanonicalParticipantMediaAdapter";
export type { CanonicalParticipantMediaAdapterInput } from "./CanonicalParticipantMediaAdapter";

export {
  consumeCanonicalMonitorAssignment,
  consumeCanonicalMonitorAB,
} from "./CanonicalMonitorAssignmentAdapter";
export type { CanonicalMonitorAssignmentConsumption } from "./CanonicalMonitorAssignmentAdapter";
