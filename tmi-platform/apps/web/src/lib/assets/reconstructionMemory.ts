export type ReconstructionMemoryRecord = {
  assetId: string;
  originalSource: string;
  partsExtracted: string[];
  variantsCreated: string[];
  posesCreated: string[];
  expressionsCreated: string[];
  updatedAt: number;
};

const reconstructionMemory = new Map<string, ReconstructionMemoryRecord>();

export function updateReconstructionMemory(record: ReconstructionMemoryRecord): void {
  reconstructionMemory.set(record.assetId, { ...record, updatedAt: Date.now() });
}

export function getReconstructionMemory(assetId: string): ReconstructionMemoryRecord | null {
  return reconstructionMemory.get(assetId) ?? null;
}

export function listReconstructionMemories(): ReconstructionMemoryRecord[] {
  return Array.from(reconstructionMemory.values());
}
