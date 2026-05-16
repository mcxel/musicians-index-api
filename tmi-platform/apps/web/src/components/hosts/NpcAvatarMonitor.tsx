"use client";

import { NPC_AVATAR_REGISTRY } from "@/lib/hosts/npcAvatarRegistry";
import HostStatusCard from "./HostStatusCard";

export default function NpcAvatarMonitor() {
  return (
    <section data-testid="npc-avatar-monitor" style={{ display: "grid", gap: 8 }}>
      {NPC_AVATAR_REGISTRY.map((npc) => (
        <HostStatusCard
          key={npc.id}
          id={npc.id}
          name={npc.name}
          role={npc.role}
          currentRoute={npc.currentRoute}
          currentTask={npc.currentTask}
          avatarState={npc.avatarState}
          voiceState={npc.voiceState}
          animationState={npc.animationState}
          proofStatus={npc.proofStatus}
        />
      ))}
    </section>
  );
}
