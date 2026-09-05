/**
 * composeReleaseProgram — Phase 1 World Release / Mini Release presentation.
 *
 * Composes production PROGRAM.WORLD_RELEASE (🌍) or PROGRAM.RELEASE_PREMIERE (⭐)
 * from existing Shows & Releases lifecycle + ReleasePartyDirectorEngine phases.
 * Artist/release focus + listening/premiere energy + real merch CTAs only —
 * NEVER Battle VS, NEVER Cypher circle combat.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents streams, preorders, attendance, or merch (Rule 20).
 */

import type { ReleaseEventPhase } from "@/lib/broadcast/ReleasePartyDirectorEngine";
import type { ShowsReleasePhase } from "@/lib/events/ScheduledEventRegistry";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout } from "./types";

/** Canonical PROGRAM source ids (matrix + DNA). */
export const PROGRAM_WORLD_RELEASE = "PROGRAM.WORLD_RELEASE" as const;
export const PROGRAM_RELEASE_PREMIERE = "PROGRAM.RELEASE_PREMIERE" as const;

export const ISO_PREMIERE = "ISO.PREMIERE" as const;
export const ISO_ARTIST = "ISO.ARTIST" as const;
export const ISO_COUNTDOWN = "ISO.COUNTDOWN" as const;
export const ISO_MERCH = "ISO.MERCH" as const;

/** World vs Mini naming (Rule 21) — never invent World without scope=WORLD. */
export type ReleaseScope = "MINI" | "WORLD";

/**
 * Unified presentation phase — calendar (ShowsRelease) + director (ReleaseParty).
 * Prefer director phase when live; calendar when scheduled/idle.
 */
export type ReleaseLifecyclePhase =
  | ShowsReleasePhase
  | ReleaseEventPhase
  | "PREMIERE_DROP";

export type ReleaseArtist = {
  id: string;
  displayName: string;
  slug?: string | null;
};

export type ReleaseMedia = {
  releaseId: string;
  title: string;
  artworkUrl?: string | null;
};

/** Real store / preorder inventory only — omit rather than invent. */
export type ReleaseMerchCta = {
  productId: string;
  title: string;
  href: string;
  priceLabel?: string | null;
};

export type ReleaseProgramComposition = {
  sessionId: string;
  releaseId: string;
  roomId: string;
  eventId: string | null;
  packId: "WorldRelease";
  scope: ReleaseScope;
  /** ⭐ MINI or 🌍 WORLD — visual honesty (Rule 21). */
  worldMiniBadge: "⭐ MINI" | "🌍 WORLD";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: ReleaseLifecyclePhase;
  programSourceId: typeof PROGRAM_WORLD_RELEASE | typeof PROGRAM_RELEASE_PREMIERE;
  artist: ReleaseArtist | null;
  release: ReleaseMedia | null;
  /** Countdown seconds when known — null when unknown (never invent). */
  countdownRemainingSec: number | null;
  /** Real merch/preorder CTAs only — empty when none supplied. */
  merchCtas: ReleaseMerchCta[];
  /** Always false — Release DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always null — Release pack forbids winner finale chrome. */
  winnerId: null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: ReleaseProgramComposition | null = null;

function defaultTargets(bindJumbotron: boolean): ExperienceDisplayTarget[] {
  const targets: ExperienceDisplayTarget[] = [
    "UNIVERSAL_PLAYER_PRIMARY",
    "UNIVERSAL_PLAYER_SECONDARY",
  ];
  if (bindJumbotron) {
    targets.push("JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY");
  }
  return targets;
}

function resolveProgramId(
  scope: ReleaseScope
): typeof PROGRAM_WORLD_RELEASE | typeof PROGRAM_RELEASE_PREMIERE {
  return scope === "WORLD" ? PROGRAM_WORLD_RELEASE : PROGRAM_RELEASE_PREMIERE;
}

/**
 * Map release lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * Never CIRCLE_FOCUS (Cypher DNA). Never GAME_BOARD.
 */
export function mapReleasePhaseToComposition(
  phase: ReleaseLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "DRAFT":
    case "CLOSED":
      return "HOST_CLOSE";
    case "PRESHOW":
    case "pre-countdown":
    case "countdown":
      return "PIP";
    case "intro":
    case "PREMIERE_DROP":
      return "STAGE_WIDE";
    case "LIVE":
    case "performing":
      return "STAGE_WIDE";
    case "intermission":
      return "PIP";
    case "closing":
    case "POSTSHOW":
    case "archived":
      return "HOST_CLOSE";
    default:
      return "STAGE_WIDE";
  }
}

function normalizeArtist(
  id: string | undefined | null,
  displayName?: string | null,
  slug?: string | null
): ReleaseArtist | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name, slug: slug?.trim() || null };
}

function normalizeRelease(
  releaseId: string | undefined | null,
  title?: string | null,
  artworkUrl?: string | null
): ReleaseMedia | null {
  const id = releaseId?.trim();
  const t = title?.trim();
  if (!id || !t) return null;
  return {
    releaseId: id,
    title: t,
    artworkUrl: artworkUrl?.trim() || null,
  };
}

function normalizeMerch(
  items:
    | Array<{
        productId: string;
        title: string;
        href: string;
        priceLabel?: string | null;
      }>
    | null
    | undefined
): ReleaseMerchCta[] {
  if (!Array.isArray(items)) return [];
  const out: ReleaseMerchCta[] = [];
  const seen = new Set<string>();
  for (const m of items) {
    const productId = m?.productId?.trim();
    const title = m?.title?.trim();
    const href = m?.href?.trim();
    if (!productId || !title || !href || seen.has(productId)) continue;
    if (href === "#" || href.startsWith("javascript:")) continue;
    seen.add(productId);
    out.push({
      productId,
      title,
      href,
      priceLabel: m.priceLabel?.trim() || null,
    });
  }
  return out;
}

function normalizeCountdown(sec: number | null | undefined): number | null {
  if (typeof sec !== "number" || !Number.isFinite(sec) || sec < 0) return null;
  return Math.floor(sec);
}

/**
 * Compose / refresh Release PROGRAM for an existing release session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeReleaseProgram(opts: {
  sessionId: string;
  releaseId: string;
  roomId: string;
  eventId?: string | null;
  /** Mini = ⭐ user-qualified; World = 🌍 scheduled premiere — never invent World. */
  scope?: ReleaseScope;
  artistId?: string | null;
  artistDisplayName?: string | null;
  artistSlug?: string | null;
  releaseTitle?: string | null;
  artworkUrl?: string | null;
  /** Real countdown from schedule/director — omit rather than invent. */
  countdownRemainingSec?: number | null;
  /** Real merch/preorder inventory only. */
  merchCtas?: Array<{
    productId: string;
    title: string;
    href: string;
    priceLabel?: string | null;
  }> | null;
  lifecyclePhase?: ReleaseLifecyclePhase;
  /** Prefer STAGE_WIDE / HOST_CLOSE / PIP. Never pass DUAL/CIRCLE_FOCUS. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): ReleaseProgramComposition {
  const scope: ReleaseScope = opts.scope === "WORLD" ? "WORLD" : "MINI";
  const packId = "WorldRelease" as const;
  const pack = getPresentationPack(packId);

  if (pack.allowsVsLayout) {
    throw new Error(`${packId} pack must not allow VS layout`);
  }
  if (pack.allowsWinnerFinale) {
    throw new Error(`${packId} pack must not allow winner finale`);
  }
  if (pack.allowsEliminationFinale) {
    throw new Error(`${packId} pack must not allow elimination finale`);
  }
  if (pack.isRegularGoLive) {
    throw new Error(`${packId} pack must not alias Regular GO LIVE`);
  }

  const artist = normalizeArtist(opts.artistId, opts.artistDisplayName, opts.artistSlug);
  const release = normalizeRelease(opts.releaseId, opts.releaseTitle, opts.artworkUrl);
  const merchCtas = normalizeMerch(opts.merchCtas);
  const countdownRemainingSec = normalizeCountdown(opts.countdownRemainingSec);

  const lifecyclePhase: ReleaseLifecyclePhase =
    opts.lifecyclePhase ??
    (countdownRemainingSec != null && countdownRemainingSec > 0
      ? "countdown"
      : release
        ? "LIVE"
        : "PRESHOW");

  const layout = mapReleasePhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition(packId, layout);

  if (activeRegistry && activeRegistry.getSessionId() !== opts.sessionId) {
    activeRegistry = null;
    activeComposition = null;
  }

  if (!activeRegistry) {
    activeRegistry = new ExperienceSourceRegistry(opts.sessionId);
  } else {
    activeRegistry.assertSameSession(opts.sessionId);
  }

  const bindJumbotron = opts.bindJumbotron ?? true;
  const targets = defaultTargets(bindJumbotron);
  const programSourceId = resolveProgramId(scope);
  const badge = scope === "WORLD" ? ("🌍 WORLD" as const) : ("⭐ MINI" as const);
  const releaseLabel = release?.title ?? "Waiting for release";
  const artistLabel = artist?.displayName ?? "Waiting for artist";

  activeRegistry.registerSource({
    sourceId: programSourceId,
    kind: "PROGRAM",
    label: `${badge} Release · ${releaseLabel} · ${artistLabel}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_PREMIERE,
    kind: "ISO",
    label: release
      ? `Premiere · ${release.title}`
      : "Premiere · empty — no invented artwork",
    decoderId: "release-premiere-card",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_ARTIST,
    kind: "ISO",
    label: artist ? `Artist · ${artist.displayName}` : "Artist · empty",
    decoderId: "webrtc-artist-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (countdownRemainingSec != null && countdownRemainingSec > 0) {
    activeRegistry.registerSource({
      sourceId: ISO_COUNTDOWN,
      kind: "ISO",
      label: `Countdown · ${countdownRemainingSec}s`,
      decoderId: "release-countdown",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (merchCtas.length > 0) {
    activeRegistry.registerSource({
      sourceId: ISO_MERCH,
      kind: "ISO",
      label: `Merch · ${merchCtas.length} real CTA${merchCtas.length === 1 ? "" : "s"}`,
      decoderId: "release-merch-rail",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: scope === "WORLD" ? "JUMBOTRON.WORLD_RELEASE" : "JUMBOTRON.RELEASE",
      kind: "JUMBOTRON",
      label: `In-venue Jumbotron · ${badge} Release PROGRAM`,
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(programSourceId, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    releaseId: opts.releaseId,
    roomId: opts.roomId,
    eventId: opts.eventId?.trim() || null,
    packId,
    scope,
    worldMiniBadge: badge,
    composition: layout,
    lifecyclePhase,
    programSourceId,
    artist,
    release,
    countdownRemainingSec,
    merchCtas,
    dualOccupancy: false,
    winnerId: null,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveReleaseProgram(): ReleaseProgramComposition | null {
  return activeComposition;
}

export function clearReleaseProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_RELEASE_PROGRAM__?: ReleaseProgramComposition | null;
    };
    w.__TMI_RELEASE_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_RELEASE_PROGRAM__?: ReleaseProgramComposition | null }
  ).__TMI_RELEASE_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isReleaseProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Release never presents as Battle VS / Cypher circle combat. */
export function isReleaseVsFree(program: ReleaseProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "WorldRelease" &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS" &&
    program.composition !== "GAME_BOARD"
  );
}
