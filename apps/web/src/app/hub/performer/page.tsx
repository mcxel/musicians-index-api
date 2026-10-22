import { redirect } from "next/navigation";
import PerformerHubMount from "@/components/auth/PerformerHubMount";
import HubWorkspaceClosed from "@/components/auth/HubWorkspaceClosed";
import { canonicalWorkspacePath } from "@/lib/auth/canonicalSessionAuthority";
import { authorizeHubWorkspace } from "@/lib/auth/getTmiAuth";
import { resolveSessionDisplayName } from "@/lib/auth/resolveSessionIdentity";

export const dynamic = "force-dynamic";

/**
 * Performer hub renders only after a canonical User lookup authorizes it.
 * tmi_role, tmi_hub_shell, and tmi_uid_sig cannot mount the shell alone.
 */

export default async function PerformerHubPage() {
  const gate = await authorizeHubWorkspace("performer");
  if (!gate.access.allowed) {
    if (gate.access.reason === "role_denied" && gate.decision.outcome === "authenticated") {
      const dest = canonicalWorkspacePath(gate.decision.user, gate.hubShell);
      if (dest !== "/hub/performer") redirect(dest);
    }
    return (
      <HubWorkspaceClosed
        reason={gate.access.reason === "unavailable" ? "unavailable" : "unauthenticated"}
        retryHref="/hub/performer"
      />
    );
  }

  return (
    <PerformerHubMount
      session={{
        identity: "PERFORMER",
        rawRole: gate.access.role,
        userId: gate.access.userId,
        displayName: resolveSessionDisplayName({
          email: gate.access.email,
          dbName: gate.access.name,
          userId: gate.access.userId,
        }),
      }}
    />
  );
}
