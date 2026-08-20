/**
 * Hub / dashboard Instant Go Live — stay in the current TMI shell.
 * Calls executeInstantGoLive, then binds the existing InstantGoLiveStage
 * into the assigned monitor. Never router.push('/live/go') as the visible destination.
 */

"use client";

import { executeInstantGoLive, type InstantGoLiveResult } from "@/lib/dock/executeInstantGoLive";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import {
  DEFAULT_MONITOR_A,
  defaultPersonalMediaRouter,
  registerAndAdaptParticipant,
  type MonitorTarget,
} from "@/lib/personal-media";

function paramFromHref(href: string | undefined, key: string, fallback: string): string {
  if (!href) return fallback;
  try {
    return new URL(href, "https://themusiciansindex.local").searchParams.get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function shouldPresentGoLiveInPlace(pathname: string | null | undefined): boolean {
  const p = pathname ?? "";
  return p === "/hub" || p.startsWith("/hub/") || p.startsWith("/dashboard");
}

export async function presentInstantGoLiveInPlace(opts?: {
  role?: string;
  privacy?: LivePrivacy;
  preferredExperience?: string;
  monitor?: MonitorTarget;
}): Promise<InstantGoLiveResult> {
  const monitor = opts?.monitor ?? DEFAULT_MONITOR_A;
  const existing = useGoLiveTransition.getState().inPlace;
  if (existing?.roomId) {
    return { ok: true, href: existing.href, roomId: existing.roomId };
  }

  const role = (opts?.role ?? "PERFORMER").toUpperCase();
  launchDockStore.setRole(role);
  useGoLiveTransition.getState().activate(monitor);

  const result = await executeInstantGoLive({
    role,
    privacy: opts?.privacy,
    preferredExperience: opts?.preferredExperience ?? "live",
    deferMedia: true,
    /** STAGE / monitor bind only — registry publish waits for explicit GO LIVE. */
    publishSession: false,
  });

  if (!result.ok) {
    useGoLiveTransition.getState().clearWarp();
    return result;
  }

  if (!result.roomId) {
    useGoLiveTransition.getState().clearWarp();
    return {
      ok: false,
      error: result.error ?? "Stage room did not mint. Staying in this shell — no kick-out.",
    };
  }

  const identity = registerAndAdaptParticipant({
    participantId: result.roomId,
    canonicalIdentityId: result.roomId,
    roomId: result.roomId,
    displayName: "Live Stage",
  });
  defaultPersonalMediaRouter.assignToMonitor(identity.participantId, monitor);

  useGoLiveTransition.getState().bindInPlace(
    {
      roomId: result.roomId,
      category: paramFromHref(result.href, "category", "live"),
      privacy: paramFromHref(result.href, "privacy", "public"),
      href: result.href,
    },
    monitor,
  );

  return result;
}
