export type BubbleType = "tip" | "praise" | "fire";

export type BubbleMessage = {
  id: string;
  type: BubbleType;
  text: string;
  createdAt: number;
};

export function enqueueBubble(queue: BubbleMessage[], message: Omit<BubbleMessage, "id" | "createdAt">): BubbleMessage[] {
  const entry: BubbleMessage = {
    id: `bubble-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
    ...message,
  };
  return [entry, ...queue].slice(0, 24);
}

export function pruneExpiredBubbles(queue: BubbleMessage[], ttlMs = 4500): BubbleMessage[] {
  const now = Date.now();
  return queue.filter((bubble) => now - bubble.createdAt <= ttlMs);
}
