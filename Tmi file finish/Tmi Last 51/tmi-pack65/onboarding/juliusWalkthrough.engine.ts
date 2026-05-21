// apps/web/src/lib/engines/juliusWalkthrough.engine.ts
// Julius animated walkthrough — AR-style guide like PlayStation.
// Runs on first login. Role-aware. Dismissible. Replayable from Help.

export type WalkthroughRole = "fan" | "performer" | "sponsor" | "advertiser" | "admin";

export interface WalkthroughStep {
  stepId: string;
  spotlightSelector?: string;  // CSS selector to highlight (null = no spotlight)
  julisPosition: "center" | "bottom_left" | "bottom_right" | "top_right";
  juliusAnimation: "idle" | "point" | "wave" | "cheer" | "explain" | "celebrate";
  dialogueLine: string;
  dialogueSubtext?: string;
  autoAdvanceMs?: number;      // auto-advance if set, else wait for tap
  ctaLabel?: string;
  ctaAction?: string;
}

export interface WalkthroughProfile {
  role: WalkthroughRole;
  steps: WalkthroughStep[];
  completionMessage: string;
  completionAnimation: string;
  rewardOnComplete: { points: number; xp: number };
}

export const JULIUS_WALKTHROUGHS: Record<WalkthroughRole, WalkthroughProfile> = {
  fan: {
    role: "fan",
    steps: [
      { stepId:"f1", julisPosition:"center",       juliusAnimation:"wave",     dialogueLine:"Welcome to The Musician's Index!", dialogueSubtext:"I'm Julius — I'll show you around!", autoAdvanceMs:3500 },
      { stepId:"f2", spotlightSelector:".reaction-hotbar", julisPosition:"bottom_left", juliusAnimation:"point", dialogueLine:"Tap these buttons to react live!", dialogueSubtext:"Heart and Clap are yours for free", ctaLabel:"Got it!" },
      { stepId:"f3", spotlightSelector:".earn-status-banner", julisPosition:"bottom_right", juliusAnimation:"explain", dialogueLine:"Stay in the room for 7 minutes to start earning points!", dialogueSubtext:"Leave and rejoin resets your timer", ctaLabel:"Understood" },
      { stepId:"f4", spotlightSelector:".vote-panel", julisPosition:"bottom_left", juliusAnimation:"cheer", dialogueLine:"Vote for who you think won the battle!", dialogueSubtext:"Your vote matters — and earns you 2-3 points", ctaLabel:"Let's go!" },
      { stepId:"f5", spotlightSelector:".xp-bar",    julisPosition:"bottom_right", juliusAnimation:"celebrate", dialogueLine:"Earn XP and unlock new emotes, dances, and season pass rewards!", autoAdvanceMs:4000 },
      { stepId:"f6", julisPosition:"center",         juliusAnimation:"celebrate", dialogueLine:"You're ready! Have fun in the crowd 🎉", autoAdvanceMs:3000 },
    ],
    completionMessage: "You're officially part of the crowd! Enjoy the show!",
    completionAnimation: "celebrate",
    rewardOnComplete: { points: 250, xp: 250 },
  },
  performer: {
    role: "performer",
    steps: [
      { stepId:"p1", julisPosition:"center",       juliusAnimation:"cheer",   dialogueLine:"This is your stage. Be original.", autoAdvanceMs:3000 },
      { stepId:"p2", spotlightSelector:".go-live-btn", julisPosition:"bottom_right", juliusAnimation:"point", dialogueLine:"Press Go Live to start your first performance!", ctaLabel:"Got it!" },
      { stepId:"p3", spotlightSelector:".launch-modal", julisPosition:"bottom_left", juliusAnimation:"explain", dialogueLine:"Choose how you want to go live — concert, battle, cypher, or rehearsal", ctaLabel:"I see!" },
      { stepId:"p4", spotlightSelector:".sound-check", julisPosition:"bottom_right", juliusAnimation:"point", dialogueLine:"Always check your audio before going live. Stay crisp!", ctaLabel:"Will do!" },
      { stepId:"p5", spotlightSelector:".pre-lobby", julisPosition:"bottom_left", juliusAnimation:"wave", dialogueLine:"You're up next! Stay ready and the stage will call you in", ctaLabel:"Ready!" },
      { stepId:"p6", julisPosition:"center",        juliusAnimation:"celebrate", dialogueLine:"Your stage is ready. Go show them what you've got! 🎤", autoAdvanceMs:3500 },
    ],
    completionMessage: "Welcome to the stage! Your fans are waiting.",
    completionAnimation: "cheer",
    rewardOnComplete: { points: 250, xp: 250 },
  },
  sponsor: {
    role: "sponsor",
    steps: [
      { stepId:"s1", julisPosition:"center",      juliusAnimation:"wave",    dialogueLine:"Welcome to The Musician's Index Sponsor Hub!", autoAdvanceMs:3000 },
      { stepId:"s2", spotlightSelector:".artist-select", julisPosition:"bottom_right", juliusAnimation:"point", dialogueLine:"Browse artists and sponsor them directly!", ctaLabel:"Got it!" },
      { stepId:"s3", julisPosition:"center",      juliusAnimation:"celebrate", dialogueLine:"As they grow, your brand grows with them. Let's get started!", autoAdvanceMs:3000 },
    ],
    completionMessage: "Your sponsorship journey starts now!",
    completionAnimation: "wave",
    rewardOnComplete: { points: 0, xp: 0 },
  },
  advertiser: {
    role: "advertiser",
    steps: [
      { stepId:"a1", julisPosition:"center",      juliusAnimation:"wave",    dialogueLine:"Welcome! Let's get your campaigns reaching fans fast", autoAdvanceMs:3000 },
      { stepId:"a2", spotlightSelector:".campaign-builder", julisPosition:"bottom_right", juliusAnimation:"point", dialogueLine:"Build campaigns here and pick your ad placements", ctaLabel:"Let's go!" },
      { stepId:"a3", julisPosition:"center",      juliusAnimation:"celebrate", dialogueLine:"Your ads will appear across battles, concerts, and live rooms!", autoAdvanceMs:3000 },
    ],
    completionMessage: "You're ready to reach millions of music fans!",
    completionAnimation: "cheer",
    rewardOnComplete: { points: 0, xp: 0 },
  },
  admin: {
    role: "admin",
    steps: [
      { stepId:"ad1", julisPosition:"center",     juliusAnimation:"explain", dialogueLine:"Admin access confirmed. You control everything from here.", autoAdvanceMs:3000 },
      { stepId:"ad2", julisPosition:"center",     juliusAnimation:"point",   dialogueLine:"Monitor rooms, bots, rewards, sponsors, and system health", ctaLabel:"Understood" },
    ],
    completionMessage: "Full system access granted. Handle with care.",
    completionAnimation: "idle",
    rewardOnComplete: { points: 0, xp: 0 },
  },
};

export function getWalkthrough(role: WalkthroughRole): WalkthroughProfile {
  return JULIUS_WALKTHROUGHS[role];
}
