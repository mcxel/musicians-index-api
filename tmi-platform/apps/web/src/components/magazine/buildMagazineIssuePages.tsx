import { ImageSlotWrapper } from '@/components/visual-enforcement';
import Link from "next/link";
import type { MagazinePage } from "@/components/magazine/MagazineShell";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";

type TileProps = {
  title: string;
  deck?: string;
  href: string;
  accent: string;
};

type ImageTileProps = {
  src: string;
  href: string;
  label: string;
  ratio?: "portrait" | "video" | "square" | "tall";
  faceCrop?: boolean;
};

const sponsorLogos = [
  "/sponsors/primeaudio.svg",
  "/sponsors/beatforge.svg",
  "/sponsors/skyline-tech.svg",
  "/sponsors/glowclub.svg",
];

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

function panel(accent: string) {
  return {
    border: `1px solid ${accent}88`,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${accent}28, rgba(5,5,16,0.88))`,
    padding: 10,
  } as const;
}

function TextTile({ title, deck, href, accent }: TileProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "#fff", ...panel(accent), display: "grid", gap: 6 }}>
      <span style={{ fontSize: 9, letterSpacing: "0.16em", fontWeight: 900, color: accent }}>{title}</span>
      {deck && <span style={{ fontSize: 11, lineHeight: 1.45, color: "rgba(255,255,255,0.9)" }}>{deck}</span>}
      <span style={{ fontSize: 9, letterSpacing: "0.11em", fontWeight: 800 }}>OPEN →</span>
    </Link>
  );
}

function ImageTile({ src, href, label, ratio = "portrait", faceCrop = false }: ImageTileProps) {
  const aspectRatioMap = {
    video: "16 / 9",
    square: "1 / 1",
    portrait: "3 / 4",
    tall: "2 / 3",
  };
  const aspectRatio = aspectRatioMap[ratio];
  const objectPosition = ratio === "video" ? "center" : faceCrop ? "center 15%" : "center 20%";

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: 10,
        overflow: "hidden",
        background: "rgba(5,5,16,0.75)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: "100%", aspectRatio, overflow: "hidden", flexShrink: 0 }}>
        <ImageSlotWrapper imageId="img-tmrq2" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
      </div>
      <span style={{ fontSize: 9, padding: "6px 8px", letterSpacing: "0.11em", color: "#FFD700", fontWeight: 800, flexShrink: 0 }}>{label}</span>
    </Link>
  );
}

function ConfettiBand() {
  return (
    <div
      aria-hidden
      style={{
        height: 20,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, #00FFFF 0 20%, #FF2DAA 20% 40%, #FFD700 40% 60%, #AA2DFF 60% 80%, #00FF88 80% 100%)",
        filter: "saturate(1.2)",
        boxShadow: "0 0 14px rgba(0,255,255,0.4)",
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// PAGE COMPONENTS — A variants (first half of issue)
// ────────────────────────────────────────────────────────────

function FeatureImagePage({ article, image, artistSlug, artistImage }: { article: MagazineArticle; image: string; artistSlug: string; artistImage: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ConfettiBand />
      <ImageTile src={image} href={`/magazine/article/${article.slug}`} label="FEATURE IMAGE" ratio="video" />
      <TextTile
        title={article.title.toUpperCase()}
        deck={article.subtitle}
        href={`/magazine/article/${article.slug}`}
        accent={article.heroColor}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ImageTile src={artistImage} href={`/artists/${artistSlug}`} label="ARTIST" ratio="portrait" faceCrop />
        <TextTile title="READ ARTICLE" deck="Open the full editorial inside." href={`/magazine/article/${article.slug}`} accent="#FFD700" />
      </div>
    </div>
  );
}

// Page 3 — Article Mix A: side-by-side text + image with poll/news grid
function MixedEditorialPageA({ article, fallbackNewsSlug }: { article: MagazineArticle; fallbackNewsSlug: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
        <TextTile
          title="ARTICLE PREVIEW"
          deck={article.blocks.find((block) => block.type === "paragraph")?.text ?? article.subtitle}
          href={`/magazine/article/${article.slug}`}
          accent="#00FFFF"
        />
        <ImageTile src={mediaShots[1]} href="/live" label="VIDEO PREVIEW" ratio="video" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="POLL CARD" deck="Vote this story to next week's cover." href="/games/polls" accent="#AA2DFF" />
        <TextTile title="NEWS TILE" deck="Trending chart movements and recaps." href={`/articles/news/${fallbackNewsSlug}`} accent="#FFD700" />
      </div>
      <TextTile title="SPONSOR TILE" deck="Sponsored segment placement in this spread." href="/sponsors/soundwave-audio" accent="#FF2DAA" />
      <ConfettiBand />
    </div>
  );
}

// Page 4 — Sponsor A: logo grid with market drop
function SponsorCollagePageA() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TextTile title="SPONSOR POWER PANEL" deck="Magazine ad inventory, sponsor offers, and launch rails." href="/articles/sponsor/soundwave-audio-presents-the-beat-vault" accent="#FFD700" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {sponsorLogos.slice(0, 2).map((logo, index) => (
          <Link key={logo} href="/sponsors/soundwave-audio" style={{ ...panel(index === 0 ? "#00FFFF" : "#FF2DAA"), display: "grid", placeItems: "center", minHeight: 110 }}>
            <ImageSlotWrapper imageId="img-k9mv3" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          </Link>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="MARKET DROP" deck="Bundle launches in marketplace." href="/marketplace" accent="#00FF88" />
        <ImageTile src={mediaShots[3]} href="/live" label="VENUE SPOTLIGHT" ratio="video" />
      </div>
      <ConfettiBand />
    </div>
  );
}

// Page 5 — Artist Spotlight A: portrait trio across top
function ArtistSpotlightPageA() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <ImageTile src={mediaShots[2]} href="/artists/ray-journey" label="RAY JOURNEY" ratio="portrait" faceCrop />
        <ImageTile src={mediaShots[5]} href="/artists/nova-cipher" label="NOVA CIPHER" ratio="portrait" faceCrop />
        <ImageTile src={mediaShots[7]} href="/artists/zuri-bloom" label="ZURI BLOOM" ratio="portrait" faceCrop />
      </div>
      <TextTile title="ARTIST SPOTLIGHT" deck="Profiles, article links, and booking movement inside the issue." href="/articles/artist/ray-journey-builds-his-empire" accent="#00FFFF" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="BOOK NOW" deck="Artist booking details from profile rail." href="/artists/ray-journey" accent="#FFD700" />
        <TextTile title="READ ARTICLE" deck="Open artist editorial detail view." href="/magazine/article/wavetek-rise-billboard" accent="#FF2DAA" />
      </div>
    </div>
  );
}

// Page 6 — Poll/Video A: poll first, then big video
function PollVideoArchivePageA() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TextTile title="LIVE POLL" deck="Fans decide next cover hero in real time." href="/games/polls" accent="#AA2DFF" />
      <ImageTile src={mediaShots[8]} href="/live" label="LIVE VIDEO TILE" ratio="video" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="ARCHIVE" deck="Jump to prior issue spreads." href="/magazine/archive" accent="#00FFFF" />
        <TextTile title="MARKETPLACE" deck="Issue product cards and limited drops." href="/marketplace" accent="#FFD700" />
      </div>
      <TextTile title="CONTINUE READING" deck="Read full issue and continue from saved spread." href="/magazine/issue/current" accent="#FF2DAA" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PAGE COMPONENTS — B variants (second half of issue, distinct layouts)
// ────────────────────────────────────────────────────────────

// Page 8 — Article Mix B: full-width image banner → full-width article headline → 3-column tiles
function MixedEditorialPageB({ article, fallbackNewsSlug }: { article: MagazineArticle; fallbackNewsSlug: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ConfettiBand />
      <ImageTile src={mediaShots[4]} href={`/magazine/article/${article.slug}`} label="EDITORIAL IMAGE" ratio="video" />
      <TextTile
        title={article.title.toUpperCase()}
        deck={article.blocks.find((block) => block.type === "paragraph")?.text ?? article.subtitle}
        href={`/magazine/article/${article.slug}`}
        accent="#FF2DAA"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <TextTile title="POLL" deck="Cast your vote now." href="/games/polls" accent="#AA2DFF" />
        <TextTile title="NEWS" deck="This week's chart recap." href={`/articles/news/${fallbackNewsSlug}`} accent="#FFD700" />
        <TextTile title="ARCHIVE" deck="Past issue index." href="/magazine/archive" accent="#00FFFF" />
      </div>
    </div>
  );
}

// Page 9 — Sponsor B: image-first, then 4-logo row, then CTA pair
function SponsorCollagePageB() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ImageTile src={mediaShots[6]} href="/sponsors/soundwave-audio" label="PRESENTED BY" ratio="video" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {sponsorLogos.map((logo, index) => (
          <Link
            key={logo}
            href="/sponsors/soundwave-audio"
            style={{ ...panel(["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF"][index % 4]), display: "grid", placeItems: "center", minHeight: 70 }}
          >
            <ImageSlotWrapper imageId="img-66vu8" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          </Link>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="ADVERTISE WITH TMI" deck="Reach 10K+ music industry fans." href="/sponsors/soundwave-audio" accent="#00FF88" />
        <TextTile title="SPONSOR ARTICLE" deck="Full editorial placement available." href="/articles/sponsor/soundwave-audio-presents-the-beat-vault" accent="#FFD700" />
      </div>
      <ConfettiBand />
    </div>
  );
}

// Page 10 — Artist Spotlight B: hero portrait left + content stack right, media shots bottom
function ArtistSpotlightPageB() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, alignItems: "start" }}>
        <ImageTile src={mediaShots[3]} href="/artists/lena-sky" label="LENA SKY" ratio="tall" faceCrop />
        <div style={{ display: "grid", gap: 8 }}>
          <TextTile title="FEATURED ARTIST" deck="This week's spotlight pick from the index." href="/artists/lena-sky" accent="#FF2DAA" />
          <TextTile title="BOOK NOW" deck="Check availability." href="/artists/lena-sky" accent="#FFD700" />
          <TextTile title="ARTICLE" deck="Read full profile." href="/magazine/article/wavetek-rise-billboard" accent="#00FFFF" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ImageTile src={mediaShots[1]} href="/artists/marcus-wave" label="MARCUS WAVE" ratio="video" />
        <ImageTile src={mediaShots[0]} href="/artists/dj-storm" label="DJ STORM" ratio="video" />
      </div>
    </div>
  );
}

// Page 11 — Poll/Video B: big video top, poll + text bottom, confetti at end
function PollVideoArchivePageB() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ImageTile src={mediaShots[6]} href="/live" label="THIS WEEK IN TMI" ratio="video" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="LIVE POLL" deck="Who should be next month's cover?" href="/games/polls" accent="#AA2DFF" />
        <TextTile title="BATTLES TODAY" deck="See all active contests running now." href="/battles/today" accent="#FF2DAA" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ImageTile src={mediaShots[2]} href="/winners" label="WINNERS" ratio="square" />
        <TextTile title="WINNER HALL" deck="All-time champions and ceremony replays." href="/winner-hall" accent="#FFD700" />
      </div>
      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// STRUCTURAL PAGES
// ────────────────────────────────────────────────────────────

function CoverPage({ issue }: { issue: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.35)",
          padding: 10,
          background: "linear-gradient(135deg, rgba(0,255,255,0.18), rgba(255,45,170,0.22), rgba(255,215,0,0.18))",
          display: "grid",
          gap: 7,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#00FFFF", fontWeight: 900 }}>THE MUSICIAN&apos;S INDEX</div>
        <h1 style={{ margin: 0, fontSize: "clamp(19px, 4vw, 32px)", lineHeight: 1.05 }}>ISSUE {issue} COLLAGE EDITION</h1>
        <Link href="/magazine" style={{ color: "#050510", background: "#FFD700", textDecoration: "none", borderRadius: 8, padding: "7px 10px", fontSize: 10, fontWeight: 900, width: "fit-content" }}>
          LOBBY INDEX
        </Link>
      </div>
      <ImageTile src={mediaShots[0]} href="/magazine/article/wavetek-rise-billboard" label="COVER FEATURE" ratio="video" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="WEEKLY CROWN" href="/battles/b1" accent="#FF2DAA" />
        <TextTile title="TOP STORIES" href="/articles" accent="#00FFFF" />
      </div>
      <ConfettiBand />
    </div>
  );
}

function BackCoverPage() {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <div style={{ ...panel("#00FFFF"), textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#FFD700", fontWeight: 900 }}>NEXT ISSUE PREVIEW</div>
        <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>SEE YOU NEXT WEEK</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <TextTile title="MAGAZINE LOBBY" href="/magazine" accent="#FF2DAA" />
        <TextTile title="ARCHIVE" href="/magazine/archive" accent="#00FFFF" />
      </div>
      <ImageTile src={mediaShots[7]} href="/magazine/issue/current" label="READ AGAIN" ratio="video" />
      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// BUILDER
// ────────────────────────────────────────────────────────────

export function buildMagazineIssuePages(issue: string): MagazinePage[] {
  const issueNum = issue === "current" ? "1" : issue;
  const a0 = MAGAZINE_ISSUE_1[0];
  const a1 = MAGAZINE_ISSUE_1[1];
  const a2 = MAGAZINE_ISSUE_1[2];
  const a3 = MAGAZINE_ISSUE_1[3];

  return [
    {
      id: "cover",
      title: "Cover",
      type: "cover",
      content: <CoverPage issue={issueNum} />,
    },
    {
      id: "feature-a",
      title: "Feature Image",
      type: "article",
      content: <FeatureImagePage article={a0} image={mediaShots[2]} artistSlug="ray-journey" artistImage={mediaShots[5]} />,
    },
    {
      id: "article-mix-a",
      title: "Article Mix",
      type: "editorial",
      content: <MixedEditorialPageA article={a1} fallbackNewsSlug="tmi-season-1-standings-week-16" />,
    },
    {
      id: "sponsor-a",
      title: "Sponsor Mix",
      type: "sponsor",
      content: <SponsorCollagePageA />,
    },
    {
      id: "artist-a",
      title: "Artist Spotlight",
      type: "interview",
      content: <ArtistSpotlightPageA />,
    },
    {
      id: "poll-video-a",
      title: "Poll & Video",
      type: "editorial",
      content: <PollVideoArchivePageA />,
    },
    {
      id: "feature-b",
      title: "Feature Image 2",
      type: "article",
      content: <FeatureImagePage article={a2} image={mediaShots[4]} artistSlug="zuri-bloom" artistImage={mediaShots[8]} />,
    },
    {
      id: "article-mix-b",
      title: "Article Mix 2",
      type: "article",
      content: <MixedEditorialPageB article={a3} fallbackNewsSlug="tmi-season-1-standings-week-16" />,
    },
    {
      id: "sponsor-b",
      title: "Sponsor Mix 2",
      type: "sponsor",
      content: <SponsorCollagePageB />,
    },
    {
      id: "artist-b",
      title: "Artist Spotlight 2",
      type: "interview",
      content: <ArtistSpotlightPageB />,
    },
    {
      id: "poll-video-b",
      title: "Poll & Video 2",
      type: "editorial",
      content: <PollVideoArchivePageB />,
    },
    {
      id: "back-cover",
      title: "Back Cover",
      type: "cover",
      content: <BackCoverPage />,
    },
  ];
}
