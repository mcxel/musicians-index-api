"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/venue/bookings", label: "Bookings" },
  { href: "/venue/tickets", label: "Tickets" },
  { href: "/venue/seating", label: "Seat Map" },
  { href: "/venue/rooms", label: "Rooms" },
  { href: "/hub/venue/analytics", label: "Analytics" },
  { href: "/hub/venue/network", label: "Network" },
  { href: "/tickets/print", label: "Print" },
  { href: "/tickets/scanner", label: "Scanner" },
  { href: "/settings", label: "Settings" },
];

export default function VenueHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="VENUE HUB"
      subtitle="Rooms, bookings & ticket operations"
      accentColor="#22c55e"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
