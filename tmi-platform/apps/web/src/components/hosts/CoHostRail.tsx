"use client";

import { CO_HOST_REGISTRY } from "@/lib/hosts/coHostRegistry";
import HostStatusCard from "./HostStatusCard";

export default function CoHostRail() {
  return (
    <section data-testid="co-host-rail" style={{ display: "grid", gap: 8 }}>
      {CO_HOST_REGISTRY.map((coHost) => (
        <HostStatusCard
          key={coHost.id}
          id={coHost.id}
          name={coHost.name}
          role={coHost.role}
          currentRoute={coHost.currentRoute}
          currentTask={coHost.currentTask}
          avatarState={coHost.avatarState}
          voiceState={coHost.voiceState}
          animationState={coHost.animationState}
          proofStatus={coHost.proofStatus}
        />
      ))}
    </section>
  );
}
