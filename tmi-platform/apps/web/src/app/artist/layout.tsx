import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/artist"
      slotId="route-artist-hero"
      kind="profile-image"
      owner="artist-route"
      component="ArtistRouteLayout"
      title="Artist"
      subtitle="Singular artist profile surfaces and artist utility routes."
      accent="#FF2DAA"
      secondaryAccent="#00FFFF"
      quickLinks={[
        { label: "Artists", href: "/artists" },
        { label: "Dashboard", href: "/artists/dashboard" },
        { label: "Territory", href: "/artists/dashboard/territory" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}