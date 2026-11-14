/**
 * canonicalLogout — single client logout authority for every role shell.
 * POST /api/auth/logout + clear private caches + redirect /auth.
 */

import { clearPrivateClientAccountCache } from "@/lib/account/clearPrivateClientAccountCache";
import { releasePublishedLiveMedia, useLivePrivacyState } from "@/lib/live/livePrivacyState";

export function releaseLiveMediaForLogout(): void {
  releasePublishedLiveMedia();
}

export async function canonicalLogout(redirectTo = "/auth"): Promise<void> {
  if (typeof window === "undefined") return;

  clearPrivateClientAccountCache();

  const privacyState = useLivePrivacyState.getState();
  if (privacyState.isLivePublished) {
    try {
      await fetch("/api/live/go", { method: "DELETE", credentials: "include" });
    } catch {
      // Always release local camera/microphone access on logout.
    }
  }
  releaseLiveMediaForLogout();

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
