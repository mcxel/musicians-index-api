"use client";

import { HOST_REGISTRY } from "@/lib/hosts/hostRegistry";
import { CO_HOST_REGISTRY } from "@/lib/hosts/coHostRegistry";
import { NPC_AVATAR_REGISTRY } from "@/lib/hosts/npcAvatarRegistry";
import { getHostRuntimeLog } from "@/lib/hosts/hostRuntimeEngine";
import { runHostProofSummary } from "@/lib/hosts/hostProofEngine";
import { getAvatarPresenceSnapshot } from "@/lib/hosts/avatarPresenceEngine";

export default function HostOperationsMonitor() {
  const proof = runHostProofSummary();
  const presence = getAvatarPresenceSnapshot();
  const logs = getHostRuntimeLog().slice(-20).reverse();

  return (
    <section data-testid="host-operations-monitor" style={{ display: "grid", gap: 10 }}>
      <h2 style={{ margin: 0, color: "#67e8f9", fontSize: 16 }}>Host Operations Monitor</h2>

      <div data-testid="host-proof-summary" style={{ border: "1px solid rgba(56,189,248,0.4)", borderRadius: 10, background: "#0f172a", padding: 10, fontSize: 12, color: "#cbd5e1" }}>
        hosts={String(proof.hostsRegistered)} cohosts={String(proof.coHostsRegistered)} npc={String(proof.npcRegistered)}
        routes={String(proof.allHaveRoutes)} status={String(proof.allHaveStatus)} proof={String(proof.allHaveProofStatus)}
        blockedRooms={String(proof.allBlockedRoomsConfigured)} unsafe={String(proof.unsafeAccessFound)}
      </div>

      <div data-testid="host-presence-snapshot" style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, background: "#0f172a", padding: 10, fontSize: 12, color: "#cbd5e1" }}>
        total={presence.total} visible={presence.visible} speaking={presence.speaking} hosts={presence.byRole.hosts} cohosts={presence.byRole.coHosts} npcs={presence.byRole.npcAvatars}
      </div>

      <div data-testid="host-registry-counts" style={{ fontSize: 12, color: "#93c5fd" }}>
        hostCount={HOST_REGISTRY.length} coHostCount={CO_HOST_REGISTRY.length} npcCount={NPC_AVATAR_REGISTRY.length}
      </div>

      <div data-testid="host-runtime-log" style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, background: "#0f172a", padding: 10, maxHeight: 220, overflow: "auto" }}>
        {logs.length === 0 ? (
          <span style={{ color: "#64748b", fontSize: 12 }}>No runtime events yet.</span>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{ fontSize: 11, color: "#cbd5e1" }}>
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.entityId} {log.action}: {log.detail}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
