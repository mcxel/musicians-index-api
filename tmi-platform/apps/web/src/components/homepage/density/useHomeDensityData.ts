"use client";

import { useEffect, useState } from "react";
import { getHomeCharts, type HomeChartRow } from "@/components/home/data/getHomeCharts";
import { getHomeEditorial, type HomeEditorialArticle } from "@/components/home/data/getHomeEditorial";
import { getHomeLive, type HomeLiveRoom, type HomeLiveShow } from "@/components/home/data/getHomeLive";
import { getHomeReleases, type HomeReleaseRow } from "@/components/home/data/getHomeReleases";
import { getHomeSponsors, type HomeSponsorRow } from "@/components/home/data/getHomeSponsors";
import { getHomeCrown, type HomeCrownWinner } from "@/components/home/data/getHomeCrown";

export interface DensityTickerItem {
  id: string;
  label: string;
  text: string;
  href: string;
}

export interface DensityVenueItem {
  id: string;
  name: string;
  occupancy: number;
  href: string;
}

export interface DensityBattleCard {
  title: string;
  subtitle: string;
  entries: string;
  heat: string;
  eta: string;
}

export interface DensityCypherCard {
  title: string;
  subtitle: string;
  queue: string;
  wait: string;
  status: string;
}

export interface HomeDensityData {
  ticker: DensityTickerItem[];
  articles: HomeEditorialArticle[];
  venues: DensityVenueItem[];
  events: HomeLiveShow[];
  sponsors: HomeSponsorRow[];
  charts: HomeChartRow[];
  releases: HomeReleaseRow[];
  battle: DensityBattleCard;
  cypher: DensityCypherCard;
  crownWinners: HomeCrownWinner[];
  isLive: boolean;
}

const FALLBACK_DENSITY_DATA: HomeDensityData = {
  ticker: [
    { id: "bn-1", label: "Breaking", text: "Battle finals locked: Wavetek vs FlowMaster tonight", href: "/battles" },
    { id: "bn-2", label: "Live", text: "Cypher Arena filled to 92% in last 20 minutes", href: "/cypher" },
    { id: "bn-3", label: "Drop", text: "New sponsor drop unlocked in Home 1-2 spread", href: "/home/1-2" },
    { id: "bn-4", label: "Alert", text: "Top 10 leaderboard updated after surprise overtime", href: "/leaderboard" },
  ],
  articles: [
    { id: "a-1", title: "Inside the Crown Run", category: "FEATURE", slug: "" },
    { id: "a-2", title: "How Cypher Rooms Are Filling Faster", category: "LIVE", slug: "" },
    { id: "a-3", title: "Producer Heatmap and Beat Momentum", category: "ANALYSIS", slug: "" },
    { id: "a-4", title: "Venue Loyalty and VIP Rotation", category: "VENUES", slug: "" },
  ],
  venues: [
    { id: "v-1", name: "Neon Forum", occupancy: 94, href: "/venues/neon-forum" },
    { id: "v-2", name: "Crown Ring", occupancy: 88, href: "/venues/crown-ring" },
    { id: "v-3", name: "Drift Hall", occupancy: 76, href: "/venues/drift-hall" },
    { id: "v-4", name: "Pulse District", occupancy: 69, href: "/venues/pulse-district" },
  ],
  events: [
    { id: "e-1", title: "Battle Season Qualifier", artist: "TMI Host", date: "Tonight", venue: "Main Stage", ticketsLeft: 0 },
    { id: "e-2", title: "Producer Beat Auction", artist: "TMI Host", date: "Tomorrow", venue: "Auction Hall", ticketsLeft: 0 },
    { id: "e-3", title: "Comedy Night Open Set", artist: "TMI Host", date: "Thu", venue: "Comedy Room", ticketsLeft: 0 },
    { id: "e-4", title: "Dance-Off Regional", artist: "TMI Host", date: "Fri", venue: "Dance Hall", ticketsLeft: 0 },
  ],
  sponsors: [
    { name: "VELOCITY AUDIO", tier: "PLATINUM" },
    { name: "BEATPORT USA", tier: "GOLD" },
    { name: "ROLAND", tier: "SILVER" },
  ],
  charts: [
    { id: "c-1", rank: 1, title: "Wavetek", artist: "Wavetek", genre: "Hip-Hop", change: "up", plays: "14.2K", slug: "wavetek", followers: 14200 },
    { id: "c-2", rank: 2, title: "FlowMaster", artist: "FlowMaster", genre: "Hip-Hop", change: "up", plays: "11.8K", slug: "flowmaster", followers: 11800 },
    { id: "c-3", rank: 3, title: "Krypt", artist: "Krypt", genre: "Rap", change: "up", plays: "9.4K", slug: "krypt", followers: 9400 },
    { id: "c-4", rank: 4, title: "Neon Vibe", artist: "Neon Vibe", genre: "R&B", change: "same", plays: "8.2K", slug: "neon-vibe", followers: 8200 },
    { id: "c-5", rank: 5, title: "Zuri", artist: "Zuri", genre: "Afrobeats", change: "up", plays: "7.1K", slug: "zuri", followers: 7100 },
  ],
  releases: [
    { id: "b-1", slug: "", title: "Midnight Bars", genre: "Hip-Hop", bpm: 142, playCount: 0, createdAt: "", color: "#00FFFF" },
    { id: "b-2", slug: "", title: "Neon Dust", genre: "R&B", bpm: 136, playCount: 0, createdAt: "", color: "#FF2DAA" },
    { id: "b-3", slug: "", title: "Tunnel Echo", genre: "Trap", bpm: 128, playCount: 0, createdAt: "", color: "#FFD700" },
    { id: "b-4", slug: "", title: "Riverline", genre: "Afrobeats", bpm: 150, playCount: 0, createdAt: "", color: "#2DFFAA" },
  ],
  battle: {
    title: "Wavetek vs FlowMaster Championship Round",
    subtitle: "Audience-first voting · double XP window · sponsor ring active",
    entries: "1,842",
    heat: "96%",
    eta: "12m",
  },
  cypher: {
    title: "Neon District Open Mic Cypher",
    subtitle: "12 genres live · multilingual lane · crowd clip vault enabled",
    queue: "47",
    wait: "3m",
    status: "Open Queue",
  },
  crownWinners: [
    { name: "WAVETEK", genre: "Hip-Hop", title: "Crown Season", votes: "24,881", week: "Week 14" },
  ],
  isLive: false,
};

function buildTicker(news: string[]): DensityTickerItem[] {
  if (news.length === 0) return FALLBACK_DENSITY_DATA.ticker;

  const labels = ["Breaking", "Live", "Drop", "Alert", "Now"];
  return news.slice(0, 5).map((text, index) => ({
    id: `news-${index + 1}`,
    label: labels[index] ?? "Update",
    text,
    href: "/articles",
  }));
}

function buildVenues(rooms: HomeLiveRoom[]): DensityVenueItem[] {
  if (rooms.length === 0) return FALLBACK_DENSITY_DATA.venues;

  return rooms.slice(0, 4).map((room, index) => ({
    id: room.id || `venue-${index + 1}`,
    name: room.name,
    occupancy: Math.max(5, Math.min(99, Math.round(room.viewers / 15))),
    href: "/venues",
  }));
}

function buildBattleCard(winners: HomeCrownWinner[]): DensityBattleCard {
  const winner = winners[0];
  if (!winner) return FALLBACK_DENSITY_DATA.battle;

  return {
    title: `${winner.name} Championship Push`,
    subtitle: `${winner.genre} headline · audience-first vote pressure`,
    entries: winner.votes,
    heat: "Live",
    eta: winner.week,
  };
}

function buildCypherCard(rooms: HomeLiveRoom[]): DensityCypherCard {
  const cypherRoom = rooms.find((room) => room.type.toLowerCase().includes("cypher")) ?? rooms[0];
  if (!cypherRoom) return FALLBACK_DENSITY_DATA.cypher;

  return {
    title: cypherRoom.name,
    subtitle: `${cypherRoom.genre} lane · live crowd in room`,
    queue: `${Math.max(8, Math.round(cypherRoom.viewers / 20))}`,
    wait: `${Math.max(1, Math.round(cypherRoom.viewers / 120))}m`,
    status: "Open Queue",
  };
}

export function useHomeDensityData() {
  const [data, setData] = useState<HomeDensityData>(FALLBACK_DENSITY_DATA);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [editorialEnvelope, liveEnvelope, sponsorsEnvelope, chartsEnvelope, releases, crown] = await Promise.all([
          getHomeEditorial(),
          getHomeLive(4, 4),
          getHomeSponsors(),
          getHomeCharts(5),
          getHomeReleases(4),
          getHomeCrown(),
        ]);

        if (!isMounted) return;

        const articles = editorialEnvelope.data.cover.length > 0 ? editorialEnvelope.data.cover : FALLBACK_DENSITY_DATA.articles;
        const ticker = buildTicker(editorialEnvelope.data.news);
        const venues = buildVenues(liveEnvelope.data.rooms);
        const events = liveEnvelope.data.shows.length > 0 ? liveEnvelope.data.shows.slice(0, 4) : FALLBACK_DENSITY_DATA.events;
        const sponsors = sponsorsEnvelope.data.length > 0 ? sponsorsEnvelope.data.slice(0, 3) : FALLBACK_DENSITY_DATA.sponsors;
        const charts = chartsEnvelope.data.length > 0 ? chartsEnvelope.data.slice(0, 5) : FALLBACK_DENSITY_DATA.charts;
        const releaseRows = releases.length > 0 ? releases.slice(0, 4) : FALLBACK_DENSITY_DATA.releases;
        const winners = crown.winners.length > 0 ? crown.winners : FALLBACK_DENSITY_DATA.crownWinners;

        setData({
          ticker,
          articles,
          venues,
          events,
          sponsors,
          charts,
          releases: releaseRows,
          battle: buildBattleCard(winners),
          cypher: buildCypherCard(liveEnvelope.data.rooms),
          crownWinners: winners,
          isLive:
            editorialEnvelope.source === "live" ||
            liveEnvelope.source === "live" ||
            sponsorsEnvelope.source === "live" ||
            chartsEnvelope.source === "live",
        });
      } catch {
        if (isMounted) {
          setData(FALLBACK_DENSITY_DATA);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
