import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { editorialSubmissionEngine } from "@/lib/editorial-economy/EditorialSubmissionEngine";
import type { EditorialSubmission } from "@/lib/editorial-economy/types";

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
  /** Links author name to /profile/writer/[writerSlug] when present */
  writerSlug?: string;
  /** Links to /performers/[slug] + /articles/performer/[slug] — used by discovery wheel + article profile CTA */
  performerSlug?: string;
  /** News/editorial category linking to /articles/news/[slug] when type is 'news' */
  newsSlug?: string;
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
    subtitle: "How the Houston rapper built his independent streaming career on TMI",
    author: "TMI Editorial",
    performerSlug: "wavetek",
    publishedAt: "2026-04-01",
    category: "feature",
    tags: ["hip-hop", "independent", "streaming"],
    heroColor: "#FF2DAA",
    icon: "🎤",
    blocks: [
      { type: "paragraph", text: "Before the plaques, before the magazine covers, Wavetek was just another kid recording on his phone in his cousin's living room in Houston's Fifth Ward." },
      { type: "paragraph", text: "His debut single found a fast, engaged audience with zero promotion budget. Within months, he was on TMI's front page." },
      { type: "pullquote", text: "\"I didn't wait for a label. TMI gave me the platform, the fans gave me the fuel.\"" },
      { type: "paragraph", text: "Wavetek is proving that independent artists can build a real following on their own terms — no label, no gatekeeper, just a platform and an audience." },
    ],
  },
  {
    slug: "neon-vibe-monday-stage",
    title: "Neon Vibe Takes Over Monday Stage",
    subtitle: "The DJ/producer's weekly residency is redefining live electronic music",
    author: "TMI Staff",
    newsSlug: "neon-vibe-monday-stage",
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
    subtitle: "How producers are building real income selling beat licenses on TMI",
    author: "TMI Finance Desk",
    publishedAt: "2026-04-05",
    category: "editorial",
    tags: ["beats", "marketplace", "economy"],
    heroColor: "#FFD700",
    icon: "💰",
    blocks: [
      { type: "paragraph", text: "TMI's Beat Marketplace lets producers sell licenses directly to artists, no middleman required." },
      { type: "paragraph", text: "Basic, Premium, and Exclusive license tiers give producers flexibility in how they price and protect their work — and producers keep the large majority of every sale." },
      { type: "paragraph", text: "The key innovation: tagged previews. Buyers hear the beat with a vocal watermark, making theft nearly impossible while keeping the buying experience frictionless." },
    ],
  },
  {
    slug: "lyric-stone-debut-album",
    title: "Lyric Stone's Debut Album: Track by Track",
    subtitle: "The R&B/Soul artist breaks down every track on 'Obsidian Water'",
    author: "TMI Music Editor",
    performerSlug: "lyric-stone",
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
    performerSlug: "zuri-bloom",
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
    subtitle: "How TMI's tiered fan club system gives artists a direct, recurring revenue channel",
    author: "TMI Finance Desk",
    publishedAt: "2026-04-11",
    category: "news",
    tags: ["fan-clubs", "revenue", "subscriptions"],
    heroColor: "#FF2DAA",
    icon: "📊",
    blocks: [
      { type: "paragraph", text: "The model is simple: fans pay a recurring monthly fee to join an artist's club, and the artist keeps the large majority of that revenue after platform fees." },
      { type: "paragraph", text: "TMI's Fan Club system launched with tiers spanning RUBY through DIAMOND, each offering escalating access." },
      { type: "paragraph", text: "For artists building a direct relationship with their most dedicated fans, Fan Club membership is designed to become a real, recurring revenue channel over time." },
    ],
  },
  {
    slug: "krypt-no-label-no-limit",
    title: "Krypt: No Label, No Limit",
    subtitle: "The drill rapper explains why he turned down three major label deals",
    author: "TMI Editorial",
    performerSlug: "krypt",
    publishedAt: "2026-04-13",
    category: "interview",
    tags: ["drill", "independent", "business"],
    heroColor: "#FFD700",
    icon: "🔒",
    blocks: [
      { type: "paragraph", text: "When the third label offered Krypt a deal — $750,000 advance, three-album commitment, standard 360 terms — he said no." },
      { type: "pullquote", text: "\"I looked at the numbers. After recoupment, after touring percentages — they were going to make more off me than I was. TMI changed my math.\"" },
      { type: "paragraph", text: "Today Krypt owns 100% of his masters and builds his income directly through the platform, before a single show." },
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
      { type: "paragraph", text: "Winners earn XP, titles, homepage and Billboard features, and a shot at real industry exposure through the platform's ranking and discovery system." },
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
      { type: "paragraph", text: "The engine is already connecting unsigned artists with real venues across the country, one booking at a time." },
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
      { type: "paragraph", text: "Every Monday at 8PM, the Monday Cypher goes live. What started as a casual experiment has grown into one of TMI's most competitive weekly rooms." },
      { type: "paragraph", text: "The format is simple: 90-second freestyles, no hooks, no repeated bars. Judges score in real time. The top 3 earn platform XP bonuses and homepage placement." },
      { type: "paragraph", text: "For the artists who show up week after week, the Cypher has become a real proving ground." },
    ],
  },
  {
    slug: "dj-culture-bedroom-to-venue",
    title: "The Rise of DJ Culture on TMI: From Bedroom Sets to Live Venues",
    subtitle: "How the platform turned amateur selectors into headlining acts with global audiences",
    author: "TMI Music Editor",
    publishedAt: "2026-04-21",
    category: "feature",
    tags: ["dj", "culture", "electronic", "live"],
    heroColor: "#00C8FF",
    icon: "🎧",
    blocks: [
      { type: "paragraph", text: "Two years ago, DJ Kairo was spinning sets in a converted garage in Newark, New Jersey. His audience was eleven people — mostly family, two friends, and a neighbor who wandered in by mistake." },
      { type: "paragraph", text: "Today, Kairo broadcasts from the same setup to a real, growing Friday night audience. He's turned down two venue residency offers because, as he puts it, 'the living room pays better.'" },
      { type: "pullquote", text: "\"I didn't need a club. TMI gave me a stage bigger than any club I've ever played.\"" },
      { type: "paragraph", text: "The DJ economy on TMI runs on a combination of live tips, fan club subscriptions, and merchandise sold during broadcast." },
      { type: "heading", text: "The Architecture of a DJ Set on TMI" },
      { type: "paragraph", text: "A typical TMI DJ session runs 90 minutes. The opening 15 minutes are free and public — this is the discovery window, where non-subscribers can tune in. Partway through the set, a 'going subscriber-only' overlay appears, giving casual listeners a natural moment to become fan club members." },
      { type: "paragraph", text: "The platform's BPM-synced visual engine — the same system powering TMI's Monday Stage and Cypher Arena — gives DJ broadcasts a visual identity that matches the music's energy. Listeners don't just hear the set. They watch it." },
    ],
  },
  {
    slug: "gospel-digital-renaissance",
    title: "Gospel's Digital Renaissance: How TMI Is Reviving a Genre",
    subtitle: "Contemporary gospel artists are finding the largest audiences of their careers — online, at midnight, in real time",
    author: "TMI Editorial",
    publishedAt: "2026-04-23",
    category: "feature",
    tags: ["gospel", "spiritual", "community", "live"],
    heroColor: "#00FF88",
    icon: "🙏",
    blocks: [
      { type: "paragraph", text: "Sunday services have always filled pews. But Wednesday night on TMI? That's where the real congregation gathers." },
      { type: "paragraph", text: "The Gospel Collective — an informal group of artists who coordinate broadcast schedules to avoid overlapping — has built a real, growing weekly audience. No label involvement. No radio play. Just voice, piano, and faith." },
      { type: "pullquote", text: "\"People want to feel something real. We give them that every week, and they keep coming back.\" — Minister E. Laine, Collective founder" },
      { type: "heading", text: "Why Gospel Works on Live Platforms" },
      { type: "paragraph", text: "Unlike recorded gospel, live gospel carries risk — and audiences respond to that risk emotionally. A missed note, a cracked voice, a moment of visible prayer before the chorus — these are the details that streaming albums eliminate and that live platforms amplify." },
      { type: "paragraph", text: "TMI's audience interaction features — live praise comments, virtual altar calls, and the 'AMEN' reaction button — created a digital worship experience that neither YouTube nor Instagram could replicate." },
    ],
  },
  {
    slug: "tmi-editorial-writers-collective",
    title: "Writers Who Run the Game: TMI's Editorial Collective",
    subtitle: "Meet the critics, journalists, and storytellers building the voice of the platform",
    author: "TMI Staff",
    publishedAt: "2026-04-25",
    category: "interview",
    tags: ["writers", "editorial", "journalism"],
    heroColor: "#FF6B35",
    icon: "✍️",
    blocks: [
      { type: "paragraph", text: "Every platform needs a voice. TMI's voice is built by a growing collective of contributors — some career journalists, some first-time writers, all deeply embedded in the music scene they cover." },
      { type: "heading", text: "The Freelance Economy" },
      { type: "paragraph", text: "TMI pays contributors per published piece, with standard pieces, features, and exclusive interviews compensated at different tiers as the contributor program grows." },
      { type: "pullquote", text: "\"I wrote my first TMI piece as a side hustle. Now it's my full-time career. I cover four genres and interview artists I used to only listen to.\" — Contributor, V. Marsh" },
      { type: "heading", text: "What They Cover" },
      { type: "paragraph", text: "The collective doesn't specialize in gossip or controversy. Their focus is craft: technique breakdowns, career analysis, business-of-music reporting, and long-form artist profiles. The editorial philosophy is that readers come for the music, but they stay for the story behind the music." },
    ],
  },
  {
    slug: "live-monetization-tip-economy",
    title: "The Secret Economy of Tip Jars: Inside Live Monetization",
    subtitle: "How real-time tipping during live broadcasts is becoming a real revenue channel for performers",
    author: "TMI Finance Desk",
    publishedAt: "2026-04-27",
    category: "editorial",
    tags: ["monetization", "tips", "economy", "live"],
    heroColor: "#FFD700",
    icon: "💸",
    blocks: [
      { type: "paragraph", text: "Individual tips are usually small — a few dollars here and there — but across a broadcast, and across a platform, they add up into a real income channel most performers never had access to before." },
      { type: "paragraph", text: "Artists keep the large majority of every tip after platform fees." },
      { type: "pullquote", text: "\"I got a tip in the middle of a song. I didn't miss a beat, but I was crying inside.\" — Performer, Lyric Stone" },
      { type: "heading", text: "The Psychology of the Tip" },
      { type: "paragraph", text: "Performers who've broadcast on TMI describe tips clustering at predictable moments: immediately after a major vocal performance, later in long broadcasts when audience loyalty is highest, and right after a performer acknowledges a fan by name." },
      { type: "paragraph", text: "The name-acknowledgment moment is a favorite among experienced performers — fans respond to being seen, and it shows in how the room reacts." },
    ],
  },
  {
    slug: "spoken-word-moment-tmi",
    title: "Spoken Word Is Having a Moment — And TMI Is the Reason Why",
    subtitle: "Poetry slams, storytellers, and spoken artists are finding a real audience on a platform designed for music",
    author: "TMI Arts Desk",
    publishedAt: "2026-04-29",
    category: "feature",
    tags: ["spoken-word", "poetry", "arts", "culture"],
    heroColor: "#AA2DFF",
    icon: "📖",
    blocks: [
      { type: "paragraph", text: "When TMI added Spoken Artists as an official category, it was considered a risk. Would music fans stay for poetry?" },
      { type: "paragraph", text: "The answer arrived quickly: Spoken Word broadcasts consistently hold viewers longer than almost any other format on the platform." },
      { type: "pullquote", text: "\"Words hit different when someone's looking you in the eyes while they say them. That's what live poetry is.\" — Versa King, featured spoken artist" },
      { type: "heading", text: "The Format That Works" },
      { type: "paragraph", text: "The most successful spoken word broadcasts on TMI follow a consistent structure: one original piece, one audience request, one collaborative piece where audience members contribute lines via live chat, and a closing piece. Total runtime: 35-50 minutes." },
      { type: "paragraph", text: "The collaborative piece — where the performer weaves submitted audience lines into a spontaneous poem — has become TMI's most-shared content format, regularly outperforming music clips on social platforms." },
    ],
  },
  {
    slug: "battle-rap-judging-mathematics",
    title: "Inside the Cypher: The Mathematics of Battle Rap Judging",
    subtitle: "TMI's scoring system uses seven criteria to evaluate freestyles in real time — here's how it works",
    author: "TMI Live Desk",
    publishedAt: "2026-05-01",
    category: "editorial",
    tags: ["battle-rap", "judging", "cypher", "scoring"],
    heroColor: "#FF2DAA",
    icon: "🎯",
    blocks: [
      { type: "paragraph", text: "Every bar in a TMI battle earns a score. The scoring engine evaluates seven dimensions: lyricism (25%), delivery (20%), crowd response (20%), wordplay complexity (15%), originality (10%), flow consistency (5%), and topical relevance (5%)." },
      { type: "heading", text: "The Crowd Response Factor" },
      { type: "paragraph", text: "The crowd response metric is the most controversial — and the most democratic. It measures real-time audience reactions: emote spikes, chat velocity, and tip timestamps. A technically perfect bar that lands flat with the crowd scores lower than a crowd-destroying bar with minor technical imperfections." },
      { type: "pullquote", text: "\"The system is designed to reflect how rap actually works. The crowd always knows.\" — TMI Chief Judge, A. Wallace" },
      { type: "paragraph", text: "Judges can override algorithmic scores in extreme cases — a bar that references a recent tragedy, for example, might be algorithmically neutral but ethically problematic. Human oversight keeps the competition meaningful." },
    ],
  },
  {
    slug: "venue-spotlight-arena-prime",
    title: "Venue Spotlight: Arena Prime and the Future of Virtual Concerts",
    subtitle: "Inside the platform's flagship virtual venue and how it's built to scale",
    author: "TMI Venues Desk",
    publishedAt: "2026-05-03",
    category: "review",
    tags: ["venues", "virtual", "concert", "arena"],
    heroColor: "#FF6B35",
    icon: "🏟️",
    blocks: [
      { type: "paragraph", text: "Arena Prime is TMI's largest virtual venue — capacity 50,000 simultaneous audience seats — and it operates like a real arena in almost every meaningful way." },
      { type: "paragraph", text: "Performers book time slots through the Venue Booking Engine, which accounts for genre conflicts, audience crossover, and optimal scheduling windows." },
      { type: "heading", text: "The Audience Experience" },
      { type: "paragraph", text: "Arena Prime's audience view places fans in rendered seat rows with view-distance simulation — front-row ticket holders see the stage differently than balcony seats. The experience is built on AudienceScene technology, designed to scale toward its full seating capacity as the platform grows." },
      { type: "pullquote", text: "\"I've played real arenas. Arena Prime is different — you can actually feel the crowd reacting to the same moment.\" — Wavetek, after his Arena Prime debut" },
      { type: "paragraph", text: "Venue sponsors can purchase branded seat sections, LED screen placements, and interval bumper slots — creating a revenue layer that parallels real-world arena economics." },
    ],
  },
  {
    slug: "season-pass-superfan-economy",
    title: "Season Pass: How TMI Turned Superfans Into Investors",
    subtitle: "The platform's season pass model gave its most dedicated fans a stake in the platform's success",
    author: "TMI Finance Desk",
    publishedAt: "2026-05-05",
    category: "news",
    tags: ["season-pass", "subscriptions", "community", "revenue"],
    heroColor: "#00FFFF",
    icon: "🎟️",
    blocks: [
      { type: "paragraph", text: "When TMI launched its Season Pass program, the founding team was nervous. Would music fans pay $49.99 for a platform-wide subscription on top of individual artist fan clubs?" },
      { type: "paragraph", text: "The answer came quickly — Season Pass found a real, dedicated audience from day one." },
      { type: "heading", text: "What Season Pass Includes" },
      { type: "paragraph", text: "Access to all live events, no ticket fees. Priority seating in Arena Prime. Early access to new features and beta programs. Monthly editorial content bundle (12 premium articles, 4 exclusive interviews). 10% discount on all marketplace purchases. Quarterly platform report with artist earnings data and competition results." },
      { type: "pullquote", text: "\"The quarterly report alone is worth the price. I use it to decide which artists to invest in.\" — Season Pass holder" },
    ],
  },
  {
    slug: "comedy-night-files",
    title: "The Comedy Night Files: Stand-Up Finds Its Live Stage",
    subtitle: "TMI's Comedy Night has become the most-watched live comedy event not on network television",
    author: "TMI Live Desk",
    publishedAt: "2026-05-07",
    category: "feature",
    tags: ["comedy", "stand-up", "live", "entertainment"],
    heroColor: "#FFD700",
    icon: "😂",
    blocks: [
      { type: "paragraph", text: "Comedy Night on TMI runs every Thursday at 9PM. The lineup: five comedians, five minutes each, audience voting after every set, top vote-getter returns for a 10-minute closer." },
      { type: "paragraph", text: "Thursday viewership has grown steadily since launch, with standout nights drawing the platform's biggest comedy crowds yet." },
      { type: "pullquote", text: "\"Stand-up has always needed a room. TMI gave us the biggest room we've ever been in.\" — Featured comedian, T. Ramos" },
      { type: "heading", text: "The Business of Live Comedy on a Music Platform" },
      { type: "paragraph", text: "The cross-genre discovery effect is real — comedy, counterintuitively, has become one of TMI's strongest ways to introduce new people to the platform." },
    ],
  },
  {
    slug: "dance-crew-hip-hop-economy",
    title: "Break Dancers, Hip Hop Heads, and the Dance Crew Economy",
    subtitle: "How visual performance artists are building real income on an audio-first platform",
    author: "TMI Arts Desk",
    publishedAt: "2026-05-09",
    category: "feature",
    tags: ["dance", "hip-hop-dance", "breaking", "crews"],
    heroColor: "#AA2DFF",
    icon: "🕺",
    blocks: [
      { type: "paragraph", text: "When the platform added Dance Crews as an official category, the engineering team had to solve a problem: how do you make a dance performance feel as immersive online as it does in person?" },
      { type: "paragraph", text: "The answer was multi-camera switching — crews can broadcast from up to four angles simultaneously, with the audience able to choose their view. The default 'Director's Cut' switches automatically based on the crew's pre-choreographed camera call sheet." },
      { type: "pullquote", text: "\"We treat every online show like a movie set. The cameras are part of the performance.\" — Cipher Crew, Los Angeles" },
      { type: "paragraph", text: "The top dance crews on the platform earn real, recurring income across tips, subscription content, and merchandise — and their audiences keep growing." },
    ],
  },
  {
    slug: "bar-god-nova-battle-brotherhood",
    title: "Bar God vs. Nova: Battle Culture and Brotherhood",
    subtitle: "The two Chicago emcees who turned rivalry into a business model",
    author: "TMI Editorial",
    performerSlug: "bar-god",
    publishedAt: "2026-05-11",
    category: "interview",
    tags: ["battle-rap", "chicago", "interview", "hip-hop"],
    heroColor: "#FF2DAA",
    icon: "⚔️",
    blocks: [
      { type: "paragraph", text: "The first time Bar God and Nova shared a stage, it was a battle. They split the judges 2-1. Neither claimed the win. Neither admitted the loss." },
      { type: "paragraph", text: "Two years later, they share a merchandise line, a podcast, and a combined fan club roster that keeps growing. The rivalry wasn't an ending — it was a beginning." },
      { type: "pullquote", text: "\"Battle rap is the only genre where your competition makes you bigger. Every bar he throws at me builds my rep.\" — Bar God" },
      { type: "heading", text: "The Business of a Rivalry" },
      { type: "paragraph", text: "Their joint shows — branded 'The Rematch Series' — reliably pack Arena Prime whenever they're announced, and the two artists have built a real business around their friendly rivalry." },
      { type: "pullquote", text: "\"We figured out that winning against each other is worth less than winning together.\" — Nova" },
    ],
  },
  {
    slug: "lagos-burst-afrobeats-wave",
    title: "New Artist Spotlight: Lagos Burst and the Afrobeats Wave",
    subtitle: "The Nigeria-based crew redefining what a global music career looks like in 2026",
    author: "TMI International",
    performerSlug: "lagos-burst",
    publishedAt: "2026-05-13",
    category: "feature",
    tags: ["afrobeats", "nigeria", "lagos", "global"],
    heroColor: "#00FF88",
    icon: "🌍",
    blocks: [
      { type: "paragraph", text: "Lagos Burst vs. Verse launched on TMI from a recording space above a market in Lagos Island. Their first broadcast attracted 12 viewers — all family members, by their own admission." },
      { type: "paragraph", text: "Months later, they'd built a real global audience and were booked for a three-city UK tour, organized entirely through TMI's booking engine." },
      { type: "heading", text: "The African Artist Advantage" },
      { type: "paragraph", text: "TMI's global rankings don't weight by region — a listener from Lagos counts the same as a listener from Los Angeles. This has benefited African artists disproportionately, as their existing regional audiences translate directly into global platform rank." },
      { type: "pullquote", text: "\"We were already big at home. TMI told the world we were big. That's the difference.\"" },
      { type: "paragraph", text: "Their genre — a fusion of Afrobeats, drill, and spoken Yoruba verse — has been categorized by TMI's genre algorithm as 'Global Fusion' and has seeded a new discovery category that's finding real listeners of its own." },
    ],
  },
  {
    slug: "dj-kraze-world-tour-diary",
    title: "DJ Kraze's World Tour Diary: 30 Cities, 30 Stories",
    subtitle: "The Diamond-tier DJ shares the moments, mistakes, and milestones of his first global tour",
    author: "TMI Staff",
    performerSlug: "dj-kraze",
    publishedAt: "2026-05-15",
    category: "interview",
    tags: ["dj", "tour", "diary", "edm", "global"],
    heroColor: "#00C8FF",
    icon: "✈️",
    blocks: [
      { type: "paragraph", text: "DJ Kraze arrived in Tokyo at 5AM, jet-lagged, with a hard drive full of sets and a soundcheck in four hours. He broadcast the entire soundcheck on TMI — and fans from around the world tuned in to watch." },
      { type: "pullquote", text: "\"The tour isn't just 30 cities anymore. It's 30 cities plus however many people are watching every minute.\"" },
      { type: "heading", text: "The Hybrid Tour Model" },
      { type: "paragraph", text: "Kraze's tour operated on a hybrid model he designed himself: every physical show was also broadcast on TMI with a virtual ticket, letting a global audience join a room they could never fly to." },
      { type: "paragraph", text: "He streamed rehearsals, soundchecks, afterparties, and bus conversations. The TMI audience wasn't just watching the tour — they were living it alongside him, city after city." },
    ],
  },
  {
    slug: "astra-nova-global-fanbase-guide",
    title: "Astra Nova's Guide to Building a Global Fanbase",
    subtitle: "The Platinum-tier R&B artist breaks down the seven strategies that built her loyal fan club",
    author: "TMI Music Editor",
    performerSlug: "astra-nova",
    publishedAt: "2026-05-17",
    category: "interview",
    tags: ["r&b", "fanbase", "strategy", "astra-nova"],
    heroColor: "#FF2DAA",
    icon: "🌟",
    blocks: [
      { type: "paragraph", text: "Astra Nova's fan club roster grew steadily through her first year on TMI. She attributes this to what she calls 'the seven rules of honest performance.'" },
      { type: "heading", text: "Rule 1: Never Miss a Scheduled Broadcast" },
      { type: "paragraph", text: "\"Consistency is trust. If I say I'm live at 8PM on Thursday, I'm live at 8PM on Thursday. Even if I'm sick. Even if only 200 people show up. Those 200 people become your most loyal fans because they know you'll always show up.\"" },
      { type: "heading", text: "Rule 2: Thank Your Tippers by Name" },
      { type: "paragraph", text: "\"I keep a list. Every time someone tips, I say their name out loud before the next song. It takes three seconds and it builds a bond that lasts years.\"" },
      { type: "pullquote", text: "\"Build the room. The algorithms will find the room once the room is real.\"" },
      { type: "paragraph", text: "Her remaining five rules — vulnerability scheduling, genre surfing, fan club exclusivity design, archive monetization, and collaboration targeting — are available in full in her TMI Masterclass, accessible to Season Pass holders." },
    ],
  },
  {
    slug: "stream-win-radio-explained",
    title: "Stream & Win Radio: The Show That Pays You to Listen",
    subtitle: "TMI's most innovative format rewards audience participation with real cash and platform XP",
    author: "TMI Tech Desk",
    publishedAt: "2026-05-19",
    category: "news",
    tags: ["stream-win", "radio", "innovation", "rewards"],
    heroColor: "#00FF88",
    icon: "📻",
    blocks: [
      { type: "paragraph", text: "Stream & Win Radio isn't a gimmick. It's a carefully engineered loyalty and retention system disguised as entertainment — and it works." },
      { type: "paragraph", text: "The mechanics: listeners tune in live. At random intervals — between 8 and 22 minutes apart — a 'Win Window' opens. Listeners who are actively watching (not idle, confirmed by engagement signal) receive a prompt. First to respond correctly to a trivia question wins the round." },
      { type: "heading", text: "What You Can Win" },
      { type: "paragraph", text: "Round prizes: platform XP, fan club credit toward an artist of choice, merchandise vouchers, and sponsor-provided rewards. Longer streaks of verified active listening unlock bigger rewards." },
      { type: "pullquote", text: "\"I won a prize while doing dishes. That's not something that happens on Spotify.\"" },
      { type: "paragraph", text: "Sponsor integration: brands can purchase Win Windows, making the prize a branded experience. A Win Window sponsored by 'Beat Lab Studios' might offer a free beat license as the reward." },
    ],
  },
  {
    slug: "venue-booking-guide-unsigned-artists",
    title: "Venue Booking Guide: How to Get Your Act on Stage",
    subtitle: "The complete walkthrough for unsigned artists navigating TMI's booking engine",
    author: "TMI Artist Support",
    publishedAt: "2026-05-21",
    category: "editorial",
    tags: ["booking", "venues", "guide", "unsigned-artists"],
    heroColor: "#FF6B35",
    icon: "📋",
    blocks: [
      { type: "heading", text: "Step 1: Complete Your Artist Profile" },
      { type: "paragraph", text: "The booking engine won't surface you to venues until your profile has: a bio (minimum 150 words), at least one audio track, a verified genre tag, city/region, and a performance availability calendar. Incomplete profiles are invisible to venue searches." },
      { type: "heading", text: "Step 2: Build a Show History" },
      { type: "paragraph", text: "Virtual shows on TMI count as verified performance history. Venues booking through the engine can see your average audience size, your audience retention rate, and your tip income per show. These three numbers are the equivalent of a booking agent's packet — build them deliberately." },
      { type: "pullquote", text: "\"My first real venue booking came after I'd built a consistent show history. It was like a door unlocked.\" — Artist, D. Faulkner" },
      { type: "heading", text: "Step 3: Use the Smart Pitch Tool" },
      { type: "paragraph", text: "The Smart Pitch tool generates a one-page booking proposal using your profile data and sends it to up to five venues per week. Artists with a verified show history see meaningfully better response rates. For artists with no show history, the tool recommends building three virtual events first." },
    ],
  },
  {
    slug: "sponsor-report-what-brands-pay-for",
    title: "The Sponsor Report: What Brands Are Paying for in Live Music",
    subtitle: "An inside look at TMI's advertising and sponsorship market — what converts, what doesn't, and what's next",
    author: "TMI Finance Desk",
    publishedAt: "2026-05-23",
    category: "news",
    tags: ["sponsors", "advertising", "brands", "revenue"],
    heroColor: "#FFD700",
    icon: "📊",
    blocks: [
      { type: "paragraph", text: "Brands that sponsor on TMI aren't buying impressions. They're buying moments." },
      { type: "paragraph", text: "The highest-converting ad unit on the platform isn't a banner or a pre-roll. It's the artist-read sponsorship — where the performer incorporates the brand into their live broadcast authentically." },
      { type: "heading", text: "Why It Works" },
      { type: "paragraph", text: "Artist-read sponsorships consistently outperform banner ads and pre-roll interruptions in early results. The difference isn't just format — it's trust. When an artist their fans adore recommends something, those fans listen." },
      { type: "pullquote", text: "\"The artist mentioned the product for 45 seconds. That's the most efficient ad spend I've ever run.\" — Brand partner" },
      { type: "paragraph", text: "Available sponsorship categories: Fan Club Sponsor (name in artist's subscriber emails), Live Show Sponsor (branded Win Windows and overlay moments), Beat Marketplace Featured Placement, and Homepage Billboard placement." },
    ],
  },
  {
    slug: "songwriter-index-behind-the-scenes",
    title: "The Songwriter's Index: How Behind-the-Scenes Talent Gets Credit",
    subtitle: "TMI's songwriter registry is changing how the music industry credits and compensates the people behind the songs",
    author: "TMI Music Editor",
    publishedAt: "2026-05-25",
    category: "editorial",
    tags: ["songwriters", "credits", "industry", "rights"],
    heroColor: "#AA2DFF",
    icon: "🎼",
    blocks: [
      { type: "paragraph", text: "Every song performed on TMI can be registered with its songwriter data — the names, splits, and publishing information for everyone who contributed to its creation." },
      { type: "paragraph", text: "This isn't a royalty system — TMI doesn't collect or distribute mechanical royalties. What it does is create a permanent, searchable record that connects every live performance back to its creative origins." },
      { type: "heading", text: "Why This Matters" },
      { type: "paragraph", text: "The music industry has a credit problem. Songs have been recorded, licensed, and performed for decades with songwriter information trapped in label databases that don't talk to each other. TMI's public songwriter registry changes the discovery direction — fans who love a performance can now find every other song the songwriter ever wrote." },
      { type: "pullquote", text: "\"I wrote a song that became a hit. Nobody knew it was mine until it showed up on TMI with my name on it.\" — Nashville songwriter" },
    ],
  },
  {
    slug: "home-3-live-world-explained",
    title: "Home 3: Inside TMI's Live World Network",
    subtitle: "The platform's most ambitious project connects every live room, battle stage, and audience into one unified experience",
    author: "TMI Tech Desk",
    publishedAt: "2026-05-27",
    category: "editorial",
    tags: ["live", "rooms", "network", "technology"],
    heroColor: "#00FFFF",
    icon: "🌐",
    blocks: [
      { type: "paragraph", text: "Home 3 isn't a page. It's a network. Every live room, every battle stage, every cypher circle, every comedy set, every DJ broadcast — all of it feeds into one unified view that shows you exactly what's happening across the entire platform right now." },
      { type: "paragraph", text: "The Billboard Live Wall at the center of Home 3 updates in real time. If 400 people just flooded into a battle room because an upset happened, you'll see it on the wall before any notification reaches you." },
      { type: "heading", text: "How the Wall Works" },
      { type: "paragraph", text: "The Billboard Live Wall shows 16 tiles simultaneously — 12 active rooms ranked by current audience size, 2 'trending up' tiles for rooms growing fastest, 1 'featured' tile from the editorial team, and 1 'new broadcast' tile for the most recent stream to go live." },
      { type: "pullquote", text: "\"I've discovered 30 artists I now follow just by looking at the wall for five minutes.\" — Fan, J. Okafor" },
    ],
  },
  {
    slug: "producers-economy-beat-licensing",
    title: "The Producer's Economy: Selling Beats in the Age of TMI",
    subtitle: "How producers on the platform are earning without labels, without middle-men, and without giving up rights",
    author: "TMI Finance Desk",
    publishedAt: "2026-05-29",
    category: "news",
    tags: ["producers", "beats", "licensing", "economy"],
    heroColor: "#FF2DAA",
    icon: "🎹",
    blocks: [
      { type: "paragraph", text: "The producer tier on TMI doesn't perform. They supply. Every artist who needs a track, a sound, or a custom beat can find one through the Beat Marketplace — and every transaction benefits the platform's producing community." },
      { type: "paragraph", text: "The Beat Marketplace catalog is growing every week, with new producers listing tracks and existing catalogs picking up repeat licenses from artists who found a sound they liked." },
      { type: "heading", text: "License Types Explained" },
      { type: "paragraph", text: "Basic License: non-exclusive streaming rights with a capped play count, no physical distribution. Premium License: non-exclusive, unlimited streaming, physical distribution allowed. Exclusive License: full ownership transfer, artist gets exclusive rights and the beat is removed from marketplace." },
      { type: "pullquote", text: "\"I sold an exclusive last month for real money. That beat only took me a few hours to make.\" — Producer, K. Mayne" },
      { type: "paragraph", text: "Producers on the platform keep the large majority of every license sale. The platform fee funds the marketplace infrastructure, the discovery algorithms, and the promotional placement that drives traffic to their catalog." },
    ],
  },
];
function getMagazineIssue1(): MagazineArticle[] {
  return MAGAZINE_ISSUE_1;
}

/**
 * Approved contributor submissions become readable articles under their own
 * submissionId slug — this is what lets a writer's piece actually resolve to
 * full content once the review queue clears it (see /editorial/review).
 * Unapproved/rejected submissions never resolve here, so a guessed
 * submissionId can't leak unmoderated content onto a public surface.
 */
async function writerArticleFromSubmission(submission: EditorialSubmission): Promise<MagazineArticle> {
  const contributor = await contributorAccountEngine.get(submission.contributorId);
  const paragraphs = submission.body
    .split(/\n+/)
    .map((text) => text.trim())
    .filter(Boolean);

  return {
    slug: submission.submissionId,
    title: submission.title,
    subtitle: paragraphs[0]?.slice(0, 140) ?? submission.title,
    author: contributor?.displayName ?? "TMI Contributor",
    writerSlug: submission.contributorId,
    performerSlug: submission.artistSlug,
    publishedAt: submission.publishedAt ?? submission.updatedAt,
    category: submission.category === "interview" ? "interview" : "news",
    tags: [submission.category],
    heroColor: "#00FFFF",
    icon: "📝",
    blocks: paragraphs.length > 0 ? paragraphs.map((text) => ({ type: "paragraph" as const, text })) : [{ type: "paragraph", text: submission.title }],
  };
}

export async function getArticleBySlug(slug: string): Promise<MagazineArticle | undefined> {
  const staffArticle = getMagazineIssue1().find(a => a.slug === slug);
  if (staffArticle) return staffArticle;

  const submission = await editorialSubmissionEngine.get(slug);
  if (submission && (submission.status === "approved" || submission.status === "published")) {
    return writerArticleFromSubmission(submission);
  }
  return undefined;
}

export function getArticlesByCategory(category: MagazineArticle["category"]): MagazineArticle[] {
  return getMagazineIssue1().filter(a => a.category === category);
}

export function getFeaturedArticles(count = 3): MagazineArticle[] {
  return getMagazineIssue1().filter(a => a.category === "feature").slice(0, count);
}

export function getRecentArticles(count = 4): MagazineArticle[] {
  return [...getMagazineIssue1()]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

/** PERFORMER pool: articles tied to a registry slug. */
export function getPerformerPoolArticles(): MagazineArticle[] {
  return getMagazineIssue1().filter((article) => Boolean(article.performerSlug));
}

/** NEWS pool: news/editorial/interview that is not a performer feature. */
export function getNewsPoolArticles(): MagazineArticle[] {
  return getMagazineIssue1().filter((article) => {
    if (article.performerSlug) return false;
    return article.category === "news" || article.category === "editorial" || article.category === "interview";
  });
}
