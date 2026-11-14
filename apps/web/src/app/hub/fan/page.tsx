import { redirect } from "next/navigation";
import FanHubMount from "@/components/auth/FanHubMount";
import HubWorkspaceClosed from "@/components/auth/HubWorkspaceClosed";
import { canonicalWorkspacePath } from "@/lib/auth/canonicalSessionAuthority";
import { authorizeHubWorkspace } from "@/lib/auth/getTmiAuth";
import { resolveSessionDisplayName } from "@/lib/auth/resolveSessionIdentity";

export const dynamic = "force-dynamic";

/**
 * Fan hub renders only after a canonical User lookup authorizes it.
 * Cookie role and hub-shell claims cannot mount the shell alone.
 */

function traceHubPage(detail: Record<string, string | number | boolean | null>) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[hub-auth-trace]", JSON.stringify({ stage: "hub-page", ...detail }));
}

export default async function FanHubPage() {
  const started = Date.now();
  const gate = await authorizeHubWorkspace("fan");
  traceHubPage({
    ms: Date.now() - started,
    outcome: gate.decision.outcome,
    allowed: gate.access.allowed,
    reason: gate.access.allowed ? "open" : gate.access.reason,
  });
  if (!gate.access.allowed) {
    if (gate.access.reason === "role_denied" && gate.decision.outcome === "authenticated") {
      const dest = canonicalWorkspacePath(gate.decision.user, gate.hubShell);
      if (dest !== "/hub/fan") redirect(dest);
    }
    return (
      <HubWorkspaceClosed
        reason={gate.access.reason === "unavailable" ? "unavailable" : "unauthenticated"}
        retryHref="/hub/fan"
      />
    );
  }

  const publishedRoomId =
    gate.decision.outcome === "authenticated" &&
    gate.decision.user.isLive &&
    gate.decision.user.liveRoomId
      ? gate.decision.user.liveRoomId
      : null;

  return (
    <div data-hub-auth-build="2026-10-01-trace" data-published-room-id={publishedRoomId ?? undefined}>
      <FanHubMount
        publishedRoomId={publishedRoomId}
        session={{
          identity: "FAN",
          rawRole: gate.access.role,
          userId: gate.access.userId,
          displayName: resolveSessionDisplayName({
            email: gate.access.email,
            dbName: gate.access.name,
            userId: gate.access.userId,
          }),
        }}
      />
    </div>
  );
}
