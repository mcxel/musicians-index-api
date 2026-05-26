import type { ReactNode } from "react";
import RouteVisualShell from "@/components/routes/RouteVisualShell";
import ArticleReadTracker from "@/components/tracking/ArticleReadTracker";

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
        { label: "Music", href: "/articles/c/music" },
        { label: "Winners", href: "/articles/c/winners" },
        { label: "Cypher", href: "/articles/c/cypher" },
        { label: "Business", href: "/articles/c/business" },
        { label: "World", href: "/articles/c/world" },
        { label: "Culture", href: "/articles/c/culture" },
      ]}
    >
      <ArticleReadTracker />
      {children}
    </RouteVisualShell>
  );
}