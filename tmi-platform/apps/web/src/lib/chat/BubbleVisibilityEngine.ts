import type { ChatRole } from "./RoomChatEngine";
import type { FloatingBubble } from "./RoomBubbleChatEngine";

export type VisibilityRule = "host-priority" | "performer-first" | "density-culled" | "role-filtered" | "all";

export type VisibilityConfig = {
  rule: VisibilityRule;
  densityThreshold: number;
  maxVisiblePerRole: number;
  performerBubblePriority: boolean;
  hostAlwaysVisible: boolean;
};

const DEFAULT_CONFIG: VisibilityConfig = {
  rule: "host-priority",
  densityThreshold: 18,
  maxVisiblePerRole: 4,
  performerBubblePriority: true,
  hostAlwaysVisible: true,
};

const ROLE_VISIBILITY_PRIORITY: Record<ChatRole, number> = {
  host: 1000,
  performer: 900,
  judge: 800,
  sponsor: 700,
  moderator: 600,
  system: 500,
  audience: 100,
};

export function isVisibleByRule(
  bubble: FloatingBubble,
  allBubbles: FloatingBubble[],
  config: VisibilityConfig,
): boolean {
  if (config.rule === "all") return true;

  // Host always visible (if enabled)
  if (config.hostAlwaysVisible && bubble.message.role === "host") {
    return true;
  }

  // Performer priority (if enabled and crowded)
  if (config.performerBubblePriority && allBubbles.length > config.densityThreshold) {
    if (bubble.message.role === "performer") {
      return true;
    }
  }

  // Density-based culling
  if (allBubbles.length > config.densityThreshold) {
    const priority = ROLE_VISIBILITY_PRIORITY[bubble.message.role] ?? 0;
    const sameRoleCount = allBubbles.filter(
      (b) => b.message.role === bubble.message.role && ROLE_VISIBILITY_PRIORITY[b.message.role] >= priority,
    ).length;

    if (sameRoleCount > config.maxVisiblePerRole) {
      return false;
    }
  }

  return true;
}

export function filterVisibleBubbles(
  bubbles: FloatingBubble[],
  config: Partial<VisibilityConfig> = {},
): FloatingBubble[] {
  const rules = { ...DEFAULT_CONFIG, ...config };

  // Sort by priority
  const sorted = [...bubbles].sort((a, b) => {
    const priorityA = ROLE_VISIBILITY_PRIORITY[a.message.role] ?? 0;
    const priorityB = ROLE_VISIBILITY_PRIORITY[b.message.role] ?? 0;
    if (priorityB !== priorityA) return priorityB - priorityA;
    return b.createdAtMs - a.createdAtMs;
  });

  return sorted.filter((bubble) => isVisibleByRule(bubble, bubbles, rules));
}

export function getCullingReason(
  bubble: FloatingBubble,
  allBubbles: FloatingBubble[],
  config: Partial<VisibilityConfig> = {},
): string | null {
  const rules = { ...DEFAULT_CONFIG, ...config };

  if (isVisibleByRule(bubble, allBubbles, rules)) {
    return null;
  }

  if (allBubbles.length > rules.densityThreshold) {
    return "density";
  }

  return "priority";
}

export function getVisibilityStats(
  bubbles: FloatingBubble[],
  config: Partial<VisibilityConfig> = {},
): {
  total: number;
  visible: number;
  culled: number;
  byRole: Record<string, { total: number; visible: number }>;
} {
  const visible = filterVisibleBubbles(bubbles, config);

  const byRole: Record<string, { total: number; visible: number }> = {};
  for (const bubble of bubbles) {
    const role = bubble.message.role;
    if (!byRole[role]) {
      byRole[role] = { total: 0, visible: 0 };
    }
    byRole[role].total += 1;
    if (visible.find((b) => b.id === bubble.id)) {
      byRole[role].visible += 1;
    }
  }

  return {
    total: bubbles.length,
    visible: visible.length,
    culled: bubbles.length - visible.length,
    byRole,
  };
}
