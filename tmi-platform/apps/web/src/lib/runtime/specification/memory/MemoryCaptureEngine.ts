export interface MemoryCaptureEngine {
  captureToMemory(ownerId: string, mediaId: string): Promise<{ memoryId: string }>;
}
