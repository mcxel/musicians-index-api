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
}

export const EXPLORE_SECTIONS: Array<{ label: string; items: ExploreCardDefinition[] }> = [
  {
    label: "LIVE LOBBIES",
    items: [
      { name: "Live Lobby", desc: "Real-time active rooms platform-wide", icon: "🎪", color: "#00FFFF", href: "/live/lobby" },
      { name: "Live Lobby Wall", desc: "Grid view of every live room", icon: "🧱", color: "#00FFFF", href: "/live/lobby-wall" },
      { name: "Fan Lobby", desc: "Social hangout — fans only", icon: "👥", color: "#AA2DFF", href: "/rooms/fan-lobby", experienceId: "fan-lobby" },
      { name: "VIP Lounge", desc: "Video-window social lounge", icon: "🛋️", color: "#AA2DFF", href: "/rooms/vip-lounge", experienceId: "lounge" },
      { name: "All Rooms", desc: "Browse every room on the platform", icon: "🌐", color: "#00FF88", href: "/rooms" },
    ],
  },
  {
    label: "GAMES & BATTLES",
    items: [
      { name: "Battles", desc: "Head-to-head — crowd votes the winner", icon: "⚔️", color: "#FF2DAA", href: "/battles/live", experienceId: "battle" },
      { name: "Battles Lobby Wall", desc: "Every battle happening now", icon: "🧱", color: "#FF2DAA", href: "/battles/lobby-wall" },
      { name: "Jazz Scat Battle", desc: "Vocal improv — scat vs scat", icon: "🎷", color: "#FFD700", href: "/battles/jazz-scat", experienceId: "jazz-scat-battle" },
      { name: "Gibberish Battle", desc: "Vocal improv — nonsense energy duel", icon: "🗣️", color: "#00FFFF", href: "/battles/gibberish", experienceId: "gibberish-battle" },
      { name: "Cypher", desc: "Open circle — every bar counts", icon: "🔄", color: "#00FFFF", href: "/cypher/stage", experienceId: "cypher" },
      { name: "Cypher Lobby Wall", desc: "Every cypher happening now", icon: "🧱", color: "#00FFFF", href: "/cypher/lobby-wall" },
      { name: "Challenges", desc: "Producer & artist challenge rooms", icon: "🏆", color: "#FFD700", href: "/challenge/stage", experienceId: "challenge" },
      { name: "Rankings, Belts & Trophies", desc: "Real prize pools and standings", icon: "🥇", color: "#FFD700", href: "/battles/rankings" },
    ],
  },
  {
    label: "OFFICIAL EVENTS",
    items: [
      { name: "Live Events Schedule", desc: "Monday Night Stage, World Dance Party, and more", icon: "📅", color: "#FF9500", href: "/live-schedule" },
      { name: "Monday Night Stage", desc: "Weekly flagship performance show", icon: "🎤", color: "#FF2DAA", href: "/shows/monday-night-stage", experienceId: "monday-night-stage" },
      { name: "World Dance Party", desc: "Global dance floor — join the party", icon: "💃", color: "#FF2DAA", href: "/rooms/world-dance-party", experienceId: "world-dance-party" },
      { name: "Deal or Feud 1000", desc: "Game show — risk it all", icon: "🎰", color: "#FFD700", href: "/rooms/deal-vs-feud", experienceId: "deal-or-feud" },
      { name: "Today's Shows", desc: "What's live right now", icon: "🔴", color: "#E63000", href: "/shows/today" },
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
