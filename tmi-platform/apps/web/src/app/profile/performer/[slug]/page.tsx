import Link from "next/link";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { SPONSOR_PLACEMENTS } from "@/lib/editorial/SponsorPlacementModel";
import { profileToArticleRoute } from "@/lib/editorial/editorialRoutingResolver";
import PerformerProfileShell from "@/components/performer/PerformerProfileShell";
import PerformerBattleRail from "@/components/performer/PerformerBattleRail";
import PerformerBookingRail from "@/components/performer/PerformerBookingRail";
import PerformerMediaRail from "@/components/performer/PerformerMediaRail";
import PreviewWindow from "@/components/hubs/PreviewWindow";
import PerformerVideoPanel from "@/components/media/PerformerVideoPanel";
import PerformerSponsorShelf, {
  type PerformerSponsor,
} from "@/components/performer/PerformerSponsorShelf";
import type { SponsorSlot } from "@/components/performer/DynamicRadialAura";
import ViralShareButton from "@/components/share/ViralShareButton";

interface Props {
  params: { slug: string };
}

const KNOWN_PERFORMERS: Record<
  string,
  {
    displayName: string;
    tagline: string;
    rank: number;
    wins: number;
    losses: number;
    isVerified: boolean;
    currentStreak: number;
    longestStreak: number;
    hasArticle: boolean;
    isLive: boolean;
    liveVenueName?: string;
    openToMeetGreet: boolean;
    openToBooking: boolean;
    genres: string[];
  }
> = {
  "nova-cipher": {
    displayName: "Nova Cipher",
    tagline: "8-streak battle champion. TMI Season 1 frontrunner.",
    rank: 1,
    wins: 8,
    losses: 0,
    isVerified: true,
    currentStreak: 8,
    longestStreak: 8,
    hasArticle: true,
    isLive: true,
    liveVenueName: "Cypher Arena",
    openToMeetGreet: true,
    openToBooking: true,
    genres: ["hip-hop", "cypher", "battle-rap"],
  },
  "flowstate-j": {
    displayName: "FlowState.J",
    tagline: "Cypher artist, viral content creator, #4 ranked performer",
    rank: 4,
    wins: 5,
    losses: 2,
    isVerified: false,
    currentStreak: 3,
    longestStreak: 5,
    hasArticle: false,
    isLive: false,
    openToMeetGreet: true,
    openToBooking: true,
    genres: ["hip-hop", "freestyle"],
  },
  test: {
    displayName: "Test Performer",
    tagline: "Deterministic smoke fixture for performer profile route proof.",
    rank: 99,
    wins: 1,
    losses: 1,
    isVerified: false,
    currentStreak: 1,
    longestStreak: 1,
    hasArticle: false,
    isLive: false,
    openToMeetGreet: false,
    openToBooking: false,
    genres: [],
  },
};

function seedPerformer(slug: string) {
  if (KNOWN_PERFORMERS[slug]) return KNOWN_PERFORMERS[slug];
  const display = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    displayName: display,
    tagline: `Performer profile for ${display}.`,
    rank: 50,
    wins: 0,
    losses: 0,
    isVerified: false,
    currentStreak: 0,
    longestStreak: 0,
    hasArticle: false,
    isLive: false,
    openToMeetGreet: false,
    openToBooking: true,
    genres: [],
  };
}

// ─── Seed sponsor data per performer ─────────────────────────────────────────

const SEED_SPONSORS: Record<string, PerformerSponsor[]> = {
  "nova-cipher": [
    { id: "nc-s1", merchantName: "BeatBox Labs",   merchantCategory: "Music Tech",    sponsorClass: "local",  packageLabel: "Local Premium",  monthlyRateCents: 10000,  status: "active",  color: "#00FFFF" },
    { id: "nc-s2", merchantName: "FlexFit Gear",   merchantCategory: "Apparel",       sponsorClass: "local",  packageLabel: "Local Standard", monthlyRateCents: 5000,   status: "active",  color: "#FF2DAA" },
    { id: "nc-s3", merchantName: "CyberDrip Co",   merchantCategory: "Fashion",       sponsorClass: "local",  packageLabel: "Local Standard", monthlyRateCents: 5000,   status: "active",  color: "#AA2DFF" },
    { id: "nc-s4", merchantName: "SoundWave Pro",  merchantCategory: "Audio Gear",    sponsorClass: "major",  packageLabel: "Major Basic",    monthlyRateCents: 15000,  status: "active",  color: "#FFD700" },
    { id: "nc-s5", merchantName: "Urban Media Grp",merchantCategory: "Media",         sponsorClass: "major",  packageLabel: "Major Standard", monthlyRateCents: 35000,  status: "active",  color: "#00FF88" },
    { id: "nc-s6", merchantName: "NovaNest Drinks", merchantCategory: "Beverages",    sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,   status: "pending", color: "#FF6B35" },
  ],
  "flowstate-j": [
    { id: "fj-s1", merchantName: "Verse Kicks",    merchantCategory: "Footwear",      sponsorClass: "local",  packageLabel: "Local Standard", monthlyRateCents: 5000,   status: "active",  color: "#00FFFF" },
    { id: "fj-s2", merchantName: "FreeStyle Fuel",  merchantCategory: "Energy Drinks", sponsorClass: "local",  packageLabel: "Local Basic",    monthlyRateCents: 2500,   status: "active",  color: "#FFD700" },
    { id: "fj-s3", merchantName: "GridLock Studios",merchantCategory: "Recording",     sponsorClass: "major",  packageLabel: "Major Basic",    monthlyRateCents: 15000,  status: "pending", color: "#AA2DFF" },
  ],
};

// Default seed sponsors for unknown performers (shows 2 actives, rest open)
function seedSponsors(slug: string): PerformerSponsor[] {
  if (SEED_SPONSORS[slug]) return SEED_SPONSORS[slug];
  // Generic placeholders so every profile has something to show
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    { id: `${slug}-s1`, merchantName: "Local Biz Co",    merchantCategory: "Local Business", sponsorClass: "local", packageLabel: "Local Basic",    monthlyRateCents: 2500,  status: "active",  color: "#00FFFF" },
    { id: `${slug}-s2`, merchantName: "Brand Partner",   merchantCategory: "Retail",          sponsorClass: "local", packageLabel: "Local Standard", monthlyRateCents: 5000,  status: h % 2 === 0 ? "active" : "pending", color: "#FF2DAA" },
  ];
}

// Build aura slots from active sponsors only (shown orbiting avatar)
function buildAuraSlots(sponsors: PerformerSponsor[]): SponsorSlot[] {
  return sponsors
    .filter((s) => s.status === "active")
    .slice(0, 8) // cap at 8 for orbit legibility
    .map((s) => ({ id: s.id, label: s.merchantName, color: s.color }));
}

function getRelatedArticles(slug: string) {
  return EDITORIAL_ARTICLES.filter(
    (a) => a.relatedPerformerSlug === slug || a.category === "performer" || a.tags.includes("battle"),
  ).slice(0, 5);
}

function getRelatedSponsors() {
  return SPONSOR_PLACEMENTS.filter((s) => s.zone === "mid-article" || s.zone === "side-rail").slice(0, 4);
}

function rotateFrom<T>(items: T[], seed: string, count = 3): T[] {
  if (items.length <= count) return items;
  const start = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % items.length;
  return Array.from({ length: count }, (_, i) => items[(start + i) % items.length]);
}

const ACCENT = "#FF2DAA";
const GOLD = "#facc15";
const CYAN = "#00f5ff";

export default function PerformerProfilePage({ params }: Props) {
  const performer = seedPerformer(params.slug);
  const articleRoute = performer.hasArticle ? profileToArticleRoute("performer", params.slug) : undefined;

  const performerSponsors = seedSponsors(params.slug);
  const auraSlots = buildAuraSlots(performerSponsors);

  const articleRail = rotateFrom(
    [
      { label: "Cover Story", href: articleRoute ?? "/magazine/articles/test", note: articleRoute ? "Linked" : "Fallback" },
      { label: "Stage Breakdown", href: "/magazine/articles/test", note: "Technique" },
      { label: "Battle Chronicle", href: "/magazine/articles/test", note: "History" },
      { label: "Issue Spotlight", href: "/magazine/articles/test", note: "Monthly" },
    ],
    `${params.slug}-article`,
  );

  const mediaRail = rotateFrom(
    [
      { label: "Live Clip", href: "/live/stages" },
      { label: "Backstage Cam", href: "/live/reactions" },
      { label: "Ticket Lane", href: "/tickets" },
      { label: "Store Drop", href: "/store" },
    ],
    `${params.slug}-media`,
  );

  const relatedArticles = getRelatedArticles(params.slug);
  const relatedSponsors = getRelatedSponsors();

  return (
    <>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <PerformerProfileShell
        displayName={performer.displayName}
        slug={params.slug}
        tagline={performer.tagline}
        rank={performer.rank}
        isVerified={performer.isVerified}
        battleRecord={{ wins: performer.wins, losses: performer.losses }}
        articleRoute={articleRoute}
        sponsorAura={auraSlots}
        previewWindow={
          <PreviewWindow
            title={`${performer.displayName} Performer Preview`}
            subtitle="Battle, booking, article, live, music, and ranking jump windows with safe fallbacks."
            motionPortrait={{
              name: performer.displayName,
              accent: ACCENT,
              mode: "cutout",
              state: performer.rank <= 1 ? "winner" : "featured",
              assetId: `asset-performer-${params.slug}`,
              avatarId: `avatar-performer-${params.slug}`,
            }}
            cards={{
              profile: {
                title: performer.displayName,
                value: `#${performer.rank}`,
                description: `${performer.wins}W · ${performer.losses}L · streak ${performer.currentStreak}`,
                accent: CYAN,
                badge: performer.isVerified ? "VERIFIED" : "PERFORMER",
                actions: [
                  { label: "Battle History", href: `/battles?performer=${params.slug}` },
                  { label: "Profile Root", href: `/profile/performer/${params.slug}` },
                ],
              },
              liveActivity: {
                title: performer.isLive ? `LIVE — ${performer.liveVenueName ?? "Stage"}` : "Offline",
                value: performer.isLive ? "On Stage" : "—",
                description: performer.isLive
                  ? `${performer.displayName} is performing live right now.`
                  : "Check back during scheduled performance windows.",
                accent: ACCENT,
                actions: [
                  { label: "Live Stages", href: "/live/stages" },
                  { label: "Reactions", href: "/live/reactions" },
                ],
              },
              article: {
                title: articleRoute ? "Feature Route" : "No Feature Yet",
                value: articleRoute ? "Linked" : "Fallback",
                description: articleRoute
                  ? "Performer editorial route resolved and ready to jump."
                  : "No performer feature route resolved, using magazine fallback safely.",
                accent: GOLD,
                actions: [
                  { label: "Open Article", href: articleRoute ?? "/magazine/articles/test" },
                  { label: "Editorial", href: "/magazine" },
                ],
              },
              venueBooking: {
                title: "Venue + Booking",
                value: performer.openToBooking ? "Open" : "Closed",
                description: performer.openToBooking
                  ? "Available for venue bookings — hit the CTA below."
                  : "Booking currently closed for this performer.",
                accent: "#00FF88",
                actions: [
                  { label: "Booking", href: "/booking" },
                  { label: "Tickets", href: "/tickets" },
                ],
              },
              music: {
                title: "Cypher + Media",
                value: "Queued",
                description: "Media preview points to established routes.",
                accent: "#AA2DFF",
                actions: [
                  { label: "Live", href: "/live/stages" },
                  { label: "Store", href: "/store" },
                ],
              },
              ranking: {
                title: "Performer Ranking",
                value: `#${performer.rank}`,
                description: `Longest streak ${performer.longestStreak}.`,
                accent: "#FF8C00",
                actions: [
                  { label: "Profile", href: `/profile/performer/${params.slug}` },
                  { label: "Home", href: "/home/1" },
                ],
              },
            }}
          />
        }
      >
        {performer.isLive ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,45,170,0.12)",
              border: `1px solid ${ACCENT}55`,
              borderRadius: 999,
              padding: "5px 14px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: ACCENT,
                display: "inline-block",
                boxShadow: `0 0 8px ${ACCENT}`,
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Live Now — {performer.liveVenueName ?? "On Stage"}
            </span>
            <Link href="/live/stages" style={{ fontSize: 10, color: CYAN, fontWeight: 700, textDecoration: "none", marginLeft: 6 }}>
              Watch →
            </Link>
          </div>
        ) : null}

        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#22d3ee" }}>
            ● Live Performance
          </span>
          <ViralShareButton
            playlistId={`${params.slug}-performer-spotlight`}
            curatorId={params.slug}
            playlistTitle={`${performer.displayName} Live Spotlight`}
            sharePath={`/profile/performer/${encodeURIComponent(params.slug)}`}
          />
          <Link href="/booking" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f0abfc", textDecoration: "none", border: "1px solid rgba(240,171,252,0.35)", borderRadius: 999, padding: "4px 10px" }}>
            Booking CTA
          </Link>
          <Link href="/tickets" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#86efac", textDecoration: "none", border: "1px solid rgba(134,239,172,0.35)", borderRadius: 999, padding: "4px 10px" }}>
            Meet-and-Greet CTA
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
          <div>
            <PerformerBattleRail
              performerSlug={params.slug}
              currentStreak={performer.currentStreak}
              longestStreak={performer.longestStreak}
              totalBattles={performer.wins + performer.losses}
            />

            <section style={{ marginTop: 14, border: "1px solid rgba(34,211,238,0.25)", borderRadius: 12, padding: 12, background: "rgba(8,47,73,0.2)" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#67e8f9", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Rotating Article Rail
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {articleRail.map((a) => (
                  <Link key={a.label} href={a.href} style={{ color: "#e2e8f0", textDecoration: "none", fontSize: 12 }}>
                    {a.label} <span style={{ color: "#94a3b8", fontSize: 10 }}>· {a.note}</span>
                  </Link>
                ))}
              </div>
            </section>

            <PerformerSponsorShelf
              performerSlug={params.slug}
              performerName={performer.displayName}
              tier="free"
              sponsors={performerSponsors}
            />

            <PerformerMediaRail performerSlug={params.slug} />

            <section style={{ marginTop: 14, border: "1px solid rgba(250,204,21,0.25)", borderRadius: 12, padding: 12, background: "rgba(71,38,7,0.2)" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#fde047", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Rotating Media Rail
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {mediaRail.map((m) => (
                  <Link key={m.label} href={m.href} style={{ color: "#fef9c3", textDecoration: "none", fontSize: 12 }}>
                    {m.label}
                  </Link>
                ))}
              </div>
            </section>

            {relatedArticles.length > 0 ? (
              <section
                style={{
                  marginTop: 20,
                  background: "rgba(0,245,255,0.04)",
                  border: `1px solid ${CYAN}22`,
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: CYAN, marginBottom: 12 }}>
                  Related Articles
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {relatedArticles.map((article) => (
                    <Link key={article.id} href={articleRoute ?? "/magazine/articles/test"} style={{ textDecoration: "none", display: "block" }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>{article.title}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{article.snippet.slice(0, 80)}…</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedSponsors.length > 0 ? (
              <section
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {relatedSponsors.map((sponsor) => (
                  <Link key={sponsor.id} href={sponsor.ctaRoute || "/store"} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${sponsor.accentColor}0a, rgba(2,6,23,0.9))`,
                        border: `1px solid ${sponsor.accentColor}33`,
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: sponsor.accentColor, marginBottom: 5 }}>
                        Sponsor
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>{sponsor.sponsorName}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>{sponsor.headline}</div>
                    </div>
                  </Link>
                ))}
              </section>
            ) : null}
          </div>

          <div>
            <PerformerBookingRail performerSlug={params.slug} isOpenToBooking={performer.openToBooking} />
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            href="/booking"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: ACCENT,
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            Book {performer.displayName}
          </Link>
          <Link
            href="/tickets"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(250,204,21,0.12)",
              border: `1px solid ${GOLD}55`,
              color: GOLD,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            🤝 Meet &amp; Greet
          </Link>
          <Link
            href={performer.isLive ? "/live/stages" : "/live/stages"}
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              color: performer.isLive ? ACCENT : "#94a3b8",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {performer.isLive ? "🔴 Watch Live" : "Stages"}
          </Link>
          {articleRoute ? (
            <Link
              href={articleRoute}
              style={{
                padding: "10px 22px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              📰 Read Feature
            </Link>
          ) : null}
        </div>
        {/* Video & Media panel — live stream + past battle clips */}
        <PerformerVideoPanel
          slug={params.slug}
          displayName={performer.displayName}
          isLive={performer.isLive}
          liveRoomId={performer.isLive ? `performer-${params.slug}` : undefined}
          accentColor={ACCENT}
          role="performer"
        />
      </PerformerProfileShell>
    </>
  );
}
