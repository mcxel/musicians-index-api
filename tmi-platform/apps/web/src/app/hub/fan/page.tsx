import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FanHubMount from "@/components/auth/FanHubMount";
import FanHubSessionFallback from "@/components/auth/FanHubSessionFallback";
import {
  classifyShellIdentity,
  hubPathForIdentity,
} from "@/lib/auth/sessionRole";

export const dynamic = "force-dynamic";

/**
 * Fan hub — prefer cookie role (no ROLE_RESOLVING). Static FanShell only.
 * Client SessionRoleGate only when role cookie is missing/unclassified.
 * Suspense boundary keeps SSR hub chrome mounted while searchParams bridge resolves.
 */

export default function FanHubPage() {
  const store = cookies();
  const sessionToken = store.get("tmi_session")?.value;
  const sessionUserId = store.get("tmi_session_id")?.value;
  if (!sessionToken && !sessionUserId) {
    redirect("/auth?next=/hub/fan");
  }

  const roleCookie = store.get("tmi_role")?.value;
  const identity = classifyShellIdentity(roleCookie);

  if (identity === "PERFORMER") {
    redirect("/hub/performer");
  }
  if (identity === "OTHER") {
    redirect(hubPathForIdentity("OTHER", roleCookie ?? ""));
  }

  if (identity === "FAN") {
    const userId = sessionUserId ?? store.get("tmi_user_id")?.value ?? "";
    const displayName = store.get("tmi_display_name")?.value?.trim() || "Fan";
    const session = {
      identity: "FAN" as const,
      rawRole: (roleCookie ?? "FAN").toUpperCase(),
      userId,
      displayName,
    };
    return (
      <Suspense fallback={<FanHubMount session={session} />}>
        <FanHubMount session={session} />
      </Suspense>
    );
  }

  return <FanHubSessionFallback />;
}
