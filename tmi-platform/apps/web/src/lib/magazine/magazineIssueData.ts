export interface ArticleBlock {
  type: "paragraph" | "heading" | "pullquote" | "image";
  text?: string;
  url?: string;
}

export interface MagazineArticle {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: string;
  category: "feature" | "interview" | "review" | "news" | "editorial";
  tags: string[];
  heroColor: string;
  icon: string;
  blocks: ArticleBlock[];
}

export const MAGAZINE_ISSUE_1: MagazineArticle[] = [
  {
    slug: "wavetek-rise-billboard",
    title: "Wavetek's Rise: From the Block to the Billboard",
    subtitle: "How the Houston rapper built a $2M streaming empire in 18 months",
    author: "TMI Editorial",
    publishedAt: "2026-04-01",
    category: "feature",
    tags: ["hip-hop", "independent", "streaming"],
    heroColor: "#FF2DAA",
    icon: "🎤",
    blocks: [
      { type: "paragraph", text: "Before the plaques, before the magazine covers, Wavetek was just another kid recording on his phone in his cousin's living room in Houston's Fifth Ward." },
      { type: "paragraph", text: "His debut single hit 100K streams in 72 hours — with zero promotion budget. Three months later, he was on TMI's front page." },
      { type: "pullquote", text: "\"I didn't wait for a label. TMI gave me the platform, the fans gave me the fuel.\"" },
      { type: "paragraph", text: "Now with over 2 million monthly listeners and a touring schedule that spans 15 cities, Wavetek is proving that independent artists can build empires on their own terms." },
    ],
  },
  {
    slug: "neon-vibe-monday-stage",
    title: "Neon Vibe Takes Over Monday Stage",
    subtitle: "The DJ/producer's weekly residency is redefining live electronic music",
    author: "TMI Staff",
    publishedAt: "2026-04-03",
    category: "interview",
    tags: ["edm", "dj", "monday-stage"],
    heroColor: "#00FFFF",
    icon: "🎧",
    blocks: [
      { type: "paragraph", text: "Every Monday night, something electric happens inside TMI's Monday Stage. Neon Vibe takes the decks at 9PM and doesn't let go until the last listener signs off." },
      { type: "paragraph", text: "The sets blend house, techno, and future bass in ways that shouldn't work — but always do. Fans have dubbed it 'The Neon Church.'" },
      { type: "pullquote", text: "\"The stage is alive. It breathes with the crowd. I just follow where the energy goes.\"" },
    ],
  },
  {
    slug: "beat-marketplace-economy",
    title: "The Beat Marketplace: Inside TMI's New Economy",
    subtitle: "How producers are earning five figures a month selling licenses",
    author: "TMI Finance Desk",
    publishedAt: "2026-04-05",
    category: "editorial",
    tags: ["beats", "marketplace", "economy"],
    heroColor: "#FFD700",
    icon: "💰",
    blocks: [
      { type: "paragraph", text: "Six months after launch, TMI's Beat Marketplace has processed over $400,000 in license sales. The average producer earns $3,200 per month." },
      { type: "paragraph", text: "Basic licenses start at $25. Premium goes for $75. Exclusive deals regularly top $500 — and producers keep 90% of every sale." },
      { type: "paragraph", text: "The key innovation: tagged previews. Buyers hear the beat with a vocal watermark, making theft nearly impossible while keeping the buying experience frictionless." },
    ],
  },
  {
    slug: "lyric-stone-debut-album",
    title: "Lyric Stone's Debut Album: Track by Track",
    subtitle: "The R&B/Soul artist breaks down every track on 'Obsidian Water'",
    author: "TMI Music Editor",
    publishedAt: "2026-04-07",
    category: "review",
    tags: ["r&b", "soul", "album-review"],
    heroColor: "#AA2DFF",
    icon: "🎵",
    blocks: [
      { type: "paragraph", text: "'Obsidian Water' is a 12-track journey through heartbreak, healing, and hard-won joy. We sat with Lyric Stone for three hours to unpack every song." },
      { type: "heading", text: "Track 1: Glass Roots" },
      { type: "paragraph", text: "\"This was the first song I wrote for the album. I was in Atlanta, it was 3AM, and I just started crying at the piano. That's Glass Roots.\"" },
      { type: "heading", text: "Track 5: Neon Rain" },
      { type: "paragraph", text: "\"Neon Rain is for everyone who's ever loved someone who was bad for them and didn't care.\"" },
    ],
  },
  {
    slug: "zuri-bloom-afrobeats-future",
    title: "Zuri Bloom Is the Future of Afrobeats",
    subtitle: "The 24-year-old artist is bridging Lagos and Los Angeles one song at a time",
    author: "TMI International",
    publishedAt: "2026-04-09",
    category: "feature",
    tags: ["afrobeats", "pop", "rising-artist"],
    heroColor: "#00FF88",
    icon: "🌍",
    blocks: [
      { type: "paragraph", text: "Zuri Bloom doesn't choose between her Nigerian roots and her American upbringing. She lets both live in every note." },
      { type: "paragraph", text: "Her sound — a fluid mix of Afrobeats, Amapiano, and mainstream pop — has already earned her collaborations with three Afrobeats legends." },
      { type: "pullquote", text: "\"My grandmother's voice is in my music. She sang to me in Yoruba every night. That doesn't leave you.\"" },
    ],
  },
  {
    slug: "fan-clubs-artist-revenue",
    title: "How TMI's Fan Club System Is Changing Artist Revenue",
    subtitle: "Artists are earning $8,000–$40,000 per month from fan club memberships alone",
    author: "TMI Finance Desk",
    publishedAt: "2026-04-11",
    category: "news",
    tags: ["fan-clubs", "revenue", "subscriptions"],
    heroColor: "#FF2DAA",
    icon: "📊",
    blocks: [
      { type: "paragraph", text: "The math is simple: 1,000 fans paying $9.99/month = $9,990 in recurring monthly revenue. Minus platform fees, that's roughly $7,900 landing directly in the artist's wallet." },
      { type: "paragraph", text: "TMI's Fan Club system launched with four tiers — Bronze, Silver, Gold, and Platinum — each offering escalating access." },
      { type: "paragraph", text: "The top-earning artist on the platform has 4,200 Fan Club members across all tiers, generating $38,000 per month in membership revenue." },
    ],
  },
  {
    slug: "krypt-no-label-no-limit",
    title: "Krypt: No Label, No Limit",
    subtitle: "The drill rapper explains why he turned down three major label deals",
    author: "TMI Editorial",
    publishedAt: "2026-04-13",
    category: "interview",
    tags: ["drill", "independent", "business"],
    heroColor: "#FFD700",
    icon: "🔒",
    blocks: [
      { type: "paragraph", text: "When the third label offered Krypt a deal — $750,000 advance, three-album commitment, standard 360 terms — he said no." },
      { type: "pullquote", text: "\"I looked at the numbers. After recoupment, after touring percentages — they were going to make more off me than I was. TMI changed my math.\"" },
      { type: "paragraph", text: "Today Krypt owns 100% of his masters and pulls $22,000 per month from the platform before a single show." },
    ],
  },
  {
    slug: "tmi-grand-contest-season-1",
    title: "Inside the TMI Grand Contest: Season 1 Preview",
    subtitle: "Everything you need to know about the platform's first major competition",
    author: "TMI Events",
    publishedAt: "2026-04-15",
    category: "news",
    tags: ["contest", "season-1", "competition"],
    heroColor: "#00FFFF",
    icon: "🏆",
    blocks: [
      { type: "paragraph", text: "Categories: Singers, Rappers, DJs, Dancers, Comedians, Beatmakers, Bands, Magicians, Influencers, and Freestyle." },
      { type: "paragraph", text: "Prize pool: $250,000 across all categories. Grand Prize winner takes $100,000 plus a recording contract." },
      { type: "pullquote", text: "\"This isn't a talent show. This is a launchpad.\"" },
    ],
  },
  {
    slug: "booking-engine-explained",
    title: "The Booking Engine: How TMI Matches Artists and Venues",
    subtitle: "An inside look at the algorithm getting unsigned artists on real stages",
    author: "TMI Tech Desk",
    publishedAt: "2026-04-17",
    category: "editorial",
    tags: ["booking", "venues", "algorithm"],
    heroColor: "#AA2DFF",
    icon: "🎭",
    blocks: [
      { type: "paragraph", text: "The TMI Booking Engine analyzes 12 data points to match artists with venues: genre compatibility, geographic radius, budget alignment, and more." },
      { type: "paragraph", text: "\"Underserved boost\" deliberately surfaces emerging artists who haven't been booked recently, preventing the rich-get-richer effect." },
      { type: "paragraph", text: "In its first quarter, the engine facilitated 1,247 bookings across 23 states, with an average artist payout of $1,800 per show." },
    ],
  },
  {
    slug: "monday-cypher-bars-born",
    title: "Monday Cypher: Where Bars Are Born",
    subtitle: "TMI's weekly freestyle session has become the most competitive platform in rap",
    author: "TMI Live Desk",
    publishedAt: "2026-04-19",
    category: "feature",
    tags: ["cypher", "freestyle", "rap"],
    heroColor: "#00FF88",
    icon: "🎙️",
    blocks: [
      { type: "paragraph", text: "Every Monday at 8PM, the Monday Cypher goes live. What started as a casual experiment now draws 15,000+ simultaneous viewers." },
      { type: "paragraph", text: "The format is simple: 90-second freestyles, no hooks, no repeated bars. Judges score in real time. The top 3 earn platform XP bonuses and homepage placement." },
      { type: "paragraph", text: "Three Monday Cypher participants have since signed major deals. The Cypher is officially a talent pipeline." },
    ],
  },
];

export function getArticleBySlug(slug: string): MagazineArticle | undefined {
  return MAGAZINE_ISSUE_1.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: MagazineArticle["category"]): MagazineArticle[] {
  return MAGAZINE_ISSUE_1.filter(a => a.category === category);
}

export function getFeaturedArticles(count = 3): MagazineArticle[] {
  return MAGAZINE_ISSUE_1.filter(a => a.category === "feature").slice(0, count);
}
