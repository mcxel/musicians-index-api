"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import PerformerNetworkCommandCenter from "@/components/performer/network/PerformerNetworkCommandCenter";

/**
 * Performer Network Command Center — Discover / Near You / Promote / Booking.
 * Separate from PerformerShell root to avoid mid-edit shell conflicts.
 */
export default function PerformerNetworkPage() {
  const [ownerId, setOwnerId] = useState("me");
  const [displayName, setDisplayName] = useState("Performer");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { id?: string; name?: string; displayName?: string };
        };
        if (cancelled || !data.user) return;
        setOwnerId(data.user.id ?? "me");
        setDisplayName(data.user.displayName || data.user.name || "Performer");
      } catch {
        /* guest / unsigned — still show discovery with registry data */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PerformerNetworkCommandCenter
      ownerId={ownerId}
      displayName={displayName}
      mode="performer"
    />
  );
}
