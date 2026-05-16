import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return (
    <RouteVisualShell
      route="/articles"
      slotId="route-articles-hero"
      kind="magazine-page-image"
      owner="articles-route"
      component="ArticlesRouteLayout"
      title="Articles"
      subtitle="News, artist stories, performer features, and sponsor narratives."
      accent="#FFD700"
      secondaryAccent="#00FFFF"
      quickLinks={[
        { label: "News", href: "/articles/news" },
        { label: "Artist", href: "/articles/artist" },
        { label: "Performer", href: "/articles/performer" },
      ]}
    >
      {children}
    </RouteVisualShell>
  );
}