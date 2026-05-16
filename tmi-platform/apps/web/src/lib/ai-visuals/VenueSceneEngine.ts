export type VenueSceneType = 'club' | 'arena' | 'battle-hall' | 'lounge';

export type VenueSceneRecord = {
  sceneId: string;
  venueId: string;
  sceneType: VenueSceneType;
  lightingProfile: string;
  stagePreset: string;
  crowdDensity: number;
  assetSlots: string[];
  createdAt: number;
};

const venueScenes = new Map<string, VenueSceneRecord>();

export function composeVenueScene(input: {
  sceneId: string;
  venueId: string;
  sceneType: VenueSceneType;
  lightingProfile: string;
  stagePreset: string;
  crowdDensity: number;
  assetSlots: string[];
}): VenueSceneRecord {
  const next: VenueSceneRecord = {
    ...input,
    createdAt: Date.now(),
  };

  venueScenes.set(next.sceneId, next);
  return next;
}

export function listVenueScenes(): VenueSceneRecord[] {
  return [...venueScenes.values()].sort((a, b) => b.createdAt - a.createdAt);
}
