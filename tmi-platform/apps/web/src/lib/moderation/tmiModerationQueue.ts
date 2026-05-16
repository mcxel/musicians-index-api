export type ModerationType = "report" | "message" | "upload" | "profile";
export type ModerationPriority = "low" | "medium" | "high" | "critical";
export type ModerationStatus = "open" | "in-review" | "resolved" | "dismissed";

export type ModerationQueueItem = {
  id: string;
  type: ModerationType;
  targetId: string;
  reason: string;
  priority: ModerationPriority;
  status: ModerationStatus;
  createdAt: string;
};

export const DEFAULT_MODERATION_QUEUE: ModerationQueueItem[] = [
  {
    id: "mod-001",
    type: "report",
    targetId: "artist-07",
    reason: "Possible spam campaign link",
    priority: "high",
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mod-002",
    type: "upload",
    targetId: "media-asset-332",
    reason: "Upload flagged by safety rules",
    priority: "medium",
    status: "in-review",
    createdAt: new Date().toISOString(),
  },
];

export function countOpenModerationItems(items: ModerationQueueItem[]): number {
  return items.filter((item) => item.status === "open" || item.status === "in-review").length;
}
