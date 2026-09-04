/**
 * Universal Media Player — audience presence binding (LIVE P0-2).
 *
 * Watchers on the hub media-player path (`?watch=` → bindInPlace) register
 * real occupancy via POST /api/live/audience. Hosts who already published
 * via GO LIVE do not double-join as audience (they own the registry session).
 *
 * Rule 20: never invent counts. Leave honestly on unbind.
 */

"use client";

import { useEffect, useRef } from "react";
import { countHumanAttendance } from "@/lib/venues/venuePresenceMetrics";

export type MediaPlayerPresenceRole = "fan" | "performer" | "band" | "venue" | "promoter" | "sponsor" | "advertiser" | string;

export interface UseMediaPlayerAudiencePresenceOpts {
  roomId: string | null | undefined;
  userId: string;
  displayName: string;
  /** Command-center account role */
  accountRole: MediaPlayerPresenceRole;
  /**
   * When true, this client is the published host of `roomId` — skip join/leave
   * so END LIVE remains the authority (last-fan-leave must not kill the session).
   */
  isPublishedHost?: boolean;
  enabled?: boolean;
}

function audienceMemberRole(accountRole: MediaPlayerPresenceRole): "fan" | "artist" | "host" {
  const r = String(accountRole || "fan").toLowerCase();
  if (r === "performer" || r === "artist" || r === "band") return "artist";
  if (r === "host" || r === "admin") return "host";
  return "fan";
}

/**
 * Register / unregister real audience occupancy for the media-player watch path.
 * Returns nothing — side-effect hook. Safe no-op when roomId empty or host.
 */
export function useMediaPlayerAudiencePresence(opts: UseMediaPlayerAudiencePresenceOpts): void {
  const { roomId, userId, displayName, accountRole, isPublishedHost = false, enabled = true } =
    opts;
  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !roomId || !userId || isPublishedHost) {
      return;
    }

    const venueSlug = roomId.trim();
    if (!venueSlug) return;

    let cancelled = false;
    const memberRole = audienceMemberRole(accountRole);
    // Watchers always register as fan for occupancy honesty — performer watching
    // another room is still an audience human, not the session host.
    const joinRole = isPublishedHost ? memberRole : "fan";

    const join = async () => {
      try {
        const res = await fetch("/api/live/audience", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            venueSlug,
            member: {
              userId,
              displayName: (displayName || "Viewer").slice(0, 48),
              role: joinRole,
              seatId: null,
              captureEnabled: false,
            },
          }),
        });
        if (!res.ok || cancelled) return;
        joinedRef.current = venueSlug;
        const data = (await res.json()) as {
          members?: Array<{ role?: string; displayName?: string; active?: boolean }>;
          activeMembers?: Array<{ role?: string; displayName?: string }>;
        };
        const rows = Array.isArray(data.activeMembers)
          ? data.activeMembers
          : (data.members ?? []).filter((m) => m.active !== false);
        const humans = countHumanAttendance(rows);
        window.dispatchEvent(
          new CustomEvent("tmi:watch-audience-count", {
            detail: { roomId: venueSlug, viewers: humans },
          }),
        );
      } catch {
        /* honest: stay unbound */
      }
    };

    const leave = async (slug: string) => {
      try {
        await fetch("/api/live/audience", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "leave",
            venueSlug: slug,
            userId,
          }),
          keepalive: true,
        });
      } catch {
        /* best-effort */
      }
    };

    void join();

    const onUnload = () => {
      if (joinedRef.current) {
        void leave(joinedRef.current);
        joinedRef.current = null;
      }
    };
    window.addEventListener("pagehide", onUnload);

    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", onUnload);
      const slug = joinedRef.current;
      joinedRef.current = null;
      if (slug) void leave(slug);
    };
  }, [enabled, roomId, userId, displayName, accountRole, isPublishedHost]);
}
