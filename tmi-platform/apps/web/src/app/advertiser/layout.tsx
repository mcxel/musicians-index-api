import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function AdvertiserLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/advertiser"
      slotId="route-advertiser-hero"
      kind="advertiser-image"
      owner="advertiser-route"
      component="AdvertiserRouteLayout"
      title="Advertiser"
      subtitle="Ad dashboards, placements, contracts, and analytics."
      accent="#00FFFF"
      secondaryAccent="#FF2DAA"
      quickLinks={[
        { label: "Dashboard", href: "/advertiser" },
        { label: "Campaigns", href: "/advertiser/campaigns" },
        { label: "Placements", href: "/advertiser/placements" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}