import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function ArtistsLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/artists"
      slotId="route-artists-hero"
      kind="profile-image"
      owner="artists-route"
      component="ArtistsRouteLayout"
      title="Artists"
      subtitle="Artist profiles, campaigns, live, article, and analytics surfaces."
      accent="#00FFFF"
      secondaryAccent="#FF2DAA"
      quickLinks={[
        { label: "Profiles", href: "/artists" },
        { label: "Dashboard", href: "/artists/dashboard" },
        { label: "Bookings", href: "/artists/dashboard/bookings" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}