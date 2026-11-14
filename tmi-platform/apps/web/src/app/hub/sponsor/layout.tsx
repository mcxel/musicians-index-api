"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/sponsor/campaigns", label: "Campaigns" },
  { href: "/sponsor/placements", label: "Placements" },
  { href: "/sponsor/contests", label: "Contests" },
  { href: "/hub/sponsor/analytics", label: "Analytics" },
  { href: "/sponsor/contracts", label: "Contracts" },
  { href: "/sponsor/payments", label: "Payments" },
  { href: "/giveaway", label: "Giveaway" },
  { href: "/settings", label: "Settings" },
];

export default function SponsorHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="SPONSOR HUB"
      subtitle="Sponsorship campaigns & placements"
      accentColor="#FFD700"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
