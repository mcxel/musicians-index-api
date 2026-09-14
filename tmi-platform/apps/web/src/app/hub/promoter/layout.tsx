"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/promoter/events", label: "Promote Event" },
  { href: "/booking", label: "Book Artist" },
  { href: "/dashboard/promoter", label: "Dashboard" },
  { href: "/hub/venue", label: "Venue Hub" },
  { href: "/tickets", label: "Tickets" },
  { href: "/settings", label: "Settings" },
];

export default function PromoterHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="PROMOTER HUB"
      subtitle="Event Promoter Command Center"
      accentColor="#00FF88"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
