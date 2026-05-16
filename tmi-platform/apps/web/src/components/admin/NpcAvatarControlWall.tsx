"use client";

import { NPC_AVATAR_REGISTRY } from "@/lib/hosts/npcAvatarRegistry";

export default function NpcAvatarControlWall() {
  return (
    <section data-testid="npc-avatar-control-wall" style={{ display: "grid", gap: 8 }}>
      {NPC_AVATAR_REGISTRY.map((npc) => (
        <article
          key={npc.id}
          data-testid={`npc-avatar-control-${npc.id}`}
          style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, background: "#0f172a", padding: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong style={{ color: "#e2e8f0", fontSize: 13 }}>{npc.name}</strong>
            <span style={{ color: "#93c5fd", fontSize: 11 }}>{npc.role}</span>
          </div>
          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 6 }}>route={npc.currentRoute}</div>
          <div style={{ fontSize: 11, color: "#cbd5e1" }}>task={npc.currentTask}</div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>
            allowed=[{npc.allowedRooms.join(", ")}] blocked=[{npc.blockedRooms.join(", ")}]
          </div>
        </article>
      ))}
    </section>
  );
}
