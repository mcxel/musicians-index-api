import type { Metadata } from "next";

/**
 * Immersive PREVIEW VENUE layout — chrome (footer / bottom nav / rail) is
 * suppressed via pathname checks in PlatformFooter / TMIGlobalNav /
 * NavigationRail / LaunchDock. This layout only marks the route ownership.
 */
export const metadata: Metadata = {
  title: "Venue Preview",
  robots: { index: false, follow: false },
};

export default function VenuePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-tmi-surface="venue-preview" data-immersive="true" style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}
