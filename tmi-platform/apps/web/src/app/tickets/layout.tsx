import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function TicketsLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/tickets"
      slotId="route-tickets-hero"
      kind="ticket-image"
      owner="tickets-route"
      component="TicketsRouteLayout"
      title="Tickets"
      subtitle="Ticket art, validation, print, and purchase surfaces."
      accent="#AA2DFF"
      secondaryAccent="#FFD700"
      quickLinks={[
        { label: "Purchase", href: "/tickets" },
        { label: "Validate", href: "/tickets/validate" },
        { label: "Print", href: "/tickets/print" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}