/**
 * performPersonaSwitch — canonical client chain for persona hub navigation.
 *
 * Admin/staff oversight (Phase 0): navigate to Fan/Performer/Admin hubs WITHOUT
 * mutating permanent `tmi_role` — permanent ADMIN authority stays intact.
 *
 * Dual-profile users: POST /api/auth/switch-role updates activeRole + tmi_role.
 */

import { resolvePersonaHubDestination } from "@/lib/auth/resolvePersonaHubDestination";

export type PersonaSwitchRole = "ADMIN" | "FAN" | "PERFORMER";

export interface PersonaSwitchResult {
  ok: boolean;
  activeRole?: string;
  hubUrl?: string;
  error?: string;
  code?: string;
  /** True when admin oversight used navigate-only (no tmi_role mutation). */
  oversight?: boolean;
}

type OperatorContext = {
  primaryRole: string;
  roles: string[];
  email?: string | null;
};

const ADMIN_PRIVILEGED = new Set(["ADMIN", "STAFF", "SUPERADMIN", "OVERSEER"]);
const TRIAD_ROLES = new Set<PersonaSwitchRole>(["ADMIN", "FAN", "PERFORMER"]);

function isAdminOversightOperator(ctx: OperatorContext): boolean {
  const primary = ctx.primaryRole.trim().toUpperCase();
  const roles = new Set(ctx.roles.map((r) => r.trim().toUpperCase()));
  if (ADMIN_PRIVILEGED.has(primary)) return true;
  return roles.has("ADMIN") || roles.has("STAFF") || roles.has("SUPERADMIN");
}

async function loadOperatorContext(): Promise<OperatorContext | null> {
  try {
    const [rolesRes, sessionRes] = await Promise.all([
      fetch("/api/auth/my-roles", { credentials: "include", cache: "no-store" }),
      fetch("/api/auth/session", { credentials: "include", cache: "no-store" }),
    ]);
    const rolesData = rolesRes.ok
      ? ((await rolesRes.json()) as { roles?: string[]; primaryRole?: string })
      : null;
    const sessionData = sessionRes.ok
      ? ((await sessionRes.json()) as { user?: { email?: string } })
      : null;
    if (!rolesData?.roles) return null;
    return {
      primaryRole: rolesData.primaryRole ?? "USER",
      roles: rolesData.roles,
      email: sessionData?.user?.email ?? null,
    };
  } catch {
    return null;
  }
}

function persistWorkspaceHint(role: PersonaSwitchRole): void {
  localStorage.setItem(
    "tmi_last_workspace",
    role === "ADMIN" ? "admin" : role === "PERFORMER" ? "performer" : "fan",
  );
}

function persistOversightShellHint(role: PersonaSwitchRole): void {
  if (typeof document === "undefined") return;
  const shell = role === "ADMIN" ? "admin" : role.toLowerCase();
  document.cookie = `tmi_hub_shell=${shell}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

/**
 * Admin oversight navigate-only — preserves permanent `tmi_role` cookie.
 */
export function navigateAdminOversightHub(
  role: PersonaSwitchRole,
  email?: string | null,
): PersonaSwitchResult {
  const hubUrl = resolvePersonaHubDestination(role, email);
  persistWorkspaceHint(role);
  persistOversightShellHint(role);
  return { ok: true, hubUrl, oversight: true, activeRole: role };
}

export async function performPersonaSwitch(
  role: PersonaSwitchRole,
  options?: { forceEndLive?: boolean },
): Promise<PersonaSwitchResult> {
  const ctx = await loadOperatorContext();

  if (ctx && isAdminOversightOperator(ctx) && TRIAD_ROLES.has(role)) {
    return navigateAdminOversightHub(role, ctx.email);
  }

  try {
    const res = await fetch("/api/auth/switch-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        role,
        ...(options?.forceEndLive ? { forceEndLive: true } : {}),
      }),
    });

    // Fail closed on a non-JSON body (e.g. a raw framework error page for an
    // unhandled server exception) instead of letting res.json() throw into
    // the generic catch below with no distinguishing detail.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return {
        ok: false,
        error: "Switch service returned an invalid response",
        code: "INVALID_RESPONSE",
      };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      activeRole?: string;
      hubUrl?: string;
      error?: string;
      code?: string;
      oversight?: boolean;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error ?? `Switch failed (${res.status})`,
        code: data.code,
      };
    }
    const hubUrl = data.hubUrl ?? resolvePersonaHubDestination(role, ctx?.email);
    persistWorkspaceHint(role);
    return {
      ok: true,
      activeRole: data.activeRole,
      hubUrl,
      oversight: data.oversight,
    };
  } catch {
    return { ok: false, error: "Network error during persona switch" };
  }
}
