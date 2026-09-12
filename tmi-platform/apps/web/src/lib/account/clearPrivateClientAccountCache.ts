/**
 * clearPrivateClientAccountCache
 *
 * Clears private client-side account/session caches on logout so the next
 * visitor on the same browser never sees the previous account's identity
 * chrome (Rule 31 PRIV-09 / ACCOUNT-SHELL-10).
 *
 * Device-only preferences that are not account-private are left alone.
 */

const PRIVATE_LOCAL_KEYS = [
  "_csrf_token",
  "tmi_last_workspace",
  "tmi_profile_avatar_url",
  "tmi_account_identity_cache",
  "tmi_active_role_preview",
] as const;

const PRIVATE_SESSION_KEYS = [
  "tmi_account_identity_cache",
  "tmi_private_account_shell",
] as const;

export function clearPrivateClientAccountCache(): void {
  if (typeof window === "undefined") return;

  for (const key of PRIVATE_LOCAL_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore quota / privacy mode */
    }
  }

  for (const key of PRIVATE_SESSION_KEYS) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
