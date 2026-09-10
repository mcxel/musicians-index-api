/**
 * LEGACY shim — /live/lobby → /live/lobby-wall (P0 lobby convergence).
 * Kept as a page-level redirect so query strings (?room=, ?mode=random) survive
 * when next.config redirects are bypassed by client navigations.
 * Do not remount superseded discovery walls here.
 */

import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(searchParams?: SearchParams): string {
  if (!searchParams) return "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.set(key, value);
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export default function LiveLobbyLegacyRedirect({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  redirect(`/live/lobby-wall${toQueryString(searchParams)}`);
}
