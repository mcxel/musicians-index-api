import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function VenuesLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/venues"
      slotId="route-venues-hero"
      kind="venue-image"
      owner="venues-route"
      component="VenuesRouteLayout"
      title="Venues"
      subtitle="Venue pages, stage surfaces, live rooms, and ticket flows."
      accent="#00FF88"
      secondaryAccent="#00FFFF"
      quickLinks={[
        { label: "Dashboard", href: "/venues/dashboard" },
        { label: "Skins", href: "/venues/skins" },
        { label: "Designer", href: "/venues/designer" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}