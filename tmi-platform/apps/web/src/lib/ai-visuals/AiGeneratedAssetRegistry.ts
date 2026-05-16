export type AiGeneratedAssetStatus = "draft" | "approved" | "active" | "archived" | "replaced";

export type AiGeneratedAssetType =
  | "image"
  | "poster"
  | "avatar-reference"
  | "venue-skin"
  | "battle-stage"
  | "instrument"
  | "prop"
  | "clothing"
  | "sponsor-ad"
  | "ticket-design"
  | "nft-artwork"
  | "magazine-spread"
  | "billboard-scene"
  | "video-scene-plan"
  | "animation-storyboard"
  | "stage-scene"
  | "background"
  | "room-skin";

export type AiGeneratedAssetRecord = {
  assetId: string;
  assetType: AiGeneratedAssetType;
  generated?: boolean;
  source?: string;
  synthetic?: boolean;
  prompt: string;
  style: string;
  ownerSystem: string;
  targetRoute: string;
  targetComponent: string;
  createdAt: number;
  qualityScore: number;
  usageCount: number;
  replacementOf?: string;
  status: AiGeneratedAssetStatus;
  outputRef?: string;
  tags: string[];
};

const generatedAssetMap = new Map<string, AiGeneratedAssetRecord>();

function id(): string {
  return `aiga_${Math.random().toString(36).slice(2, 11)}`;
}

export function registerGeneratedAsset(
  input: Omit<AiGeneratedAssetRecord, "assetId" | "createdAt" | "usageCount">
): AiGeneratedAssetRecord {
  const record: AiGeneratedAssetRecord = {
    ...input,
    assetId: id(),
    createdAt: Date.now(),
    usageCount: 0,
    tags: Array.from(new Set(input.tags)),
  };
  generatedAssetMap.set(record.assetId, record);
  return record;
}

export function getGeneratedAsset(assetId: string): AiGeneratedAssetRecord | null {
  return generatedAssetMap.get(assetId) ?? null;
}

export function listGeneratedAssets(filter?: Partial<Pick<AiGeneratedAssetRecord, "status" | "ownerSystem" | "targetRoute">>): AiGeneratedAssetRecord[] {
  const all = [...generatedAssetMap.values()];
  if (!filter) return all;
  return all.filter((asset) => {
    if (filter.status && asset.status !== filter.status) return false;
    if (filter.ownerSystem && asset.ownerSystem !== filter.ownerSystem) return false;
    if (filter.targetRoute && asset.targetRoute !== filter.targetRoute) return false;
    return true;
  });
}

export function incrementGeneratedAssetUsage(assetId: string): AiGeneratedAssetRecord | null {
  const current = generatedAssetMap.get(assetId);
  if (!current) return null;
  const next: AiGeneratedAssetRecord = { ...current, usageCount: current.usageCount + 1 };
  generatedAssetMap.set(assetId, next);
  return next;
}

export function updateGeneratedAssetStatus(assetId: string, status: AiGeneratedAssetStatus): AiGeneratedAssetRecord | null {
  const current = generatedAssetMap.get(assetId);
  if (!current) return null;
  const next: AiGeneratedAssetRecord = { ...current, status };
  generatedAssetMap.set(assetId, next);
  return next;
}

export function replaceGeneratedAsset(assetId: string, replacementAssetId: string): AiGeneratedAssetRecord | null {
  const current = generatedAssetMap.get(assetId);
  if (!current) return null;
  const next: AiGeneratedAssetRecord = { ...current, status: "replaced", replacementOf: replacementAssetId };
  generatedAssetMap.set(assetId, next);
  return next;
}
