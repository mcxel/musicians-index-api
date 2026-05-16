"use client";

/**
 * Slice 6 — Brick 3: Live + Bot Surfaces
 *
 * LiveRoomsZone  → /home/3 left-top  (zone: liveRooms)
 * EventsZone     → /home/3 left-bot  (zone: events)
 * CypherZone     → /home/3 right     (zone: cypher)
 * DiscoveryZone  → /home/2 right     (zone: discovery)
 * GenresZone     → /home/2 left-top  (zone: genres)
 * PlaylistsZone  → /home/2 left-bot  (zone: playlists)
 * SponsorZone    → /home/4 left-bot  (zone: sponsors)
 * AdsZone        → /home/4 left-top  (zone: ads)
 * PlacementsZone → /home/4 right     (zone: placements)
 * NewsZone       → bot-fed overlay used by all critical zones
 */

import {
  getLiveRooms,
  getLiveCyphers,
  getUpcomingEvents,
  getGenres,
  getPlaylists,
  getRisingArtists,
  getSponsors,
  getAdPlacements,
  getNewsAlerts,
  type LiveRoomEntry,
  type CypherEntry,
} from "./dataAdapters";
import VenueSkinShell from "@/packages/foundation-visual/VenueSkinShell";
import StageFrame from "@/packages/foundation-visual/StageFrame";
import LiveVideoShell from "@/packages/foundation-visual/LiveVideoShell";
import ReactionBar from "@/packages/foundation-visual/ReactionBar";
import AngledPanel from "@/packages/foundation-visual/AngledPanel";
import BillboardFrame from "@/packages/foundation-visual/BillboardFrame";
import SponsorSpotlightFrame from "@/packages/foundation-visual/SponsorSpotlightFrame";
import NameThatTuneBoard from "@/packages/foundation-visual/NameThatTuneBoard";
import HexCluster from "@/packages/foundation-effects/HexCluster";
import { useMemo, useState } from "react";

// ─── Viewer count formatter ───────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Live badge ───────────────────────────────────────────────────────────────

function LiveBadge({ isLive }: { isLive: boolean }) {
  return (
    <span className={`live-badge live-badge--${isLive ? "on" : "soon"}`}>
      {isLive ? "● LIVE" : "SOON"}
    </span>
  );
}

// ─── Zone: Live Rooms (home3 left-top) ───────────────────────────────────────

export function LiveRoomsZone() {
  const rooms = getLiveRooms();
  const active = rooms.find((room) => room.isLive) ?? rooms[0];

  function handleReact(type: string) {
    // Slice 6.5 pre-hook: will be replaced with socket emission in Slice 7.
    console.log("reaction:live-room", type, active?.id);
  }

  return (
    <div className="live-zone live-zone--rooms" data-zone-id="liveRooms">
      <div className="live-zone__header">
        <p className="live-zone__kicker">NOW STREAMING</p>
        <h2 className="live-zone__title">Live Rooms</h2>
      </div>
      <VenueSkinShell theme="dark-concert" className="rounded-xl border border-white/10 p-2">
        <StageFrame theme="dark-concert" className="min-h-[220px] p-2">
          <LiveVideoShell performerName={active?.host ?? "Live Performer"} isSpeaking={Boolean(active?.isLive)}>
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-[11px] tracking-[0.2em] text-zinc-300">
              STREAM MOUNT PLACEHOLDER
            </div>
          </LiveVideoShell>
          <div className="mt-2 flex justify-end">
            <ReactionBar onReact={handleReact} />
          </div>
        </StageFrame>
      </VenueSkinShell>
      <div className="live-zone__room-grid" data-live="rooms">
        {rooms.map((room: LiveRoomEntry) => (
          <div key={room.id} className={`room-card${room.isLive ? " room-card--live" : ""}`}>
            <LiveBadge isLive={room.isLive} />
            <span className="room-card__title">{room.title}</span>
            <span className="room-card__host">Host: {room.host}</span>
            <div className="room-card__footer">
              <span className="room-card__genre">{room.genre}</span>
              <span className="room-card__viewers">{fmt(room.viewerCount)} watching</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Events (home3 left-bot) ───────────────────────────────────────────

export function EventsZone() {
  const events = getUpcomingEvents();
  return (
    <div className="live-zone live-zone--events" data-zone-id="events">
      <div className="live-zone__header">
        <p className="live-zone__kicker">UPCOMING</p>
        <h2 className="live-zone__title">Events</h2>
      </div>
      <div className="live-zone__event-list" data-live="events">
        {events.map((ev) => (
          <AngledPanel key={ev.id} className={`event-row${ev.isSoldOut ? " event-row--soldout" : ""}`}>
            <div className="event-row__info">
              <span className="event-row__title">{ev.title}</span>
              <span className="event-row__venue">{ev.venue} · {ev.startsAt}</span>
            </div>
            <div className="event-row__right">
              <span className="event-row__badge">{ev.badge}</span>
              {ev.isSoldOut && <span className="event-row__sold">SOLD OUT</span>}
            </div>
          </AngledPanel>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Cypher (home3 right) ───────────────────────────────────────────────

export function CypherZone() {
  const cyphers = getLiveCyphers();
  const live = cyphers.filter((c: CypherEntry) => c.status === "live");
  const upcoming = cyphers.filter((c: CypherEntry) => c.status === "upcoming");
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const boardSlots = useMemo(
    () =>
      cyphers.slice(0, 8).map((c) => ({
        id: c.id,
        content: `${c.participant1} vs ${c.participant2}`,
        revealed: revealedIds.includes(c.id),
      })),
    [cyphers, revealedIds],
  );

  function toggleReveal(id: string) {
    setRevealedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  return (
    <div className="live-zone live-zone--cypher" data-zone-id="cypher">
      <div className="live-zone__header">
        <p className="live-zone__kicker">BATTLE ARENA</p>
        <h2 className="live-zone__title">Cyphers</h2>
      </div>

      <div className="mb-2 rounded-xl border border-fuchsia-500/30 bg-black/40 p-2">
        <NameThatTuneBoard slots={boardSlots} />
        <div className="mt-2 flex flex-wrap gap-2" data-interaction-widget="game-board-toggle">
          {boardSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => toggleReveal(slot.id)}
              className="rounded-full border border-fuchsia-400/40 px-2 py-1 text-[10px] tracking-widest text-fuchsia-200"
            >
              {slot.revealed ? "HIDE" : "REVEAL"} {slot.id}
            </button>
          ))}
        </div>
      </div>

      {live.length > 0 && (
        <div className="cypher-section" data-live="cypher-live">
          <p className="cypher-section__label">● LIVE NOW</p>
          {live.map((c: CypherEntry) => (
            <div key={c.id} className="cypher-card cypher-card--live">
              <div className="cypher-card__title">{c.title}</div>
              <div className="cypher-card__vs">
                <span>{c.participant1}</span>
                <span className="cypher-card__vs-sep">VS</span>
                <span>{c.participant2}</span>
              </div>
              <div className="cypher-card__hype">
                <span className="cypher-card__hype-label">HYPE</span>
                <div className="cypher-hype-bar">
                  <div className="cypher-hype-bar__fill" style={{ width: `${c.hype}%` }} />
                </div>
                <span className="cypher-card__hype-val">{c.hype}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="cypher-section" data-live="cypher-upcoming">
          <p className="cypher-section__label">UPCOMING</p>
          {upcoming.map((c: CypherEntry) => (
            <div key={c.id} className="cypher-card cypher-card--upcoming">
              <div className="cypher-card__title">{c.title}</div>
              <div className="cypher-card__vs">
                <span>{c.participant1}</span>
                <span className="cypher-card__vs-sep">VS</span>
                <span>{c.participant2}</span>
              </div>
              <span className="cypher-card__start">Starts {c.startAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Zone: Genres (home2 left-top) ────────────────────────────────────────────

export function GenresZone() {
  const genres = getGenres();
  return (
    <div className="discovery-zone discovery-zone--genres" data-zone-id="genres">
      <div className="discovery-zone__header">
        <p className="discovery-zone__kicker">DISCOVERY</p>
        <h2 className="discovery-zone__title">Genre Radar</h2>
      </div>
      <div className="discovery-zone__genre-grid" data-discovery="genres">
        <HexCluster items={genres.slice(0, 6).map((g) => g.label)} />
        {genres.map((g) => (
          <div key={g.slug} className={`genre-chip genre-chip--${g.color} genre-chip--${g.trend}`}>
            <span className="genre-chip__label">{g.label}</span>
            <span className="genre-chip__heat">{g.heatScore}</span>
            <span className={`genre-chip__trend genre-chip__trend--${g.trend}`}>
              {g.trend === "rising" ? "▲" : g.trend === "falling" ? "▼" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Playlists (home2 left-bot) ─────────────────────────────────────────

export function PlaylistsZone() {
  const playlists = getPlaylists();
  return (
    <div className="discovery-zone discovery-zone--playlists" data-zone-id="playlists">
      <div className="discovery-zone__header">
        <p className="discovery-zone__kicker">CURATED</p>
        <h2 className="discovery-zone__title">Playlist Capsules</h2>
      </div>
      <div className="discovery-zone__playlist-list" data-discovery="playlists">
        {playlists.map((pl) => (
          <div key={pl.id} className={`playlist-row playlist-row--${pl.glow}`}>
            <span className="playlist-row__badge">{pl.badge}</span>
            <div className="playlist-row__info">
              <span className="playlist-row__title">{pl.title}</span>
              <span className="playlist-row__meta">{pl.curator} · {pl.trackCount} tracks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Discovery (home2 right — rising artists) ──────────────────────────

export function DiscoveryZone() {
  const rising = getRisingArtists();
  const all = getGenres();
  return (
    <div className="discovery-zone discovery-zone--rising" data-zone-id="discovery">
      <div className="discovery-zone__header">
        <p className="discovery-zone__kicker">SPOTLIGHT</p>
        <h2 className="discovery-zone__title">Rising Artists</h2>
      </div>
      <div className="discovery-zone__rising-grid" data-discovery="rising">
        {rising.map((a) => (
          <div key={a.rank} className="discovery-artist-card">
            <span className="discovery-artist-card__rank">#{a.rank}</span>
            <div className="discovery-artist-card__info">
              <span className="discovery-artist-card__name">{a.name}</span>
              <span className="discovery-artist-card__genre">{a.genre}</span>
            </div>
            <span className="discovery-artist-card__delta">+{a.delta}</span>
          </div>
        ))}
        <div className="discovery-zone__genre-tags">
          {all.slice(0, 4).map((g) => (
            <span key={g.slug} className={`genre-tag genre-tag--${g.color}`}>{g.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Zone: Sponsors (home4 left-bot) ─────────────────────────────────────────

export function SponsorsZone() {
  const sponsors = getSponsors();
  return (
    <div className="market-zone market-zone--sponsors" data-zone-id="sponsors">
      <div className="market-zone__header">
        <p className="market-zone__kicker">PARTNERS</p>
        <h2 className="market-zone__title">Sponsors</h2>
      </div>
      <div className="market-zone__sponsor-list" data-market="sponsors">
        {sponsors.map((sp) => (
          <div key={sp.id} className={`sponsor-card sponsor-card--${sp.tier}`}>
            <SponsorSpotlightFrame
              brandName={sp.name}
              message={sp.tagline}
              href={sp.ctaHref}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Ads (home4 left-top) ───────────────────────────────────────────────

export function AdsZone() {
  const ads = getAdPlacements();
  const sponsor = getSponsors()[0];
  return (
    <div className="market-zone market-zone--ads" data-zone-id="ads">
      <div className="market-zone__header">
        <p className="market-zone__kicker">PLACEMENTS</p>
        <h2 className="market-zone__title">Ad Inventory</h2>
      </div>
      <BillboardFrame sponsorTag={sponsor?.name} className="mb-2 p-3">
        <SponsorSpotlightFrame
          brandName={sponsor?.name ?? "Featured Brand"}
          message={sponsor?.tagline ?? "Native placement slot"}
          href={sponsor?.ctaHref}
        />
      </BillboardFrame>
      <div className="market-zone__ad-list" data-market="ads">
        {ads.map((ad) => (
          <div key={ad.id} className={`ad-row ad-row--${ad.tier}`}>
            <span className="ad-row__badge">{ad.badge}</span>
            <div className="ad-row__copy">
              <span className="ad-row__headline">{ad.headline}</span>
              <span className="ad-row__subline">{ad.subline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Placements/Newsroom (home4 right — bot-fed) ───────────────────────

export function PlacementsZone() {
  const news = getNewsAlerts();
  const sponsors = getSponsors();
  return (
    <div className="market-zone market-zone--placements" data-zone-id="placements">
      <div className="market-zone__header">
        <p className="market-zone__kicker">NEWSROOM</p>
        <h2 className="market-zone__title">Sponsor + News Feed</h2>
      </div>

      <div className="placements-news-feed" data-market="placements-news">
        {news.map((n) => (
          <div key={n.id} className={`news-alert${n.isBreaking ? " news-alert--breaking" : ""}`}>
            {n.isBreaking && <span className="news-alert__breaking">BREAKING</span>}
            <span className="news-alert__category">{n.category}</span>
            <p className="news-alert__headline">{n.headline}</p>
            <span className="news-alert__time">{n.publishedAt}</span>
          </div>
        ))}
      </div>

      <div className="placements-sponsor-strip" data-market="placements-sponsors">
        {sponsors.slice(0, 2).map((sp) => (
          <div key={sp.id} className="sponsor-strip-pill">
            <span>{sp.name}</span>
            <span className={`sponsor-strip-pill__tier sponsor-strip-pill__tier--${sp.tier}`}>{sp.tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
