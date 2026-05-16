import {
  injectBattleIntro,
  injectWinnerReplay,
  injectSponsorReel,
  injectSeasonPassPromo,
  injectArtistPromo,
} from "@/lib/video/VideoWallSyncEngine";
import {
  injectBattleResult,
  injectCypherResult,
  injectSponsorSlot,
  injectEventSlot,
  injectMagazineSlot,
} from "@/lib/lobby/LobbyBillboardMirrorEngine";

export type ProjectionTarget = "room_screen" | "lobby_board" | "venue_wall" | "all";

export type ProjectionContentType =
  | "battle_winner"
  | "cypher_winner"
  | "battle_intro"
  | "sponsor_promo"
  | "article"
  | "season_pass_promo"
  | "event_promo"
  | "artist_promo";

export interface ProjectionPayload {
  type: ProjectionContentType;
  target: ProjectionTarget;
  // battle_winner / battle_intro
  fighter1?: string;
  fighter2?: string;
  winner?: string;
  genre?: string;
  // cypher_winner
  spotlight?: string;
  // sponsor_promo
  sponsorName?: string;
  sponsorId?: string;
  campaign?: string;
  // article / event_promo
  title?: string;
  subtitle?: string;
  // season_pass_promo
  passTier?: string;
  instrument?: string;
  // artist_promo
  artistName?: string;
  artistId?: string;
  tagline?: string;
  // shared
  mediaUrl?: string;
  href: string;
  // wall target id (for venue_wall / room_screen)
  wallId?: string;
}

export interface ProjectionResult {
  success: boolean;
  targets: ProjectionTarget[];
  error?: string;
}

// ── Dispatch logic ────────────────────────────────────────────────────────────

function projectToLobbyBoard(payload: ProjectionPayload): void {
  switch (payload.type) {
    case "battle_winner":
      injectBattleResult(
        payload.winner ?? "Champion",
        payload.fighter2 ?? "Opponent",
        payload.genre ?? "Open",
        payload.href
      );
      break;
    case "battle_intro":
      // lobby board doesn't have a battle intro slot — inject as event
      injectEventSlot(
        `${payload.fighter1 ?? "?"} vs ${payload.fighter2 ?? "?"} — ${payload.genre ?? ""} Battle`,
        "Starting now",
        payload.href
      );
      break;
    case "cypher_winner":
      injectCypherResult(payload.spotlight ?? "Artist", payload.genre ?? "Open", payload.href);
      break;
    case "sponsor_promo":
      injectSponsorSlot(payload.sponsorName ?? "Sponsor", payload.campaign ?? "", payload.href);
      break;
    case "article":
      injectMagazineSlot(payload.title ?? "Article", payload.subtitle ?? "", payload.href);
      break;
    case "event_promo":
      injectEventSlot(payload.title ?? "Event", payload.subtitle ?? "", payload.href);
      break;
    case "season_pass_promo":
      injectMagazineSlot(`${payload.passTier ?? "Gold"} Season Pass`, `Unlock ${payload.instrument ?? "instrument"}`, payload.href);
      break;
    case "artist_promo":
      injectMagazineSlot(payload.artistName ?? "Artist", payload.tagline ?? "", payload.href);
      break;
  }
}

function projectToVenueWall(wallId: string, payload: ProjectionPayload): void {
  switch (payload.type) {
    case "battle_winner":
      injectWinnerReplay(wallId, {
        winnerName: payload.winner ?? "Champion",
        eventName: `${payload.genre ?? "Open"} Battle`,
        ctaRoute: payload.href,
        mediaUrl: payload.mediaUrl,
      });
      break;
    case "battle_intro":
      injectBattleIntro(wallId, {
        fighter1: payload.fighter1 ?? "Artist A",
        fighter2: payload.fighter2 ?? "Artist B",
        genre: payload.genre ?? "Open",
        ctaRoute: payload.href,
      });
      break;
    case "cypher_winner":
      injectWinnerReplay(wallId, {
        winnerName: payload.spotlight ?? "Spotlight",
        eventName: `${payload.genre ?? "Open"} Cypher`,
        ctaRoute: payload.href,
        mediaUrl: payload.mediaUrl,
      });
      break;
    case "sponsor_promo":
      injectSponsorReel(wallId, {
        sponsorName: payload.sponsorName ?? "Sponsor",
        campaign: payload.campaign ?? "",
        sponsorId: payload.sponsorId ?? "unknown",
        ctaRoute: payload.href,
        mediaUrl: payload.mediaUrl,
      });
      break;
    case "season_pass_promo":
      injectSeasonPassPromo(wallId, {
        tier: payload.passTier ?? "Gold",
        instrument: payload.instrument ?? "guitar",
        ctaRoute: payload.href,
      });
      break;
    case "artist_promo":
      injectArtistPromo(wallId, {
        artistName: payload.artistName ?? "Artist",
        tagline: payload.tagline ?? "",
        artistId: payload.artistId ?? "unknown",
        ctaRoute: payload.href,
        mediaUrl: payload.mediaUrl,
      });
      break;
    case "article":
    case "event_promo":
      // Video wall: use artist promo slot as generic promo
      injectArtistPromo(wallId, {
        artistName: payload.title ?? "Feature",
        tagline: payload.subtitle ?? "",
        artistId: "tmi",
        ctaRoute: payload.href,
        mediaUrl: payload.mediaUrl,
      });
      break;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function project(payload: ProjectionPayload): ProjectionResult {
  const targets: ProjectionTarget[] = [];
  const wallId = payload.wallId ?? "main";

  try {
    if (payload.target === "lobby_board" || payload.target === "all") {
      projectToLobbyBoard(payload);
      targets.push("lobby_board");
    }
    if (payload.target === "venue_wall" || payload.target === "room_screen" || payload.target === "all") {
      projectToVenueWall(wallId, payload);
      targets.push(payload.target === "all" ? "venue_wall" : payload.target);
    }
    return { success: true, targets };
  } catch (e) {
    return { success: false, targets, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export function broadcastBattleWinner(opts: {
  winner: string; loser: string; genre: string; href: string; wallId?: string; mediaUrl?: string;
}): ProjectionResult {
  return project({
    type: "battle_winner",
    target: "all",
    winner: opts.winner,
    fighter2: opts.loser,
    genre: opts.genre,
    href: opts.href,
    wallId: opts.wallId,
    mediaUrl: opts.mediaUrl,
  });
}

export function broadcastCypherWinner(opts: {
  spotlight: string; genre: string; href: string; wallId?: string;
}): ProjectionResult {
  return project({
    type: "cypher_winner",
    target: "all",
    spotlight: opts.spotlight,
    genre: opts.genre,
    href: opts.href,
    wallId: opts.wallId,
  });
}

export function broadcastSponsorPromo(opts: {
  sponsorName: string; sponsorId: string; campaign: string; href: string; wallId?: string; mediaUrl?: string;
}): ProjectionResult {
  return project({
    type: "sponsor_promo",
    target: "all",
    sponsorName: opts.sponsorName,
    sponsorId: opts.sponsorId,
    campaign: opts.campaign,
    href: opts.href,
    wallId: opts.wallId,
    mediaUrl: opts.mediaUrl,
  });
}

export function broadcastBattleIntro(opts: {
  fighter1: string; fighter2: string; genre: string; href: string; wallId?: string;
}): ProjectionResult {
  return project({
    type: "battle_intro",
    target: "all",
    fighter1: opts.fighter1,
    fighter2: opts.fighter2,
    genre: opts.genre,
    href: opts.href,
    wallId: opts.wallId,
  });
}
