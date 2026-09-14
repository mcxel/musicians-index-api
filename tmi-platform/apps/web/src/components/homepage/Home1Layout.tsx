"use client";

import Link from "next/link";
import BillboardBoard, { type BillboardSlot } from "./BillboardBoard";
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
import { useHomeDensityData } from "./density/useHomeDensityData";
import { getTopPerformers } from "@/lib/performers/PerformerRegistry";

// Rule 3: rank is XP-driven, never manual — never a hand-typed name/vote count.
// Rule 1: single source is PerformerRegistry, never a hardcoded performer here.
const CROWN_HOLDER = getTopPerformers(1)[0] ?? null;

const ARTICLE_TAG_COLORS: Record<string, string> = {
  FEATURE: "#FF2DAA",
  LIVE: "#00FF88",
  BATTLE: "#FFD700",
  CYPHER: "#00FFFF",
  EVENT: "#AA2DFF",
  EXCLUSIVE: "#FF2DAA",
  ANALYSIS: "#00FFFF",
  VENUES: "#AA2DFF",
};

function articleColor(category: string): string {
  return ARTICLE_TAG_COLORS[category.toUpperCase()] ?? "#00FFFF";
}

export default function Home1Layout() {
  const data = useHomeDensityData();

  // Rule 20: "LIVE NOW" billboard is built from the same real live-room feed
  // as the rest of Home 1 — never a hand-typed artist/viewer-count list.
  const liveArtistSlots: BillboardSlot[] = data.rooms.map((room, index) => ({
    id: room.id || `live-${index}`,
    label: room.host,
    sublabel: room.genre,
    stat: `${room.viewers.toLocaleString()} watching`,
    badge: "LIVE",
    href: "/live",
    color: index % 2 === 0 ? "#FF2DAA" : "#00FFFF",
    rank: index + 1,
  }));

  const featuredArticles = data.articles.slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 32px" }}>

      {/* Top utility strip: quick jumps + breaking news */}
      <QuickJumpRail />
      <BreakingNewsTicker items={data.ticker} />

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
          <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 2 }}>THE CROWN</div>
          {CROWN_HOLDER ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{CROWN_HOLDER.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{CROWN_HOLDER.category} · {CROWN_HOLDER.xp.toLocaleString()} XP</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>No Crown Holder Yet</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Be the first to climb the ranks</div>
            </>
          )}
        </div>
        <Link href={CROWN_HOLDER ? `/performers/${CROWN_HOLDER.slug}` : "/leaderboard"} style={{ textDecoration: "none", padding: "6px 14px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#FFD700" }}>
          {CROWN_HOLDER ? "VIEW PROFILE" : "VIEW LEADERBOARD"}
        </Link>
      </div>

      {/* Main density grid: content left, live rail right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 12, alignItems: "start" }}>

        {/* Left column: all content blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Featured Battle + Cypher side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FeaturedBattleCard battle={data.battle} />
            <FeaturedCypherCard cypher={data.cypher} />
          </div>

          {/* Featured Articles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.18em" }}>FEATURED THIS WEEK</div>
            {featuredArticles.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
                No featured articles yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {featuredArticles.map((a, i) => {
                  const color = articleColor(a.category);
                  return (
                    <Link key={a.id} href={a.slug ? `/articles/${a.slug}` : "/articles"} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: i === 0 ? "16px" : "12px 14px",
                        background: i === 0 ? `linear-gradient(135deg, ${color}18, rgba(0,0,0,0.6))` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${i === 0 ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                        borderRadius: 10,
                        gridColumn: i === 0 ? "span 2" : "span 1",
                        transition: "all 0.25s",
                        minHeight: i === 0 ? 100 : 72,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 900, color, border: `1px solid ${color}50`, borderRadius: 3, padding: "2px 6px", display: "inline-block", marginBottom: 6, alignSelf: "flex-start" }}>{a.category}</span>
                        <div style={{ fontSize: i === 0 ? 15 : 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{a.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Story/article horizontal strip */}
          <SpotlightArticleRail articles={data.articles} />

          {/* Live venues */}
          <LiveVenueStrip venues={data.venues} />

          {/* Upcoming events */}
          <UpcomingEventsRail events={data.events} />
        </div>

        {/* Right column: live artists → top 10 → beats → fan challenge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BillboardBoard slots={liveArtistSlots} title="LIVE NOW" variant="vertical" accentColor="#FF2DAA" />
          <TopTenLiveRail entries={data.charts} />
          <TrendingBeatRail beats={data.releases} />
          <FanChallengeRail />
        </div>
      </div>

      {/* Draggable Activity Canvas */}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.18em", marginBottom: 8 }}>ACTIVITY CANVAS</div>
        <CinemationCanvas cards={DEFAULT_CANVAS_CARDS} height={260} enableDrag />
      </div>

      {/* Sponsor rail — replaces the old 3-slot strip */}
      <SponsorRail sponsors={data.sponsors} />
    </div>
  );
}
