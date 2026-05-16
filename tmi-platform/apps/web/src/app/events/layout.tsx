import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/events"
      slotId="route-events-hero"
      kind="event-image"
      owner="events-route"
      component="EventsRouteLayout"
      title="Events"
      subtitle="Event programs, premieres, live schedules, and replay coverage."
      accent="#FF2DAA"
      secondaryAccent="#FFD700"
      quickLinks={[
        { label: "Today", href: "/events/today" },
        { label: "Trending", href: "/events/trending" },
        { label: "Live", href: "/events/live" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}