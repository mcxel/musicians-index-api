/**
 * HappyDaysPromptRegistry — Canonical rotating positive non-clinical prompts.
 * Rotates daily or deterministically by date.
 */

import type { HappyDaysPrompt } from "./HappyDaysContracts";

export const SOCIAL_PROMPT_REGISTRY_VERSION = "social-moment-2026-10-03";

/**
 * Shared publication day for this presentation pass.
 * Provisional until a magazine publication timezone is authorized.
 */
export const PUBLICATION_TIME_AUTHORITY = "PROVISIONAL_UTC_PRESENTATION_POLICY" as const;

const HAPPY_DAYS_PROMPT_SOURCE: readonly Omit<HappyDaysPrompt, "channel" | "text">[] = [
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

const COMMUNITY_GOSSIP_PROMPT_SOURCE: readonly Omit<HappyDaysPrompt, "channel" | "text">[] = [
  {
    id: "gossip-scene-01",
    promptText: "What's everybody talking about in your music scene?",
    category: "scene_chatter",
    suggestedTag: "#SceneTalk",
    placeholderText: "The conversation moving through your city, crew, or scene...",
  },
  {
    id: "gossip-heard-02",
    promptText: "What did you hear that the community needs to know about?",
    category: "scene_chatter",
    suggestedTag: "#CommunityKnows",
    placeholderText: "A show, a release, a room, or a move people should hear...",
  },
  {
    id: "gossip-city-03",
    promptText: "What's buzzing in your city today?",
    category: "scene_chatter",
    suggestedTag: "#CityBuzz",
    placeholderText: "The local story artists and fans are passing around...",
  },
  {
    id: "gossip-rumor-04",
    promptText: "What's the biggest rumor in your city right now?",
    category: "scene_chatter",
    suggestedTag: "#CityRumor",
    placeholderText: "What people are saying — the magazine still reviews it before print...",
  },
  {
    id: "gossip-unreleased-05",
    promptText: "Who dropped the hottest unreleased track this week?",
    category: "scene_chatter",
    suggestedTag: "#Unreleased",
    placeholderText: "The record people are playing before it is official...",
  },
  {
    id: "gossip-insider-06",
    promptText: "Tell us something you know that don't nobody else know.",
    category: "scene_chatter",
    suggestedTag: "#InsideWord",
    placeholderText: "A scene detail you can stand behind...",
  },
  {
    id: "gossip-room-07",
    promptText: "Which room had the moment everybody is still talking about?",
    category: "scene_chatter",
    suggestedTag: "#RoomMoment",
    placeholderText: "The battle, cypher, concert, or lobby that stuck...",
  },
  {
    id: "gossip-collab-08",
    promptText: "Who is quietly working on a collaboration that might shake the scene?",
    category: "scene_chatter",
    suggestedTag: "#QuietCollab",
    placeholderText: "Names, cities, or the sound people expect...",
  },
  {
    id: "gossip-venue-09",
    promptText: "What venue or promoter move has artists comparing notes?",
    category: "scene_chatter",
    suggestedTag: "#VenueNotes",
    placeholderText: "A booking, a night, or a room change making the rounds...",
  },
  {
    id: "gossip-release-10",
    promptText: "What release is about to catch the culture off guard?",
    category: "scene_chatter",
    suggestedTag: "#ComingRelease",
    placeholderText: "The project people think is about to land...",
  },
  {
    id: "gossip-cipher-11",
    promptText: "Who took the cypher this week and made the whole circle look?",
    category: "scene_chatter",
    suggestedTag: "#CypherTalk",
    placeholderText: "The performer the circle is still quoting...",
  },
  {
    id: "gossip-weekend-12",
    promptText: "What story from the weekend is already spreading through the group chats?",
    category: "scene_chatter",
    suggestedTag: "#WeekendStory",
    placeholderText: "The show, the battle, or the after-room story...",
  },
];

function withIdentity(
  source: Omit<HappyDaysPrompt, "channel" | "text">,
  channel: HappyDaysPrompt["channel"],
): HappyDaysPrompt {
  return { ...source, channel, text: source.promptText };
}

export const HAPPY_DAYS_PROMPTS: readonly HappyDaysPrompt[] = HAPPY_DAYS_PROMPT_SOURCE.map((prompt) =>
  withIdentity(prompt, "HAPPY_DAYS"),
);

export const COMMUNITY_GOSSIP_PROMPTS: readonly HappyDaysPrompt[] = COMMUNITY_GOSSIP_PROMPT_SOURCE.map((prompt) =>
  withIdentity(prompt, "COMMUNITY_GOSSIP"),
);

const PROMPTS_BY_CHANNEL: Record<HappyDaysPrompt["channel"], readonly HappyDaysPrompt[]> = {
  HAPPY_DAYS: HAPPY_DAYS_PROMPTS,
  COMMUNITY_GOSSIP: COMMUNITY_GOSSIP_PROMPTS,
};

/** UTC calendar day. This is a presentation policy, not the permanent magazine timezone. */
export function publicationDateKeyFromInstant(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function utcDayIndex(publicationDateKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publicationDateKey);
  if (!match) {
    throw new Error("Invalid publication date key");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 1);
  return Math.floor((utc - start) / 86_400_000);
}

/**
 * Same publication date and channel always resolve the same prompt.
 * Consecutive UTC days move one step through the registry.
 */
export function resolvePublicationPrompt(
  channel: HappyDaysPrompt["channel"],
  publicationDateKey: string,
): HappyDaysPrompt {
  const prompts = PROMPTS_BY_CHANNEL[channel];
  const channelSalt = channel === "HAPPY_DAYS" ? 0 : 1;
  const versionSalt = SOCIAL_PROMPT_REGISTRY_VERSION.length;
  const index = Math.abs(utcDayIndex(publicationDateKey) + channelSalt + versionSalt) % prompts.length;
  return prompts[index];
}

/**
 * Deterministically resolves the active Happy Days prompt for a UTC publication day.
 */
export function getDailyHappyDaysPrompt(date: Date = new Date()): HappyDaysPrompt {
  return resolvePublicationPrompt("HAPPY_DAYS", publicationDateKeyFromInstant(date));
}

/**
 * Look up a prompt by ID.
 */
export function getHappyDaysPromptById(id: string): HappyDaysPrompt | undefined {
  return [...HAPPY_DAYS_PROMPTS, ...COMMUNITY_GOSSIP_PROMPTS].find((prompt) => prompt.id === id);
}
