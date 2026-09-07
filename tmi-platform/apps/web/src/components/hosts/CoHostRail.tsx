"use client";

/**
 * CoHostRail — Bebo, Kira, Julius, Aura from HostIdentityRegistry via
 * the same HostAvatarPresence path as HostStage.
 */

import Link from "next/link";
import { getCoHostLineup, getHostOwnership, resolveHostFidelityTier } from "@/lib/hosts/HostIdentityRegistry";
import HostAvatarPresence from "./HostAvatarPresence";

export default function CoHostRail() {
  const coHosts = getCoHostLineup();

  return (
    <section data-testid="co-host-rail" style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "#FF9900",
          fontWeight: 800,
        }}
      >
        CO-HOSTS + COMPANIONS
      </div>
      {coHosts.map((host) => (
        <div
          key={host.id}
          data-testid={`co-host-entity-${host.id}`}
          data-host-ownership={getHostOwnership(host)}
          data-host-fidelity={resolveHostFidelityTier(host)}
          style={{
            display: "grid",
            gap: 6,
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${host.colorHex}44`,
            background: "rgba(5,5,16,0.85)",
          }}
        >
          <HostAvatarPresence host={host} size={110} showChat={false} />
          <Link
            href={`/hosts/${host.id}`}
            style={{ color: host.colorHex, fontWeight: 800, fontSize: 13, textDecoration: "none" }}
          >
            {host.name}
          </Link>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.06em" }}>
            {host.role.replace(/_/g, " ")}
          </span>
        </div>
      ))}
    </section>
  );
}
