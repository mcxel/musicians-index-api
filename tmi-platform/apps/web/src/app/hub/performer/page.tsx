import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PerformerHubMount from "@/components/auth/PerformerHubMount";
import PerformerHubSessionFallback from "@/components/auth/PerformerHubSessionFallback";
import {
  classifyShellIdentity,
  hubPathForIdentity,
} from "@/lib/auth/sessionRole";

export const dynamic = "force-dynamic";

/**
 * Performer hub — prefer cookie role (no ROLE_RESOLVING). Static PerformerShell only.
 * Client SessionRoleGate only when role cookie is missing/unclassified.
 */

export default async function PerformerHubPage() {
  const store = await cookies();
  const sessionToken = store.get("tmi_session")?.value;
  const sessionUserId = store.get("tmi_session_id")?.value;
  if (!sessionToken && !sessionUserId) {
    redirect("/auth?next=/hub/performer");
  }

  const roleCookie = store.get("tmi_role")?.value;
  const identity = classifyShellIdentity(roleCookie);

  if (identity === "FAN") {
    redirect("/hub/fan");
  }
  if (identity === "OTHER") {
    redirect(hubPathForIdentity("OTHER", roleCookie ?? ""));
  }

  if (identity === "PERFORMER") {
    const userId = sessionUserId ?? store.get("tmi_user_id")?.value ?? "";
    const displayName = store.get("tmi_display_name")?.value?.trim() || "Performer";
    return (
      <PerformerHubMount
        session={{
          identity: "PERFORMER",
          rawRole: (roleCookie ?? "PERFORMER").toUpperCase(),
          userId,
          displayName,
        }}
      />
    );
  }

  return <PerformerHubSessionFallback />;
}
