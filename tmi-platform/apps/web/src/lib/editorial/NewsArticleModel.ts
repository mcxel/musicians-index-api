// System B — Editorial Magazine
// Article data model for all typed editorial routes.
import { ArticleBlock } from "@/lib/magazine/magazineIssueData";

export type ArticleCategory =
  | "artist"
  | "performer"
  | "news"
  | "sponsor"
  | "advertiser"
  | "interview"
  | "feature"
  | "review"
  | "editorial";

// This is the unified, canonical article model for the entire platform.
// It merges the concepts from magazineIssueData.ts and the original NewsArticle.

export type ArticleTemplate = "A" | "B" | "C" | "D" | "E";
// A = Standard Feature, B = Split Spread, C = Full Sponsor Page, D = News Stack, E = Interview

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  headline: string;
  snippet: string; // Corresponds to 'subtitle' in the old model
  body: ArticleBlock[]; // Using the richer block-based model
  category: ArticleCategory;
  templateType: ArticleTemplate;
  publishedAt: string;
  author: string;
  heroImage?: string;
  heroColor: string;
  accentColor: string;
  icon?: string; // From the old magazine model
  relatedArtistSlug?: string;
  relatedPerformerSlug?: string;
  relatedVenueSlug?: string;
  relatedSponsorSlug?: string;
  relatedAdvertiserSlug?: string;
  /** Slug of the writer who authored this article — links to /profile/writer/[slug] */
  writerSlug?: string;
  sponsorPlacementIds: string[];
  advertiserPlacementIds: string[];
  tags: string[];
}

const BASE_ARTICLES: NewsArticle[] = [
  {
    id: "ea-001",
    slug: "ray-journey-builds-his-empire",
    title: "Ray Journey Builds His Empire",
    headline: "From open mic to sold-out arena — the blueprint nobody told you about",
    snippet: "Ray Journey turned a 12-week Cypher Arena streak into a full booking calendar and a six-figure beat catalog.",
    body: [
      { type: "paragraph", text: "Three seasons ago, Ray Journey was performing in living rooms. Today his name shows up in TMI Top 10 every single week." },
      { type: "paragraph", text: "The shift wasn't overnight. It was methodical — three battles, two crowned titles, one signature move that became a format." },
      { type: "pullquote", text: "Before this platform, I was just talking about it. Now my rank speaks before I walk in the room." },
      { type: "paragraph", text: "His fan base grew 340% in two months after his Crown defense round went viral across three platforms." },
      { type: "paragraph", text: "The label meetings followed. So did the booking requests. And then the beat licensing deals." },
      { type: "paragraph", text: "Ray credits the TMI ranking system for giving him a public scoreboard that sponsors could see." },
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
      { type: "paragraph", text: "Nova Cipher doesn't approach a battle like a fight. She approaches it like a performance audit." },
      { type: "paragraph", text: "Every opponent gets scouted. Every crowd gets read. Every round has a predetermined energy arc." },
      { type: "paragraph", text: "Her win streak of 8 consecutive battles is the longest in TMI Season 1 history." },
      { type: "pullquote", text: "Once I hit the bounce point, the battle is already over. The judges just haven't written it down yet." },
      { type: "paragraph", text: "Behind the stage presence is a data obsession. Nova tracks her vote percentage round-by-round." },
      { type: "paragraph", text: "Her lowest round score this season: 71%. Her highest: 94%. Average: 84.2%." },
      { type: "paragraph", text: "That consistency is what separates champions from contenders." },
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
      { type: "paragraph", text: "Week 16 closed with the highest total vote count in TMI Season 1 history: 847,000 votes cast across all categories." },
      { type: "paragraph", text: "Verse.XL added 2,400 votes to his crown margin, now sitting 6,800 votes ahead of the nearest challenger." },
      { type: "paragraph", text: "The biggest mover this week: FlowState.J jumped from #8 to #4, a 4-position surge powered by viral cypher footage." },
      { type: "paragraph", text: "Three new entries broke into the Top 10: Punchline.K at #9, Vocab.X at #7, and BarGod.T at #6." },
      { type: "paragraph", text: "Full standings across all categories are now live on the TMI ranking board." },
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
      { type: "paragraph", text: "SoundWave Audio has partnered with TMI to offer the most valuable prize pool in the platform's history." },
      { type: "paragraph", text: "The $10,000 Beat Vault Prize includes professional studio monitors, microphones, audio interfaces, and software licenses." },
      { type: "paragraph", text: "Eligibility: any active TMI Season 1 competitor with 500+ votes in the current ranking cycle." },
      { type: "paragraph", text: "Application opens Friday, April 30 at 8PM ET. Winners announced on the Season 1 finale broadcast." },
      { type: "paragraph", text: "SoundWave Audio is a TMI Tier 3 Sponsor featured across all billboard spaces during the finale week." },
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
      { type: "paragraph", text: "BeatMarket officially launched its TMI producer integration this week, connecting 12,000+ beats to the battle system." },
      { type: "paragraph", text: "Every active TMI performer now has direct access to BeatMarket's catalog from within the battle lobby." },
      { type: "paragraph", text: "The campaign includes a $2,500 weekly cash prize for the top-ranked battle performer in any cypher category." },
      { type: "paragraph", text: "The program runs through the end of Season 1. Enrollment is open to all verified TMI performers." },
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

// ── 10 launch-critical articles ───────────────────────────────────────────────

export const LAUNCH_ARTICLES: NewsArticle[] = [
  {
    id: "ea-l01",
    slug: "tmi-grand-contest-season-1",
    title: "TMI Grand Contest Season 1",
    headline: "Weekly battles, live cyphers, fan voting, and a prize pool that grows every round",
    snippet: "TMI's first global contest is live. Performers compete. Fans vote. Sponsors fund the prize pool. Here's everything you need to know.",
    body: [
      { type: "paragraph", text: "The Musician's Index Grand Contest Season 1 is now officially underway — and the platform has never sounded this good." },
      { type: "paragraph", text: "Every week, performers enter live battles and cyphers across TMI's arena rooms. Fans vote in real time, and the rankings update automatically after every round." },
      { type: "paragraph", text: "Prize pools are funded by sponsors. The more activity in a room, the more money goes into the pot." },
      { type: "paragraph", text: "Artists can enter CBC — Challenges, Battles, and Cyphers — through their performer hub. Rounds run Thursday through Sunday." },
      { type: "paragraph", text: "Season 1 is accepting new performers now. No experience requirement. The stage is open." },
    ],
    category: "news",
    icon: "🏆",
    templateType: "D",
    publishedAt: "2026-05-20",
    author: "TMI Editorial",
    heroColor: "#FFD700",
    accentColor: "#FFD700",
    sponsorPlacementIds: ["sp-soundwave-001"],
    advertiserPlacementIds: [],
    tags: ["contest", "season1", "battles", "cyphers", "news"],
  },
  {
    id: "ea-l02",
    slug: "tmi-soft-launch-is-live",
    title: "TMI Is Live — Here's What That Means",
    headline: "The platform is open. The rooms are active. The stage is yours.",
    snippet: "After months of building, TMI is officially accepting performers, fans, sponsors, and advertisers. Here's what you can do right now.",
    body: [
      { type: "paragraph", text: "The Musician's Index is live. Not beta. Not coming soon. Live." },
      { type: "paragraph", text: "Performers can sign up and go live tonight. Fan voting is active. The giveaway pipeline is running. Sponsors can book prize slots." },
      { type: "paragraph", text: "Every role on the platform — performer, fan, advertiser, sponsor, venue, and writer — is fully onboarded and operational." },
      { type: "paragraph", text: "The arena rooms are open: CBC battles, live lobby walls, cypher pits, and stage showcase rooms." },
      { type: "paragraph", text: "If you've been waiting to join, the wait is over. The curtain is up." },
    ],
    category: "news",
    icon: "🚀",
    templateType: "D",
    publishedAt: "2026-05-22",
    author: "TMI Editorial",
    heroColor: "#00FF88",
    accentColor: "#00FF88",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["launch", "news", "platform"],
  },
  {
    id: "ea-l03",
    slug: "who-took-the-crown-this-week",
    title: "Who Took the Crown This Week",
    headline: "The weekly champion is decided. Here's the full breakdown.",
    snippet: "Every week TMI crowns one performer. This week's winner, the vote tallies, and the story behind the result.",
    body: [
      { type: "paragraph", text: "The weekly crown algorithm ran at midnight Sunday. The results are in." },
      { type: "paragraph", text: "Nova Cipher took the crown for the third consecutive week, posting an 89% fan approval rating across 4 battle rounds." },
      { type: "paragraph", text: "Second place went to FlowState.J, whose cypher performance in the Underground Pit room generated the highest per-minute vote rate of the season." },
      { type: "paragraph", text: "Third place: Ari Volt. Ari's tip total this week was the highest on the platform — a signal that fans aren't just voting, they're investing." },
      { type: "paragraph", text: "Next week's crown competition opens Thursday. Performers, submit your entry in the hub." },
    ],
    category: "news",
    icon: "👑",
    templateType: "D",
    publishedAt: "2026-05-19",
    author: "TMI Rankings Desk",
    heroColor: "#FFD700",
    accentColor: "#FFD700",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["crown", "winner", "rankings", "weekly"],
  },
  {
    id: "ea-l04",
    slug: "live-lobby-walls-open",
    title: "Live Lobby Walls Are Open",
    headline: "Watch, vote, and react from inside the arena — no ticket required",
    snippet: "TMI's lobby walls give fans a front-row seat to every live battle, cypher, and showcase happening on the platform right now.",
    body: [
      { type: "paragraph", text: "TMI's Live Lobby Walls are open to all registered fans — no paid ticket required for general admission." },
      { type: "paragraph", text: "Every active performance streams directly into the wall. Fans can react, vote, send tips, and watch replays from the same interface." },
      { type: "paragraph", text: "The wall updates in real time. When a new room goes live, a card appears. When a battle ends, the wall shows the result." },
      { type: "paragraph", text: "For premium rooms — VIP showcases, sponsor events, and championship rounds — a viewer pass is required. Pricing starts at $5." },
      { type: "paragraph", text: "The lobby wall is the heartbeat of TMI. Come watch." },
    ],
    category: "news",
    icon: "🚪",
    templateType: "D",
    publishedAt: "2026-05-18",
    author: "TMI Platform Team",
    heroColor: "#00FFFF",
    accentColor: "#00FFFF",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["lobby", "live", "fans", "streaming"],
  },
  {
    id: "ea-l05",
    slug: "cbc-arena-battles-challenges-cyphers",
    title: "CBC: Challenges, Battles & Cyphers — Full Guide",
    headline: "Three formats. One arena. Here's how each one works and how to win.",
    snippet: "CBC is the core competition format on TMI. Whether you battle solo, run a cypher, or enter a challenge round, here's the complete playbook.",
    body: [
      { type: "paragraph", text: "CBC stands for Challenges, Battles, and Cyphers — the three competitive formats that run TMI's arena." },
      { type: "paragraph", text: "Battles are 1v1. Two performers. Two rounds each. Fan vote decides the winner." },
      { type: "paragraph", text: "Challenges are open-entry rounds with a theme. Any performer on the platform can submit a round. Fans rank submissions." },
      { type: "paragraph", text: "Cyphers are group formats — 4 to 8 performers in a rotation. No elimination, but ranking points are awarded per round based on crowd energy." },
      { type: "paragraph", text: "To enter, go to your Performer Hub → Battles & Cyphers → Join Round." },
    ],
    category: "news",
    icon: "⚔️",
    templateType: "D",
    publishedAt: "2026-05-17",
    author: "TMI Arena Desk",
    heroColor: "#FF2DAA",
    accentColor: "#FF2DAA",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["cbc", "battles", "cyphers", "challenges", "guide"],
  },
  {
    id: "ea-l06",
    slug: "sell-your-tickets-on-tmi",
    title: "Sell Your Tickets on TMI",
    headline: "List your show. Print tickets. Get paid. The venue system is live.",
    snippet: "TMI now supports end-to-end ticket sales for live and virtual events — including QR-code tickets and brick-and-mortar print batches.",
    body: [
      { type: "paragraph", text: "TMI's ticketing system is live and accepting event listings from verified venue operators." },
      { type: "paragraph", text: "Each event gets a dedicated page with seat mapping, pricing tiers, and a purchase flow connected directly to Stripe." },
      { type: "paragraph", text: "Tickets can be digital (email delivery with QR code) or physical (print-on-demand batch for venue door scanning)." },
      { type: "paragraph", text: "The platform takes 10%. Venues keep 90%. There are no monthly fees — you only pay when you sell." },
      { type: "paragraph", text: "To list your show, go to your Venue Hub → Manage Shows → Create Event." },
    ],
    category: "news",
    icon: "🎟️",
    templateType: "D",
    publishedAt: "2026-05-16",
    author: "TMI Commerce Team",
    heroColor: "#00FF88",
    accentColor: "#00FF88",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["tickets", "venue", "commerce", "events"],
  },
  {
    id: "ea-l07",
    slug: "advertise-where-fans-enter-the-arena",
    title: "Advertise Where Fans Enter the Arena",
    headline: "50,000+ music fans. Live rooms. Real attention. Your brand here.",
    snippet: "TMI advertising reaches music fans at their most engaged moment — inside the live arena. Here's how to get started.",
    body: [
      { type: "paragraph", text: "Every time a fan enters a live room on TMI, your ad is already there. Not a banner they scroll past — an integrated placement inside the arena wall." },
      { type: "paragraph", text: "TMI advertising placements include: lobby wall cards, in-article sponsor slots, battle countdown inserts, and giveaway prize contributions." },
      { type: "paragraph", text: "Campaign setup takes under 10 minutes. You set the budget. We handle placement targeting by room type, artist genre, and fan tier." },
      { type: "paragraph", text: "Sponsors who contribute to prize pools get brand mention on the winner announcement card — seen by everyone who voted." },
      { type: "paragraph", text: "Start your campaign: go to /advertise and select your placement type." },
    ],
    category: "news",
    icon: "📢",
    templateType: "D",
    publishedAt: "2026-05-15",
    author: "TMI Advertising Desk",
    heroColor: "#FFD700",
    accentColor: "#FFD700",
    sponsorPlacementIds: [],
    advertiserPlacementIds: ["ad-beatmarket-001"],
    tags: ["advertising", "sponsors", "campaigns", "brands"],
  },
  {
    id: "ea-l08",
    slug: "world-concerts-and-world-releases",
    title: "World Concerts. World Releases.",
    headline: "TMI is building the infrastructure for the next global music moment",
    snippet: "The platform isn't just battles and cyphers. It's the venue, the label, the magazine, and the stage — all in one place.",
    body: [
      { type: "paragraph", text: "TMI is not a social media platform. It is a performance infrastructure." },
      { type: "paragraph", text: "Artists can go live to global audiences, sell tickets to virtual shows, release beats and instrumentals directly through the store, and mint NFTs tied to their music." },
      { type: "paragraph", text: "Every performance generates data that feeds into the ranking engine, the magazine, and the season standings." },
      { type: "paragraph", text: "Concerts on TMI can be free or ticketed. They can be solo or multi-act." },
      { type: "paragraph", text: "This is the infrastructure that used to require a label, a manager, and a booking agent. TMI replaces all three." },
    ],
    category: "news",
    icon: "🌍",
    templateType: "A",
    publishedAt: "2026-05-14",
    author: "TMI Editorial",
    heroColor: "#AA2DFF",
    accentColor: "#AA2DFF",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["concerts", "releases", "global", "infrastructure"],
  },
  {
    id: "ea-l09",
    slug: "weekly-winners-and-replay-wall",
    title: "Weekly Winners & The Replay Wall",
    headline: "Every crowned performance stays live on the Replay Wall — forever",
    snippet: "When a performer wins the weekly crown, their winning round gets pinned to the Replay Wall. Here's how to find it and why it matters.",
    body: [
      { type: "paragraph", text: "Every TMI weekly champion's winning performance is preserved on the Replay Wall — a permanent archive of the platform's defining moments." },
      { type: "paragraph", text: "The Replay Wall lives at /home/3. Fans can browse by season, by artist, or by battle type." },
      { type: "paragraph", text: "Replays earn ongoing tip revenue for the performer — long after the battle ends." },
      { type: "paragraph", text: "Writers and journalists can embed Replay Wall clips in articles. Every embed tracks back to the original performer's profile." },
    ],
    category: "news",
    icon: "⏪",
    templateType: "D",
    publishedAt: "2026-05-13",
    author: "TMI Platform Team",
    heroColor: "#FF2DAA",
    accentColor: "#FF2DAA",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["replay", "winners", "archive", "wall"],
  },
  {
    id: "ea-l10",
    slug: "become-a-tmi-writer-reporter",
    title: "Become a TMI Writer or Reporter",
    headline: "Cover the platform from the inside. Get published. Get paid.",
    snippet: "TMI is accepting writers for news coverage, artist interviews, battle recaps, and sponsored editorial. Here's how to apply.",
    body: [
      { type: "paragraph", text: "The Musician's Index Magazine is live and expanding its writing team." },
      { type: "paragraph", text: "We're looking for reporters who understand music, culture, and live performance. You don't need a journalism degree. You need good instincts and deadline discipline." },
      { type: "paragraph", text: "Writer roles available: news reporter, artist profile writer, battle recap journalist, sponsored content editor." },
      { type: "paragraph", text: "Writers are paid per verified published article. Rates start at $25 per piece and scale with readership." },
      { type: "paragraph", text: "To apply, sign up with the Writer/Reporter role and submit a 200-word sample." },
    ],
    category: "news",
    icon: "✍️",
    templateType: "E",
    publishedAt: "2026-05-12",
    author: "TMI Editorial",
    heroColor: "#AA2DFF",
    accentColor: "#AA2DFF",
    sponsorPlacementIds: [],
    advertiserPlacementIds: [],
    tags: ["writers", "reporters", "magazine", "jobs"],
  },
];

// This is now the single source of truth for all articles.
// It includes the original magazine articles, converted to the new format.
// The old `magazineIssueData.ts` file can now be deprecated and removed.
export const EDITORIAL_ARTICLES: NewsArticle[] = [...BASE_ARTICLES, ...LAUNCH_ARTICLES /*, ...CONVERTED_MAGAZINE_ARTICLES */];

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
