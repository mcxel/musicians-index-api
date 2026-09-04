/**
 * Optional YoPho card media module — references existing playlistId / Song.audioUrl.
 * Skin ≠ source: chassis/position must not restart CanonicalPlaybackSession.
 * Video snippet pipeline on cards is audio-only this pass (honest OPEN).
 */

import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import { resolveDurablePlayableSrc } from "@/lib/media/durablePlayableUrl";

/** Now Playing — single track and/or playlist for "song right now" */
export interface YoPhoNowPlaying {
  playlistId?: string | null;
  trackId?: string | null;
  title?: string | null;
  artist?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
}

export type YoPhoMediaModuleType =
  | "playlist"
  | "album"
  | "song"
  | "audio_snippet"
  | "video_snippet"
  | "motto";

export type YoPhoMediaAutoplayPolicy = "attempt" | "muted_until_tap" | "off";

export type YoPhoMediaModulePosition = "bottom" | "center" | "top" | "left" | "right";

export const YOPHO_MOTTO_DURATION_DEFAULT_SEC = 7;
export const YOPHO_MOTTO_DURATION_MIN_SEC = 5;
export const YOPHO_MOTTO_DURATION_MAX_SEC = 10;

/** Existing chassis only — vinyl / cassette / glass ids are not in the registry. */
export const YOPHO_CARD_CHASSIS_IDS: MediaPlayerChassisId[] = [
  "standard",
  "tmi_classic",
  "tmi_dark",
  "tmi_neon",
  "chrome",
];

export interface YoPhoMediaModule {
  id: string;
  type: YoPhoMediaModuleType;
  /** playlistId / Song.id — never a duplicated playlist copy */
  sourceId: string | null;
  audioUrl?: string | null;
  title?: string | null;
  artist?: string | null;
  coverUrl?: string | null;
  startSec: number;
  endSec: number | null;
  loop: boolean;
  autoplayPolicy: YoPhoMediaAutoplayPolicy;
  /** Visual chassis only — changing this must not restart playback */
  skinId: MediaPlayerChassisId;
  position: YoPhoMediaModulePosition;
}

export function clampMottoDurationSec(sec: number | null | undefined): number {
  const n = typeof sec === "number" && Number.isFinite(sec) ? sec : YOPHO_MOTTO_DURATION_DEFAULT_SEC;
  return Math.min(
    YOPHO_MOTTO_DURATION_MAX_SEC,
    Math.max(YOPHO_MOTTO_DURATION_MIN_SEC, Math.round(n)),
  );
}

export function createYoPhoMediaModuleId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `ymm_${Date.now().toString(36)}_${rand}`;
}

export function defaultYoPhoMediaModule(
  partial?: Partial<YoPhoMediaModule>,
): YoPhoMediaModule {
  const type = partial?.type ?? "song";
  const motto = type === "motto";
  const skinId =
    partial?.skinId && partial.skinId in MEDIA_PLAYER_CHASSIS_REGISTRY
      ? partial.skinId
      : FREE_DEFAULT_CHASSIS_ID;
  return {
    id: partial?.id ?? createYoPhoMediaModuleId(),
    type,
    sourceId: partial?.sourceId ?? null,
    audioUrl: partial?.audioUrl ?? null,
    title: partial?.title ?? null,
    artist: partial?.artist ?? null,
    coverUrl: partial?.coverUrl ?? null,
    startSec: Math.max(0, partial?.startSec ?? 0),
    endSec: motto
      ? clampMottoDurationSec(partial?.endSec ?? YOPHO_MOTTO_DURATION_DEFAULT_SEC)
      : (partial?.endSec ?? null),
    loop: partial?.loop ?? motto,
    autoplayPolicy: partial?.autoplayPolicy ?? "muted_until_tap",
    skinId,
    position: partial?.position ?? "bottom",
  };
}

export function isYoPhoMediaPlayable(mod: YoPhoMediaModule | null | undefined): boolean {
  if (!mod) return false;
  if (mod.type === "video_snippet" && !resolveDurablePlayableSrc(mod.audioUrl ?? null)) {
    return false;
  }
  if (mod.type === "playlist" || mod.type === "album") {
    return Boolean(mod.sourceId?.trim()) || Boolean(resolveDurablePlayableSrc(mod.audioUrl ?? null));
  }
  return Boolean(resolveDurablePlayableSrc(mod.audioUrl ?? null));
}

/** Source identity only — skinId / position excluded so chassis moves do not restart audio. */
export function yophoMediaPlaybackKey(mod: YoPhoMediaModule): string {
  return [
    mod.type,
    mod.sourceId ?? "",
    mod.audioUrl ?? "",
    String(mod.startSec ?? 0),
    String(mod.endSec ?? ""),
    mod.loop ? "1" : "0",
  ].join("|");
}

export function mediaModulesFromLegacyNowPlaying(
  nowPlaying: YoPhoNowPlaying | null | undefined,
  playlistId?: string | null,
): YoPhoMediaModule[] {
  const pid = nowPlaying?.playlistId ?? playlistId ?? null;
  const audioUrl = nowPlaying?.audioUrl ?? null;
  const title = nowPlaying?.title ?? null;
  if (!pid && !audioUrl && !title) return [];
  return [
    defaultYoPhoMediaModule({
      type: pid ? "playlist" : "song",
      sourceId: nowPlaying?.trackId ?? pid,
      audioUrl,
      title,
      artist: nowPlaying?.artist ?? null,
      coverUrl: nowPlaying?.coverUrl ?? null,
    }),
  ];
}

export function firstPlayableMediaModule(
  modules: YoPhoMediaModule[] | null | undefined,
): YoPhoMediaModule | null {
  if (!modules?.length) return null;
  return modules.find((m) => isYoPhoMediaPlayable(m)) ?? null;
}

export function mediaModuleToNowPlaying(mod: YoPhoMediaModule | null): YoPhoNowPlaying | null {
  if (!mod) return null;
  if (!mod.title && !mod.audioUrl && !mod.sourceId) return null;
  return {
    playlistId: mod.type === "playlist" || mod.type === "album" ? mod.sourceId : null,
    trackId: mod.type === "song" || mod.type === "audio_snippet" || mod.type === "motto" ? mod.sourceId : null,
    title: mod.title ?? null,
    artist: mod.artist ?? null,
    audioUrl: mod.audioUrl ?? null,
    coverUrl: mod.coverUrl ?? null,
  };
}

export function resolveCardMediaModules(input: {
  mediaModules?: YoPhoMediaModule[] | null;
  nowPlaying?: YoPhoNowPlaying | null;
  playlistId?: string | null;
}): YoPhoMediaModule[] {
  if (input.mediaModules && input.mediaModules.length > 0) {
    return input.mediaModules.map((m) => defaultYoPhoMediaModule(m));
  }
  return mediaModulesFromLegacyNowPlaying(input.nowPlaying, input.playlistId);
}
