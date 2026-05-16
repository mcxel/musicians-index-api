export type PageCompletionState = "draft" | "active" | "complete" | "deprecated";

export type PageTag = {
  pageId: string;
  pageType: string;
  ownerType: string;
  systemType: string;
  relatedSystems: string[];
  entryRoutes: string[];
  nextActions: string[];
  returnRoutes: string[];
  dependencies: string[];
  completionState: PageCompletionState;
};

const pageTagMap = new Map<string, PageTag>();

function key(pageId: string): string {
  return pageId.trim().toLowerCase();
}

function toRegex(routePattern: string): RegExp {
  const escaped = routePattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dynamic = escaped.replace(/\\\[([^\]]+)\\\]/g, "[^/]+");
  return new RegExp(`^${dynamic}$`);
}

export function registerPageTag(tag: PageTag): PageTag {
  const normalized: PageTag = {
    ...tag,
    pageId: key(tag.pageId),
    relatedSystems: Array.from(new Set(tag.relatedSystems)),
    entryRoutes: Array.from(new Set(tag.entryRoutes)),
    nextActions: Array.from(new Set(tag.nextActions)),
    returnRoutes: Array.from(new Set(tag.returnRoutes)),
    dependencies: Array.from(new Set(tag.dependencies)),
  };
  pageTagMap.set(normalized.pageId, normalized);
  return normalized;
}

export function getPageTag(pageId: string): PageTag | null {
  return pageTagMap.get(key(pageId)) ?? null;
}

export function listPageTags(): PageTag[] {
  return [...pageTagMap.values()];
}

export function validatePageOwnership(route: string, ownerType: string): boolean {
  return listPageTags().some((tag) => {
    const ownsRoute = [route, ...tag.entryRoutes, ...tag.returnRoutes].some((pattern) => toRegex(pattern).test(route));
    return ownsRoute && tag.ownerType === ownerType;
  });
}

export function validateReturnPaths(pageId: string): boolean {
  const tag = getPageTag(pageId);
  if (!tag) return false;
  return tag.returnRoutes.length > 0 && tag.returnRoutes.every((r) => r.startsWith("/"));
}

export function validateEntryPaths(pageId: string): boolean {
  const tag = getPageTag(pageId);
  if (!tag) return false;
  return tag.entryRoutes.length > 0 && tag.entryRoutes.every((r) => r.startsWith("/"));
}

const coreAvatarRouteTags: PageTag[] = [
  {
    pageId: "fan-slug",
    pageType: "profile",
    ownerType: "fan",
    systemType: "fan-system",
    relatedSystems: ["profile", "avatar", "live", "rewards"],
    entryRoutes: ["/fan/[slug]"],
    nextActions: ["view-avatar", "enter-live", "open-inventory"],
    returnRoutes: ["/live/lobby", "/fan/[slug]"],
    dependencies: ["AvatarPoseEngine", "AvatarInventoryEngine", "AvatarBehaviorEngine"],
    completionState: "active",
  },
  {
    pageId: "artists-slug",
    pageType: "profile",
    ownerType: "artist",
    systemType: "artist-system",
    relatedSystems: ["profile", "avatar", "venues", "editorial"],
    entryRoutes: ["/artists/[slug]"],
    nextActions: ["view-stage-pose", "open-accessories", "go-live"],
    returnRoutes: ["/live/lobby", "/artists/[slug]"],
    dependencies: ["AvatarPoseEngine", "AvatarAccessoryEngine", "AvatarBehaviorEngine"],
    completionState: "active",
  },
  {
    pageId: "performers-slug",
    pageType: "profile",
    ownerType: "performer",
    systemType: "performer-system",
    relatedSystems: ["profile", "avatar", "battle", "venue-runtime"],
    entryRoutes: ["/performers/[slug]"],
    nextActions: ["set-battle-pose", "join-room", "open-emotes"],
    returnRoutes: ["/live/lobby", "/performers/[slug]"],
    dependencies: ["AvatarPoseEngine", "AvatarEmoteEngine", "AvatarRoomBindingEngine"],
    completionState: "active",
  },
  {
    pageId: "live-lobby",
    pageType: "live",
    ownerType: "venue-runtime",
    systemType: "live-runtime",
    relatedSystems: ["live", "avatar", "rooms", "seating"],
    entryRoutes: ["/live/lobby"],
    nextActions: ["join-room", "assign-seat", "react-emote"],
    returnRoutes: ["/fan/[slug]", "/artists/[slug]", "/performers/[slug]"],
    dependencies: ["AvatarSeatBindingEngine", "AvatarRoomBindingEngine", "AvatarEmoteEngine"],
    completionState: "active",
  },
  {
    pageId: "live-room-id",
    pageType: "live-room",
    ownerType: "venue-runtime",
    systemType: "live-runtime",
    relatedSystems: ["live", "avatar", "rooms", "engagement"],
    entryRoutes: ["/live/rooms/[id]"],
    nextActions: ["watch", "react", "leave-room"],
    returnRoutes: ["/live/lobby", "/fan/[slug]", "/artists/[slug]", "/performers/[slug]"],
    dependencies: ["AvatarRoomBindingEngine", "AvatarEmoteEngine", "AvatarBehaviorEngine"],
    completionState: "active",
  },
  {
    pageId: "venue-live",
    pageType: "venue-live",
    ownerType: "venue",
    systemType: "venue-system",
    relatedSystems: ["venues", "live", "avatar", "seat-management"],
    entryRoutes: ["/venues/[slug]/live"],
    nextActions: ["assign-seat", "watch", "tip", "leave"],
    returnRoutes: ["/live/lobby", "/venues/[slug]/live"],
    dependencies: ["AvatarSeatBindingEngine", "AvatarRoomBindingEngine", "AvatarBehaviorEngine"],
    completionState: "active",
  },
  {
    pageId: "song-battle-live",
    pageType: "battle-live",
    ownerType: "battle",
    systemType: "battle-runtime",
    relatedSystems: ["battle", "avatar", "live", "rewards"],
    entryRoutes: ["/song-battle/live"],
    nextActions: ["battle", "emote", "vote", "exit"],
    returnRoutes: ["/live/lobby", "/performers/[slug]"],
    dependencies: ["AvatarPoseEngine", "AvatarEmoteEngine", "AvatarBehaviorEngine"],
    completionState: "active",
  },
  {
    pageId: "dance-party-live",
    pageType: "dance-live",
    ownerType: "dance",
    systemType: "dance-runtime",
    relatedSystems: ["dance", "avatar", "live", "rooms"],
    entryRoutes: ["/dance-party/live"],
    nextActions: ["dance", "react", "switch-room", "exit"],
    returnRoutes: ["/live/lobby", "/fan/[slug]", "/artists/[slug]"],
    dependencies: ["AvatarPoseEngine", "AvatarEmoteEngine", "AvatarRoomBindingEngine"],
    completionState: "active",
  },
];

const adminVisualRouteTags: PageTag[] = [
  {
    pageId: "admin-visual-creator",
    pageType: "admin-tool",
    ownerType: "admin",
    systemType: "visual-creation-system",
    relatedSystems: ["ai-visuals", "admin", "assets", "bots"],
    entryRoutes: ["/admin/visual-creator"],
    nextActions: ["create-visual", "queue-generation", "review-quality"],
    returnRoutes: ["/admin/big-ace/visuals", "/admin/assets/generated"],
    dependencies: ["AiVisualCreatorEngine", "AiPromptComposer", "AiVisualQualityJudge"],
    completionState: "active",
  },
  {
    pageId: "admin-assets-generated",
    pageType: "admin-assets",
    ownerType: "admin",
    systemType: "asset-registry-system",
    relatedSystems: ["ai-visuals", "admin", "assets", "route-ownership"],
    entryRoutes: ["/admin/assets/generated"],
    nextActions: ["approve", "reject", "archive", "replace"],
    returnRoutes: ["/admin/visual-creator", "/admin/big-ace/visuals"],
    dependencies: ["AiGeneratedAssetRegistry", "AiVisualFeedbackEngine", "AiVisualEvolutionEngine"],
    completionState: "active",
  },
  {
    pageId: "admin-big-ace-visuals",
    pageType: "admin-control",
    ownerType: "big-ace",
    systemType: "visual-governance-system",
    relatedSystems: ["ai-visuals", "admin", "governance", "bot-operations"],
    entryRoutes: ["/admin/big-ace/visuals"],
    nextActions: ["approve", "reject", "request-variation", "assign-visual-task"],
    returnRoutes: ["/admin/visual-creator", "/admin/assets/generated"],
    dependencies: ["VisualCreatorBotEngine", "SceneBuilderBotEngine", "AssetUpgradeBotEngine"],
    completionState: "active",
  },
];

for (const tag of [...coreAvatarRouteTags, ...adminVisualRouteTags]) {
  registerPageTag(tag);
}
