// packages/venue-engine/src/venueSkinEngine.ts
// All venue skins from Venue_Skins_Plus_Seating.zip design system.

export type VenueSkinId =
  | "neon_underground"    // dark walls, neon tubes, graffiti, underground club
  | "rooftop_city"        // NYC skyline, open air, string lights, sunset
  | "stadium_arena"       // 10k seat arena, scoreboard, sponsor boards
  | "intimate_jazz"       // wood panels, warm amber, intimate lounge
  | "digital_studio"      // broadcast studio, screens everywhere, tech HUD
  | "cypher_alley"        // concrete walls, spray paint, warehouse grit
  | "vip_lounge"          // velvet, gold accents, exclusive premium
  | "outdoor_festival"    // main stage, crowd, tent canopies, daylight
  | "gaming_arena"        // esports style, LED walls, controller patterns
  | "tv_sound_stage"      // late-night show set, desk, curtains, cameras
  | "space_station"       // futuristic sci-fi, planets, zero-gravity vibe
  | "retro_80s"           // synth wave, neon grid, chrome, pastel
  | "sold_out_hall"       // sold-out marquee, velvet ropes, photo wall
  | "beach_stage"         // open air ocean, sand, sunset, palm trees
  | "vinyl_record_shop"   // cozy store, records, posters, worn wood
  | "black_box_theater"   // minimal dark stage, spotlight only
  | "church_gospel"       // gospel venue, stained glass, choir risers
  | "basement_rap"        // raw basement, exposed pipes, ciphering circle
  | "award_show"          // Grammys-style, curtains, orchestra pit, cameras
  | "school_auditorium";  // all-ages, folding chairs, gymnasium energy

export interface VenueSkin {
  id: VenueSkinId;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  lightingMode: "neon" | "warm" | "cold" | "daylight" | "spotlight" | "mixed";
  maxCapacity: number;
  seatMapType: "general_admission" | "assigned_seating" | "floor_plus_risers" | "outdoor_open";
  hasStage: boolean;
  hasSponsorBoards: boolean;
  hasCrownDisplay: boolean;
  audioProfile: string;
  motionProfile: "energetic" | "smooth" | "subtle" | "theatrical" | "raw";
  compatibleRoomTypes: string[];
  unlockTier: "FREE" | "STARTER" | "PRO" | "GOLD" | "PLATINUM" | "DIAMOND";
  isSeasonalSkin: boolean;
  seasonAvailableMonths?: number[];
}

export const VENUE_SKIN_REGISTRY: Record<VenueSkinId, VenueSkin> = {
  neon_underground: {
    id:"neon_underground", name:"Neon Underground", description:"Dark club walls, neon tubes, graffiti art",
    primaryColor:"#FF2D78", accentColor:"#00E5FF", backgroundGradient:"linear-gradient(160deg,#0D0520,#1A0835)",
    lightingMode:"neon", maxCapacity:500, seatMapType:"general_admission",
    hasStage:true, hasSponsorBoards:false, hasCrownDisplay:true, audioProfile:"cypher_beat",
    motionProfile:"energetic", compatibleRoomTypes:["LIVE_STAGE","CYPHER_ARENA","OPEN_MIC"],
    unlockTier:"FREE", isSeasonalSkin:false,
  },
  rooftop_city: {
    id:"rooftop_city", name:"Rooftop City", description:"NYC skyline, string lights, open-air rooftop",
    primaryColor:"#FFB800", accentColor:"#FF8C00", backgroundGradient:"linear-gradient(180deg,#1a1a3e,#2d1b69)",
    lightingMode:"mixed", maxCapacity:300, seatMapType:"general_admission",
    hasStage:true, hasSponsorBoards:true, hasCrownDisplay:false, audioProfile:"stage_ambient",
    motionProfile:"smooth", compatibleRoomTypes:["LIVE_STAGE","LISTEN_PARTY","AFTERPARTY"],
    unlockTier:"PRO", isSeasonalSkin:false,
  },
  stadium_arena: {
    id:"stadium_arena", name:"Stadium Arena", description:"10,000-seat arena with sponsor boards and scoreboard",
    primaryColor:"#00B8A9", accentColor:"#FFB800", backgroundGradient:"linear-gradient(180deg,#0D0520,#120024)",
    lightingMode:"cold", maxCapacity:10000, seatMapType:"assigned_seating",
    hasStage:true, hasSponsorBoards:true, hasCrownDisplay:true, audioProfile:"stadium_crowd",
    motionProfile:"theatrical", compatibleRoomTypes:["LIVE_STAGE","AUDIENCE_ROOM","OVERFLOW_SHARD"],
    unlockTier:"GOLD", isSeasonalSkin:false,
  },
  intimate_jazz: {
    id:"intimate_jazz", name:"Intimate Jazz Club", description:"Wood panels, warm amber light, small tables",
    primaryColor:"#FF8C00", accentColor:"#FFB800", backgroundGradient:"linear-gradient(160deg,#1a0c00,#2d1500)",
    lightingMode:"warm", maxCapacity:80, seatMapType:"assigned_seating",
    hasStage:true, hasSponsorBoards:false, hasCrownDisplay:false, audioProfile:"jazz_ambient",
    motionProfile:"subtle", compatibleRoomTypes:["LIVE_STAGE","LISTEN_PARTY","CREATOR_WORKSHOP"],
    unlockTier:"STARTER", isSeasonalSkin:false,
  },
  digital_studio: {
    id:"digital_studio", name:"Digital Studio", description:"Broadcast studio with screens, tech HUD overlays",
    primaryColor:"#00E5FF", accentColor:"#7B2FBE", backgroundGradient:"linear-gradient(160deg,#0D0520,#001a2e)",
    lightingMode:"cold", maxCapacity:50, seatMapType:"general_admission",
    hasStage:false, hasSponsorBoards:true, hasCrownDisplay:true, audioProfile:"studio_silence",
    motionProfile:"smooth", compatibleRoomTypes:["CREATOR_WORKSHOP","BACKSTAGE","GAME_ROOM"],
    unlockTier:"PRO", isSeasonalSkin:false,
  },
  cypher_alley: {
    id:"cypher_alley", name:"Cypher Alley", description:"Concrete walls, graffiti, warehouse grit, circle formation",
    primaryColor:"#FF2D78", accentColor:"#7B2FBE", backgroundGradient:"linear-gradient(160deg,#0a0a0a,#1a001a)",
    lightingMode:"spotlight", maxCapacity:200, seatMapType:"floor_plus_risers",
    hasStage:false, hasSponsorBoards:false, hasCrownDisplay:true, audioProfile:"cypher_beat",
    motionProfile:"raw", compatibleRoomTypes:["CYPHER_ARENA","LIVE_CIPHER","OPEN_MIC"],
    unlockTier:"FREE", isSeasonalSkin:false,
  },
  tv_sound_stage: {
    id:"tv_sound_stage", name:"TV Sound Stage", description:"Late-night show set, desk, curtains, cameras visible",
    primaryColor:"#FFB800", accentColor:"#FF2D78", backgroundGradient:"linear-gradient(160deg,#1a0520,#2d0040)",
    lightingMode:"mixed", maxCapacity:150, seatMapType:"assigned_seating",
    hasStage:true, hasSponsorBoards:true, hasCrownDisplay:false, audioProfile:"game_show",
    motionProfile:"theatrical", compatibleRoomTypes:["GAME_ROOM","LIVE_STAGE","AUDIENCE_ROOM"],
    unlockTier:"GOLD", isSeasonalSkin:false,
  },
  retro_80s: {
    id:"retro_80s", name:"Retro 80s", description:"Synth wave neon grid, chrome, pastel sunset tones",
    primaryColor:"#FF69B4", accentColor:"#00FFFF", backgroundGradient:"linear-gradient(180deg,#1a0030,#000050)",
    lightingMode:"neon", maxCapacity:400, seatMapType:"general_admission",
    hasStage:true, hasSponsorBoards:false, hasCrownDisplay:true, audioProfile:"lobby_ambient",
    motionProfile:"energetic", compatibleRoomTypes:["LIVE_STAGE","DANCE_PARTY","AFTERPARTY"],
    unlockTier:"STARTER", isSeasonalSkin:false,
  },
  award_show: {
    id:"award_show", name:"Award Show", description:"Grammy-style ceremony, curtains, orchestra pit, press cameras",
    primaryColor:"#FFB800", accentColor:"#C0A060", backgroundGradient:"linear-gradient(180deg,#0D0520,#1a0a00)",
    lightingMode:"theatrical", maxCapacity:1000, seatMapType:"assigned_seating",
    hasStage:true, hasSponsorBoards:true, hasCrownDisplay:true, audioProfile:"triumphant",
    motionProfile:"theatrical", compatibleRoomTypes:["LIVE_STAGE","WINNER_HALL","AUDIENCE_ROOM"],
    unlockTier:"PLATINUM", isSeasonalSkin:false,
  },
  sold_out_hall: {
    id:"sold_out_hall", name:"Sold Out Hall", description:"Sold-out marquee, velvet ropes, trophy photo wall",
    primaryColor:"#FFB800", accentColor:"#FF8C00", backgroundGradient:"linear-gradient(160deg,#0D0520,#1A0010)",
    lightingMode:"warm", maxCapacity:600, seatMapType:"floor_plus_risers",
    hasStage:true, hasSponsorBoards:false, hasCrownDisplay:true, audioProfile:"stage_ambient",
    motionProfile:"smooth", compatibleRoomTypes:["LIVE_STAGE","PREMIUM_FRONT_ROW","AUDIENCE_ROOM"],
    unlockTier:"DIAMOND", isSeasonalSkin:false,
  },
  vip_lounge:      { id:"vip_lounge",      name:"VIP Lounge",       description:"Velvet, gold accents, exclusive private space",                  primaryColor:"#FFB800", accentColor:"#C0A060", backgroundGradient:"linear-gradient(160deg,#0D0520,#1a0010)", lightingMode:"warm",     maxCapacity:30,   seatMapType:"assigned_seating",   hasStage:false,hasSponsorBoards:false,hasCrownDisplay:false,audioProfile:"backstage",       motionProfile:"subtle",     compatibleRoomTypes:["BACKSTAGE","PRIVATE_ROOM","SPONSOR_LOUNGE"],    unlockTier:"GOLD",     isSeasonalSkin:false },
  outdoor_festival: { id:"outdoor_festival", name:"Outdoor Festival",  description:"Main stage, crowd, tent canopies, natural daylight",           primaryColor:"#00C896", accentColor:"#FFB800", backgroundGradient:"linear-gradient(180deg,#0d2010,#1a3010)", lightingMode:"daylight",  maxCapacity:5000, seatMapType:"outdoor_open",       hasStage:true, hasSponsorBoards:true, hasCrownDisplay:false,audioProfile:"stage_ambient",   motionProfile:"energetic",  compatibleRoomTypes:["LIVE_STAGE","DANCE_PARTY","AUDIENCE_ROOM"],      unlockTier:"PRO",      isSeasonalSkin:false },
  gaming_arena:     { id:"gaming_arena",     name:"Gaming Arena",     description:"Esports-style LED walls, controller art, gaming chairs",        primaryColor:"#00E5FF", accentColor:"#FF2D78", backgroundGradient:"linear-gradient(160deg,#001020,#001a30)", lightingMode:"neon",     maxCapacity:300,  seatMapType:"general_admission",  hasStage:true, hasSponsorBoards:true, hasCrownDisplay:true, audioProfile:"game_show",       motionProfile:"energetic",  compatibleRoomTypes:["GAME_ROOM","CYPHER_ARENA"],                      unlockTier:"PRO",      isSeasonalSkin:false },
  space_station:    { id:"space_station",    name:"Space Station",    description:"Futuristic sci-fi, floating planets, zero-gravity feel",        primaryColor:"#7B2FBE", accentColor:"#00E5FF", backgroundGradient:"linear-gradient(160deg,#000010,#0d0530)", lightingMode:"cold",     maxCapacity:200,  seatMapType:"general_admission",  hasStage:true, hasSponsorBoards:false,hasCrownDisplay:true, audioProfile:"lobby_ambient",   motionProfile:"smooth",     compatibleRoomTypes:["LIVE_STAGE","LISTEN_PARTY","CREATOR_WORKSHOP"], unlockTier:"GOLD",     isSeasonalSkin:false },
  beach_stage:      { id:"beach_stage",      name:"Beach Stage",      description:"Open-air ocean view, sand, palm trees, sunset horizon",         primaryColor:"#00C896", accentColor:"#FFB800", backgroundGradient:"linear-gradient(180deg,#001520,#003040)", lightingMode:"daylight",  maxCapacity:800,  seatMapType:"outdoor_open",       hasStage:true, hasSponsorBoards:true, hasCrownDisplay:false,audioProfile:"stage_ambient",   motionProfile:"smooth",     compatibleRoomTypes:["LIVE_STAGE","DANCE_PARTY","AFTERPARTY"],         unlockTier:"STARTER",  isSeasonalSkin:false },
  vinyl_record_shop:{ id:"vinyl_record_shop", name:"Vinyl Record Shop","Cozy shop, records on walls, worn wood, intimate crowd",                    primaryColor:"#FF8C00", accentColor:"#FFB800", backgroundGradient:"linear-gradient(160deg,#1a0800,#2d1000)", lightingMode:"warm",     maxCapacity:40,   seatMapType:"general_admission",  hasStage:false,hasSponsorBoards:false,hasCrownDisplay:false,audioProfile:"editorial",       motionProfile:"subtle",     compatibleRoomTypes:["LISTEN_PARTY","CREATOR_WORKSHOP","OPEN_MIC"],   unlockTier:"FREE",     isSeasonalSkin:false },
  black_box_theater:{ id:"black_box_theater", name:"Black Box Theater","Minimal dark stage, pure spotlight, actor's theater energy",               primaryColor:"#C8A8E8", accentColor:"#FFB800", backgroundGradient:"linear-gradient(160deg,#050505,#0d0520)", lightingMode:"spotlight", maxCapacity:100,  seatMapType:"assigned_seating",   hasStage:true, hasSponsorBoards:false,hasCrownDisplay:false,audioProfile:"stage_ambient",   motionProfile:"theatrical", compatibleRoomTypes:["LIVE_STAGE","OPEN_MIC","COMEDY_STAGE"],         unlockTier:"FREE",     isSeasonalSkin:false },
  church_gospel:    { id:"church_gospel",    name:"Gospel Hall",      description:"Stained glass, choir risers, warm community energy",            primaryColor:"#FFB800", accentColor:"#FF8C00", backgroundGradient:"linear-gradient(180deg,#1a0a00,#2d1500)", lightingMode:"warm",     maxCapacity:250,  seatMapType:"assigned_seating",   hasStage:true, hasSponsorBoards:false,hasCrownDisplay:false,audioProfile:"editorial",       motionProfile:"smooth",     compatibleRoomTypes:["LIVE_STAGE","LISTEN_PARTY","OPEN_MIC"],         unlockTier:"FREE",     isSeasonalSkin:false },
  basement_rap:     { id:"basement_rap",     name:"Basement Rap",     description:"Raw basement, exposed pipes, cipher circle on concrete floor",  primaryColor:"#FF2D78", accentColor:"#7B2FBE", backgroundGradient:"linear-gradient(160deg,#050505,#0D0520)", lightingMode:"spotlight", maxCapacity:60,   seatMapType:"floor_plus_risers",  hasStage:false,hasSponsorBoards:false,hasCrownDisplay:true, audioProfile:"cypher_beat",     motionProfile:"raw",        compatibleRoomTypes:["CYPHER_ARENA","LIVE_CIPHER","OPEN_MIC"],        unlockTier:"FREE",     isSeasonalSkin:false },
  school_auditorium:{ id:"school_auditorium", name:"School Auditorium","All-ages venue, folding chairs, gymnasium energy, community feel",          primaryColor:"#00B8A9", accentColor:"#FFB800", backgroundGradient:"linear-gradient(180deg,#001020,#002040)", lightingMode:"cold",     maxCapacity:300,  seatMapType:"assigned_seating",   hasStage:true, hasSponsorBoards:false,hasCrownDisplay:false,audioProfile:"lobby_ambient",   motionProfile:"subtle",     compatibleRoomTypes:["LIVE_STAGE","OPEN_MIC","AUDIENCE_ROOM"],        unlockTier:"FREE",     isSeasonalSkin:false },
};

export function getVenueSkin(id: VenueSkinId): VenueSkin {
  return VENUE_SKIN_REGISTRY[id];
}
export function getSkinsByTier(tier: string): VenueSkin[] {
  const tierOrder = ["FREE","STARTER","PRO","GOLD","PLATINUM","DIAMOND"];
  const tierIdx = tierOrder.indexOf(tier);
  return Object.values(VENUE_SKIN_REGISTRY).filter(s => tierOrder.indexOf(s.unlockTier) <= tierIdx);
}
