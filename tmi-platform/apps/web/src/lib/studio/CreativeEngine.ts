import {
  submitComposition,
  type CompositionJob,
  type CompositionRequest,
} from '@/lib/studio/CompositorEngine';
import {
  getDefaultOutputsForRecipe,
  outputToMode,
  type CreativeOutput,
  type CreativeRecipe,
} from '@/lib/studio/CreativeRecipeRegistry';

export interface CreativeRenderRequest {
  ownerId: string;
  ownerName: string;
  ownerTier: string;
  backdropId: string;
  backdropName: string;
  accentColor: string;
  sourceImageUrl?: string | null;
  title?: string;
  description?: string;
  templateId?: string;
  recipe: CreativeRecipe;
  outputs?: CreativeOutput[];
  collectionName?: string;
  sourceKind?: CompositionRequest['sourceKind'];
}

export interface CreativeCollection {
  collectionId: string;
  name: string;
  ownerId: string;
  recipe: CreativeRecipe;
  outputs: CreativeOutput[];
  createdAt: string;
  jobs: CompositionJob[];
}

const collections = new Map<string, CreativeCollection>();

function sanitizeCollectionName(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const cleaned = input.trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 80);
  return cleaned || fallback;
}

export function renderCreativeCollection(input: CreativeRenderRequest): CreativeCollection {
  const outputs = input.outputs && input.outputs.length > 0 ? input.outputs : getDefaultOutputsForRecipe(input.recipe);
  const collectionId = `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const name = sanitizeCollectionName(input.collectionName, `${input.ownerName} ${input.recipe}`);

  const jobs = outputs.map((output) => {
    const mode = outputToMode(output);
    const title = input.title ? `${input.title} · ${output}` : `${input.ownerName} · ${output}`;
    const description = input.description
      ? `${input.description} (${output})`
      : `${input.backdropName} · ${input.recipe} · ${output}`;

    return submitComposition({
      ownerId: input.ownerId,
      ownerName: input.ownerName,
      ownerTier: input.ownerTier,
      backdropId: input.backdropId,
      backdropName: input.backdropName,
      mode,
      accentColor: input.accentColor,
      sourceImageUrl: input.sourceImageUrl,
      templateId: input.templateId,
      title,
      description,
      sourceKind: input.sourceKind ?? 'fan-retro-vision',
    });
  });

  const collection: CreativeCollection = {
    collectionId,
    name,
    ownerId: input.ownerId,
    recipe: input.recipe,
    outputs,
    createdAt,
    jobs,
  };

  collections.set(collectionId, collection);
  return collection;
}

export function getCreativeCollection(collectionId: string): CreativeCollection | null {
  return collections.get(collectionId) ?? null;
}

export function listCreativeCollections(ownerId?: string): CreativeCollection[] {
  return Array.from(collections.values())
    .filter((collection) => !ownerId || collection.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
