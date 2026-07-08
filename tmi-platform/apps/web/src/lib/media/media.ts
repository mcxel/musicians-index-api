export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "article"
  | "ticket"
  | "trophy";

export interface MediaItem {
  id: string;
  ownerId: string;
  type: MediaType;
  sourceUrl: string;
  thumbnailUrl?: string;
  title: string;
  artist?: string;
  durationMs?: number;
  createdAt: string;
}
