// apps/web/src/engines/characters/character.registry.ts
// Central brain for ALL TMI characters.
// Every host, bot, avatar, and stage persona pulled from here.
// Blackbox: wire this into host.engine.ts and showFlow.engine.ts

export type CharacterId =
  | "danny_green"      // Deal or Feud host — Black man, glasses, navy suit, microphone
  | "eddie_larocca"    // Co-host/battle — Middle Eastern, East LA energy, brighter suit
  | "julius"           // Meerkat AR assistant — platform guide, PlayStation AR-style
  | "kira"             // Monday Night Stage host — Black woman, Australian voice
  | "bebo"             // Elimination robot — rotating costumes, crowd-pressure enforcer
  | "monthly_idol_host_1"  // Glam trio host A
  | "monthly_idol_host_2"  // Glam trio host B
  | "monthly_idol_host_3"; // Glam trio host C

export type CharacterRole =
  | "battle_host"      // hosts battle shows (Danny + Eddie alternate)
  | "stage_host"       // hosts a specific show (Kira = Monday Night)
  | "enforcer"         // boo/removal mechanic (Bebo)
  | "assistant"        // platform-wide AR guide (Julius)
  | "idol_host";       // Monthly Idol hosts

export type HostMode =
  | "intro"            // show opening
  | "battle"           // during a battle
  | "hype"             // crowd energy up
  | "comedy"           // joke/banter
  | "serious_results"  // reading results/scores
  | "sponsor_read"     // reading sponsor messages
  | "winner_reveal"    // announcing the winner
  | "recap"            // end-of-show recap
  | "solo"             // hosting alone
  | "duo";             // co-hosting together

export interface CharacterProfile {
  id: CharacterId;
  displayName: string;
  role: CharacterRole;
  voice: {
    accent: string;       // "british" | "east_la" | "australian" | "american"
    style: string;        // "witty" | "hype" | "warm" | "robotic"
    language: string;     // "en-GB" | "en-US" | "en-AU"
    speechRate: number;   // 0.8-1.2 — 1.0 = normal
  };
  appearance: {
    skinTone: string;
    hairColor: string;
    hairStyle: string;
    outfit: string;
    accentColor: string;  // neon color for TMI world
    bodyType: "full_body" | "upper_body" | "head_only";
    hasLipSync: boolean;
  };
  modes: HostMode[];
  pairingCompatibility: CharacterId[];  // who they can co-host with
  defaultSoloNights: string[];          // day names they host solo
  assetPath: string;                    // /public/characters/[id]/
  scriptProfile: string;                // path to script profile file
  motionProfile: string;                // path to motion profile file
}

export const CHARACTER_REGISTRY: Record<CharacterId, CharacterProfile> = {
  danny_green: {
    id: "danny_green",
    displayName: "Danny Green",
    role: "battle_host",
    voice: { accent:"british", style:"witty", language:"en-GB", speechRate:0.95 },
    appearance: {
      skinTone:"light",
      hairColor:"red",
      hairStyle:"short_neat",
      outfit:"navy_suit_neon_trim",
      accentColor:"#00E5FF",
      bodyType:"full_body",
      hasLipSync:true,
    },
    modes: ["intro","battle","serious_results","sponsor_read","winner_reveal","recap","solo","duo"],
    pairingCompatibility: ["eddie_larocca","julius"],
    defaultSoloNights: ["Monday","Wednesday","Friday"],
    assetPath:"/public/characters/danny_green/",
    scriptProfile:"danny_green.scriptProfile.ts",
    motionProfile:"danny_green.motionProfile.ts",
  },
  eddie_larocca: {
    id: "eddie_larocca",
    displayName: "Eddie LaRocca",
    role: "battle_host",
    voice: { accent:"east_la", style:"hype", language:"en-US", speechRate:1.05 },
    appearance: {
      skinTone:"medium_dark",
      hairColor:"black",
      hairStyle:"medium_wavy",
      outfit:"teal_purple_gradient_suit",
      accentColor:"#FF2D78",
      bodyType:"full_body",
      hasLipSync:true,
    },
    modes: ["intro","battle","hype","comedy","sponsor_read","winner_reveal","duo","solo"],
    pairingCompatibility: ["danny_green","julius"],
    defaultSoloNights: ["Tuesday","Thursday","Saturday"],
    assetPath:"/public/characters/eddie_larocca/",
    scriptProfile:"eddie_larocca.scriptProfile.ts",
    motionProfile:"eddie_larocca.motionProfile.ts",
  },
  julius: {
    id: "julius",
    displayName: "Julius",
    role: "assistant",
    voice: { accent:"american", style:"warm", language:"en-US", speechRate:1.0 },
    appearance: {
      skinTone:"meerkat_tan",
      hairColor:"none",
      hairStyle:"meerkat_ears",
      outfit:"tmi_branded_suit",
      accentColor:"#FFB800",
      bodyType:"full_body",
      hasLipSync:true,
    },
    modes: ["intro","hype","comedy","recap","solo","duo"],
    pairingCompatibility: ["danny_green","eddie_larocca","kira"],
    defaultSoloNights: [],  // Julius is platform-wide, not scheduled nights
    assetPath:"/public/characters/julius/",
    scriptProfile:"julius.scriptProfile.ts",
    motionProfile:"julius.motionProfile.ts",
  },
  kira: {
    id: "kira",
    displayName: "Kira",
    role: "stage_host",
    voice: { accent:"australian", style:"warm", language:"en-AU", speechRate:1.0 },
    appearance: {
      skinTone:"dark",
      hairColor:"black",
      hairStyle:"natural_big",
      outfit:"stage_host_fitted",
      accentColor:"#00B8A9",
      bodyType:"full_body",
      hasLipSync:true,
    },
    modes: ["intro","serious_results","hype","winner_reveal","recap","solo"],
    pairingCompatibility: ["julius","bebo"],
    defaultSoloNights: ["Monday"],  // Marcel's Monday Night Stage
    assetPath:"/public/characters/kira/",
    scriptProfile:"kira.scriptProfile.ts",
    motionProfile:"kira.motionProfile.ts",
  },
  bebo: {
    id: "bebo",
    displayName: "Bebo",
    role: "enforcer",
    voice: { accent:"robotic", style:"robotic", language:"en-US", speechRate:0.9 },
    appearance: {
      skinTone:"metallic_silver",
      hairColor:"none",
      hairStyle:"antenna",
      outfit:"rotating_costume",   // defined in beboCostume.registry.ts
      accentColor:"#FF2D78",
      bodyType:"full_body",
      hasLipSync:false,  // Bebo uses sound effects, not full lip sync
    },
    modes: ["battle","hype","comedy"],
    pairingCompatibility: ["kira"],
    defaultSoloNights: [],
    assetPath:"/public/characters/bebo/",
    scriptProfile:"bebo.scriptProfile.ts",
    motionProfile:"bebo.motionProfile.ts",
  },
  monthly_idol_host_1: {
    id:"monthly_idol_host_1", displayName:"Idol Host A", role:"idol_host",
    voice:{ accent:"american", style:"warm", language:"en-US", speechRate:1.0 },
    appearance:{ skinTone:"medium", hairColor:"varied", hairStyle:"glam", outfit:"glam_stage_outfit", accentColor:"#FFB800", bodyType:"full_body", hasLipSync:true },
    modes:["intro","hype","winner_reveal","duo"], pairingCompatibility:["monthly_idol_host_2","monthly_idol_host_3"],
    defaultSoloNights:[], assetPath:"/public/characters/idol_host_1/", scriptProfile:"", motionProfile:"",
  },
  monthly_idol_host_2: {
    id:"monthly_idol_host_2", displayName:"Idol Host B", role:"idol_host",
    voice:{ accent:"american", style:"hype", language:"en-US", speechRate:1.05 },
    appearance:{ skinTone:"dark", hairColor:"varied", hairStyle:"glam", outfit:"glam_stage_outfit_b", accentColor:"#FF2D78", bodyType:"full_body", hasLipSync:true },
    modes:["intro","hype","winner_reveal","duo"], pairingCompatibility:["monthly_idol_host_1","monthly_idol_host_3"],
    defaultSoloNights:[], assetPath:"/public/characters/idol_host_2/", scriptProfile:"", motionProfile:"",
  },
  monthly_idol_host_3: {
    id:"monthly_idol_host_3", displayName:"Idol Host C", role:"idol_host",
    voice:{ accent:"american", style:"witty", language:"en-US", speechRate:1.0 },
    appearance:{ skinTone:"light", hairColor:"varied", hairStyle:"glam", outfit:"glam_stage_outfit_c", accentColor:"#7B2FBE", bodyType:"full_body", hasLipSync:true },
    modes:["intro","hype","winner_reveal","duo"], pairingCompatibility:["monthly_idol_host_1","monthly_idol_host_2"],
    defaultSoloNights:[], assetPath:"/public/characters/idol_host_3/", scriptProfile:"", motionProfile:"",
  },
};

export function getCharacter(id: CharacterId): CharacterProfile {
  return CHARACTER_REGISTRY[id];
}

export function getAllHosts(): CharacterProfile[] {
  return Object.values(CHARACTER_REGISTRY).filter(c =>
    ["battle_host","stage_host","idol_host"].includes(c.role)
  );
}

export function getHostsForShow(showType: "battle" | "monday_night" | "monthly_idol" | "any"): CharacterProfile[] {
  const SHOW_HOSTS: Record<string, CharacterId[]> = {
    battle:       ["danny_green","eddie_larocca"],
    monday_night: ["kira"],
    monthly_idol: ["monthly_idol_host_1","monthly_idol_host_2","monthly_idol_host_3"],
    any:          ["danny_green","eddie_larocca","kira","julius"],
  };
  return SHOW_HOSTS[showType].map(id => CHARACTER_REGISTRY[id]);
}
