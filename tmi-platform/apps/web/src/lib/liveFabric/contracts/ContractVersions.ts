/**
 * ContractVersions.ts — Canonical Contract Identifiers for TMI Live Media Fabric
 *
 * Foundation law: version all major contracts to prevent silent breaks in
 * recordings, replays, scheduled rooms, and Observatory tooling.
 */

export const FABRIC_CONTRACT_VERSIONS = {
  LIVE_SESSION_KERNEL: "LiveSessionKernel/1.0",
  SESSION_MEDIA_GRAPH: "SessionMediaGraph/1.0",
  EXPERIENCE_PRESENTATION: "ExperiencePresentation/1.0",
  LIVE_RIGHTS: "LiveRights/1.0",
  LIVE_RECOVERY: "LiveRecovery/1.0",
  SURFACE_COMPOSER: "SurfaceComposer/1.0",
  AUDIO_DIRECTOR: "AudioDirector/1.0",
  DEVICE_BUDGET: "DeviceBudget/1.0",
  LIVE_FRAME_GRAPH: "LiveFrameGraph/1.0",
  TRANSPORT_ROUTER: "LiveTransportRouter/1.0",
  OBSERVATORY: "ObservatoryTelemetry/1.0",
  RECORDING: "RecordingReplay/1.0",
} as const;

export type FabricContractVersion =
  (typeof FABRIC_CONTRACT_VERSIONS)[keyof typeof FABRIC_CONTRACT_VERSIONS];

export const FOUNDATION_REQUIRED_VERSIONS: readonly FabricContractVersion[] = [
  FABRIC_CONTRACT_VERSIONS.LIVE_SESSION_KERNEL,
  FABRIC_CONTRACT_VERSIONS.SESSION_MEDIA_GRAPH,
  FABRIC_CONTRACT_VERSIONS.EXPERIENCE_PRESENTATION,
  FABRIC_CONTRACT_VERSIONS.LIVE_RIGHTS,
  FABRIC_CONTRACT_VERSIONS.LIVE_RECOVERY,
];
