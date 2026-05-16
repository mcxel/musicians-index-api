import Link from "next/link";
import { getHostBySlug } from "@/lib/hosts/hostRegistry";
import { CO_HOST_REGISTRY } from "@/lib/hosts/coHostRegistry";
import { NPC_AVATAR_REGISTRY } from "@/lib/hosts/npcAvatarRegistry";

type Props = { params: { slug: string } };

export default function HostProfilePage({ params }: Props) {
  const host =
    getHostBySlug(params.slug) ??
    CO_HOST_REGISTRY.find((h) => h.slug === params.slug) ??
    NPC_AVATAR_REGISTRY.find((h) => h.slug === params.slug) ??
    null;

  if (!host) {
    return (
      <main data-testid="host-profile-not-found" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
        <h1>Host Not Found</h1>
        <Link href="/hosts" style={{ color: "#93c5fd" }}>Back to Hosts</Link>
      </main>
    );
  }

  return (
    <main data-testid="host-profile-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 10 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>{host.name}</h1>
      <div data-testid="host-profile-status" style={{ fontSize: 13, color: "#cbd5e1" }}>
        role={host.role} route={host.currentRoute} location={host.currentLocation}
      </div>
      <div data-testid="host-profile-proof" style={{ fontSize: 12, color: "#93c5fd" }}>
        proof={host.proofStatus} avatar={host.avatarState} voice={host.voiceState} animation={host.animationState}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Allowed: {host.allowedRooms.join(", ")}</div>
      <div style={{ fontSize: 12, color: "#fda4af" }}>Blocked: {host.blockedRooms.join(", ")}</div>
      <Link href="/hosts" style={{ color: "#93c5fd" }}>Back to Hosts</Link>
    </main>
  );
}
