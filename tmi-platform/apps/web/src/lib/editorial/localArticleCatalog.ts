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

const LAUNCH_NEWS_ARTICLES: LocalArticle[] = [
  { id: "ln-01", slug: "tmi-grand-contest-season-1",    title: "TMI Grand Contest Season 1",        subtitle: "Weekly battles, cyphers, fan voting, and a prize pool that grows every round",       author: "TMI Editorial",        publishedAt: "2026-05-20", category: "news",     tags: ["contest","season1","battles"],  heroColor: "#FFD700", icon: "🏆", body: ["Season 1 is live. Enter battles, earn rankings, win prizes.", "Fan voting is active across all rooms. Every vote earns XP."] },
  { id: "ln-02", slug: "tmi-soft-launch-is-live",       title: "TMI Is Live",                        subtitle: "The platform is open. The rooms are active. The stage is yours.",                    author: "TMI Editorial",        publishedAt: "2026-05-22", category: "news",     tags: ["launch","platform"],           heroColor: "#00FF88", icon: "🚀", body: ["The Musician's Index is live. Not beta — live.", "All roles are fully onboarded. The arena is open."] },
  { id: "ln-03", slug: "who-took-the-crown-this-week",  title: "Who Took the Crown This Week",       subtitle: "The weekly champion is decided. Here's the full breakdown.",                         author: "TMI Rankings Desk",    publishedAt: "2026-05-19", category: "news",     tags: ["crown","winner","rankings"],   heroColor: "#FFD700", icon: "👑", body: ["Nova Cipher took the crown for the third consecutive week.", "89% fan approval across 4 battle rounds."] },
  { id: "ln-04", slug: "live-lobby-walls-open",         title: "Live Lobby Walls Are Open",          subtitle: "Watch, vote, and react from inside the arena — no ticket required",                 author: "TMI Platform Team",    publishedAt: "2026-05-18", category: "news",     tags: ["lobby","live","fans"],         heroColor: "#00FFFF", icon: "📡", body: ["The lobby wall is open to all registered fans.", "React, vote, tip, and watch replays from the same interface."] },
  { id: "ln-05", slug: "cbc-arena-battles-challenges-cyphers", title: "CBC: Battles, Challenges & Cyphers", subtitle: "Three formats. One arena. Here's how each one works and how to win.", author: "TMI Arena Desk", publishedAt: "2026-05-17", category: "news", tags: ["cbc","battles","cyphers"],  heroColor: "#FF2DAA", icon: "⚔️", body: ["CBC is the core competition format on TMI.", "Battles are 1v1. Challenges are open-entry. Cyphers are group formats."] },
  { id: "ln-06", slug: "sell-your-tickets-on-tmi",      title: "Sell Your Tickets on TMI",           subtitle: "List your show. Print tickets. Get paid. The venue system is live.",                 author: "TMI Commerce Team",    publishedAt: "2026-05-16", category: "news",     tags: ["tickets","venue","commerce"],  heroColor: "#00FF88", icon: "🎟️", body: ["TMI ticketing is live for virtual and physical events.", "Artists keep 90%. Platform takes 10%."] },
  { id: "ln-07", slug: "advertise-where-fans-enter-the-arena", title: "Advertise Where Fans Enter the Arena", subtitle: "50,000+ music fans. Live rooms. Real attention. Your brand here.", author: "TMI Advertising Desk", publishedAt: "2026-05-15", category: "news", tags: ["advertising","sponsors"],    heroColor: "#FFD700", icon: "📢", body: ["Every time a fan enters a live room, your ad is there.", "Campaign setup takes under 10 minutes. Minimum $49/week."] },
  { id: "ln-08", slug: "world-concerts-and-world-releases", title: "World Concerts. World Releases.", subtitle: "TMI is building the infrastructure for the next global music moment", author: "TMI Editorial", publishedAt: "2026-05-14", category: "news", tags: ["concerts","releases","global"], heroColor: "#AA2DFF", icon: "🌍", body: ["Artists can go live globally, sell tickets, release beats, and mint NFTs.", "This is the infrastructure that used to require a label."] },
  { id: "ln-09", slug: "weekly-winners-and-replay-wall", title: "Weekly Winners & The Replay Wall",   subtitle: "Every crowned performance stays live on the Replay Wall — forever",               author: "TMI Platform Team",    publishedAt: "2026-05-13", category: "news",     tags: ["replay","winners","archive"],  heroColor: "#FF2DAA", icon: "🔁", body: ["Every TMI weekly champion's winning performance is preserved.", "Replays earn ongoing tip revenue — long after the battle ends."] },
  { id: "ln-10", slug: "become-a-tmi-writer-reporter",  title: "Become a TMI Writer or Reporter",    subtitle: "Cover the platform from the inside. Get published. Get paid.",                      author: "TMI Editorial",        publishedAt: "2026-05-12", category: "news",     tags: ["writers","reporters","magazine"], heroColor: "#AA2DFF", icon: "✍️", body: ["TMI Magazine is live and expanding its writing team.", "Writers paid per verified published article. Rates start at $25."] },
];

export const LOCAL_ARTICLE_CATALOG: LocalArticle[] = [
  ...MAGAZINE_ARTICLES,
  ...ARTIST_PERFORMER_ARTICLES,
  ...LAUNCH_NEWS_ARTICLES,
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
