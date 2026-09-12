"use client";

/**
 * HostStage — mounts canonical HostIdentityRegistry stage hosts through
 * HostAvatarPresence (idle portrait + blink). LEGACY hostRegistry is not used.
 */

import Link from "next/link";
import { getStageHosts, getHostOwnership, resolveHostFidelityTier } from "@/lib/hosts/HostIdentityRegistry";
import HostAvatarPresence from "./HostAvatarPresence";

export default function HostStage() {
  const hosts = getStageHosts();

  return (
    <section data-testid="host-stage" style={{ display: "grid", gap: 12 }}>
      {hosts.map((host) => (
        <div
          key={host.id}
          data-testid={`host-stage-entity-${host.id}`}
          data-host-ownership={getHostOwnership(host)}
          data-host-fidelity={resolveHostFidelityTier(host)}
          style={{
            display: "grid",
            gap: 8,
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${host.colorHex}55`,
            background: "rgba(5,5,16,0.85)",
          }}
        >
          <HostAvatarPresence host={host} size={140} showChat={false} />
          <div style={{ display: "grid", gap: 4 }}>
            <Link
              href={`/hosts/${host.id}`}
              style={{ color: host.colorHex, fontWeight: 800, fontSize: 14, textDecoration: "none" }}
            >
              {host.name}
            </Link>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.08em" }}>
              {host.role.replace(/_/g, " ")}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", lineHeight: 1.35 }}>
              {host.description}
            </span>
            {host.showAssignments.length > 0 && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>
                Shows: {host.showAssignments.join(", ")}
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
