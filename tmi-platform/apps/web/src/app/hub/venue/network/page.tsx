"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import PerformerNetworkCommandCenter from "@/components/performer/network/PerformerNetworkCommandCenter";

/** Venue network command — Find Performers / Map / Promote / Booking. */
export default function VenueNetworkPage() {
  const [ownerId, setOwnerId] = useState("venue");
  const [displayName, setDisplayName] = useState("Venue");

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
        setOwnerId(data.user.id ?? "venue");
        setDisplayName(data.user.displayName || data.user.name || "Venue");
      } catch {
        /* unsigned — registry discovery still works */
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
      mode="venue"
    />
  );
}
