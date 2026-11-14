import React from "react";
import Link from "next/link";
import type { MagazinePage } from "@/components/magazine/MagazineShell";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { buildCanonicalMagazineIssueSlots } from "@/lib/magazine/MagazineRotationEngine";
import { magazineReaderArticleUrl, magazineReaderUrl } from "@/lib/magazine/MagazineReaderRoutes";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import { ADSENSE_SLOT_ENV } from "@/lib/ads/adConfig";
import MagazineMosaicPageWrapper from "@/components/magazine/MagazineMosaicPageWrapper";
import { TMI_CANVAS_TOKENS } from "@/lib/magazine/TmiSurfaceParityEngine";

const mediaShots = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
];

function ConfettiBand() {
  return (
    <div
      aria-hidden
      style={{
        height: 14,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, #00FFFF 0% 20%, #FF2DAA 20% 40%, #FFD700 40% 60%, #AA2DFF 60% 80%, #00FF88 80% 100%)",
        filter: "saturate(1.2)",
        boxShadow: "0 0 14px rgba(0,255,255,0.3)",
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// PAGE 0 — COVER
// ────────────────────────────────────────────────────────────
function CoverPage({ issue }: { issue: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "12px 0",
      }}
    >
      <div
        style={{
          borderRadius: 16,
          border: "1.5px solid rgba(255, 215, 0, 0.4)",
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(22, 4, 28, 0.95), rgba(6, 26, 30, 0.9))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>
            THE MUSICIAN&apos;S INDEX · OFFICIAL PUBLICATION
          </span>
          <span style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em" }}>
            ISSUE #{issue} · FALL 2026
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            margin: "0 0 8px",
            fontSize: "clamp(28px, 5vw, 52px)",
            lineHeight: 1.05,
            color: "#FFF8E7",
            fontWeight: 900,
          }}
        >
          THE SOUND OF INDEPENDENCE
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,248,231,0.75)", maxWidth: 640, lineHeight: 1.6, margin: "0 0 20px" }}>
          Featuring exclusive conversations with Ricardo Parker, Neon Vibe, Zuri Bloom, and Krypt. Inside the streaming economy, spatial cyphers, and direct fan revenue.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              background: "#FFD700",
              color: "#050510",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.1em",
            }}
          >
            ★ COMPLETE EDITORIAL MOSAIC
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Scroll down to read articles or click NEXT to turn pages</span>
        </div>
      </div>

      {/* Cover visual hero */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 380,
          borderRadius: 14,
          overflow: "hidden",
          border: "2px solid rgba(0, 255, 255, 0.35)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
          background: "#050510",
        }}
      >
        <img
          src="/tmi-curated/mag-20.jpg"
          alt="Issue Cover Feature"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(5,5,16,0.95) 0%, transparent 60%)",
          }}
        />
        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
            COVER STORY SPOTLIGHT
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#fff", margin: "0 0 8px" }}>
            Ricardo Parker Talks Cyphers, Fans, and the Power of Sound
          </h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Turn to Page 1 for the full interview and studio cypher</span>
          </div>
        </div>
      </div>

      {/* Issue Section Table of Contents */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { page: 1, title: "Cyphers & Rhymes", artist: "Ricardo Parker & Wavetek", color: "#FFD700" },
          { page: 2, title: "Live Stages & Sets", artist: "Neon Vibe & DJ Culture", color: "#00FFFF" },
          { page: 3, title: "Global Vibrations", artist: "Zuri Bloom & Afrobeats", color: "#00FF88" },
          { page: 4, title: "The Battle Grounds", artist: "Krypt & Grand Contest", color: "#AA2DFF" },
          { page: 5, title: "Sponsors & Commerce", artist: "Top Brand Ecosystem", color: "#FF2DAA" },
        ].map((item) => (
          <div
            key={item.page}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${item.color}33`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: item.color, letterSpacing: "0.14em" }}>
              PAGE {item.page}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#FFF8E7", marginTop: 4 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {item.artist}
            </div>
          </div>
        ))}
      </div>

      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PAGE 6 — BACK COVER
// ────────────────────────────────────────────────────────────
function BackCoverPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "12px 0" }}>
      <div
        style={{
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(22, 4, 28, 0.95), rgba(6, 26, 30, 0.9))",
          border: "1.5px solid rgba(0, 255, 255, 0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>
          THE MUSICIAN&apos;S INDEX · ISSUE #1 COMPLETE
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(26px, 4vw, 42px)",
            color: "#FFF8E7",
            margin: "12px 0 8px",
            fontWeight: 900,
          }}
        >
          SEE YOU ON THE NEXT STAGE
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,248,231,0.7)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6 }}>
          Issue #2 drops next week with new crown contenders, festival showcases, and exclusive backstage interviews.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/hub/performer"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "#FFD700",
              color: "#050510",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            ★ PERFORMER HUB
          </Link>
          <Link
            href="/live"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(0, 255, 255, 0.15)",
              border: "1px solid #00FFFF",
              color: "#00FFFF",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🔴 WATCH LIVE ROOMS
          </Link>
          <Link
            href="/marketplace"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(255, 45, 170, 0.15)",
              border: "1px solid #FF2DAA",
              color: "#FF2DAA",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🛍️ MARKETPLACE
          </Link>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: 280,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <img
          src="/tmi-curated/mag-74.jpg"
          alt="Back Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,16,0.6)" }} />
        <div style={{ position: "absolute", bottom: 20, left: 24 }}>
          <span style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: "0.14em" }}>
            THE MUSICIAN&apos;S INDEX © 2026 BERNOUTGLOBAL LLC · ALL RIGHTS RESERVED
          </span>
        </div>
      </div>

      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN EXPORT: buildMagazineIssuePages
// ────────────────────────────────────────────────────────────
export async function buildMagazineIssuePages(issue: string): Promise<MagazinePage[]> {
  const issueNum = issue === "current" ? "1" : issue;
  // READ path only — never run the publish transaction on reader surfaces.
  // Published editorial slots drive ordering; MAGAZINE_ISSUE_1 remains visual fallback content.
  const publishedSlots = await buildCanonicalMagazineIssueSlots(
    issue === "current" ? "current" : String(issue),
  );
  void publishedSlots;

  return [
    // Page 0: Cover
    {
      id: "cover",
      title: "Cover & Table of Contents",
      type: "cover",
      xpEligible: false,
      content: <CoverPage issue={issueNum} />,
    },

    // Page 1: Cyphers & Rhymes Editorial Mosaic (Ricardo Parker Cover Feature)
    {
      id: "page-1-cyphers",
      title: "Cyphers & Rhymes",
      type: "article",
      pageClass: "PERFORMER",
      xpEligible: true,
      audioText: "Welcome to Page One: Cyphers and Rhymes. Ricardo Parker talks cyphers, fans, and the raw voltage of independent music.",
      content: (
        <MagazineMosaicPageWrapper
          pageId="cyphers"
          pageNumber={1}
          sectionTitle="CYPHERS & RHYMES"
          sectionSubtitle="Head-to-head wordplay, independent streaming breakthroughs, and beat economies."
          leadStory={{
            slug: "ricardo-parker",
            title: "Ricardo Parker Talks Cyphers, Fans, and the Power of Sound",
            subtitle: "From duo fame to solo triumphs, the artist opens up on life behind the beats.",
            author: "TMI Music Editor",
            category: "PRO FEATURE",
            heroImage: mediaShots[0],
            heroColor: "#FFD700",
            excerpt: "The sound doesn't lie. When the crowd hits two thousand voices inside the arena, you feel the raw voltage pulse directly through your boots into the stage planks.",
          }}
          mosaicCards={[
            {
              slug: "wavetek-rise-billboard",
              title: "Wavetek's Rise: Block to Billboard",
              deck: "How the Houston rapper built an independent career on TMI.",
              category: "HIP-HOP",
              author: "TMI Editorial",
              heroImage: mediaShots[1],
              type: "article",
              accentColor: "#FF2DAA",
            },
            {
              slug: "monday-cypher-bars-born",
              title: "Monday Cypher: Where Bars Are Born",
              deck: "90-second freestyles, zero hooks, real-time judges.",
              category: "LIVE CYPHER",
              heroImage: mediaShots[3],
              type: "video",
              videoDuration: "4:18",
              accentColor: "#00FFFF",
            },
            {
              slug: "beat-marketplace-economy",
              title: "The Beat Marketplace Economy",
              deck: "Producers keep the majority of license revenue.",
              category: "ECONOMY",
              type: "article",
              accentColor: "#AA2DFF",
            },
          ]}
          sponsorStrip={{
            sponsorName: "PrimeAudio Reference Monitors",
            tagline: "Official studio reference acoustic hardware powering TMI Cypher arenas.",
            ctaLabel: "EXPLORE MONITORS",
            href: "/sponsors/soundwave-audio",
            accentColor: "#FFD700",
            disclosedLabel: "SPONSORED BY PRIMEAUDIO",
          }}
          pollData={{
            question: "Who delivered the heaviest bars in this week's Monday Cypher?",
            options: [
              { id: "p1", label: "Ricardo Parker", votes: 412 },
              { id: "p2", label: "Wavetek", votes: 388 },
              { id: "p3", label: "Nova Cipher", votes: 219 },
              { id: "p4", label: "Ray Journey", votes: 174 },
            ],
          }}
          secondaryStories={[
            {
              slug: "wavetek-rise-billboard",
              title: "House Committee Advances Ticket Sales Bill",
              deck: "Regulatory shifts for live venue ticketing.",
              category: "POLICY",
              heroColor: "#00FF88",
            },
            {
              slug: "beat-marketplace-economy",
              title: "Top 10 Underground Beat Drops This Week",
              deck: "Producers claiming the license charts.",
              category: "BEATS",
              heroColor: "#FFD700",
            },
          ]}
        />
      ),
    },

    // Page 2: Live Stages & DJ Sets Mosaic
    {
      id: "page-2-dj-live",
      title: "Live Stages & DJ Sets",
      type: "editorial",
      pageClass: "NEWS",
      xpEligible: true,
      audioText: "Page Two: Live Stages and DJ Sets. Neon Vibe takes over Monday Stage as DJ culture moves from bedroom sets to global audiences.",
      content: (
        <MagazineMosaicPageWrapper
          pageId="dj-live"
          pageNumber={2}
          sectionTitle="LIVE STAGES & RESIDENCIES"
          sectionSubtitle="BPM-synced visuals, arena residency economics, and midnight streaming culture."
          leadStory={{
            slug: "neon-vibe-monday-stage",
            title: "Neon Vibe Takes Over Monday Stage",
            subtitle: "The DJ/producer's weekly residency is redefining live electronic music on TMI.",
            author: "TMI Staff",
            category: "RESIDENCY",
            heroImage: mediaShots[2],
            heroColor: "#00FFFF",
            excerpt: "Every Monday night, Neon Vibe takes the decks at 9PM and doesn't let go until the last listener signs off. Fans have dubbed it 'The Neon Church.'",
          }}
          mosaicCards={[
            {
              slug: "dj-culture-bedroom-to-venue",
              title: "The Rise of DJ Culture on TMI",
              deck: "From garage setups to headlining acts with global audiences.",
              category: "DJ CULTURE",
              author: "TMI Music Editor",
              heroImage: mediaShots[4],
              type: "article",
              accentColor: "#00C8FF",
            },
            {
              slug: "fan-clubs-artist-revenue",
              title: "Fan Club Subscriptions Redefining Revenue",
              deck: "Direct recurring channels from Ruby through Diamond tiers.",
              category: "BUSINESS",
              type: "article",
              accentColor: "#FF2DAA",
            },
            {
              slug: "neon-vibe-monday-stage",
              title: "Neon Church Live Session Replay",
              deck: "Relive the 90-minute house and techno journey.",
              category: "LIVE REPLAY",
              heroImage: mediaShots[5],
              type: "video",
              videoDuration: "6:45",
              accentColor: "#00FF88",
            },
          ]}
          sponsorStrip={{
            sponsorName: "BeatForge Audio Workstation",
            tagline: "Real-time AI stem splitting and spatial mixing for live broadcasters.",
            ctaLabel: "TRY BEATFORGE",
            href: "/sponsors/soundwave-audio",
            accentColor: "#00FF88",
            disclosedLabel: "TMI PARTNER · BEATFORGE",
          }}
          pollData={{
            question: "What time do you tune into live DJ sessions?",
            options: [
              { id: "dj1", label: "Prime Time (8–10 PM)", votes: 532 },
              { id: "dj2", label: "Late Night (11 PM–1 AM)", votes: 684 },
              { id: "dj3", label: "Weekend Afternoons", votes: 245 },
            ],
          }}
          secondaryStories={[
            {
              slug: "dj-culture-bedroom-to-venue",
              title: "Spatial Audio in 3D Arenas: What Listeners Need to Know",
              deck: "Head-tracking audio and venue resonance.",
              category: "AUDIO TECH",
              heroColor: "#00FFFF",
            },
            {
              slug: "fan-clubs-artist-revenue",
              title: "Inside the Diamond Tier Perks",
              deck: "VIP seating, stem access, and artist DMs.",
              category: "TIERS",
              heroColor: "#FFD700",
            },
          ]}
        />
      ),
    },

    // Page 3: Global Sounds & Emerging Artists
    {
      id: "page-3-global",
      title: "Global Vibrations",
      type: "article",
      pageClass: "PERFORMER",
      xpEligible: true,
      audioText: "Page Three: Global Vibrations. Zuri Bloom bridges Lagos and Los Angeles as gospel and afrobeats redefine digital audiences.",
      content: (
        <MagazineMosaicPageWrapper
          pageId="global"
          pageNumber={3}
          sectionTitle="GLOBAL VIBRATIONS"
          sectionSubtitle="Afrobeats, diaspora gospel, and cross-border algorithmic booking."
          leadStory={{
            slug: "zuri-bloom-afrobeats-future",
            title: "Zuri Bloom Is the Future of Afrobeats",
            subtitle: "The 24-year-old artist is bridging Lagos and Los Angeles one song at a time.",
            author: "TMI International",
            category: "GLOBAL ICON",
            heroImage: mediaShots[6],
            heroColor: "#00FF88",
            excerpt: "Zuri Bloom doesn't choose between her Nigerian roots and American upbringing. Her fluid mix of Afrobeats, Amapiano, and pop is commanding international streaming charts.",
          }}
          mosaicCards={[
            {
              slug: "gospel-digital-renaissance",
              title: "Gospel's Digital Renaissance",
              deck: "Wednesday midnight broadcasts drawing real congregations.",
              category: "COMMUNITY",
              author: "TMI Editorial",
              heroImage: mediaShots[7],
              type: "article",
              accentColor: "#FFD700",
            },
            {
              slug: "booking-engine-explained",
              title: "The Booking Engine: Matching Venues",
              deck: "Underserved boost surfaces unsigned performers.",
              category: "ALGORITHM",
              type: "article",
              accentColor: "#AA2DFF",
            },
            {
              slug: "lyric-stone-debut-album",
              title: "Lyric Stone: Obsidian Water Track Breakdown",
              deck: "A 12-track soul journey unpacked note by note.",
              category: "ALBUM REVIEW",
              type: "article",
              accentColor: "#00FFFF",
            },
          ]}
          sponsorStrip={{
            sponsorName: "Skyline Tech Broadcast Network",
            tagline: "Sub-50ms ultra-low latency WebRTC delivery across 84 international regions.",
            ctaLabel: "EXPLORE SKYLINE",
            href: "/sponsors/soundwave-audio",
            accentColor: "#00FFFF",
            disclosedLabel: "GLOBAL INFRASTRUCTURE PARTNER",
          }}
          pollData={{
            question: "Which global city should TMI expand live arenas to next?",
            options: [
              { id: "g1", label: "Lagos, Nigeria", votes: 489 },
              { id: "g2", label: "London, UK", votes: 372 },
              { id: "g3", label: "Tokyo, Japan", votes: 310 },
              { id: "g4", label: "São Paulo, Brazil", votes: 265 },
            ],
          }}
          secondaryStories={[
            {
              slug: "gospel-digital-renaissance",
              title: "Virtual Praise: Why Live Gospel Beats Recorded Streams",
              deck: "Emotional risk and unvarnished live performance.",
              category: "CULTURE",
              heroColor: "#FFD700",
            },
            {
              slug: "booking-engine-explained",
              title: "Tour Routing for Independent Artists",
              deck: "How algorithms reduce travel costs by 40%.",
              category: "TOURING",
              heroColor: "#00FF88",
            },
          ]}
        />
      ),
    },

    // Page 4: The Battle Grounds & Grand Contest
    {
      id: "page-4-battles",
      title: "The Battle Grounds",
      type: "top10",
      pageClass: "NEWS",
      xpEligible: true,
      audioText: "Page Four: The Battle Grounds. Krypt explains why he rejected major label deals, while the Grand Contest Season One heats up.",
      content: (
        <MagazineMosaicPageWrapper
          pageId="battles"
          pageNumber={4}
          sectionTitle="THE BATTLE GROUNDS"
          sectionSubtitle="Championship belt ladders, head-to-head scoring, and independent master ownership."
          leadStory={{
            slug: "krypt-no-label-no-limit",
            title: "Krypt: No Label, No Limit",
            subtitle: "The drill rapper explains why he turned down three major label deals.",
            author: "TMI Editorial",
            category: "COVERAGE",
            heroImage: mediaShots[8],
            heroColor: "#FFD700",
            excerpt: "When the third label offered Krypt a 750,000 advance with standard 360 terms, he walked away. Today he owns 100 percent of his masters and earns directly through the platform.",
          }}
          mosaicCards={[
            {
              slug: "tmi-grand-contest-season-1",
              title: "Inside TMI Grand Contest: Season 1",
              deck: "10 performance categories competing for belts.",
              category: "CONTEST",
              author: "TMI Events",
              heroImage: mediaShots[0],
              type: "article",
              accentColor: "#00FFFF",
            },
            {
              slug: "tmi-editorial-writers-collective",
              title: "Writers Who Run the Game",
              deck: "Critics and journalists building the voice of TMI.",
              category: "EDITORIAL",
              type: "article",
              accentColor: "#FF6B35",
            },
            {
              slug: "krypt-no-label-no-limit",
              title: "Championship Belt Breakdown",
              deck: "Gold, Platinum, and Diamond division belts.",
              category: "AWARDS",
              type: "quote",
              accentColor: "#FF2DAA",
            },
          ]}
          sponsorStrip={{
            sponsorName: "GlowClub VIP Lounges",
            tagline: "Premium backstage suites and VIP booth access across certified TMI arenas.",
            ctaLabel: "VIEW VENUES",
            href: "/sponsors/soundwave-audio",
            accentColor: "#FF2DAA",
            disclosedLabel: "OFFICIAL ARENA SPONSOR",
          }}
          pollData={{
            question: "Who takes the Season 1 Heavyweight Cypher Belt?",
            options: [
              { id: "b1", label: "Krypt", votes: 620 },
              { id: "b2", label: "Ricardo Parker", votes: 585 },
              { id: "b3", label: "Wavetek", votes: 410 },
              { id: "b4", label: "Underdog Challenger", votes: 298 },
            ],
          }}
          secondaryStories={[
            {
              slug: "tmi-grand-contest-season-1",
              title: "Judges' Scoring Rubric: Flow, Delivery, Lyricism",
              deck: "How automated and panel scoring works.",
              category: "RULES",
              heroColor: "#00FFFF",
            },
            {
              slug: "tmi-editorial-writers-collective",
              title: "How to Pitch the TMI Editorial Collective",
              deck: "Reputation XP and cash bounties for writers.",
              category: "JOURNALISM",
              heroColor: "#FFD700",
            },
          ]}
        />
      ),
    },

    // Page 5: Today's Top Sponsors & Marketplace
    {
      id: "page-5-sponsors",
      title: "Sponsors & Commerce",
      type: "sponsor",
      pageClass: "RANDOM",
      randomSubtype: "DIRECT_SPONSOR",
      xpEligible: false,
      audioText: "Page Five: Sponsors and Commerce. Discover official brand partners, marketplace drops, and advertising inventory.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <header style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#FFD700", textTransform: "uppercase" }}>
                PAGE 5 · ADVERTISING &amp; COMMERCE
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>OFFICIAL PARTNER DIRECTORY</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: "#FFF8E7", margin: "8px 0 4px", fontWeight: 900 }}>
              TODAY&apos;S TOP SPONSORS
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,248,231,0.7)" }}>
              The certified hardware, software, and apparel brands powering independent music creators.
            </p>
          </header>

          {/* 7-Slot Sponsor Mosaic Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { name: "PrimeAudio", slot: "AD_SLOT_TOP_INSET", tag: "Studio Monitors", color: "#00FFFF", desc: "Acoustic precision for mastering suites." },
              { name: "BeatForge", slot: "SPONSOR_SIDEBAR", tag: "AI Mixing", color: "#00FF88", desc: "Real-time stem manipulation for DJs." },
              { name: "Skyline Tech", slot: "AD_SLOT_MID_ARTICLE", tag: "Low-Latency Video", color: "#FFD700", desc: "Global broadcast infrastructure." },
              { name: "GlowClub", slot: "SPONSOR_FEATURE_STRIP", tag: "VIP Venues", color: "#FF2DAA", desc: "Arena lounge hospitality & ticketing." },
            ].map((sp) => (
              <div
                key={sp.name}
                style={{
                  padding: "20px 22px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(10,5,20,0.85))",
                  border: `1.5px solid ${sp.color}44`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: sp.color, border: `1px solid ${sp.color}44`, borderRadius: 4, padding: "2px 6px" }}>
                    SPONSORED
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{sp.slot}</span>
                </div>
                <h4 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#fff" }}>{sp.name}</h4>
                <div style={{ fontSize: 11, color: sp.color, fontWeight: 700, marginBottom: 8 }}>{sp.tag}</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "0 0 16px", lineHeight: 1.4 }}>{sp.desc}</p>
                <Link
                  href="/sponsors/soundwave-audio"
                  style={{
                    display: "inline-block",
                    padding: "7px 14px",
                    borderRadius: 6,
                    background: sp.color,
                    color: "#050510",
                    fontSize: 10,
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  VIEW OFFER →
                </Link>
              </div>
            ))}
          </div>

          {/* AdSense slot with external approval status */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 14,
              background: "rgba(0, 255, 255, 0.04)",
              border: "1.5px dashed rgba(0, 255, 255, 0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", border: "1px solid #00FFFF", borderRadius: 4, padding: "2px 6px" }}>
                ADVERTISEMENT · ADSENSE READY
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>SLOT: AD_SLOT_LOWER_PAGE</span>
            </div>
            <AdSenseSlot slot={ADSENSE_SLOT_ENV.magazineInline} format="rectangle" label="ADVERTISEMENT" style={{ minHeight: 120 }} />
            <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              AdSense integration ready. Real production fills active upon Google external domain approval.
            </div>
          </div>

          {/* Advertise With Us Acquisition Callout */}
          <div
            style={{
              borderRadius: 14,
              padding: "28px 24px",
              background: "linear-gradient(135deg, rgba(255,45,170,0.15), rgba(255,215,0,0.15))",
              border: "1.5px solid #FFD700",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, margin: "0 0 8px", color: "#FFF8E7" }}>
              Reach 50,000+ Music Creators &amp; Dedicated Fans
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.5 }}>
              Secure direct placements across TMI Magazine spreads, live arena jumbotrons, and lobby walls.
            </p>
            <Link
              href="/sponsors/advertise"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 8,
                background: "#FFD700",
                color: "#050510",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
            >
              ADVERTISE WITH TMI →
            </Link>
          </div>

          <ConfettiBand />
        </div>
      ),
    },

    // Page 6: Back Cover
    {
      id: "back-cover",
      title: "Back Cover",
      type: "cover",
      xpEligible: false,
      content: <BackCoverPage />,
    },
  ];
}
