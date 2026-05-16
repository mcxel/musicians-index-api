import type { HostAvatarState, HostVoiceState, HostAnimationState } from "./hostRegistry";

export type NpcAvatarEntity = {
  id: string;
  slug: string;
  name: string;
  role: "npc-avatar";
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

export const NPC_AVATAR_REGISTRY: NpcAvatarEntity[] = [
  {
    id: "npc-guide-1",
    slug: "guide-echo",
    name: "Guide Echo",
    role: "npc-avatar",
    avatarState: "visible",
    voiceState: "muted",
    animationState: "idle",
    currentRoute: "/hosts/guide-echo",
    currentLocation: "home-1-canvas",
    allowedRooms: ["main-lobby", "home1", "home2", "home3", "home4", "home5"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "route-guide",
    cueScript: "Tap to explore",
    safetyRules: ["public-only", "no-private-room-access", "minor-safety-hard-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/npc-avatars",
  },
  {
    id: "npc-hype-1",
    slug: "hype-pulse",
    name: "Hype Pulse",
    role: "npc-avatar",
    avatarState: "visible",
    voiceState: "ready",
    animationState: "idle",
    currentRoute: "/hosts/hype-pulse",
    currentLocation: "public-stage",
    allowedRooms: ["main-lobby", "public-stage", "cypher-arena"],
    blockedRooms: ["private-room-1", "minor-private-1"],
    currentTask: "ambient-hype",
    cueScript: "Crowd pulse up",
    safetyRules: ["public-only", "no-private-room-access", "minor-safety-hard-gate"],
    proofStatus: "pending",
    adminMonitorTarget: "/admin/npc-avatars",
  },
];
