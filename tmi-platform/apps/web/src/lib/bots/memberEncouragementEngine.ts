/**
 * memberEncouragementEngine.ts
 *
 * Milestone detection and encouragement message generation for TMI members.
 * Used by hype-bots and host-bots during live events.
 */

import { botEncourageUser, botReportToAdmin } from "./permanentBotOperationsEngine";

export type MilestoneTrigger =
  | "first-login"
  | "first-vote"
  | "first-article"
  | "first-cypher"
  | "first-concert"
  | "rank-top10"
  | "rank-top3"
  | "rank-1"
  | "vote-streak-7"
  | "vote-streak-30"
  | "article-published"
  | "season-pass-purchased"
  | "cypher-win"
  | "concert-host"
  | "100-fans"
  | "1000-fans"
  | "profile-complete";

export type EncouragementLevel = "low" | "medium" | "high" | "legendary";

export type MilestoneAlert = {
  userId: string;
  userName: string;
  milestone: MilestoneTrigger;
  level: EncouragementLevel;
  message: string;
  timestamp: number;
  broadcastToRoom?: string;
  deliveredByBot?: string;
};

const MILESTONE_LEVEL: Record<MilestoneTrigger, EncouragementLevel> = {
  "first-login": "low",
  "first-vote": "low",
  "first-article": "low",
  "first-cypher": "medium",
  "first-concert": "medium",
  "rank-top10": "medium",
  "rank-top3": "high",
  "rank-1": "legendary",
  "vote-streak-7": "medium",
  "vote-streak-30": "high",
  "article-published": "medium",
  "season-pass-purchased": "medium",
  "cypher-win": "high",
  "concert-host": "high",
  "100-fans": "high",
  "1000-fans": "legendary",
  "profile-complete": "low",
};

const MILESTONE_MESSAGES: Record<MilestoneTrigger, string[]> = {
  "first-login": [
    "Welcome to TMI! 🎵 The stage is yours!",
    "You just stepped into the world's biggest music platform. Make your mark! 🚀",
  ],
  "first-vote": [
    "First vote cast! 🗳️ You're shaping the Top 10!",
    "Your voice matters here! First vote logged! 🎤",
  ],
  "first-article": [
    "First article read! 📰 You're plugged into the TMI magazine!",
    "The TMI Magazine has you hooked! 🎶",
  ],
  "first-cypher": [
    "First cypher session! 🎤 You just entered the arena!",
    "Welcome to the cypher ring! Let your bars speak! 🔥",
  ],
  "first-concert": [
    "First concert attended! 🎸 Live music hits different!",
    "You've experienced live TMI! Welcome to the show life! 🎟️",
  ],
  "rank-top10": [
    "TOP 10 ACHIEVED! 🏆 The platform is watching!",
    "You made the Top 10! The crowd goes wild! 🔥",
  ],
  "rank-top3": [
    "TOP 3! 🥉🥈🥇 Elite status unlocked!",
    "PODIUM ALERT! You're in the top 3 on TMI! 👑",
  ],
  "rank-1": [
    "👑 #1 ARTIST ON TMI! The crown is yours! ALL HAIL!",
    "LEGENDARY! YOU ARE THE #1 ARTIST! 🏆✨ THE PLATFORM BOWS!",
  ],
  "vote-streak-7": [
    "7-day vote streak! 🔥 You're a dedicated fan!",
    "One week of voting! Your loyalty is showing! 💯",
  ],
  "vote-streak-30": [
    "30-DAY VOTE STREAK! 🏅 You are a true TMI champion fan!",
    "One month of daily votes! Legendary fan status! 🌟",
  ],
  "article-published": [
    "Article published! ✍️ Your voice is in the magazine!",
    "You're now a TMI contributor! The article is live! 📰",
  ],
  "season-pass-purchased": [
    "Season Pass activated! 🎟️ Full access unlocked!",
    "You're official! Season Pass holder — all-access to TMI! 🎶",
  ],
  "cypher-win": [
    "CYPHER WIN! 🏆 You dominated the arena! The judges agreed!",
    "WINNER! You just won the cypher round! 🎤🔥",
  ],
  "concert-host": [
    "First concert hosted! 🎸 You're a promoter now!",
    "Show promoter unlocked! TMI crowd approved your concert! 🎟️",
  ],
  "100-fans": [
    "100 fans! 🎉 Your fanbase is growing!",
    "Triple digits! 100 people are following YOUR journey! 🚀",
  ],
  "1000-fans": [
    "1000 FANS! 🌟 You're a movement now!",
    "Four digits! 1000 fans and climbing! THE MACHINE IS REAL! 👑",
  ],
  "profile-complete": [
    "Profile complete! ⭐ You're fully visible on TMI!",
    "100% profile! The algorithm now sees your full potential! 🎯",
  ],
};

const milestoneAlertLog: MilestoneAlert[] = [];

/**
 * Fire a milestone encouragement for a user.
 * Bot delivers message to the user and optionally broadcasts to room.
 */
export function fireMilestoneAlert(
  userId: string,
  userName: string,
  milestone: MilestoneTrigger,
  botId: string,
  broadcastToRoom?: string
): MilestoneAlert {
  const level = MILESTONE_LEVEL[milestone];
  const messages = MILESTONE_MESSAGES[milestone];
  const message = messages[Math.floor(Math.random() * messages.length)];

  const alert: MilestoneAlert = {
    userId,
    userName,
    milestone,
    level,
    message,
    timestamp: Date.now(),
    broadcastToRoom,
    deliveredByBot: botId,
  };

  milestoneAlertLog.push(alert);

  // Deliver via bot encouragement engine
  botEncourageUser(botId, userId, userName, `[MILESTONE: ${milestone}] ${message}`);

  // For legendary/high milestones, broadcast to room
  if (broadcastToRoom && (level === "legendary" || level === "high")) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:milestone-broadcast", {
          detail: { ...alert, room: broadcastToRoom },
        })
      );
    }
  }

  return alert;
}

/**
 * Generate a random encouragement message without milestone context.
 */
export function getRandomEncouragement(userName: string): string {
  const templates = [
    `Keep pushing ${userName}! 🔥 The stage is yours tonight!`,
    `${userName} is building something real! 🎵 Stay focused!`,
    `Don't stop now, ${userName}! The charts are watching! 📈`,
    `${userName} — every performance counts! Keep grinding! 💪`,
    `Believe in your sound, ${userName}! 🎤 TMI sees you!`,
    `The crowd loves you, ${userName}! 🎸 Play on!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function getMilestoneAlertLog(): MilestoneAlert[] {
  return [...milestoneAlertLog];
}

export function getMilestoneLevel(milestone: MilestoneTrigger): EncouragementLevel {
  return MILESTONE_LEVEL[milestone];
}
