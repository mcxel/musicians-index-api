import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function FanLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/fan"
      slotId="route-fan-hero"
      kind="profile-image"
      owner="fan-route"
      component="FanRouteLayout"
      title="Fan"
      subtitle="Fan profiles, rewards, lounge, and support routes."
      accent="#00FF88"
      secondaryAccent="#FF2DAA"
      quickLinks={[
        { label: "Lounge", href: "/fan" },
        { label: "Dashboard", href: "/fan/dashboard" },
        { label: "Tickets", href: "/fan/tickets" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}