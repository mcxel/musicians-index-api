import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function PerformersLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/performers"
      slotId="route-performers-hero"
      kind="profile-image"
      owner="performers-route"
      component="PerformersRouteLayout"
      title="Performers"
      subtitle="Performer profiles, live booking, and showcase routes."
      accent="#FF9500"
      secondaryAccent="#00FFFF"
      quickLinks={[
        { label: "Directory", href: "/performers" },
        { label: "Dashboard", href: "/performers/dashboard" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}