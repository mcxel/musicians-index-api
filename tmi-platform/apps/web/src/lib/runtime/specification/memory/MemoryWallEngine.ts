export interface MemoryItem {
  memoryId: string;
  ownerId: string;
  mediaType: "photo" | "video" | "audio";
  url: string;
  createdAtMs: number;
}

export interface MemoryWallEngine {
  listMemories(ownerId: string): Promise<MemoryItem[]>;
}
