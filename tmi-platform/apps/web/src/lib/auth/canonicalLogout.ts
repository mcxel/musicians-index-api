/**
 * canonicalLogout — single client logout authority for every role shell.
 * POST /api/auth/logout + clear private caches + redirect /auth.
 */

import { clearPrivateClientAccountCache } from "@/lib/account/clearPrivateClientAccountCache";

export async function canonicalLogout(redirectTo = "/auth"): Promise<void> {
  if (typeof window === "undefined") return;

  clearPrivateClientAccountCache();

  try {
    document.cookie = "tmi_hub_shell=; path=/; max-age=0; SameSite=Lax";
  } catch {
    /* ignore */
  }

  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* still redirect — server may have cleared session */
  }

  clearPrivateClientAccountCache();
  window.location.href = redirectTo;
}
