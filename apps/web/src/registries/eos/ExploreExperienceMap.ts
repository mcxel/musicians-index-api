/**
 * Maps Explore discovery cards to EOS ExperienceRegistry IDs.
 * Cards without an entry use direct href navigation only.
 */

export interface ExploreCardDefinition {
  name: string;
  desc: string;
  icon: string;
  color: string;
  href: string;
  /** When set, card opens StageLoader before entry */
  experienceId?: string;
  /** When set, card opens ExploreProfileReaderStage in-place */
  profileUsername?: string;
  colexistingRoutes?: string[];
  hentryRoute?: string;
}

export const EXPLORE_SECTIONS: Array<{ label: string; items: ExploreCardDefinition[] }> = [
  {
    label: "LIVE LOBBIES",
    items: [
      { name: "Live Lobby", desc: "Real-time active rooms platform-wide", icon: "🎪", color: "#00FFFF", href: "/live/lobby" },
      { name: "Live Lobby Wall", desc: "Grid view of every live room", icon: "🧱", color: "#00FFFF", colexistingRoutes: ["/fan-lobby", "/live/lobby/fans"], href: "/live/lobby" },
      { name: "Fan Lobby", desc: "Social hangout — fans only", icon: "👥", color: "#AA2DFF", hentryRoute: "/fan-lobby", href: "/fan-lobby", experienceId: "fan-lobby" },
      { name: "VIP Lounge", desc: "Video-window social lounge", icon: "🛋️", color: "#AA2DFF", href: "/rooms/vip-lounge", experienceId: "lounge" },
      { name: "All Rooms", desc: "Browse every room on the platform", icon: "🌐", color: "#00FF88", href: "/rooms" },
    ],
  },
  {
    label: "GAMES & BATTLES",
    items: [
      { name: "Cypher Arena", desc: "Live rap & vocal cyphers — enter the circle", icon: "⚔️", color: "#FF2DAA", href: "/battles/cypher", experienceId: "cypher" },
      { name: "Beat Battle Stadium", desc: "Producer vs Producer knockout tournament", icon: "🏆", color: "#FFD700", href: "/battles/stadium", experienceId: "beat-battle" },
      { name: "Live Trivia Showdown", desc: "Daily music & culture trivia with cash pools", icon: "🎯", color: "#00FFFF", href: "/games/trivia", experienceId: "trivia" },
      { name: "DJ Soundclash", desc: "Two DJs, one crown — crowd-voted battles", icon: "🎧", color: "#AA2DFF", href: "/battles/soundclash", experienceId: "soundclash" },
      { name: "Leaderboard & Belts", desc: "Current champions, belt holders, and rankings", icon: "🥇", color: "#FFD700", href: "/battles/leaderboard" },
    ],
  },
  {
    label: "OFFICIAL EVENTS & RESIDENCIES",
    items: [
      { name: "Live Events Schedule", desc: "Monday Night Stage, World Dance Party, and more", icon: "📅", color: "#FF9500", href: "/live-schedule" },
      { name: "Monday Night Stage", desc: "Weekly flagship performance show", icon: "🎤", color: "#FF2DAA", href: "/shows/monday-night-stage", experienceId: "monday-night-stage" },
      { name: "World Dance Party", desc: "Global dance floor — join the party", icon: "💃", color: "#FF2DAA", href: "/rooms/world-dance-party", experienceId: "world-dance-party" },
      { name: "Deal or Feud 1000", desc: "Game show — risk it all", icon: "🎰", color: "#FFD700", href: "/rooms/deal-vs-feud", experienceId: "deal-or-feud" },
      { name: "Today's Shows", desc: "What's live right now", icon: "🔴", color: "#E63000", href: "/shows/today" },
    ],
  },
  {
    label: "PEOPLE & PUBLIC IDENTITIES",
    items: [
      { name: "Ricardo Parker", desc: "Performer · Hip-Hop/Live Cypher · Crown Rank #4", icon: "👑", color: "#FFD700", href: "/p/ricardo-parker", profileUsername: "ricardo-parker" },
      { name: "The Night Signals", desc: "Band · Atmospheric Indie-Synth · Lineup Roster", icon: "🎸", color: "#00E5FF", href: "/p/the-night-signals", profileUsername: "the-night-signals" },
      { name: "WaveTek", desc: "Performer · Electronic/Trap · Crown Rank #1", icon: "⚡", color: "#00FFFF", href: "/p/wavetek", profileUsername: "wavetek" },
      { name: "Jasmine R.", desc: "Fan · Diamond Tier · Lobby Host", icon: "💎", color: "#00FFFF", href: "/p/jasmine-r", profileUsername: "jasmine-r" },
      { name: "Neon Vibe", desc: "Performer · Synth Pop · Resident Performer", icon: "✨", color: "#FF2DAA", href: "/p/neon-vibe", profileUsername: "neon-vibe" },
      { name: "Zuri Bloom", desc: "Performer · Global Soul · Rising Star", icon: "🌸", color: "#AA2DFF", href: "/p/zuri-bloom", profileUsername: "zuri-bloom" },
      { name: "Marcus_V", desc: "Fan · Gold Member · Cypher Jury", icon: "🎧", color: "#FFD700", href: "/p/marcus-v", profileUsername: "marcus-v" },
    ],
  },
  {
    label: "LISTEN & DISCOVER",
    items: [
      { name: "TMI Radio", desc: "Stream & Win — real member-submitted rotation", icon: "📻", color: "#00FF88", href: "/radio" },
      { name: "Playlist", desc: "Your saved tracks and radio playlists", icon: "🎵", color: "#00FF88", href: "/playlist" },
      { name: "Magazine", desc: "Artist features, news, editorial", icon: "📰", color: "#AA2DFF", href: "/magazine" },
      { name: "Beat Marketplace", desc: "License beats from real producers", icon: "🎛️", color: "#FFD700", href: "/beats" },
    ],
  },
];

export function getExploreExperienceId(cardName: string): string | undefined {
  for (const section of EXPLORE_SECTIONS) {
    const item = section.items.find((i) => i.name === cardName);
    if (item?.experienceId) return item.experienceId;
  }
  return undefined;
}
