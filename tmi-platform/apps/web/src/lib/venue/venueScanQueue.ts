export type VenueScanQueueItem = {
  id: string;
  sourcePath: string;
  sourceType: string;
  status: "queued" | "processing" | "done" | "failed";
  createdAt: number;
  updatedAt: number;
};

const scanQueue: VenueScanQueueItem[] = [];

function idFor(path: string): string {
  return `scan-${Date.now()}-${Math.abs(path.length * 31)}`;
}

export function enqueueVenueScan(sourcePath: string): VenueScanQueueItem {
  const sourceType = sourcePath.split(".").pop()?.toLowerCase() ?? "unknown";
  const now = Date.now();
  const item: VenueScanQueueItem = {
    id: idFor(sourcePath),
    sourcePath,
    sourceType,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };
  scanQueue.push(item);
  return item;
}

export function nextVenueScan(): VenueScanQueueItem | null {
  const item = scanQueue.find((entry) => entry.status === "queued");
  if (!item) return null;
  item.status = "processing";
  item.updatedAt = Date.now();
  return item;
}

export function completeVenueScan(id: string, failed = false): void {
  const item = scanQueue.find((entry) => entry.id === id);
  if (!item) return;
  item.status = failed ? "failed" : "done";
  item.updatedAt = Date.now();
}

export function listVenueScanQueue(): VenueScanQueueItem[] {
  return [...scanQueue];
}
