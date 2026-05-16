import EditorialBelt from "@/packages/home/belts/EditorialBelt";
import BeltShell from "@/packages/home/belts/BeltShell";
import CardFrame from "@/packages/home/belts/CardFrame";
import ArticleFeatureCard from "@/packages/foundation-visual/ArticleFeatureCard";
import BillboardFrame from "@/packages/foundation-visual/BillboardFrame";
import SponsorSpotlightFrame from "@/packages/foundation-visual/SponsorSpotlightFrame";
import MagazineFrame from "@/packages/foundation-visual/MagazineFrame";
import StageFrame from "@/packages/foundation-visual/StageFrame";
import Top10Rotator from "@/packages/home/experience/Top10Rotator";
import type { IssueRegistryEntry } from "./issueRegistry";
import { allIssueZones, type IssueZoneKey } from "./zoneMaps";
import {
  CrownRankingZone,
  GlobalRankZone,
  GenreRankZone,
  RisingZone,
} from "./rankingZones";
import {
  LiveRoomsZone,
  EventsZone,
  CypherZone,
  GenresZone,
  PlaylistsZone,
  DiscoveryZone,
} from "./liveZones";
import { FeaturedGameZone, GameSelectorZone, WeeklyEventTrackerZone, PrizePoolZone } from "./gameZones";
import { SponsorSpotlightZone, AdMarketplaceZone, AnalyticsDashZone } from "./marketZones";
import TmiReferenceZone from "@/packages/home/tmi/TmiReferenceZone";
import Home1LiveMagazine from "@/packages/magazine-engine/Home1LiveMagazine";
import Home2ArtifactSystem from "@/packages/magazine-engine/Home2ArtifactSystem";
import Home3ArtifactSystem from "@/packages/magazine-engine/Home3ArtifactSystem";
import Home4ArtifactSystem from "@/packages/magazine-engine/Home4ArtifactSystem";
import Home5ArtifactSystem from "@/packages/magazine-engine/Home5ArtifactSystem";
import Link from "next/link";
import HexCluster from "@/packages/foundation-effects/HexCluster";

import { zoneVisualBindings } from "./visualRegistry";

type ZoneRendererProps = {
  issue: IssueRegistryEntry;
};

function VisualZone({ zone, children }: { zone: IssueZoneKey; children: React.ReactNode }) {
  return (
    <div data-visual-zone={zone} data-visual-components={zoneVisualBindings[zone].join(",")}>{children}</div>
  );
}

export const contentRegistry: Record<IssueZoneKey, (props: ZoneRendererProps) => JSX.Element> = {
  // ── home1 ──────────────────────────────────────────────────────────────────
  coverFront: () => (
    <VisualZone zone="coverFront">
      <BillboardFrame sponsorTag="WEEKLY CROWN" className="home1-crown-billboard h-full p-0">
        <Home1LiveMagazine />
      </BillboardFrame>
    </VisualZone>
  ),
  topTenLoop: () => (
    <VisualZone zone="topTenLoop">
      <div className="h-full flex items-end justify-end p-2">
        <Top10Rotator compact />
      </div>
    </VisualZone>
  ),

  // ── home2 ──────────────────────────────────────────────────────────────────
  editorial:  () => (
    <VisualZone zone="editorial">
      <Home2ArtifactSystem />
    </VisualZone>
  ),
  discovery:  () => (
    <VisualZone zone="discovery">
      <BeltShell id="discovery-home2" title="Discovery Belt" tone="discovery" kicker="TREND MAP">
        <MagazineFrame title="Discovery Magazine Composition">
          <div className="home2-magazine">
            <div className="home2-magazine__top">
              <CardFrame title="Article Feature" badge="FEATURE" shape="angled" glow="cyan" className="home2-panel home2-panel--feature">
                <ArticleFeatureCard title="The Rise of Cyphers" category="Culture" />
              </CardFrame>

              <CardFrame title="Music News" badge="NEWS" shape="ribbon" glow="magenta" className="home2-panel home2-panel--news">
                <div className="home-card-list">
                  <Link href="/articles/featured-story" className="home-card-list__item">Crown rankings shake up this week</Link>
                  <Link href="/articles/featured-story" className="home-card-list__item">Venue skins expand with world themes</Link>
                  <Link href="/articles/featured-story" className="home-card-list__item">Artist lobby upgrades now live</Link>
                </div>
              </CardFrame>

              <div className="home2-magazine__right-stack">
                <CardFrame title="Interviews" badge="Q&A" shape="angled" glow="green" className="home2-panel">
                  <div className="home-card-list">
                    <Link href="/articles/featured-story" className="home-card-list__item">Host Julius on crowd energy design</Link>
                    <Link href="/articles/featured-story" className="home-card-list__item">Arena producers on weekly crowns</Link>
                  </div>
                </CardFrame>
                <CardFrame title="Studio Recaps" badge="RECAP" shape="angled" glow="cyan" className="home2-panel">
                  <div className="home-card-list">
                    <Link href="/home/2" className="home-card-list__item">Session 18: live critique highlights</Link>
                    <Link href="/home/2" className="home-card-list__item">Session 20: new discovery reel</Link>
                  </div>
                </CardFrame>
              </div>
            </div>

            <div className="home2-magazine__bottom">
              <CardFrame title="Genre Hex Cluster" badge="CLUSTER" shape="hex" glow="magenta" className="home2-panel home2-panel--hex">
                <HexCluster items={["Hip Hop", "R&B", "Pop", "EDM", "Afrobeats", "Latin"]} />
              </CardFrame>

              <div className="home2-magazine__side-stack">
                <CardFrame title="Top 10 Mini Chart" badge="TOP10" shape="badge" glow="gold" className="home2-panel">
                  <ol className="home-mini-rankings">
                    <li><Link href="/artists/ari-volt">Ari Volt</Link></li>
                    <li><Link href="/artists/nova-kane">Nova Kane</Link></li>
                    <li><Link href="/artists/rhyme-lane">Rhyme Lane</Link></li>
                    <li><Link href="/artists/echo-vee">Echo Vee</Link></li>
                    <li><Link href="/artists/lex-royal">Lex Royal</Link></li>
                  </ol>
                </CardFrame>
                <CardFrame title="Weekly Playlist" badge="WEEKLY" shape="ribbon" glow="cyan" className="home2-panel">
                  <div className="home-card-list">
                    <Link href="/home/2" className="home-card-list__item">Midnight Neon · 28 tracks</Link>
                    <Link href="/home/2" className="home-card-list__item">Global Pulse · 34 tracks</Link>
                  </div>
                </CardFrame>
                <CardFrame title="Artist Directory" badge="DIRECTORY" shape="angled" glow="green" className="home2-panel">
                  <div className="home-card-list">
                    <Link href="/artists/featured" className="home-card-list__item">Open featured profiles</Link>
                    <Link href="/booking" className="home-card-list__item">Booking Portal</Link>
                  </div>
                </CardFrame>
              </div>
            </div>
          </div>
        </MagazineFrame>
      </BeltShell>
    </VisualZone>
  ),
  charts:     () => (
    <VisualZone zone="charts">
      <MagazineFrame title="Chart Lanes">
        <div className="h-full">
          <PlaylistsZone />
        </div>
      </MagazineFrame>
    </VisualZone>
  ),

  // ── home3 ──────────────────────────────────────────────────────────────────
  liveRooms:  () => (
    <VisualZone zone="liveRooms">
      <Home3ArtifactSystem />
    </VisualZone>
  ),
  events:     () => (
    <VisualZone zone="events">
      <MagazineFrame title="Event Calendar">
        <div className="h-full">
          <EventsZone />
        </div>
      </MagazineFrame>
    </VisualZone>
  ),
  cyphers:    () => (
    <VisualZone zone="cyphers">
      <BillboardFrame sponsorTag="CYPHER ARENA" className="h-full p-0">
        <CypherZone />
      </BillboardFrame>
    </VisualZone>
  ),

  // ── home4 ──────────────────────────────────────────────────────────────────
  featuredGame: () => (
    <VisualZone zone="featuredGame">
      <Home4ArtifactSystem />
    </VisualZone>
  ),
  gameSelector: () => (
    <VisualZone zone="gameSelector">
      <BillboardFrame sponsorTag="LIVE MODES" className="h-full">
        <GameSelectorZone />
      </BillboardFrame>
    </VisualZone>
  ),
  eventTracker: () => (
    <VisualZone zone="eventTracker">
      <MagazineFrame title="Tracker">
        <div className="h-full">
          <WeeklyEventTrackerZone />
        </div>
      </MagazineFrame>
    </VisualZone>
  ),
  prizePool:    () => (
    <VisualZone zone="prizePool">
      <BillboardFrame sponsorTag="PRIZE POOL" className="h-full">
        <PrizePoolZone />
      </BillboardFrame>
    </VisualZone>
  ),

  // ── home5 ──────────────────────────────────────────────────────────────────
  sponsorSpotlight: () => (
    <VisualZone zone="sponsorSpotlight">
      <BeltShell id="market-home5" title="Marketplace Belt" tone="marketplace" kicker="ADS + DEALS">
        <Home5ArtifactSystem />
      </BeltShell>
    </VisualZone>
  ),
  adMarketplace:    () => (
    <VisualZone zone="adMarketplace">
      <BillboardFrame sponsorTag="AD INVENTORY" className="h-full">
        <AdMarketplaceZone />
      </BillboardFrame>
    </VisualZone>
  ),
  analyticsDash:    () => (
    <VisualZone zone="analyticsDash">
      <MagazineFrame title="Campaign Analytics">
        <div className="h-full">
          <AnalyticsDashZone />
        </div>
      </MagazineFrame>
    </VisualZone>
  ),

  // ── home6 ──────────────────────────────────────────────────────────────────
  globalRankLoop: () => <VisualZone zone="globalRankLoop"><GlobalRankZone /></VisualZone>,
  risingStars: () => <VisualZone zone="risingStars"><RisingZone /></VisualZone>,
  genreLeaderboards: () => <VisualZone zone="genreLeaderboards"><GenreRankZone /></VisualZone>,

  // ── home7 ──────────────────────────────────────────────────────────────────
  idolStage: () => (
    <VisualZone zone="idolStage">
      <TmiReferenceZone
        title="Monthly Idol Stage"
        subtitle="Host-led showcase synced to the PDF visual pack."
        imageSrc="/tmi-curated/host-main.png"
        ctaLabel="Open Stage"
        ctaHref="/home/7"
      />
    </VisualZone>
  ),
  idolJudges: () => (
    <VisualZone zone="idolJudges">
      <TmiReferenceZone
        title="Judge Panel"
        subtitle="Decision surface modeled from host and profile references."
        imageSrc="/tmi-curated/profile-admin.jpg"
        ctaLabel="Judge View"
        ctaHref="/dashboard/admin"
      />
    </VisualZone>
  ),
  idolAudience: () => (
    <VisualZone zone="idolAudience">
      <TmiReferenceZone
        title="Audience Reactions"
        subtitle="Crowd metrics and live pulse cards inspired by TMI skins."
        imageSrc="/tmi-curated/venue-10.jpg"
        ctaLabel="Join Crowd"
        ctaHref="/rooms/lobby"
      />
    </VisualZone>
  ),

  // ── home8 ──────────────────────────────────────────────────────────────────
  danceFloor: () => (
    <VisualZone zone="danceFloor">
      <TmiReferenceZone
        title="World Dance Floor"
        subtitle="Venue skin lanes and seating references from PDF bundle."
        imageSrc="/tmi-curated/venue-14.jpg"
        ctaLabel="Enter Floor"
        ctaHref="/home/8"
      />
    </VisualZone>
  ),
  djBooth: () => (
    <VisualZone zone="djBooth">
      <TmiReferenceZone
        title="DJ Booth"
        subtitle="Live booth operator deck with host visual overlays."
        imageSrc="/tmi-curated/host-3.png"
        ctaLabel="DJ Panel"
        ctaHref="/events/weekly-crown"
      />
    </VisualZone>
  ),
  producerSpotlight: () => (
    <VisualZone zone="producerSpotlight">
      <TmiReferenceZone
        title="Producer Spotlight"
        subtitle="Creator-facing scene sourced from performer signup references."
        imageSrc="/tmi-curated/signup-performer.png"
        ctaLabel="Creator Hub"
        ctaHref="/dashboard/artist"
      />
    </VisualZone>
  ),

  // ── home9 ──────────────────────────────────────────────────────────────────
  battleRing: () => (
    <VisualZone zone="battleRing">
      <TmiReferenceZone
        title="Cypher Battle Ring"
        subtitle="Game-show arena shell integrated with venue skin visuals."
        imageSrc="/tmi-curated/gameshow-31.jpg"
        ctaLabel="Open Arena"
        ctaHref="/home/9"
      />
    </VisualZone>
  ),
  cypherHost: () => (
    <VisualZone zone="cypherHost">
      <TmiReferenceZone
        title="Cypher Host Desk"
        subtitle="Host command surface for rounds, cues, and callouts."
        imageSrc="/tmi-curated/host-4.png"
        ctaLabel="Host Desk"
        ctaHref="/events/weekly-crown"
      />
    </VisualZone>
  ),
  challengerQueue: () => (
    <VisualZone zone="challengerQueue">
      <TmiReferenceZone
        title="Challenger Queue"
        subtitle="Queue lane for next artists to rotate into the ring."
        imageSrc="/tmi-curated/mag-35.jpg"
        ctaLabel="View Queue"
        ctaHref="/home/9"
      />
    </VisualZone>
  ),

  // ── home10 ──────────────────────────────────────────────────────────────────
  feudBoard: () => (
    <VisualZone zone="feudBoard">
      <TmiReferenceZone
        title="Deal Or Feud Board"
        subtitle="Broadcast board visual connected to game-show skin pack."
        imageSrc="/tmi-curated/gameshow-35.jpg"
        ctaLabel="Board View"
        ctaHref="/home/10"
      />
    </VisualZone>
  ),
  feudPodiums: () => (
    <VisualZone zone="feudPodiums">
      <TmiReferenceZone
        title="Contest Podiums"
        subtitle="Multi-team podium frame aligned to PDF game silhouettes."
        imageSrc="/tmi-curated/venue-18.jpg"
        ctaLabel="Podiums"
        ctaHref="/home/10"
      />
    </VisualZone>
  ),
  feudCrowd: () => (
    <VisualZone zone="feudCrowd">
      <TmiReferenceZone
        title="Crowd Meter"
        subtitle="Audience energy and hype strip for feud rounds."
        imageSrc="/tmi-curated/mag-42.jpg"
        ctaLabel="Crowd Feed"
        ctaHref="/rooms/lobby"
      />
    </VisualZone>
  ),

  // ── home11 ──────────────────────────────────────────────────────────────────
  squaresGrid: () => (
    <VisualZone zone="squaresGrid">
      <TmiReferenceZone
        title="Circles & Squares Grid"
        subtitle="Grid canvas using curated magazine reference captures."
        imageSrc="/tmi-curated/mag-50.jpg"
        ctaLabel="Grid"
        ctaHref="/home/11"
      />
    </VisualZone>
  ),
  squaresHost: () => (
    <VisualZone zone="squaresHost">
      <TmiReferenceZone
        title="Squares Host"
        subtitle="Host panel mapped from Julius and host asset set."
        imageSrc="/tmi-curated/julius.png"
        ctaLabel="Host"
        ctaHref="/events/weekly-crown"
      />
    </VisualZone>
  ),
  squaresContestants: () => (
    <VisualZone zone="squaresContestants">
      <TmiReferenceZone
        title="Contestant Feeds"
        subtitle="Contestant lane references with profile-style framing."
        imageSrc="/tmi-curated/mag-58.jpg"
        ctaLabel="Contestants"
        ctaHref="/home/11"
      />
    </VisualZone>
  ),

  // ── home12 ──────────────────────────────────────────────────────────────────
  roastStage: () => (
    <VisualZone zone="roastStage">
      <TmiReferenceZone
        title="Dirty Dozens Stage"
        subtitle="Roast stage visual based on game-show and venue references."
        imageSrc="/tmi-curated/gameshow-36.jpg"
        ctaLabel="Stage"
        ctaHref="/home/12"
      />
    </VisualZone>
  ),
  roastScore: () => (
    <VisualZone zone="roastScore">
      <TmiReferenceZone
        title="Roast Scoreboard"
        subtitle="Round scoring lane with magazine card styling."
        imageSrc="/tmi-curated/mag-66.jpg"
        ctaLabel="Scores"
        ctaHref="/home/12"
      />
    </VisualZone>
  ),
  roastCrowd: () => (
    <VisualZone zone="roastCrowd">
      <TmiReferenceZone
        title="Roast Crowd"
        subtitle="Audience reaction blend tied to venue seating snapshots."
        imageSrc="/tmi-curated/venue-22.jpg"
        ctaLabel="Reactions"
        ctaHref="/rooms/lobby"
      />
    </VisualZone>
  ),

  // ── home13 ──────────────────────────────────────────────────────────────────
  rewardsLedger: () => (
    <VisualZone zone="rewardsLedger">
      <MagazineFrame title="Rewards Ledger">
        <TmiReferenceZone
          title="Rewards Ledger"
          subtitle="Fan and artist progression layout based on profile cards."
          imageSrc="/tmi-curated/signup-fan.png"
          ctaLabel="Rewards"
          ctaHref="/rewards"
        />
      </MagazineFrame>
    </VisualZone>
  ),
  storeShowcase: () => (
    <VisualZone zone="storeShowcase">
      <BeltShell id="store-showcase-home13" title="Store Showcase" tone="marketplace" kicker="COSMETICS & GEAR">
        <TmiReferenceZone
          title="Store Showcase"
          subtitle="Marketplace visual lane ready for sponsor and product cards."
          imageSrc="/tmi-curated/profile-advertiser.jpg"
          ctaLabel="Store"
          ctaHref="/store"
        />
      </BeltShell>
    </VisualZone>
  ),
  seasonPass: () => (
    <VisualZone zone="seasonPass">
      <BillboardFrame sponsorTag="SEASON 4">
        <TmiReferenceZone
          title="Season Pass"
          subtitle="Pass progression panel connected to profile reference artwork."
          imageSrc="/tmi-curated/season-pass.jpg"
          ctaLabel="Season Pass"
          ctaHref="/season-pass"
        />
      </BillboardFrame>
    </VisualZone>
  ),

  // ── home14 ──────────────────────────────────────────────────────────────────
  sponsorGiveaways: () => (
    <VisualZone zone="sponsorGiveaways">
      <BeltShell id="giveaways-home14" title="Sponsor Giveaways" tone="events" kicker="ACTIVE DROPS">
        <TmiReferenceZone
          title="Sponsor Giveaways"
          subtitle="Campaign-driven reward drops using sponsor sign-up references."
          imageSrc="/tmi-curated/signup-sponsor.png"
          ctaLabel="Giveaways"
          ctaHref="/sponsor/dashboard"
        />
      </BeltShell>
    </VisualZone>
  ),
  sponsorLeaderboard: () => (
    <VisualZone zone="sponsorLeaderboard">
      <MagazineFrame title="Sponsor Leaderboard">
        <TmiReferenceZone
          title="Sponsor Leaderboard"
          subtitle="Performance ranking of campaigns and sponsor spend lanes."
          imageSrc="/tmi-curated/signup-advertiser.png"
          ctaLabel="Leaderboard"
          ctaHref="/sponsor/analytics"
        />
      </MagazineFrame>
    </VisualZone>
  ),
  dropCountdown: () => (
    <VisualZone zone="dropCountdown">
      <BillboardFrame className="p-0 border-rose-500">
        <TmiReferenceZone
          title="Drop Countdown"
          subtitle="Timed release strip for sponsor and creator activations."
          imageSrc="/tmi-curated/mag-74.jpg"
          ctaLabel="Drops"
          ctaHref="/home/14"
        />
      </BillboardFrame>
    </VisualZone>
  ),

  // ── home15 ──────────────────────────────────────────────────────────────────
  hallOfFame: () => (
    <VisualZone zone="hallOfFame">
      <BeltShell id="archive-home15" title="Heritage Vault" tone="discovery" kicker="LEGENDS">
        <TmiReferenceZone
          title="Hall Of Fame"
          subtitle="Legacy winner wall aligned to magazine archive frames."
          imageSrc="/tmi-curated/mag-82.jpg"
          ctaLabel="Hall"
          ctaHref="/winner-hall"
        />
      </BeltShell>
    </VisualZone>
  ),
  classicReplays: () => (
    <VisualZone zone="classicReplays">
      <StageFrame theme="neon-retro">
        <TmiReferenceZone
          title="Classic Replays"
          subtitle="Replay strip with magazine issue visuals as backdrop."
          imageSrc="/tmi-curated/home5.png"
          ctaLabel="Replays"
          ctaHref="/winners"
        />
      </StageFrame>
    </VisualZone>
  ),
  vaultArchive: () => (
    <VisualZone zone="vaultArchive">
      <MagazineFrame>
        <TmiReferenceZone
          title="Vault Archive"
          subtitle="Historic issue vault and profile references connected."
          imageSrc="/tmi-curated/home1.jpg"
          ctaLabel="Archive"
          ctaHref="/home/15"
        />
      </MagazineFrame>
    </VisualZone>
  ),
};

function validateContentRegistry() {
  for (const zone of allIssueZones) {
    if (!contentRegistry[zone]) {
      throw new Error(`contentRegistry is missing zone renderer for ${zone}`);
    }
  }
}

validateContentRegistry();
