export interface PolaroidEngine {
  generatePolaroid(memoryId: string): Promise<{ renderId: string; url: string }>;
}
