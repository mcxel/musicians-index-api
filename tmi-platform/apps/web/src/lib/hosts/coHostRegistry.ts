import type { HostEntity } from "./hostRegistry";

export type CoHostEntity = Omit<HostEntity, "role"> & { role: "co-host" };

export const CO_HOST_REGISTRY: CoHostEntity[] = [
  {
    id: "cohost-julius",
    slug: "julius",
    name: "Julius Spark",
    role: "co-host",
    avatarState: "visible",
    voiceState: "ready",
    animationState: "idle",
    currentRoute: "/hosts/julius",
    currentLocation: "co-host-rail-left",
    allowedRooms: ["main-lobby", "cypher-arena", "public-stage"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "support-host",
    cueScript: "Co-host standby",
    safetyRules: ["public-only", "minor-safety-hard-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/co-hosts",
  },
  {
    id: "cohost-aura",
    slug: "aura",
    name: "Aura Voice",
    role: "co-host",
    avatarState: "visible",
    voiceState: "ready",
    animationState: "idle",
    currentRoute: "/hosts/aura",
    currentLocation: "co-host-rail-right",
    allowedRooms: ["main-lobby", "public-stage"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "announce",
    cueScript: "PA cues ready",
    safetyRules: ["public-only", "minor-safety-hard-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/co-hosts",
  },
];
