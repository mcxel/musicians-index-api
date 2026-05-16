export type MemoryType = "spotlight" | "finale" | "battle-win" | "article-read" | "show-attended" | "tip-sent" | "achievement";

export type MemoryCard = {
  memoryId: string;
  userId: string;
  type: MemoryType;
  title: string;
  subtitle: string;
  eventSlug?: string;
  artistSlug?: string;
  accentColor: string;
  icon: string;
  pointsEarned: number;
  createdAtMs: number;
};

const TYPE_COLOR: Record<MemoryType, string> = {
  spotlight: "#FF2DAA",
  finale: "#FFD700",
  "battle-win": "#00FF88",
  "article-read": "#AA2DFF",
  "show-attended": "#00FFFF",
  "tip-sent": "#FF9500",
  achievement: "#FFD700",
};

const SEED_MEMORIES: MemoryCard[] = [
  { memoryId: "m1", userId: "guest", type: "show-attended", title: "Ray Journey — Live Set", subtitle: "Attended · 52 min · +120 XP", eventSlug: "ray-journey-live", artistSlug: "ray-journey", accentColor: "#00FFFF", icon: "🎤", pointsEarned: 120, createdAtMs: Date.now() - 1 * 86400000 },
  { memoryId: "m2", userId: "guest", type: "spotlight", title: "Soul Train Finale Spotlight", subtitle: "You were featured on the big screen", eventSlug: "dance-party-1", accentColor: "#FF2DAA", icon: "🔦", pointsEarned: 250, createdAtMs: Date.now() - 2 * 86400000 },
  { memoryId: "m3", userId: "guest", type: "battle-win", title: "Cypher Monday — Battle Win", subtitle: "Verse Knight vs Neon Vibe · You voted the winner", eventSlug: "cypher-monday-1", accentColor: "#00FF88", icon: "🏆", pointsEarned: 80, createdAtMs: Date.now() - 3 * 86400000 },
  { memoryId: "m4", userId: "guest", type: "article-read", title: "Wavetek Drops \"Midnight Grind\"", subtitle: "Read · 3 min · +5 pts", artistSlug: "wavetek", accentColor: "#AA2DFF", icon: "📖", pointsEarned: 5, createdAtMs: Date.now() - 4 * 86400000 },
  { memoryId: "m5", userId: "guest", type: "finale", title: "Dance Party Finale", subtitle: "Soul Train line · Wave emoji storm · +180 XP", eventSlug: "dance-party-2", accentColor: "#FFD700", icon: "🚂", pointsEarned: 180, createdAtMs: Date.now() - 5 * 86400000 },
  { memoryId: "m6", userId: "guest", type: "tip-sent", title: "Tipped Verse Knight", subtitle: "$5 tip · Show: Monday Cypher", artistSlug: "verse-knight", accentColor: "#FF9500", icon: "💸", pointsEarned: 20, createdAtMs: Date.now() - 6 * 86400000 },
  { memoryId: "m7", userId: "guest", type: "achievement", title: "First Show Attended", subtitle: "Achievement unlocked · +50 XP", accentColor: "#FFD700", icon: "🏅", pointsEarned: 50, createdAtMs: Date.now() - 7 * 86400000 },
  { memoryId: "m8", userId: "guest", type: "show-attended", title: "Nova Cipher — Battle Set", subtitle: "Attended · 28 min · +90 XP", eventSlug: "nova-cipher-battle", artistSlug: "nova-cipher", accentColor: "#00FFFF", icon: "⚡", pointsEarned: 90, createdAtMs: Date.now() - 8 * 86400000 },
];

const userMemoryMap = new Map<string, MemoryCard[]>();

export function getMemories(userId: string): MemoryCard[] {
  return userMemoryMap.get(userId) ?? SEED_MEMORIES.map(m => ({ ...m, userId }));
}

export function addMemory(memory: MemoryCard): void {
  const existing = userMemoryMap.get(memory.userId) ?? [...SEED_MEMORIES.map(m => ({ ...m, userId: memory.userId }))];
  userMemoryMap.set(memory.userId, [memory, ...existing]);
}

export function getMemoryTypeColor(type: MemoryType): string {
  return TYPE_COLOR[type];
}

export function listPublicMemories(limit = 12): MemoryCard[] {
  return SEED_MEMORIES.slice(0, limit);
}
