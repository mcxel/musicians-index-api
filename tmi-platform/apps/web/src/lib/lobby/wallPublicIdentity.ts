/**
 * wallPublicIdentity — semi-public lobby wall labels (Rule 20 / identity isolation).
 * Never surface raw email or cross-account Marcel handles on tiles.
 */

import { sanitizePublicDisplayLabel } from "@/lib/auth/resolveSessionIdentity";

/** Host / performer line on lobby wall tiles and discovery cards. */
export function sanitizeWallHostLabel(
  label: string | null | undefined,
  opts?: { hostUserId?: string | null; hostEmail?: string | null },
): string {
  return sanitizePublicDisplayLabel(label, {
    userId: opts?.hostUserId ?? undefined,
    email: opts?.hostEmail ?? undefined,
  });
}
