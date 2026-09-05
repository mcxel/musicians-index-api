"use client";

import { useEffect, useState } from "react";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import type { BookingProfile } from "@/lib/booking/BookingProfileStore";

interface PerformerBookingRailProps {
  performerSlug: string;
  isOpenToBooking?: boolean;
}

const ACCENT = "#FF2DAA";

export default function PerformerBookingRail({
  performerSlug,
  isOpenToBooking = true,
}: PerformerBookingRailProps) {
  const [profileOpen, setProfileOpen] = useState(isOpenToBooking);
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/booking/profile?entityType=performer&entityId=${encodeURIComponent(performerSlug)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { profile?: BookingProfile };
        const p = data.profile;
        if (!p) return;
        setProfileOpen(p.bookMeEnabled);
        const bits: string[] = [];
        if (p.availableTonight) bits.push("Available Tonight");
        if (p.availableThisWeekend) bits.push("This Weekend");
        if (p.virtualAvailable) bits.push("Virtual OK");
        setAvailability(bits.join(" · "));
      } catch {
        /* keep prop default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [performerSlug]);

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          {profileOpen ? "BOOK ME" : "Bookings"}
        </span>
        {availability && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{availability}</span>
        )}
      </div>
      <BookingCanister
        entityId={performerSlug}
        entityType="performer"
        accentColor={ACCENT}
        showRequestForm={profileOpen}
      />
    </section>
  );
}
