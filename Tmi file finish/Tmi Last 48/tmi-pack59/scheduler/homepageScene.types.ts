// apps/web/src/engines/homepage/homepageScene.types.ts
// All scene types that can appear on Homepage 1

export type SceneId =
  | "genre_cluster"        // 2-3 genre spotlights with top artists
  | "crown_top10"          // Crown holder + positions 2-10
  | "magazine_insert"      // Current issue pages, articles, spreads
  | "show_game_interrupt"  // Game Night, Deal or Feud, Name That Tune, etc.
  | "bridge_transition"    // Scene-to-scene transition wipe
  | "live_event_urgent"    // Pre-empts all — a show is LIVE right now
  | "cypher_arena"         // Active cypher battle callout
  | "winner_reveal"        // Weekly winner announcement
  | "sponsor_cta"          // Sponsor spotlight CTA
  | "fan_join_cta"         // Fan onboarding push
  | "artist_join_cta";     // Artist onboarding push

export interface SceneConfig {
  id: SceneId;
  label: string;
  durationRange: [number, number];  // [minMs, maxMs] — scheduler picks within
  priority: number;                  // Higher = interrupts lower priority scenes
  canInterrupt: SceneId[];           // Which scenes this can cut into
  requiresLiveData: boolean;         // false = can run with fallback data
  ctaMessages?: string[];            // Optional CTA copy injected at end
  audioProfile?: string;
}

// ── MASTER SCENE REGISTRY ─────────────────────────────────────────
export const SCENE_REGISTRY: Record<SceneId, SceneConfig> = {
  "live_event_urgent": {
    id:"live_event_urgent", label:"LIVE NOW", durationRange:[60000,120000],
    priority:100, canInterrupt:["genre_cluster","crown_top10","magazine_insert","show_game_interrupt","bridge_transition","sponsor_cta","fan_join_cta","artist_join_cta"],
    requiresLiveData:true, ctaMessages:["JOIN NOW — LIVE!","This is happening RIGHT NOW"], audioProfile:"stage_ambient",
  },
  "genre_cluster": {
    id:"genre_cluster", label:"Genre Spotlight", durationRange:[70000,95000],
    priority:30, canInterrupt:[], requiresLiveData:false,
    ctaMessages:["Discover your genre","Who's #1 in your scene?"], audioProfile:"genre_ambient",
  },
  "crown_top10": {
    id:"crown_top10", label:"Crown & Top 10", durationRange:[55000,80000],
    priority:40, canInterrupt:["genre_cluster"],
    requiresLiveData:false, ctaMessages:["Vote for your artist","Crown updating live..."], audioProfile:"cypher_beat",
  },
  "magazine_insert": {
    id:"magazine_insert", label:"The Magazine", durationRange:[120000,180000],  // 2-3 minutes
    priority:25, canInterrupt:[], requiresLiveData:false,
    ctaMessages:["You're not a musician unless you're in The Musician's Index","Join our magazine now","Log in · Sign up · Be discovered","This is the magazine you should be in"],
    audioProfile:"editorial",
  },
  "show_game_interrupt": {
    id:"show_game_interrupt", label:"Show/Game Feature", durationRange:[35000,60000],
    priority:35, canInterrupt:["genre_cluster"],
    requiresLiveData:false, ctaMessages:["Join the game","Enter this week's contest","Watch the show live"], audioProfile:"game_show",
  },
  "bridge_transition": {
    id:"bridge_transition", label:"Scene Transition", durationRange:[20000,30000],
    priority:10, canInterrupt:[], requiresLiveData:false,
    audioProfile:"transition_whoosh",
  },
  "cypher_arena": {
    id:"cypher_arena", label:"Cypher Arena Active", durationRange:[40000,65000],
    priority:60, canInterrupt:["genre_cluster","magazine_insert","show_game_interrupt"],
    requiresLiveData:true, ctaMessages:["Cypher battle ACTIVE","Vote for the winner","Enter the arena"],
    audioProfile:"cypher_beat",
  },
  "winner_reveal": {
    id:"winner_reveal", label:"Winner Reveal", durationRange:[45000,70000],
    priority:80, canInterrupt:["genre_cluster","magazine_insert","show_game_interrupt","bridge_transition"],
    requiresLiveData:true, ctaMessages:["Congratulations to this week's champion","See the full results"],
    audioProfile:"triumphant",
  },
  "sponsor_cta": {
    id:"sponsor_cta", label:"Sponsor Spotlight", durationRange:[25000,40000],
    priority:20, canInterrupt:[], requiresLiveData:false,
    ctaMessages:["Feature your brand here","Reach 10k+ music fans"], audioProfile:"sponsor_neutral",
  },
  "fan_join_cta": {
    id:"fan_join_cta", label:"Fan Join CTA", durationRange:[20000,35000],
    priority:15, canInterrupt:[], requiresLiveData:false,
    ctaMessages:["Join the community","Sign up free · No credit card needed","Discover your next favorite artist"],
    audioProfile:"lobby_ambient",
  },
  "artist_join_cta": {
    id:"artist_join_cta", label:"Artist Join CTA", durationRange:[20000,35000],
    priority:15, canInterrupt:[], requiresLiveData:false,
    ctaMessages:["This is your stage, be original","Submit your music","Build your fanbase on TMI"],
    audioProfile:"lobby_ambient",
  },
};
