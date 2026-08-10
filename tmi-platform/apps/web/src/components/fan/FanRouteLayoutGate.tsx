"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

/**
 * Fan routes under /fan/* use RouteVisualShell except full-page YoPho studio
 * (/fan/canvas), which must not wrap the triple-stage UI or trigger dashboard hops.
 */
export default function FanRouteLayoutGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isYoPhoCanvas = pathname === "/fan/canvas" || pathname.startsWith("/fan/canvas/");

  if (isYoPhoCanvas) {
    return <>{children}</>;
  }

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
        { label: "Lounge", href: "/hub/fan" },
        { label: "Command Center", href: "/hub/fan" },
        { label: "Tickets", href: "/fan/tickets" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}
