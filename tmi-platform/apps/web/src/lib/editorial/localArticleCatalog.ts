import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";

export type LocalArticleCategory =
  | "feature"
  | "interview"
  | "review"
  | "news"
  | "editorial"
  | "artist"
  | "performer";

export type LocalArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: string;
  category: LocalArticleCategory;
  tags: string[];
  heroColor: string;
  icon: string;
  body: string[];
};

const MAGAZINE_ARTICLES: LocalArticle[] = MAGAZINE_ISSUE_1.map((article) => ({
  id: `mag-${article.slug}`,
  slug: article.slug,
  title: article.title,
  subtitle: article.subtitle,
  author: article.author,
  publishedAt: article.publishedAt,
  category: article.category,
  tags: article.tags,
  heroColor: article.heroColor,
  icon: article.icon,
  body: article.blocks
    .filter((block) => block.type === "paragraph" || block.type === "pullquote")
    .map((block) => block.text ?? "")
    .filter(Boolean),
}));

const ARTIST_PERFORMER_ARTICLES: LocalArticle[] = [
  {
    id: "artist-spotlight-ray-journey",
    slug: "ray-journey-stage-blueprint",
    title: "Ray Journey's Stage Blueprint",
    subtitle: "How a performer turns one set into a global fan funnel",
    author: "TMI Artist Desk",
    publishedAt: "2026-04-20",
    category: "artist",
    tags: ["artist", "performance", "growth"],
    heroColor: "#00FFFF",
    icon: "🎤",
    body: [
      "Ray Journey builds every set like a launch campaign. Every track transition is tied to one next action for fans.",
      "After each room set, his profile conversion jumps by 18-24% because the call-to-action path is consistent across stage, profile, and fan club.",
      "The artist article system now treats live sets as editorial moments so creators can convert hype into recurring revenue.",
    ],
  },
  {
    id: "performer-playbook-neon-vibe",
    slug: "neon-vibe-performer-playbook",
    title: "Neon Vibe Performer Playbook",
    subtitle: "From weekly residency to premium booking demand",
    author: "TMI Performer Desk",
    publishedAt: "2026-04-21",
    category: "performer",
    tags: ["performer", "dj", "booking"],
    heroColor: "#FF2DAA",
    icon: "🎧",
    body: [
      "Neon Vibe treats every Monday residency like a season arc, not an isolated show.",
      "Each set preview drives users into paid bookings and sponsor inventory, keeping monetization active between major launches.",
      "Performer pages now link directly into article surfaces so audiences can move from discovery to paid engagement in one path.",
    ],
  },
];

export const LOCAL_ARTICLE_CATALOG: LocalArticle[] = [
  ...MAGAZINE_ARTICLES,
  ...ARTIST_PERFORMER_ARTICLES,
];

export function getLocalArticleBySlug(slug: string): LocalArticle | undefined {
  return LOCAL_ARTICLE_CATALOG.find((article) => article.slug === slug);
}

export function getLocalArticlesByCategory(category: LocalArticleCategory): LocalArticle[] {
  return LOCAL_ARTICLE_CATALOG.filter((article) => article.category === category);
}

export function getLatestLocalArticles(limit = 24): LocalArticle[] {
  return [...LOCAL_ARTICLE_CATALOG]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);
}

export function isMagazineBackedNewsSlug(slug: string): boolean {
  return MAGAZINE_ISSUE_1.some((article: MagazineArticle) => article.slug === slug && article.category === "news");
}
