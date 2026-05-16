import { HOST_REGISTRY } from "./hostRegistry";
import { CO_HOST_REGISTRY } from "./coHostRegistry";
import { NPC_AVATAR_REGISTRY } from "./npcAvatarRegistry";

export type HostProofSummary = {
  hostsRegistered: boolean;
  coHostsRegistered: boolean;
  npcRegistered: boolean;
  allHaveRoutes: boolean;
  allHaveStatus: boolean;
  allHaveProofStatus: boolean;
  allBlockedRoomsConfigured: boolean;
  unsafeAccessFound: boolean;
};

export function runHostProofSummary(): HostProofSummary {
  const all = [...HOST_REGISTRY, ...CO_HOST_REGISTRY, ...NPC_AVATAR_REGISTRY];

  return {
    hostsRegistered: HOST_REGISTRY.length > 0,
    coHostsRegistered: CO_HOST_REGISTRY.length > 0,
    npcRegistered: NPC_AVATAR_REGISTRY.length > 0,
    allHaveRoutes: all.every((e) => e.currentRoute.startsWith("/")),
    allHaveStatus: all.every((e) => Boolean(e.avatarState) && Boolean(e.voiceState) && Boolean(e.animationState)),
    allHaveProofStatus: all.every((e) => Boolean(e.proofStatus)),
    allBlockedRoomsConfigured: all.every((e) => e.blockedRooms.length > 0),
    unsafeAccessFound: all.some((e) => e.allowedRooms.some((room) => e.blockedRooms.includes(room))),
  };
}
