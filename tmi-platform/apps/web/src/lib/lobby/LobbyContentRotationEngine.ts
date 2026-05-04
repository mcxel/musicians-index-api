// Lobby Content Rotation Engine
// Pulls real data from the editorial catalog and live system routes.
// Provides rotating content slots for the Lobby Main Billboard.
// No API calls — all data is pulled from the canonical catalog constants.

import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";

export type ContentSlotType = "article" | "cypher" | "performer" | "sponsor";

export interface ContentSlot {
  type: ContentSlotType;
  label: string;
  title: string;
  subtitle: string;
  route: string;
  accentColor: string;
}

function buildSlots(): ContentSlot[] {
  const artistArticle = EDITORIAL_ARTICLES.find((a) => a.category === "artist");
  const newsArticle   = EDITORIAL_ARTICLES.find((a) => a.category === "news");
  const sponsorArticle = EDITORIAL_ARTICLES.find((a) => a.category === "sponsor");

  const slots: ContentSlot[] = [];

  if (artistArticle) {
    slots.push({
      type: "article",
      label: "FEATURED ARTIST",
      title: artistArticle.title,
      subtitle: artistArticle.headline,
      route: `/articles/artist/${artistArticle.slug}`,
      accentColor: "#00FFFF",
    });
  }

  slots.push({
    type: "cypher",
    label: "LIVE CYPHER",
    title: "Cypher Arena — Weekly Battles",
    subtitle: "Vote for your champion · Join the arena",
    route: "/cypher",
    accentColor: "#AA2DFF",
  });

  if (newsArticle) {
    slots.push({
      type: "article",
      label: "THIS WEEK",
      title: newsArticle.title,
      subtitle: newsArticle.snippet,
      route: `/articles/news/${newsArticle.slug}`,
      accentColor: "#FFD700",
    });
  }

  if (sponsorArticle) {
    slots.push({
      type: "sponsor",
      label: "SPONSOR TAKEOVER",
      title: sponsorArticle.title,
      subtitle: sponsorArticle.headline,
      route: `/articles/sponsor/${sponsorArticle.slug}`,
      accentColor: "#84CC16",
    });
  }

  return slots.length > 0
    ? slots
    : [{ type: "cypher", label: "LIVE CYPHER", title: "Cypher Arena", subtitle: "Weekly battles", route: "/cypher", accentColor: "#AA2DFF" }];
}

export const LOBBY_CONTENT_SLOTS: ContentSlot[] = buildSlots();

export function getContentSlotAt(tick: number): ContentSlot {
  const idx = ((tick % LOBBY_CONTENT_SLOTS.length) + LOBBY_CONTENT_SLOTS.length) % LOBBY_CONTENT_SLOTS.length;
  return LOBBY_CONTENT_SLOTS[idx];
}
