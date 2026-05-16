import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function BillboardLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/billboard"
      slotId="route-billboard-hero"
      kind="billboard-image"
      owner="billboard-route"
      component="BillboardRouteLayout"
      title="Billboard"
      subtitle="Global billboard feeds and rotating ad placements."
      accent="#00FFFF"
      secondaryAccent="#FFD700"
      quickLinks={[
        { label: "Board", href: "/billboard" },
        { label: "Advertiser", href: "/advertiser" },
        { label: "Sponsor", href: "/sponsors" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}