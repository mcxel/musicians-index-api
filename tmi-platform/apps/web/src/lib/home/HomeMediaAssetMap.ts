export type HomeMediaKey =
  | "home2.story.coverCrown"
  | "home2.story.neoSoulRooms"
  | "home2.story.venueHeat"
  | "home2.interview.backstagePulse"
  | "home2.interview.producerRoundtable"
  | "home2.venue.tmiArena"
  | "home2.venue.crownRoom"
  | "home2.venue.studio7"
  | "home3.stage.tmiArenaWide"
  | "home3.stage.crownRoomLive"
  | "home3.stage.studio7Live"
  | "home3.backstage.micRig"
  | "home3.backstage.drumKit"
  | "home3.backstage.djDeck"
  | "home4.sponsor.soundwaveHeadphones"
  | "home4.sponsor.beatvaultController"
  | "home4.sponsor.neonSpeakerWall"
  | "home4.showroom.reflectiveDesk"
  | "home5.cypher.battleCircle"
  | "home5.cypher.crowdStage"
  | "home5.cypher.djBooth"
  | "home5.cypher.vocalMic";

export type HomeMediaAsset = {
  src: string;
  alt: string;
  fallbackSrc: string;
};

const MEDIA_MAP: Record<HomeMediaKey, HomeMediaAsset> = {
  "home2.story.coverCrown": {
    src: "/tmi-curated/mag-74.jpg",
    fallbackSrc: "/tmi-curated/mag-66.jpg",
    alt: "Live performer under stage neon with audience glow",
  },
  "home2.story.neoSoulRooms": {
    src: "/tmi-curated/mag-66.jpg",
    fallbackSrc: "/tmi-curated/mag-58.jpg",
    alt: "Neo soul live room with intimate venue lighting",
  },
  "home2.story.venueHeat": {
    src: "/tmi-curated/venue-18.jpg",
    fallbackSrc: "/tmi-curated/venue-22.jpg",
    alt: "Mid-size venue interior with crowd and stage lights",
  },
  "home2.interview.backstagePulse": {
    src: "/tmi-curated/mag-58.jpg",
    fallbackSrc: "/tmi-curated/mag-74.jpg",
    alt: "Backstage interview portrait with production lights",
  },
  "home2.interview.producerRoundtable": {
    src: "/tmi-curated/gameshow-35.jpg",
    fallbackSrc: "/tmi-curated/mag-66.jpg",
    alt: "Music producer roundtable with studio gear",
  },
  "home2.venue.tmiArena": {
    src: "/tmi-curated/venue-22.jpg",
    fallbackSrc: "/tmi-curated/venue-18.jpg",
    alt: "TMI Arena event floor and illuminated stage",
  },
  "home2.venue.crownRoom": {
    src: "/tmi-curated/venue-14.jpg",
    fallbackSrc: "/tmi-curated/venue-10.jpg",
    alt: "Crown Room interior with warm house lighting",
  },
  "home2.venue.studio7": {
    src: "/tmi-curated/venue-10.jpg",
    fallbackSrc: "/tmi-curated/venue-14.jpg",
    alt: "Studio 7 small-capacity performance venue",
  },
  "home3.stage.tmiArenaWide": {
    src: "/tmi-curated/venue-22.jpg",
    fallbackSrc: "/tmi-curated/venue-18.jpg",
    alt: "Wide concert stage shot with moving beams",
  },
  "home3.stage.crownRoomLive": {
    src: "/tmi-curated/venue-14.jpg",
    fallbackSrc: "/tmi-curated/venue-10.jpg",
    alt: "Live crowd inside Crown Room stage environment",
  },
  "home3.stage.studio7Live": {
    src: "/tmi-curated/venue-10.jpg",
    fallbackSrc: "/tmi-curated/venue-14.jpg",
    alt: "Studio 7 performer set with spotlight haze",
  },
  "home3.backstage.micRig": {
    src: "/tmi-curated/mag-58.jpg",
    fallbackSrc: "/tmi-curated/mag-74.jpg",
    alt: "Backstage vocal microphone and stand setup",
  },
  "home3.backstage.drumKit": {
    src: "/tmi-curated/gameshow-35.jpg",
    fallbackSrc: "/tmi-curated/mag-66.jpg",
    alt: "Live drum kit under concert lights",
  },
  "home3.backstage.djDeck": {
    src: "/tmi-curated/mag-66.jpg",
    fallbackSrc: "/tmi-curated/mag-58.jpg",
    alt: "DJ deck and controller at side stage",
  },
  "home4.sponsor.soundwaveHeadphones": {
    src: "/tmi-curated/mag-74.jpg",
    fallbackSrc: "/tmi-curated/mag-58.jpg",
    alt: "Premium sponsor headphones product hero shot",
  },
  "home4.sponsor.beatvaultController": {
    src: "/tmi-curated/gameshow-35.jpg",
    fallbackSrc: "/tmi-curated/mag-66.jpg",
    alt: "Beat production controller photographed in studio",
  },
  "home4.sponsor.neonSpeakerWall": {
    src: "/tmi-curated/venue-22.jpg",
    fallbackSrc: "/tmi-curated/venue-18.jpg",
    alt: "Sponsor speaker wall inside neon-lit showroom",
  },
  "home4.showroom.reflectiveDesk": {
    src: "/tmi-curated/venue-14.jpg",
    fallbackSrc: "/tmi-curated/venue-10.jpg",
    alt: "Reflective sponsor showroom desk with product lighting",
  },
  "home5.cypher.battleCircle": {
    src: "/tmi-curated/venue-18.jpg",
    fallbackSrc: "/tmi-curated/venue-22.jpg",
    alt: "Cypher battle circle with focused overhead lights",
  },
  "home5.cypher.crowdStage": {
    src: "/tmi-curated/venue-22.jpg",
    fallbackSrc: "/tmi-curated/venue-14.jpg",
    alt: "Crowd-facing battle stage with magenta and cyan beams",
  },
  "home5.cypher.djBooth": {
    src: "/tmi-curated/gameshow-35.jpg",
    fallbackSrc: "/tmi-curated/mag-66.jpg",
    alt: "DJ booth and decks driving cypher battle energy",
  },
  "home5.cypher.vocalMic": {
    src: "/tmi-curated/mag-58.jpg",
    fallbackSrc: "/tmi-curated/mag-74.jpg",
    alt: "Close-up vocal microphone for cypher performance",
  },
};

export function getHomeMediaAsset(key: HomeMediaKey): HomeMediaAsset {
  return MEDIA_MAP[key];
}

export function resolveHomeMediaSrc(key: HomeMediaKey, preferFallback = false): string {
  const media = MEDIA_MAP[key];
  return preferFallback ? media.fallbackSrc : media.src;
}
