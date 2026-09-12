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
 * No Suspense wrapper: FanHubMount does not suspend; prior Suspense pair was
 * Antigravity probe noise and a candidate hub-DOM flicker source.
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
    return <FanHubMount session={session} />;
  }

  return <FanHubSessionFallback />;
}
