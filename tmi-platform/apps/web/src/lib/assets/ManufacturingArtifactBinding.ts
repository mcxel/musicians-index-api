/**
 * Isolated manufacturing artifact binding — LIVE_ASSET_SWITCHES = NO.
 * Resolves JOB-* paths for integration/cert only. Never writes or serves
 * apps/web/public/models. Browser live URLs remain /models/... until owner promotion.
 */

export const MANUFACTURING_ARTIFACT_BINDING_ID =
  "MANUFACTURING_ARTIFACT_BINDING_v1" as const;

/** Owner lock — do not flip without explicit release approval. */
export const LIVE_ASSET_SWITCHES = false as const;

export const ARTIFACTS_ROOT =
  "packages/assets/generated/manufacturing/artifacts" as const;

export type ManufacturingJobId =
  | "JOB-VIDEO-DEVICES-001"
  | "JOB-LOUNGE-INTERACTIVES-001"
  | "JOB-VENUE-REF-AUDITORIUM-V3"
  | "JOB-VENUE-MNS-ARCH-V2"
  | "JOB-STAGE-FX-001"
  | "JOB-MINIME-VOICE-REBIRTH-001"
  | "JOB-MINIME-PERSONA-001"
  | "JOB-MINIME-BODY-001"
  | "JOB-WDP-LIGHT-DANCE-001";

/** Repo-relative path (Node/tests/cert). Not a browser URL. */
export function jobArtifactRepoPath(jobId: ManufacturingJobId, filename: string): string {
  const safe = filename.replace(/\\/g, "/").split("/").pop() ?? filename;
  return `${ARTIFACTS_ROOT}/${jobId}/${safe}`;
}

/**
 * Live browser URL — only when LIVE_ASSET_SWITCHES is true AND a promoted public path exists.
 * Otherwise null (honest: manufactured but not live-switched).
 */
export function jobArtifactLiveUrl(
  _jobId: ManufacturingJobId,
  filename: string,
  promotedPublicPath?: string | null,
): string | null {
  if (!LIVE_ASSET_SWITCHES) return null;
  if (promotedPublicPath) return promotedPublicPath;
  const safe = filename.replace(/\\/g, "/").split("/").pop() ?? filename;
  return `/models/manufacturing/${safe}`;
}

export type VideoDeviceManufacturedSpec = {
  appearanceId: string;
  filename: string;
  widthM: number;
  heightM: number;
  facing: "+Z" | "-Z";
  materialName: string;
  orientation: "LANDSCAPE" | "PORTRAIT" | "SQUARE";
  physicalSizeM: [number, number, number];
  sha256: string;
};

/** From JOB-VIDEO-DEVICES-001 certification receipt — display surfaces only. */
export const VIDEO_DEVICE_MANUFACTURED_SPECS: readonly VideoDeviceManufacturedSpec[] = [
  { appearanceId: "smartphone_v1", filename: "smartphone_v1.glb", widthM: 0.36, heightM: 0.78, facing: "+Z", materialName: "mat_smartphone_v1_screen", orientation: "PORTRAIT", physicalSizeM: [0.4, 0.84, 0.04], sha256: "E231950D034BC681D4B03B281D289ABD7969FC9CC77B871A7891290F2FD5D824" },
  { appearanceId: "retro_tv_v1", filename: "retro_tv_v1.glb", widthM: 0.56, heightM: 0.42, facing: "+Z", materialName: "mat_retro_tv_v1_screen", orientation: "SQUARE", physicalSizeM: [0.72, 0.58, 0.5], sha256: "5CD989379B99FF80ABF2DD298DBB5221C67D1A8BB9CEFF03865CD42E55E58C70" },
  { appearanceId: "hologram_panel_v1", filename: "hologram_panel_v1.glb", widthM: 0.9, heightM: 0.6, facing: "+Z", materialName: "mat_hologram_panel_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [1.0, 1.4, 0.4], sha256: "993EFA84E3498A597E77C539F4AF49425179A71E3D7B1AA675C2D105C66BE3F6" },
  { appearanceId: "picture_frame_v1", filename: "picture_frame_v1.glb", widthM: 0.6, heightM: 0.75, facing: "+Z", materialName: "mat_picture_frame_v1_screen", orientation: "PORTRAIT", physicalSizeM: [0.76, 0.91, 0.05], sha256: "A57BB685214FCC45DC90B5BD925DA8592175843D238DA98AA1EE95851942797E" },
  { appearanceId: "tablet_v1", filename: "tablet_v1.glb", widthM: 0.8, heightM: 0.6, facing: "+Z", materialName: "mat_tablet_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [0.86, 0.66, 0.03], sha256: "7C09F9A18A2C887F8D1340FE3BBCC156C95DF3D1692A9B2A34DF3589D8385B14" },
  { appearanceId: "flip_phone_v1", filename: "flip_phone_v1.glb", widthM: 0.4, heightM: 0.52, facing: "+Z", materialName: "mat_flip_phone_v1_screen", orientation: "PORTRAIT", physicalSizeM: [0.44, 1.1, 0.06], sha256: "91949CAC1EBC3CE310A222C35D45E3E07B87EBE002479EB12D2D02DC6E257DF7" },
  { appearanceId: "boombox_v1", filename: "boombox_v1.glb", widthM: 0.42, heightM: 0.3, facing: "+Z", materialName: "mat_boombox_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [0.9, 0.5, 0.3], sha256: "1C714405B351B4BD18A5B98D954EB193D209B385381E9490037CF1EF25F424CF" },
  { appearanceId: "music_player_v1", filename: "music_player_v1.glb", widthM: 0.4, heightM: 0.4, facing: "+Z", materialName: "mat_music_player_v1_screen", orientation: "SQUARE", physicalSizeM: [0.5, 0.8, 0.06], sha256: "9F47B0948000C16226592C09A159A35277FFAB63308AC0A27B102FDC05AE1B61" },
  { appearanceId: "playlist_screen_v1", filename: "playlist_screen_v1.glb", widthM: 0.8, heightM: 0.45, facing: "+Z", materialName: "mat_playlist_screen_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [0.86, 0.6, 0.05], sha256: "58D37CCBDF198CEF1014BD940015FFF098547BA69FDC8FB0D53C751F12ABBD90" },
  { appearanceId: "flatscreen_premium_v1", filename: "flatscreen_premium_v1.glb", widthM: 1.2, heightM: 0.675, facing: "+Z", materialName: "mat_flatscreen_premium_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [1.26, 0.74, 0.06], sha256: "78D62285BF67A9A44321B86C5096BDAF54D3414655CEF6B6931F7065077E43B5" },
  { appearanceId: "jukebox_skin_v1", filename: "jukebox_skin_v1.glb", widthM: 0.5, heightM: 0.4, facing: "+Z", materialName: "mat_jukebox_skin_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [0.9, 1.6, 0.6], sha256: "C720516621D32760623FA0575F1F3CEAF7128CD0F0FF2AC1B3D4B1DB66E6B38F" },
  { appearanceId: "dj_console_v1", filename: "dj_console_v1.glb", widthM: 0.9, heightM: 0.5, facing: "+Z", materialName: "mat_dj_console_v1_screen", orientation: "LANDSCAPE", physicalSizeM: [1.6, 1.1, 0.8], sha256: "BEDEBAEE09842FCBAC3F68E4A97D05621BE9E7CF1F404B0ACE5EF4765EBBBC1C" },
] as const;

export function videoDeviceIntegrationGlb(appearanceId: string): string | null {
  const spec = VIDEO_DEVICE_MANUFACTURED_SPECS.find((s) => s.appearanceId === appearanceId);
  if (!spec) return null;
  return jobArtifactRepoPath("JOB-VIDEO-DEVICES-001", spec.filename);
}

export const INTEGRATION_VENUE_WORLDS = {
  "reference-auditorium-v3": jobArtifactRepoPath(
    "JOB-VENUE-REF-AUDITORIUM-V3",
    "reference-auditorium-v3-world.glb",
  ),
  /** Canonical MNS experience id + arch-v2 blueprint — same JOB world (integration lane). */
  "monday-night-stage": jobArtifactRepoPath(
    "JOB-VENUE-MNS-ARCH-V2",
    "monday-night-stage-arch-v2-world.glb",
  ),
  "monday-night-stage-arch-v2": jobArtifactRepoPath(
    "JOB-VENUE-MNS-ARCH-V2",
    "monday-night-stage-arch-v2-world.glb",
  ),
  "monday-night-stage-arch-v3-fx": jobArtifactRepoPath(
    "JOB-VENUE-MNS-ARCH-V2",
    "monday-night-stage-arch-v3-fx-world.glb",
  ),
  "purpose-lounge-v2-interactives": jobArtifactRepoPath(
    "JOB-LOUNGE-INTERACTIVES-001",
    "purpose-lounge-v2-interactives-world.glb",
  ),
} as const;

export function manufacturingBoundaryLocks() {
  return {
    LIVE_ASSET_SWITCHES,
    PUBLIC_MODELS_UNTOUCHED: true as const,
    ARTIFACTS_ROOT,
    VIDEO_DEVICES_CERTIFIED: VIDEO_DEVICE_MANUFACTURED_SPECS.length,
    INTEGRATION_VENUE_COUNT: Object.keys(INTEGRATION_VENUE_WORLDS).length,
  } as const;
}
