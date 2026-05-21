// packages/audio-engine/src/audio.engine.ts
// UI foley, ambient audio, music profiles, and audio routing.

export type AudioProfile =
  | "editorial" | "dashboard_hum" | "stage_ambient" | "sponsor_neutral"
  | "lobby_ambient" | "cypher_beat" | "game_show" | "concert_crowd"
  | "afterparty" | "city_ambient" | "backstage" | "space_ambient"
  | "festival" | "synth_pad" | "system_hum" | "studio_silence"
  | "archive" | "triumphant" | "stadium_spatial" | "vr_ambient"
  | "boutique" | "theater_spatial";

export interface AudioLayer {
  type: "ui" | "ambience" | "music" | "game" | "sponsor" | "spatial";
  src: string;               // path under /public/audio/
  volume: number;            // 0-1
  loop: boolean;
  crossfadeMs: number;
  triggerEvent?: string;     // plays on this event
  stopOnEvent?: string;
  spatialPosition?: { x: number; y: number; z: number }; // for VR/3D audio
}

export const AUDIO_CATALOG: Record<string, string> = {
  // UI
  click:          "/audio/ui/click.mp3",
  hover:          "/audio/ui/hover.mp3",
  pageFlip:       "/audio/ui/page-flip.mp3",
  vhsInsert:      "/audio/ui/vhs-insert.mp3",
  success:        "/audio/ui/success.mp3",
  error:          "/audio/ui/error.mp3",
  notification:   "/audio/ui/notification.mp3",
  rewardUnlock:   "/audio/ui/reward-unlock.mp3",
  badgeUnlock:    "/audio/ui/badge-unlock.mp3",
  crownReveal:    "/audio/ui/crown-reveal.mp3",
  levelUp:        "/audio/ui/level-up.mp3",
  purchase:       "/audio/ui/purchase.mp3",
  itemEquip:      "/audio/ui/item-equip.mp3",
  // Ambience
  lobbyAmbience:  "/audio/ambience/lobby.mp3",
  stageAmbience:  "/audio/ambience/stage.mp3",
  venueAmbience:  "/audio/ambience/venue-crowd.mp3",
  studioAmbience: "/audio/ambience/studio.mp3",
  afterpartyAmbience: "/audio/ambience/afterparty.mp3",
  archiveHum:     "/audio/ambience/archive.mp3",
  // Game sounds
  roundStart:     "/audio/game/round-start.mp3",
  buzzer:         "/audio/game/buzzer.mp3",
  applause:       "/audio/game/applause.mp3",
  winnerFanfare:  "/audio/game/winner-fanfare.mp3",
  elimination:    "/audio/game/elimination.mp3",
  scoreTick:      "/audio/game/score-tick.mp3",
  countdown:      "/audio/game/countdown.mp3",
  dealAccepted:   "/audio/game/deal-accepted.mp3",
  buzzIn:         "/audio/game/buzz-in.mp3",
  // Music
  lobbyLofi:      "/audio/music/lobby-lofi.mp3",
  editorialChill: "/audio/music/editorial-chill.mp3",
  sponsorNeutral: "/audio/music/sponsor-neutral.mp3",
  standbyLofi:    "/audio/music/standby-lofi.mp3",
  gameShowCue:    "/audio/music/game-show-cue.mp3",
  cypherBeat:     "/audio/music/cypher-beat.mp3",
  victoryMusic:   "/audio/music/victory.mp3",
  // Sponsor
  sponsorSting:   "/audio/sponsor/sponsor-sting.mp3",
  adBreak:        "/audio/sponsor/ad-break.mp3",
  spotlightSting: "/audio/sponsor/spotlight-sting.mp3",
  // VR spatial
  stadiumSpatial: "/audio/spatial/stadium-crowd.mp3",
  clapFromLeft:   "/audio/spatial/clap-left.mp3",
  clapFromRight:  "/audio/spatial/clap-right.mp3",
  cheersSection:  "/audio/spatial/cheers-section.mp3",
};

// ── AUDIO POLICY ──────────────────────────────────────────
export const AUDIO_POLICY = {
  autoplayAllowed: false,     // never assume autoplay allowed
  showMuteButtonIfBlocked: true,
  reducedAudioMode: false,    // user preference
  mobileReducedAudio: true,   // mobile defaults to ambient only
  tvSpatialAudio: true,       // TV enables spatial audio
  vrSpatialAudio: true,       // VR uses full spatial
  maxSimultaneousLayers: 4,   // memory budget
} as const;
