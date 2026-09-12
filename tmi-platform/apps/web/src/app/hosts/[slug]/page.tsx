import Link from "next/link";
import {
  getHostById,
  getHostOwnership,
  resolveHostFidelityTier,
} from "@/lib/hosts/HostIdentityRegistry";
import HostAvatarPresence from "@/components/hosts/HostAvatarPresence";

type Props = { params: { slug: string } };

/**
 * Host profile — HostIdentityRegistry + HostAvatarPresence only.
 * Ownership PLATFORM_HOST; fidelity from resolveHostFidelityTier (Rule 20/26/28).
 */
export default function HostProfilePage({ params }: Props) {
  const host = getHostById(params.slug) ?? null;

  if (!host) {
    return (
      <main
        data-testid="host-profile-not-found"
        style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}
      >
        <h1>Host Not Found</h1>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          No host with id <code>{params.slug}</code> in HostIdentityRegistry.
        </p>
        <Link href="/hosts" style={{ color: "#93c5fd" }}>
          Back to Hosts
        </Link>
      </main>
    );
  }

  const ownership = getHostOwnership(host);
  const fidelity = resolveHostFidelityTier(host);

  return (
    <main
      data-testid="host-profile-page"
      data-host-id={host.id}
      data-host-ownership={ownership}
      data-host-fidelity={fidelity}
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        padding: 20,
        display: "grid",
        gap: 14,
        justifyItems: "start",
      }}
    >
      <HostAvatarPresence host={host} size={200} showChat />
      <h1 style={{ margin: 0, color: host.colorHex }}>{host.name}</h1>
      <div data-testid="host-profile-status" style={{ fontSize: 13, color: "#cbd5e1" }}>
        ownership={ownership} · fidelity={fidelity} · role={host.role}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        pipeline=IAvatarRenderer (2D_ANIMATED today) · same contract as fan avatars · platform-owned
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 520, lineHeight: 1.45, margin: 0 }}>
        {host.description}
      </p>
      {host.showAssignments.length > 0 && (
        <div style={{ fontSize: 12, color: "#93c5fd" }}>
          Show assignments: {host.showAssignments.join(", ")}
        </div>
      )}
      {!host.portraitUrl && (
        <div style={{ fontSize: 12, color: "#fbbf24" }}>
          No portrait asset bound — identity is real; idle sprite unavailable (UNBOUND).
        </div>
      )}
      <Link href="/hosts" style={{ color: "#93c5fd" }}>
        Back to Hosts
      </Link>
    </main>
  );
}
