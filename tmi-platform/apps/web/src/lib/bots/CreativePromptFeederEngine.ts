import {
  queueFeederIdea,
  type FeederIdeaAssetType,
  type VisualFeederIdea,
} from "@/lib/bots/AssetIdeaQueueEngine";

export function composeFeederPrompt(input: {
  botId: string;
  assetType: FeederIdeaAssetType;
  role: string;
  targetRoute: string;
  targetSlot: string;
  styleHint?: string;
  reason: string;
}): string {
  const style = input.styleHint ?? "tmi-neon-editorial";
  return [
    `Generate unique synthetic ${input.assetType}`,
    `for role ${input.role}`,
    `target route ${input.targetRoute}`,
    `target slot ${input.targetSlot}`,
    `style ${style}`,
    `reason ${input.reason}`,
    "do not copy real user likeness",
    "generated identity only",
  ].join(" | ");
}

export function createFeederIdea(input: {
  sourceBotId: string;
  targetRoute: string;
  targetSlot: string;
  assetType: FeederIdeaAssetType;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  role?: string;
  styleHint?: string;
}): VisualFeederIdea {
  const prompt = composeFeederPrompt({
    botId: input.sourceBotId,
    assetType: input.assetType,
    role: input.role ?? "bot",
    targetRoute: input.targetRoute,
    targetSlot: input.targetSlot,
    styleHint: input.styleHint,
    reason: input.reason,
  });

  return queueFeederIdea({
    sourceBotId: input.sourceBotId,
    targetRoute: input.targetRoute,
    targetSlot: input.targetSlot,
    assetType: input.assetType,
    prompt,
    priority: input.priority,
    reason: input.reason,
  });
}

export function ensureSampleFeederIdeas(): VisualFeederIdea[] {
  const samples = [
    {
      sourceBotId: "feeder-artist-1",
      targetRoute: "/artists",
      targetSlot: "artists-hero",
      assetType: "artist-portrait" as const,
      priority: "high" as const,
      reason: "artist profile click-through low",
      role: "artist-bot",
    },
    {
      sourceBotId: "feeder-venue-1",
      targetRoute: "/venues",
      targetSlot: "venues-shell",
      assetType: "venue-skin" as const,
      priority: "medium" as const,
      reason: "venue shell style refresh",
      role: "venue-bot",
    },
    {
      sourceBotId: "feeder-ticket-1",
      targetRoute: "/tickets",
      targetSlot: "ticket-art-primary",
      assetType: "ticket-design" as const,
      priority: "high" as const,
      reason: "ticket conversion uplift",
      role: "support-bot",
    },
    {
      sourceBotId: "feeder-bot-face-1",
      targetRoute: "/admin/bots/faces",
      targetSlot: "bot-face-grid",
      assetType: "bot-face" as const,
      priority: "critical" as const,
      reason: "duplicate warning mitigation",
      role: "diagnostic-bot",
    },
  ];

  return samples.map((sample) => createFeederIdea(sample));
}
