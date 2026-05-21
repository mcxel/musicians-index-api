// apps/web/src/lib/julius/julius.engine.ts
// Julius is the platform's AR-style mascot assistant (like PlayStation's Astro Bot).
// He exists everywhere: homepage, onboarding, game rooms, battles, rewards.
// He can hold any item from the item registry.

export type JuliusMode =
  | "idle"              // gentle idle bobble, waiting
  | "greeting"          // user first arrives
  | "onboarding"        // guiding new user through setup
  | "guide"             // explaining a feature
  | "hype"              // hyping the crowd / artist
  | "joke"              // delivering a one-liner
  | "announcer"         // announcing winners / results
  | "game_assist"       // helping explain game rules
  | "battle_co_host"    // co-hosting a battle with Danny or Eddie
  | "reward_announcer"  // revealing rewards/achievements
  | "shop_assistant"    // helping in the item store
  | "crowd_reset"       // calming down after big moment
  | "exit";             // Julius waves and exits scene

export interface JuliusPrompt {
  mode: JuliusMode;
  script: string;           // what Julius says
  animation: string;        // animation ID from motion profile
  heldItem?: string;        // item from item registry (mic, VIP tickets, etc.)
  duration: number;         // milliseconds to display
  nextMode?: JuliusMode;    // automatic transition
}

// Items Julius can hold — matches his asset set
export const JULIUS_ITEMS = [
  "microphone",
  "vip_tickets",
  "magic_hat",
  "balloons",
  "trophy",
  "scroll",
  "crown",
  "glow_stick",
  "pizza",
  "gaming_controller",
  "coin_stack",
  "spray_can",
] as const;

// Context-triggered prompt library
export const JULIUS_PROMPT_LIBRARY: Record<string, JuliusPrompt[]> = {
  onboarding_welcome: [
    { mode:"greeting", script:"Ay, welcome to The Musician's Index! I'm Julius — your guide through the most electric music world on the planet.", animation:"wave_big", heldItem:"microphone", duration:4000, nextMode:"onboarding" },
    { mode:"onboarding", script:"First things first — let's set up your profile so you can start earning points and climbing the charts.", animation:"point_screen", heldItem:"scroll", duration:3500, nextMode:"guide" },
  ],
  artist_went_live: [
    { mode:"hype", script:"YOOOO! Crown Holder just went LIVE! Get in there before the best seats fill up!", animation:"jump_hype", heldItem:"microphone", duration:3000, nextMode:"idle" },
  ],
  crown_awarded: [
    { mode:"announcer", script:"Ladies and gentlemen — we have a new crown holder! The votes are in and the people have spoken!", animation:"crown_reveal", heldItem:"crown", duration:4000 },
  ],
  reward_unlocked: [
    { mode:"reward_announcer", script:"Ooh what's this?! You just unlocked something NICE. Check your rewards!", animation:"present_item", heldItem:"glow_stick", duration:3000 },
  ],
  game_rules_deal_feud: [
    { mode:"game_assist", script:"Deal or Feud 1000! Here's how it works — Bobby asks the question, you buzz in FAST with the answer. Top answers win!", animation:"explain_gesture", heldItem:"scroll", duration:5000 },
  ],
  boo_meter_warning: [
    { mode:"guide", script:"Hey, the crowd's getting restless. Try switching it up — you've still got time to win them back!", animation:"urgent_gesture", heldItem:"microphone", duration:3500 },
  ],
  magazine_cta: [
    { mode:"hype", script:"You're not a musician unless you're in The Musician's Index Magazine. Sign up — your stage is waiting!", animation:"big_point", heldItem:"vip_tickets", duration:4000 },
  ],
};

export function getJuliusPromptsForEvent(eventType: string): JuliusPrompt[] {
  return JULIUS_PROMPT_LIBRARY[eventType] ?? [];
}

// Julius appears in these surfaces
export const JULIUS_SURFACES = [
  "homepage",
  "onboarding",
  "live_rooms",
  "game_rooms",
  "battle_rooms",
  "reward_reveal",
  "magazine_insert",
  "shop",
  "profile_hub",
] as const;
