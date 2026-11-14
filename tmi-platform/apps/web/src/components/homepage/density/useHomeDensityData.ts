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
  rooms: HomeLiveRoom[];
  events: HomeLiveShow[];
  sponsors: HomeSponsorRow[];
  charts: HomeChartRow[];
  releases: HomeReleaseRow[];
  battle: DensityBattleCard | null;
  cypher: DensityCypherCard | null;
  crownWinners: HomeCrownWinner[];
  isLive: boolean;
}

/**
 * Rule 20: honest empty state, not fabricated activity. Every list starts
 * empty; battle/cypher cards start null so consumers render their own real
 * "nothing happening right now" state instead of a fake specific event.
 */
const FALLBACK_DENSITY_DATA: HomeDensityData = {
  ticker: [],
  articles: [],
  venues: [],
  rooms: [],
  events: [],
  sponsors: [],
  charts: [],
  releases: [],
  battle: null,
  cypher: null,
  crownWinners: [],
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

function buildBattleCard(winners: HomeCrownWinner[]): DensityBattleCard | null {
  const winner = winners[0];
  if (!winner) return null;

  return {
    title: `${winner.name} Championship Push`,
    subtitle: `${winner.genre} headline · audience-first vote pressure`,
    entries: winner.votes,
    heat: "Live",
    eta: winner.week,
  };
}

/** Only a genuine cypher-type room qualifies — never mislabel an unrelated live room as a Featured Cypher. */
function buildCypherCard(rooms: HomeLiveRoom[]): DensityCypherCard | null {
  const cypherRoom = rooms.find((room) => room.type.toLowerCase().includes("cypher"));
  if (!cypherRoom) return null;

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
          rooms: liveEnvelope.data.rooms,
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
