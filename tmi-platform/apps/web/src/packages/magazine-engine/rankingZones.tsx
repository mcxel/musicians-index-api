"use client";

/**
 * Slice 6 — Brick 2: Ranking Pipeline
 *
 * CrownRankingZone  → /home/1 right-page (zone: ranking)
 * GlobalRankZone    → /home/5 left-page  (zone: globalRank)
 * GenreRankZone     → /home/5 left-page  (zone: genreRank)
 * RisingZone        → /home/5 right-page (zone: rising)
 */

import {
  getCrownLeader,
  getTop10,
  getGlobalRanking,
  getGenreRanking,
  getRisingArtists,
  type ArtistRankEntry,
} from "./dataAdapters";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function DeltaTag({ delta }: { delta: number }) {
  if (delta === 0) return <span className="rank-delta rank-delta--stable">—</span>;
  const up = delta > 0;
  return (
    <span className={`rank-delta rank-delta--${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

function RankRow({ entry, highlight }: { entry: ArtistRankEntry; highlight?: boolean }) {
  return (
    <div className={`rank-row${highlight ? " rank-row--crown" : ""}${entry.isNew ? " rank-row--new" : ""}`}>
      <span className="rank-row__pos">{entry.rank}</span>
      <span className="rank-row__name">{entry.name}</span>
      <span className="rank-row__genre">{entry.genre}</span>
      <DeltaTag delta={entry.delta} />
      <span className="rank-row__badge">{entry.badge}</span>
    </div>
  );
}

// ─── Zone: Crown (home1 right) ────────────────────────────────────────────────

export function CrownRankingZone() {
  const crown = getCrownLeader();
  const top10 = getTop10();

  return (
    <div className="ranking-zone ranking-zone--crown" data-zone-id="ranking">
      <div className="ranking-zone__header">
        <p className="ranking-zone__kicker">THIS WEEK&apos;S CROWN</p>
        <h2 className="ranking-zone__crown-name">{crown.name}</h2>
        <p className="ranking-zone__crown-genre">{crown.genre}</p>
        <div className="ranking-zone__crown-score">
          <span className="ranking-zone__score-num">{crown.score.toLocaleString()}</span>
          <span className="ranking-zone__score-label">pts</span>
        </div>
      </div>

      <div className="ranking-zone__list" data-ranking="crown-top10">
        <p className="ranking-zone__list-heading">TOP 10 THIS WEEK</p>
        {top10.slice(1).map((entry) => (
          <RankRow key={entry.rank} entry={entry} />
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Global Rankings (home5 left-top) ───────────────────────────────────

export function GlobalRankZone() {
  const ranking = getGlobalRanking();
  const top5 = ranking.slice(0, 5);

  return (
    <div className="ranking-zone ranking-zone--global" data-zone-id="globalRank">
      <div className="ranking-zone__header">
        <p className="ranking-zone__kicker">GLOBAL RANKING</p>
        <h2 className="ranking-zone__title">All-Genre Leaderboard</h2>
      </div>
      <div className="ranking-zone__list" data-ranking="global-top5">
        {top5.map((entry) => (
          <RankRow key={entry.rank} entry={entry} highlight={entry.rank === 1} />
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Genre Rankings (home5 left-bottom) ────────────────────────────────

export function GenreRankZone() {
  const genres = getGenreRanking();

  return (
    <div className="ranking-zone ranking-zone--genre" data-zone-id="genreRank">
      <div className="ranking-zone__header">
        <p className="ranking-zone__kicker">BY GENRE</p>
        <h2 className="ranking-zone__title">Genre Leaderboards</h2>
      </div>
      <div className="ranking-zone__genre-grid" data-ranking="genre-grid">
        {genres.map((g) => (
          <div key={g.genre} className={`genre-rank-tile genre-rank-tile--${g.trend}`}>
            <span className="genre-rank-tile__genre">{g.genre}</span>
            <span className="genre-rank-tile__leader">{g.leader.name}</span>
            <span className="genre-rank-tile__count">{g.count} artists</span>
            <span className={`genre-rank-tile__trend genre-rank-tile__trend--${g.trend}`}>
              {g.trend === "rising" ? "▲" : g.trend === "falling" ? "▼" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zone: Rising Artists (home5 right) ──────────────────────────────────────

export function RisingZone() {
  const rising = getRisingArtists();
  const all = getGlobalRanking();
  // pad if not enough delta-risers
  const list = rising.length >= 3 ? rising : all.slice(0, 5);

  return (
    <div className="ranking-zone ranking-zone--rising" data-zone-id="rising">
      <div className="ranking-zone__header">
        <p className="ranking-zone__kicker">MOMENTUM</p>
        <h2 className="ranking-zone__title">Rising Artists</h2>
        <p className="ranking-zone__subtitle">Biggest movers this week</p>
      </div>
      <div className="ranking-zone__rising-list" data-ranking="rising">
        {list.map((entry) => (
          <div key={entry.rank} className="rising-card">
            <div className="rising-card__rank">#{entry.rank}</div>
            <div className="rising-card__info">
              <span className="rising-card__name">{entry.name}</span>
              <span className="rising-card__genre">{entry.genre}</span>
            </div>
            <div className="rising-card__delta">
              <span className="rising-card__delta-num">+{entry.delta}</span>
              <span className="rising-card__delta-label">pts delta</span>
            </div>
            {entry.isNew && <span className="rising-card__new-badge">NEW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
