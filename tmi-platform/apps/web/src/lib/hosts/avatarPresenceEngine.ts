import { HOST_REGISTRY } from "./hostRegistry";
import { CO_HOST_REGISTRY } from "./coHostRegistry";
import { NPC_AVATAR_REGISTRY } from "./npcAvatarRegistry";

export function getAvatarPresenceSnapshot() {
  const all = [...HOST_REGISTRY, ...CO_HOST_REGISTRY, ...NPC_AVATAR_REGISTRY];
  return {
    total: all.length,
    visible: all.filter((a) => a.avatarState === "visible").length,
    speaking: all.filter((a) => a.voiceState === "speaking").length,
    byRole: {
      hosts: HOST_REGISTRY.length,
      coHosts: CO_HOST_REGISTRY.length,
      npcAvatars: NPC_AVATAR_REGISTRY.length,
    },
  };
}
