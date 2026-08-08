/**
 * Stable per-sender colors for community / multi-party chat.
 * Hash userId (fallback: display name) → TMI neon-safe palette with dark-bg contrast.
 */

export const TMI_SENDER_PALETTE = [
  "#00FFFF", // cyan
  "#FF2DAA", // fuchsia
  "#FFD700", // gold
  "#AA2DFF", // purple
  "#00D4FF", // electric blue
  "#FF6B35", // sunset orange
  "#39FF14", // neon green
  "#FF5C8A", // hot pink
  "#7DF9FF", // electric cyan
  "#C0C0C0", // silver
] as const;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable color for a sender — same user always gets the same hue. */
export function senderColorFor(userId: string | null | undefined, displayName?: string | null): string {
  const key = (userId ?? "").trim() || (displayName ?? "").trim() || "unknown";
  const idx = hashString(key.toLowerCase()) % TMI_SENDER_PALETTE.length;
  return TMI_SENDER_PALETTE[idx]!;
}

/** Soft bubble fill / border helpers for dark backgrounds. */
export function senderBubbleStyles(color: string): {
  color: string;
  border: string;
  background: string;
  nameColor: string;
} {
  return {
    color: "#F4F7FF",
    border: `1px solid ${color}66`,
    background: `linear-gradient(135deg, ${color}22, rgba(5,5,16,0.85))`,
    nameColor: color,
  };
}
