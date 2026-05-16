"use client";

import { HOST_REGISTRY } from "@/lib/hosts/hostRegistry";
import HostStatusCard from "./HostStatusCard";
import HostCuePanel from "./HostCuePanel";

export default function HostStage() {
  return (
    <section data-testid="host-stage" style={{ display: "grid", gap: 12 }}>
      {HOST_REGISTRY.map((host) => (
        <div key={host.id} data-testid={`host-stage-entity-${host.id}`} style={{ display: "grid", gap: 8 }}>
          <HostStatusCard
            id={host.id}
            name={host.name}
            role={host.role}
            currentRoute={host.currentRoute}
            currentTask={host.currentTask}
            avatarState={host.avatarState}
            voiceState={host.voiceState}
            animationState={host.animationState}
            proofStatus={host.proofStatus}
          />
          <HostCuePanel hostId={host.id} />
        </div>
      ))}
    </section>
  );
}
