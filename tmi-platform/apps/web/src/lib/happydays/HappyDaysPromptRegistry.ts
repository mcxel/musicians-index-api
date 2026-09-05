/**
 * HappyDaysPromptRegistry — Canonical rotating positive non-clinical prompts.
 * Rotates daily or deterministically by date.
 */

import type { HappyDaysPrompt } from "./HappyDaysContracts";

export const HAPPY_DAYS_PROMPTS: readonly HappyDaysPrompt[] = [
  {
    id: "prompt-happy-01",
    promptText: "What makes you happy today?",
    category: "daily_reflection",
    suggestedTag: "#HappyToday",
    placeholderText: "A good cup of coffee, a call with a friend, working on a beat...",
  },
  {
    id: "prompt-music-02",
    promptText: "What song made you smile today?",
    category: "music_smile",
    suggestedTag: "#MusicSmiles",
    placeholderText: "Name the song or artist that lifted your spirits today...",
    musicFocus: true,
  },
  {
    id: "prompt-good-day-03",
    promptText: "What would make today a good day?",
    category: "future_looking",
    suggestedTag: "#GoodDayVibes",
    placeholderText: "Finishing a project, taking an evening walk, discovering new music...",
  },
  {
    id: "prompt-looking-fwd-04",
    promptText: "What are you looking forward to this week?",
    category: "future_looking",
    suggestedTag: "#LookingForward",
    placeholderText: "An upcoming show, weekend plans, rehearsing with the band...",
  },
  {
    id: "prompt-inspired-05",
    promptText: "Who inspired you recently?",
    category: "community_gratitude",
    suggestedTag: "#Inspiration",
    placeholderText: "A performer in the cypher, a friend, a mentor, or an artist...",
  },
  {
    id: "prompt-proud-06",
    promptText: "What's one thing you're proud of today?",
    category: "pride_achievement",
    suggestedTag: "#DailyPride",
    placeholderText: "Showing up, creating something new, helping someone out...",
  },
  {
    id: "prompt-mood-lift-07",
    promptText: "What song always lifts your mood no matter what?",
    category: "music_smile",
    suggestedTag: "#MoodLifter",
    placeholderText: "Your go-to anthem when you need an instant energy boost...",
    musicFocus: true,
  },
  {
    id: "prompt-small-joy-08",
    promptText: "What's one small positive moment you noticed today?",
    category: "daily_reflection",
    suggestedTag: "#SmallJoys",
    placeholderText: "Sunshine on the way to work, a kind message, a great lyric...",
  },
  {
    id: "prompt-memory-09",
    promptText: "What track brings back your favorite memory?",
    category: "music_smile",
    suggestedTag: "#SongMemories",
    placeholderText: "The song that instantly takes you back in time...",
    musicFocus: true,
  },
  {
    id: "prompt-kindness-10",
    promptText: "What's a kind gesture you witnessed or experienced recently?",
    category: "community_gratitude",
    suggestedTag: "#CommunityLove",
    placeholderText: "Someone sharing advice, cheering at a show, showing support...",
  },
  {
    id: "prompt-yopho-11",
    promptText: "What would your YoPho performance baseball card look like today?",
    category: "daily_reflection",
    suggestedTag: "#YoPhoCard",
    placeholderText:
      "Background first, then your images — album cover energy, shareable with QR…",
  },
];

/**
 * Deterministically resolves the active Happy Days prompt for a given date.
 */
export function getDailyHappyDaysPrompt(date: Date = new Date()): HappyDaysPrompt {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % HAPPY_DAYS_PROMPTS.length;
  return HAPPY_DAYS_PROMPTS[index];
}

/**
 * Look up a prompt by ID.
 */
export function getHappyDaysPromptById(id: string): HappyDaysPrompt | undefined {
  return HAPPY_DAYS_PROMPTS.find((p) => p.id === id);
}
