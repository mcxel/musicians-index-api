import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function SponsorsLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/sponsors"
      slotId="route-sponsors-hero"
      kind="sponsor-image"
      owner="sponsors-route"
      component="SponsorsRouteLayout"
      title="Sponsors"
      subtitle="Sponsor campaigns, placements, contracts, and ad inventory."
      accent="#FFD700"
      secondaryAccent="#00FFFF"
      quickLinks={[
        { label: "Dashboard", href: "/sponsors" },
        { label: "Inventory", href: "/sponsors/dashboard" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}