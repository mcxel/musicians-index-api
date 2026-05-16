export type HostAvatarState = "visible" | "hidden" | "transition";
export type HostVoiceState = "muted" | "ready" | "speaking";
export type HostAnimationState = "idle" | "cue" | "speaking" | "transition";

export type HostEntity = {
  id: string;
  slug: string;
  name: string;
  role: "host";
  avatarState: HostAvatarState;
  voiceState: HostVoiceState;
  animationState: HostAnimationState;
  currentRoute: string;
  currentLocation: string;
  allowedRooms: string[];
  blockedRooms: string[];
  currentTask: string;
  cueScript: string;
  safetyRules: string[];
  proofStatus: "pending" | "pass" | "fail";
  adminMonitorTarget: string;
};

export const HOST_REGISTRY: HostEntity[] = [
  {
    id: "host-marcel",
    slug: "marcel",
    name: "Marcel Prime",
    role: "host",
    avatarState: "visible",
    voiceState: "ready",
    animationState: "idle",
    currentRoute: "/hosts/marcel",
    currentLocation: "main-stage",
    allowedRooms: ["main-lobby", "cypher-arena", "public-stage"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "standby",
    cueScript: "Welcome to TMI stage",
    safetyRules: ["no-private-room-access", "minor-safety-hard-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/hosts",
  },
  {
    id: "host-journey",
    slug: "ray-journey",
    name: "Ray Journey",
    role: "host",
    avatarState: "visible",
    voiceState: "ready",
    animationState: "idle",
    currentRoute: "/hosts/ray-journey",
    currentLocation: "contest-stage",
    allowedRooms: ["main-lobby", "public-stage"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "cue-wait",
    cueScript: "Cue pending",
    safetyRules: ["no-private-room-access", "age-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/hosts",
  },
];

export function getHostBySlug(slug: string): HostEntity | undefined {
  return HOST_REGISTRY.find((h) => h.slug === slug);
}
