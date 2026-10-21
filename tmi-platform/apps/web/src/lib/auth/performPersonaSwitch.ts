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
    const hubUrl = data.hubUrl ?? resolvePersonaHubDestination(role);
    persistWorkspaceHint(role);
    persistOversightShellHint(role);
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
