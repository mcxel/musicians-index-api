// System B — Editorial Magazine
// Article data model for all typed editorial routes.

export type ArticleCategory =
  | "artist"
  | "performer"
  | "news"
  | "sponsor"
  | "advertiser"
  | "interview";

export type ArticleTemplate = "A" | "B" | "C" | "D" | "E";
// A = Standard Feature, B = Split Spread, C = Full Sponsor Page, D = News Stack, E = Interview

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  headline: string;
  snippet: string;
  body: string[];
  category: ArticleCategory;
  templateType: ArticleTemplate;
  publishedAt: string;
  author: string;
  heroImage?: string;
  heroColor: string;
  accentColor: string;
  relatedArtistSlug?: string;
  relatedPerformerSlug?: string;
  relatedVenueSlug?: string;
  relatedSponsorSlug?: string;
  relatedAdvertiserSlug?: string;
  sponsorPlacementIds: string[];
  advertiserPlacementIds: string[];
  tags: string[];
}

export const EDITORIAL_ARTICLES: NewsArticle[] = [
  {
    id: "ea-001",
    slug: "ray-journey-builds-his-empire",
    title: "Ray Journey Builds His Empire",
    headline: "From open mic to sold-out arena — the blueprint nobody told you about",
    snippet: "Ray Journey turned a 12-week Cypher Arena streak into a full booking calendar and a six-figure beat catalog.",
    body: [
      "Three seasons ago, Ray Journey was performing in living rooms. Today his name shows up in TMI Top 10 every single week.",
      "The shift wasn't overnight. It was methodical — three battles, two crowned titles, one signature move that became a format.",
      "Inside the arena, Ray's strategy was simple: let the crowd vote, then give the crowd what they voted for, but bigger.",
      "His fan base grew 340% in two months after his Crown defense round went viral across three platforms.",
      "The label meetings followed. So did the booking requests. And then the beat licensing deals.",
      "Ray credits the TMI ranking system for giving him a public scoreboard that sponsors could see.",
      "\"Before this platform, I was just talking about it,\" Ray says. \"Now my rank speaks before I walk in the room.\"",
    ],
    category: "artist",
    templateType: "A",
    publishedAt: "2026-04-22",
    author: "TMI Artist Desk",
    heroColor: "#00FFFF",
    accentColor: "#00FFFF",
    relatedArtistSlug: "ray-journey",
    sponsorPlacementIds: ["sp-soundwave-001"],
    advertiserPlacementIds: [],
    tags: ["artist", "spotlight", "crown", "battle"],
  },
  {
    id: "ea-002",
    slug: "nova-cipher-the-science-of-the-cypher",
    title: "Nova Cipher: The Science of the Cypher",
    headline: "Why Nova's battle style is rewriting the rules for every performer on the platform",
    snippet: "Nova Cipher's 8-streak win record isn't luck. It's a system. And she's about to break it down.",
    body: [
      "Nova Cipher doesn't approach a battle like a fight. She approaches it like a performance audit.",
      "Every opponent gets scouted. Every crowd gets read. Every round has a predetermined energy arc.",
      "Her win streak of 8 consecutive battles is the longest in TMI Season 1 history.",
      "She credits her streak to what she calls 'the bounce point' — the moment the crowd shifts from neutral to invested.",
      "\"Once I hit the bounce point, the battle is already over,\" she says. \"The judges just haven't written it down yet.\"",
      "Behind the stage presence is a data obsession. Nova tracks her vote percentage round-by-round.",
      "Her lowest round score this season: 71%. Her highest: 94%. Average: 84.2%.",
      "That consistency is what separates champions from contenders.",
    ],
    category: "performer",
    templateType: "A",
    publishedAt: "2026-04-24",
    author: "TMI Battle Desk",
    heroColor: "#FF2DAA",
    accentColor: "#FF2DAA",
    relatedPerformerSlug: "nova-cipher",
    sponsorPlacementIds: ["sp-beatmarket-001"],
    advertiserPlacementIds: [],
    tags: ["performer", "battle", "cypher", "strategy"],
  },
  {
    id: "ea-003",
    slug: "tmi-season-1-standings-week-16",
    title: "TMI Season 1 — Official Week 16 Standings",
    headline: "Rankings locked. Here's who moved, who dropped, and who surprised everyone.",
    snippet: "Crown holder Verse.XL extended his lead by 2,400 votes. Three new entries broke into the Top 10.",
    body: [
      "Week 16 closed with the highest total vote count in TMI Season 1 history: 847,000 votes cast across all categories.",
      "Verse.XL added 2,400 votes to his crown margin, now sitting 6,800 votes ahead of the nearest challenger.",
      "The biggest mover this week: FlowState.J jumped from #8 to #4, a 4-position surge powered by viral cypher footage.",
      "Three new entries broke into the Top 10: Punchline.K at #9, Vocab.X at #7, and BarGod.T at #6.",
      "The fan category saw its closest race yet — VoteMaster.K and Audience.X are separated by just 40 votes.",
      "Full standings across all categories are now live on the TMI ranking board.",
    ],
    category: "news",
    templateType: "D",
    publishedAt: "2026-04-29",
    author: "TMI Editorial",
    heroColor: "#FFD700",
    accentColor: "#FFD700",
    sponsorPlacementIds: ["sp-tmi-official-001"],
    advertiserPlacementIds: ["ad-beatmarket-001"],
    tags: ["news", "rankings", "standings", "season-1"],
  },
  {
    id: "ea-004",
    slug: "soundwave-audio-presents-the-beat-vault",
    title: "SoundWave Audio Presents: The Beat Vault",
    headline: "Exclusive gear, professional-grade sounds, and a prize pool that changes careers.",
    snippet: "SoundWave Audio is dropping a $10,000 gear prize pool exclusively for TMI Season 1 competitors.",
    body: [
      "SoundWave Audio has partnered with TMI to offer the most valuable prize pool in the platform's history.",
      "The $10,000 Beat Vault Prize includes professional studio monitors, microphones, audio interfaces, and software licenses.",
      "Eligibility: any active TMI Season 1 competitor with 500+ votes in the current ranking cycle.",
      "Prize distribution: Top 3 ranked artists each receive a full studio kit. Positions 4–10 receive software bundles.",
      "Application opens Friday, April 30 at 8PM ET. Winners announced on the Season 1 finale broadcast.",
      "SoundWave Audio is a TMI Tier 3 Sponsor featured across all billboard spaces during the finale week.",
    ],
    category: "sponsor",
    templateType: "C",
    publishedAt: "2026-04-28",
    author: "SoundWave Audio / TMI Partnerships",
    heroColor: "#AA2DFF",
    accentColor: "#AA2DFF",
    relatedSponsorSlug: "soundwave-audio",
    sponsorPlacementIds: ["sp-soundwave-full-001"],
    advertiserPlacementIds: [],
    tags: ["sponsor", "soundwave", "prize", "gear"],
  },
  {
    id: "ea-005",
    slug: "beatmarket-producer-launch-campaign",
    title: "BeatMarket: The Producers Are Here",
    headline: "12,000 beats. One marketplace. Built specifically for TMI creators.",
    snippet: "BeatMarket launches its TMI producer campaign with a $2,500 weekly cash prize for top battle performers.",
    body: [
      "BeatMarket officially launched its TMI producer integration this week, connecting 12,000+ beats to the battle system.",
      "Every active TMI performer now has direct access to BeatMarket's catalog from within the battle lobby.",
      "The campaign includes a $2,500 weekly cash prize for the top-ranked battle performer in any cypher category.",
      "Producers on BeatMarket earn commission when their beats are selected for TMI ranked battles.",
      "The program runs through the end of Season 1. Enrollment is open to all verified TMI performers.",
    ],
    category: "advertiser",
    templateType: "B",
    publishedAt: "2026-04-27",
    author: "TMI Partnerships Desk",
    heroColor: "#00E5FF",
    accentColor: "#00E5FF",
    relatedAdvertiserSlug: "beatmarket",
    sponsorPlacementIds: [],
    advertiserPlacementIds: ["ad-beatmarket-001"],
    tags: ["advertiser", "beatmarket", "producers", "prize"],
  },
];

export function getEditorialArticleBySlug(slug: string): NewsArticle | undefined {
  return EDITORIAL_ARTICLES.find((a) => a.slug === slug);
}

export function getEditorialArticlesByCategory(category: ArticleCategory): NewsArticle[] {
  return EDITORIAL_ARTICLES.filter((a) => a.category === category);
}

export function getLatestEditorialArticles(limit = 10): NewsArticle[] {
  return [...EDITORIAL_ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
