export interface MemoryGalleryEngine {
  listAlbums(ownerId: string): Promise<Array<{ albumId: string; title: string }>>;
}
