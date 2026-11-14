"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/sponsor/campaigns/new", label: "Launch Campaign" },
  { href: "/sponsor/campaigns", label: "All Campaigns" },
  { href: "/sponsor/placements", label: "Placements" },
  { href: "/hub/advertiser/analytics", label: "Analytics" },
  { href: "/sponsor/contracts", label: "Contracts" },
  { href: "/sponsor/payments", label: "Payments" },
  { href: "/live/lobby-wall", label: "Live Rooms" },
  { href: "/settings", label: "Settings" },
];

/** Advertiser hub family — all /hub/advertiser/* inherit account/session chrome. */
export default function AdvertiserHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="ADVERTISER HUB"
      subtitle="Live advertising & sponsorship economy"
      accentColor="#FF8C00"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
