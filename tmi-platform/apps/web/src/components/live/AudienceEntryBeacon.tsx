"use client";

import { useEffect } from "react";

interface AudienceEntryBeaconProps {
  roomId: string;
  viewerId?: string;
  source?: string;
}

function resolveCountryFromLocale(): { countryCode?: string; countryName?: string } {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const match = locale.match(/(?:-|_)([A-Za-z]{2})\b/);
  const countryCode = match?.[1]?.toUpperCase();
  if (!countryCode) return {};

  try {
    if (typeof Intl.DisplayNames === "function") {
      const display = new Intl.DisplayNames([locale], { type: "region" });
      const countryName = display.of(countryCode) ?? countryCode;
      return { countryCode, countryName };
    }
  } catch {
    // Fallback to code-only when display names are unavailable.
  }

  return { countryCode, countryName: countryCode };
}

export default function AudienceEntryBeacon({ roomId, viewerId, source = "live-room" }: AudienceEntryBeaconProps) {
  useEffect(() => {
    if (!roomId) return;

    const localeCountry = resolveCountryFromLocale();
    void fetch("/api/live/audience-entry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roomId,
        viewerId,
        source,
        countryCode: localeCountry.countryCode,
        countryName: localeCountry.countryName,
      }),
    }).catch(() => {});
  }, [roomId, source, viewerId]);

  return null;
}
