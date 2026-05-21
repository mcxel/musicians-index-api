// packages/vr-engine/src/SceneManager.ts
// Loads and manages all 15 VR scenes using Three.js.
// Each scene is a complete 3D environment with geometry, lighting, audio.

export type VRSceneId =
  | "vr-lobby"        // Main VR entry point — TMI branded lobby
  | "vr-concert"      // Full concert stage with crowd
  | "vr-cypher"       // Underground cypher arena
  | "vr-comedy"       // Comedy club stage
  | "vr-karaoke"      // Karaoke room with screen
  | "vr-dance"        // Dance party room
  | "vr-gameshow"     // Game show arena (Dirty Dozens, Deal or Feud)
  | "vr-winnerhall"   // Winner's Hall / Hall of Fame
  | "vr-sponsor"      // Sponsor World / ad showcase
  | "vr-city"         // Open city world with venue map
  | "vr-venue"        // Customizable venue template
  | "vr-artistroom"   // Artist's personal room
  | "vr-store"        // Item shop as 3D boutique
  | "vr-theater"      // Movie theater for replays
  | "vr-stadium";     // Stadium mode — 10,000+ avatar crowd

export interface VRScene {
  id: VRSceneId;
  label: string;
  description: string;
  capacity: number;        // max avatars
  isStadium: boolean;
  hasStage: boolean;
  hasDJBooth: boolean;
  hasAudienceSeating: boolean;
  hasVIPSection: boolean;
  hasMerchBooth: boolean;
  hasSponsorBoards: boolean;
  hasBackstage: boolean;
  spatialAudio: boolean;
  interactiveObjects: string[];  // what users can click/interact with
  linkedRoomType: string;        // maps to RoomType enum in API
  scene2dEquivalent?: string;    // 2D scene ID for non-VR
  loadPriority: "eager" | "lazy";
}

export const VR_SCENE_REGISTRY: Record<VRSceneId, VRScene> = {
  "vr-lobby": {
    id: "vr-lobby", label: "The Index Lobby", description: "Central VR hub. Portal to all worlds.",
    capacity: 200, isStadium: false, hasStage: false, hasDJBooth: true, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: true, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["world_portals", "leaderboard_screens", "ad_billboards"],
    linkedRoomType: "MAIN_LOBBY", scene2dEquivalent: "lobby", loadPriority: "eager",
  },
  "vr-concert": {
    id: "vr-concert", label: "Concert Stage", description: "Full concert experience — stage, lights, crowd.",
    capacity: 500, isStadium: false, hasStage: true, hasDJBooth: true, hasAudienceSeating: true,
    hasVIPSection: true, hasMerchBooth: true, hasSponsorBoards: true, hasBackstage: true,
    spatialAudio: true, interactiveObjects: ["stage_cameras", "merch_booth", "tip_jar", "vip_entry"],
    linkedRoomType: "LIVE_STAGE", scene2dEquivalent: "live-stage", loadPriority: "eager",
  },
  "vr-cypher": {
    id: "vr-cypher", label: "Cypher Arena", description: "Underground cypher circle — raw battle energy.",
    capacity: 100, isStadium: false, hasStage: false, hasDJBooth: true, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["center_circle", "vote_button", "hype_meter"],
    linkedRoomType: "CYPHER_ARENA", scene2dEquivalent: "underground-cypher", loadPriority: "lazy",
  },
  "vr-comedy": {
    id: "vr-comedy", label: "Comedy Club", description: "Stand-up room with intimate stage.",
    capacity: 80, isStadium: false, hasStage: true, hasDJBooth: false, hasAudienceSeating: true,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: true,
    spatialAudio: true, interactiveObjects: ["seat", "spotlight", "tip_jar"],
    linkedRoomType: "LIVE_STAGE", scene2dEquivalent: "live-stage", loadPriority: "lazy",
  },
  "vr-karaoke": {
    id: "vr-karaoke", label: "Karaoke Room", description: "Karaoke with lyrics screen and rotating singers.",
    capacity: 30, isStadium: false, hasStage: true, hasDJBooth: false, hasAudienceSeating: true,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["lyrics_screen", "mic_stand", "song_queue"],
    linkedRoomType: "LISTENING_PARTY", scene2dEquivalent: "lobby", loadPriority: "lazy",
  },
  "vr-dance": {
    id: "vr-dance", label: "Dance Party", description: "Open dancefloor with DJ booth and lights.",
    capacity: 200, isStadium: false, hasStage: false, hasDJBooth: true, hasAudienceSeating: false,
    hasVIPSection: true, hasMerchBooth: false, hasSponsorBoards: true, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["dj_booth", "dance_floor", "vip_area", "bar"],
    linkedRoomType: "AFTERPARTY", scene2dEquivalent: "neon-club", loadPriority: "lazy",
  },
  "vr-gameshow": {
    id: "vr-gameshow", label: "Game Show Arena", description: "Dirty Dozens / Deal or Feud in VR.",
    capacity: 150, isStadium: false, hasStage: true, hasDJBooth: false, hasAudienceSeating: true,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: true, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["buzz_podiums", "scoreboard", "audience_vote_panel", "host_desk"],
    linkedRoomType: "GAME_ROOM", scene2dEquivalent: "game-night", loadPriority: "eager",
  },
  "vr-winnerhall": {
    id: "vr-winnerhall", label: "Winner's Hall", description: "Hall of Fame — past crown winners immortalized.",
    capacity: 50, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: false, interactiveObjects: ["winner_pedestals", "trophy_cases", "hologram_replays"],
    linkedRoomType: "MAIN_LOBBY", scene2dEquivalent: "hall-of-fame", loadPriority: "lazy",
  },
  "vr-sponsor": {
    id: "vr-sponsor", label: "Sponsor World", description: "Sponsor showcase — interactive ad billboards.",
    capacity: 50, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: true, hasBackstage: false,
    spatialAudio: false, interactiveObjects: ["sponsor_booths", "interactive_ads", "deal_desk"],
    linkedRoomType: "SPONSOR_LOUNGE", scene2dEquivalent: "sponsor-showcase", loadPriority: "lazy",
  },
  "vr-city": {
    id: "vr-city", label: "City World", description: "Open city — explore venues on an interactive map.",
    capacity: 100, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: true, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["venue_buildings", "event_posters", "city_portals"],
    linkedRoomType: "MAIN_LOBBY", loadPriority: "lazy",
  },
  "vr-venue": {
    id: "vr-venue", label: "Virtual Venue", description: "Customizable venue — any type of show.",
    capacity: 300, isStadium: false, hasStage: true, hasDJBooth: true, hasAudienceSeating: true,
    hasVIPSection: true, hasMerchBooth: true, hasSponsorBoards: true, hasBackstage: true,
    spatialAudio: true, interactiveObjects: ["stage_controls", "lighting_board", "seat_sections", "merch_counter"],
    linkedRoomType: "VENUE_LOBBY", loadPriority: "lazy",
  },
  "vr-artistroom": {
    id: "vr-artistroom", label: "Artist Room", description: "Artist's personal VR room — their space.",
    capacity: 20, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: true, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["music_player", "gallery_walls", "merch_display", "tip_jar"],
    linkedRoomType: "MEET_AND_GREET", scene2dEquivalent: "backstage", loadPriority: "lazy",
  },
  "vr-store": {
    id: "vr-store", label: "Item Store", description: "3D cosmetic boutique — browse and equip items in VR.",
    capacity: 30, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: false,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: false, interactiveObjects: ["item_displays", "fitting_mirror", "purchase_terminal", "rarity_vault"],
    linkedRoomType: "MAIN_LOBBY", scene2dEquivalent: "vr-store", loadPriority: "lazy",
  },
  "vr-theater": {
    id: "vr-theater", label: "Replay Theater", description: "Watch replays and past shows on a huge screen.",
    capacity: 60, isStadium: false, hasStage: false, hasDJBooth: false, hasAudienceSeating: true,
    hasVIPSection: false, hasMerchBooth: false, hasSponsorBoards: false, hasBackstage: false,
    spatialAudio: true, interactiveObjects: ["giant_screen", "seat_selection", "playback_controls"],
    linkedRoomType: "REPLAY_ROOM", scene2dEquivalent: "archive", loadPriority: "lazy",
  },
  "vr-stadium": {
    id: "vr-stadium",
    label: "Stadium — THE BIG SHOW",
    description: "10,000+ avatar crowd. Live concerts. Fireworks. Sponsor banners. The biggest experience on the platform.",
    capacity: 10000,
    isStadium: true,
    hasStage: true,
    hasDJBooth: true,
    hasAudienceSeating: true,
    hasVIPSection: true,
    hasMerchBooth: true,
    hasSponsorBoards: true,
    hasBackstage: true,
    spatialAudio: true,
    interactiveObjects: [
      "main_stage",        // performer livestream
      "big_screens",       // side screens showing live feed
      "crowd_sections",    // GA | Reserved | VIP | Sponsor Box
      "vip_boxes",         // private elevated boxes
      "backstage_tunnel",  // leads to backstage room
      "merch_concourse",   // merch booths around stadium
      "sponsor_billboards",// rotating sponsor ads
      "fireworks_rig",     // triggered on win events
      "crowd_wave",        // interactive crowd animation
      "tip_jar",           // tip artist from stadium
      "camera_switches",   // host switches POV cameras
    ],
    linkedRoomType: "LIVE_STAGE",
    scene2dEquivalent: "concert-arena",
    loadPriority: "eager",
  },
};
