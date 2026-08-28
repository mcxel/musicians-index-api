import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * /dashboard is a role gateway only — never a second Command Center shell.
 * Canonical HQ lives at /hub/fan and /hub/performer.
 */

function readRoles(serialized: string | undefined): string[] {
  if (!serialized) return [];
  try {
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").map((v) => v.toUpperCase());
  } catch {
    return [];
  }
}

function hubForRoles(roles: string[]): string | null {
  const set = new Set(roles);
  if (set.has("PERFORMER") || set.has("ARTIST") || set.has("BAND")) return "/hub/performer";
  if (set.has("FAN") || set.has("USER") || set.has("MEMBER")) return "/hub/fan";
  if (set.has("WRITER")) return "/hub/writer";
  if (set.has("VENUE")) return "/hub/venue";
  if (set.has("PROMOTER")) return "/hub/promoter";
  if (set.has("SPONSOR")) return "/hub/sponsor";
  if (set.has("ADVERTISER")) return "/hub/advertiser";
  if (set.has("ADMIN") || set.has("STAFF") || set.has("SUPERADMIN")) return "/admin";
  // Unknown / missing role — never default to FAN
  return null;
}

export default function DashboardGatewayPage() {
  const store = cookies();
  const sessionToken = store.get("tmi_session")?.value;
  const sessionUserId = store.get("tmi_session_id")?.value;
  if (!sessionToken && !sessionUserId) {
    redirect("/auth?next=/dashboard");
  }

  const roleCookie = store.get("tmi_role")?.value?.toUpperCase();
  const roleList = readRoles(store.get("tmi_roles")?.value);
  const roles = roleCookie ? Array.from(new Set([...roleList, roleCookie])) : roleList;
  const hub = hubForRoles(roles);
  if (!hub) {
    // ROLE_RESOLVING path — hub directory, never assume FAN
    redirect("/hub");
  }
  redirect(hub);
}
