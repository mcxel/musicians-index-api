import type { CompositionMode, CompositionRequest } from '@/lib/studio/CompositorEngine';

export type CreativeRecipe =
  | 'retro-vision-portrait'
  | 'magazine-cover'
  | 'concert-memory-pack'
  | 'story-card'
  | 'motion-poster';

export type CreativeOutput =
  | 'feed-square'
  | 'story-vertical'
  | 'landscape-banner'
  | 'poster-print';

export type StudioIntent =
  | 'fan-retro-keepsake'
  | 'performer-poster'
  | 'magazine-cover-pack'
  | 'event-ticket-pack'
  | 'billboard-pack';

interface CreativeRecipeManifest {
  id: CreativeRecipe;
  name: string;
  defaultOutputs: CreativeOutput[];
  defaultSourceKind: CompositionRequest['sourceKind'];
}

interface StudioIntentManifest {
  id: StudioIntent;
  recipe: CreativeRecipe;
  resolveOutputs: (mode: CompositionMode) => CreativeOutput[];
  defaultCollectionName: (ownerName: string) => string;
  sourceKind?: CompositionRequest['sourceKind'];
}

const RECIPE_REGISTRY: Record<CreativeRecipe, CreativeRecipeManifest> = {
  'retro-vision-portrait': {
    id: 'retro-vision-portrait',
    name: 'Retro Vision Portrait',
    defaultOutputs: ['feed-square', 'story-vertical'],
    defaultSourceKind: 'fan-retro-vision',
  },
  'magazine-cover': {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    defaultOutputs: ['feed-square', 'landscape-banner'],
    defaultSourceKind: 'magazine-cover',
  },
  'concert-memory-pack': {
    id: 'concert-memory-pack',
    name: 'Concert Memory Pack',
    defaultOutputs: ['feed-square', 'story-vertical', 'poster-print'],
    defaultSourceKind: 'memory-card',
  },
  'story-card': {
    id: 'story-card',
    name: 'Story Card',
    defaultOutputs: ['story-vertical'],
    defaultSourceKind: 'memory-card',
  },
  'motion-poster': {
    id: 'motion-poster',
    name: 'Motion Poster',
    defaultOutputs: ['landscape-banner', 'story-vertical'],
    defaultSourceKind: 'performer-motion',
  },
};

function fanRetroOutputs(mode: CompositionMode): CreativeOutput[] {
  if (mode === 'poster') return ['feed-square', 'story-vertical', 'poster-print'];
  if (mode === 'motion') return ['feed-square', 'story-vertical', 'landscape-banner'];
  return ['feed-square', 'story-vertical'];
}

const STUDIO_INTENT_REGISTRY: Partial<Record<StudioIntent, StudioIntentManifest>> = {
  'fan-retro-keepsake': {
    id: 'fan-retro-keepsake',
    recipe: 'retro-vision-portrait',
    resolveOutputs: fanRetroOutputs,
    defaultCollectionName: (ownerName) => `${ownerName} Retro-Vision Pack`,
    sourceKind: 'fan-retro-vision',
  },
};

const OUTPUT_TO_MODE: Record<CreativeOutput, CompositionMode> = {
  'feed-square': 'still',
  'story-vertical': 'story',
  'landscape-banner': 'motion',
  'poster-print': 'poster',
};

export interface ResolvedCreativePlan {
  recipe: CreativeRecipe;
  outputs: CreativeOutput[];
  sourceKind: CompositionRequest['sourceKind'];
  collectionName?: string;
}

export function getDefaultOutputsForRecipe(recipe: CreativeRecipe): CreativeOutput[] {
  return RECIPE_REGISTRY[recipe]?.defaultOutputs ?? ['feed-square'];
}

export function outputToMode(output: CreativeOutput): CompositionMode {
  return OUTPUT_TO_MODE[output] ?? 'still';
}

export function resolveCreativePlan(input: {
  ownerName: string;
  mode: CompositionMode;
  recipe: CreativeRecipe;
  outputs?: CreativeOutput[];
  collectionName?: string;
  sourceKind?: CompositionRequest['sourceKind'];
  studioIntent?: StudioIntent;
}): ResolvedCreativePlan {
  const intentManifest = input.studioIntent ? STUDIO_INTENT_REGISTRY[input.studioIntent] : undefined;

  if (intentManifest) {
    return {
      recipe: intentManifest.recipe,
      outputs: input.outputs && input.outputs.length > 0 ? input.outputs : intentManifest.resolveOutputs(input.mode),
      sourceKind: input.sourceKind ?? intentManifest.sourceKind ?? RECIPE_REGISTRY[intentManifest.recipe].defaultSourceKind,
      collectionName: input.collectionName ?? intentManifest.defaultCollectionName(input.ownerName),
    };
  }

  const manifest = RECIPE_REGISTRY[input.recipe] ?? RECIPE_REGISTRY['retro-vision-portrait'];
  return {
    recipe: manifest.id,
    outputs: input.outputs && input.outputs.length > 0 ? input.outputs : manifest.defaultOutputs,
    sourceKind: input.sourceKind ?? manifest.defaultSourceKind,
    collectionName: input.collectionName,
  };
}
