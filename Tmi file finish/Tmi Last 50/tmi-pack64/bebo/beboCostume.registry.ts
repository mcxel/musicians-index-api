// apps/web/src/lib/shows/monday-night/beboCostume.registry.ts
// Bebo enters in a different costume each time for maximum comedy and memorability.

export interface BeboCostume {
  id: string;
  name: string;
  description: string;
  entryAnimation: string;
  exitAnimation: string;
  soundEffect: string;
  rarity: "common" | "rare" | "legendary";
  isSeasonalOnly: boolean;
  season?: "winter" | "spring" | "summer" | "fall";
}

export const BEBO_COSTUMES: BeboCostume[] = [
  { id:"referee", name:"Referee Bebo", description:"Black and white stripes. Blows whistle on entry.", entryAnimation:"whistle_blow", exitAnimation:"flag_wave", soundEffect:"/audio/sfx/whistle.mp3", rarity:"common", isSeasonalOnly:false },
  { id:"security", name:"Security Guard Bebo", description:"Black jacket, earpiece, sunglasses. Ultra-serious.", entryAnimation:"guard_march", exitAnimation:"escort_walk", soundEffect:"/audio/sfx/radio_crackle.mp3", rarity:"common", isSeasonalOnly:false },
  { id:"tuxedo", name:"Black Tie Bebo", description:"Full tuxedo and bow tie. Very formal removal.", entryAnimation:"elegant_bow", exitAnimation:"formal_escort", soundEffect:"/audio/sfx/orchestra_hit.mp3", rarity:"rare", isSeasonalOnly:false },
  { id:"janitor", name:"Neon Janitor Bebo", description:"Neon-colored janitorial uniform with glowing mop.", entryAnimation:"mop_spin", exitAnimation:"mop_exit", soundEffect:"/audio/sfx/squeaky_mop.mp3", rarity:"common", isSeasonalOnly:false },
  { id:"ringmaster", name:"Ringmaster Bebo", description:"Top hat, red coat, wand. Grand theatrical removal.", entryAnimation:"wand_spin", exitAnimation:"curtain_bow", soundEffect:"/audio/sfx/circus_fanfare.mp3", rarity:"rare", isSeasonalOnly:false },
  { id:"disco_robot", name:"Disco Bebo", description:"Full mirror-ball robot suit. Disco music plays.", entryAnimation:"disco_spin", exitAnimation:"disco_exit", soundEffect:"/audio/sfx/disco_sting.mp3", rarity:"rare", isSeasonalOnly:false },
  { id:"knight", name:"Sir Bebo the Brave", description:"Full neon medieval armor. Very dramatic.", entryAnimation:"knight_march", exitAnimation:"jousting_exit", soundEffect:"/audio/sfx/medieval_fanfare.mp3", rarity:"legendary", isSeasonalOnly:false },
  { id:"firefighter", name:"Firefighter Bebo", description:"Full gear, siren sounds. "We've got a hot mess here!"", entryAnimation:"siren_entry", exitAnimation:"hose_exit", soundEffect:"/audio/sfx/fire_siren.mp3", rarity:"common", isSeasonalOnly:false },
  { id:"game_show_assistant", name:"Retro Game Show Bebo", description:"70s game show assistant outfit. Presents the exit door.", entryAnimation:"game_show_walk", exitAnimation:"door_reveal", soundEffect:"/audio/sfx/game_show_sting.mp3", rarity:"common", isSeasonalOnly:false },
  { id:"santa", name:"Santa Bebo", description:"Full Santa suit. "Ho ho ho — time to go!"", entryAnimation:"santa_laugh", exitAnimation:"sleigh_exit", soundEffect:"/audio/sfx/jingle_bells.mp3", rarity:"legendary", isSeasonalOnly:true, season:"winter" },
];

export function pickBeboCostume(): BeboCostume {
  // Weight by rarity: common 60%, rare 30%, legendary 10%
  const roll = Math.random();
  let pool: BeboCostume[];
  if (roll < 0.6) pool = BEBO_COSTUMES.filter(c => c.rarity === "common");
  else if (roll < 0.9) pool = BEBO_COSTUMES.filter(c => c.rarity === "rare");
  else pool = BEBO_COSTUMES.filter(c => c.rarity === "legendary");

  // Filter out seasonal if not in season
  const available = pool.filter(c => !c.isSeasonalOnly);
  return available[Math.floor(Math.random() * available.length)] ?? BEBO_COSTUMES[0];
}
