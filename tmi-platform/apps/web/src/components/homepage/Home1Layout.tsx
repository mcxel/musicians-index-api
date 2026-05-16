"use client";

import Link from "next/link";
import BillboardBoard, { LIVE_ARTIST_SLOTS } from "./BillboardBoard";
import TmiMonitorHUD from "./TmiMonitorHUD";
import CinemationCanvas, { DEFAULT_CANVAS_CARDS } from "./CinemationCanvas";
import QuickJumpRail from "./density/QuickJumpRail";
import BreakingNewsTicker from "./density/BreakingNewsTicker";
import FeaturedBattleCard from "./density/FeaturedBattleCard";
import FeaturedCypherCard from "./density/FeaturedCypherCard";
import SpotlightArticleRail from "./density/SpotlightArticleRail";
import LiveVenueStrip from "./density/LiveVenueStrip";
import UpcomingEventsRail from "./density/UpcomingEventsRail";
import TopTenLiveRail from "./density/TopTenLiveRail";
import TrendingBeatRail from "./density/TrendingBeatRail";
import FanChallengeRail from "./density/FanChallengeRail";
import SponsorRail from "./density/SponsorRail";
import { useHomepageRotation } from "@/hooks/useHomepageRotation";
import type { HomeChartRow } from "@/components/home/data/getHomeCharts";
import type { HomeReleaseRow } from "@/components/home/data/getHomeReleases";
import type { HomeSponsorRow } from "@/components/home/data/getHomeSponsors";

const CROWN_HOLDER = { name: "Wavetek", title: "This Week's Crown Holder", genre: "Trap · Houston TX", votes: "14,200", battles: 12, wins: 10, href: "/artist/wavetek" };

const FEATURED_ARTICLES = [
  { id: "a1", headline: "Wavetek Drops 808 Exclusive — Highest Bid Wins", tag: "BEAT", color: "#FF2DAA", href: "/articles/wavetek-808" },
  { id: "a2", headline: "Cypher Arena Season 3 Opens Tonight — 16 Genres Live", tag: "CYPHER", color: "#00FFFF", href: "/articles/cypher-season-3" },
  { id: "a3", headline: "Battle Ring Championship: Krypt vs FlowMaster", tag: "BATTLE", color: "#FFD700", href: "/articles/battle-championship" },
  { id: "a4", headline: "Neon Vibe Sells Out First TMI Live Show in 4 Hours", tag: "EVENT", color: "#AA2DFF", href: "/articles/neon-vibe-sellout" },
];

export default function Home1Layout() {
  // ── Rotation engine hookup ──────────────────────────────────────────────
  const { items: topTenRaw }    = useHomepageRotation("topTen");
  const { items: beatsRaw }     = useHomepageRotation("trendingBeats");
  const { items: sponsorsRaw }  = useHomepageRotation("sponsors");

  const topTenEntries: HomeChartRow[] = (topTenRaw as Array<{ rank: number; name: string; genre: string; score: number }>).map((r) => ({
    id:        String(r.rank),
    rank:      r.rank,
    title:     r.name,
    artist:    r.name,
    genre:     r.genre,
    change:    "same" as const,
    plays:     r.score.toLocaleString(),
    slug:      r.name.toLowerCase().replace(/\s+/g, "-"),
    followers: r.score,
  }));

  const beatEntries: HomeReleaseRow[] = (beatsRaw as Array<{ id: string; title: string; bpm: number; genre: string; badge: string }>).map((b) => ({
    id:        b.id,
    slug:      b.id,
    title:     b.title,
    genre:     b.genre,
    bpm:       b.bpm,
    playCount: 0,
    createdAt: "",
    color:     "#00FFFF",
  }));

  const sponsorEntries: HomeSponsorRow[] = (sponsorsRaw as Array<{ name: string; tier: string }>).map((s) => ({
    name: s.name,
    tier: s.tier.toUpperCase() as HomeSponsorRow["tier"],
  }));
  // ── End rotation hookup ─────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 32px" }}>

      {/* Top utility strip: quick jumps + breaking news */}
      <QuickJumpRail />
      <BreakingNewsTicker />

      {/* Live platform metrics */}
      <TmiMonitorHUD />

      {/* Crown Rail */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,0,0,0.6))",
        border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: 12,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}>
        <div style={{ fontSize: 28, lineHeight: 1 }}>👑</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 2 }}>THIS WEEK&apos;S CROWN</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{CROWN_HOLDER.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{CROWN_HOLDER.genre} · {CROWN_HOLDER.votes} votes · {CROWN_HOLDER.wins}/{CROWN_HOLDER.battles} W/L</div>
        </div>
        <Link href={CROWN_HOLDER.href} style={{ textDecoration: "none", padding: "6px 14px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#FFD700" }}>
          VIEW PROFILE
        </Link>
      </div>

      {/* Main density grid: content left, live rail right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 12, alignItems: "start" }}>

        {/* Left column: all content blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Featured Battle + Cypher side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FeaturedBattleCard />
            <FeaturedCypherCard />
          </div>

          {/* Featured Articles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.18em" }}>FEATURED THIS WEEK</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {FEATURED_ARTICLES.map((a, i) => (
                <Link key={a.id} href={a.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: i === 0 ? "16px" : "12px 14px",
                    background: i === 0 ? `linear-gradient(135deg, ${a.color}18, rgba(0,0,0,0.6))` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${i === 0 ? `${a.color}40` : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 10,
                    gridColumn: i === 0 ? "span 2" : "span 1",
                    transition: "all 0.25s",
                    minHeight: i === 0 ? 100 : 72,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 900, color: a.color, border: `1px solid ${a.color}50`, borderRadius: 3, padding: "2px 6px", display: "inline-block", marginBottom: 6, alignSelf: "flex-start" }}>{a.tag}</span>
                    <div style={{ fontSize: i === 0 ? 15 : 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{a.headline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Story/article horizontal strip */}
          <SpotlightArticleRail />

          {/* Live venues */}
          <LiveVenueStrip />

          {/* Upcoming events */}
          <UpcomingEventsRail />
        </div>

        {/* Right column: live artists → top 10 → beats → fan challenge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BillboardBoard slots={LIVE_ARTIST_SLOTS} title="LIVE NOW" variant="vertical" accentColor="#FF2DAA" />
          <TopTenLiveRail entries={topTenEntries} />
          <TrendingBeatRail beats={beatEntries} />
          <FanChallengeRail />
        </div>
      </div>

      {/* Draggable Activity Canvas */}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.18em", marginBottom: 8 }}>ACTIVITY CANVAS</div>
        <CinemationCanvas cards={DEFAULT_CANVAS_CARDS} height={260} enableDrag />
      </div>

      {/* Sponsor rail — replaces the old 3-slot strip */}
      <SponsorRail sponsors={sponsorEntries} />
    </div>
  );
}
