export type PosterSceneType = 'battle-poster' | 'event-poster' | 'sponsor-poster' | 'article-hero';

export type PosterSceneRecord = {
  sceneId: string;
  sceneType: PosterSceneType;
  headline: string;
  palette: string[];
  layoutTemplate: string;
  foregroundAsset: string;
  backgroundAsset: string;
  createdAt: number;
};

const posterScenes = new Map<string, PosterSceneRecord>();

export function composePosterScene(input: Omit<PosterSceneRecord, 'createdAt'>): PosterSceneRecord {
  const next: PosterSceneRecord = {
    ...input,
    createdAt: Date.now(),
  };

  posterScenes.set(next.sceneId, next);
  return next;
}

export function listPosterScenes(): PosterSceneRecord[] {
  return [...posterScenes.values()].sort((a, b) => b.createdAt - a.createdAt);
}
