/**
 * MemoryArchiveEngine.ts
 *
 * Manages archival of older memory wall items to storage.
 * Purpose: Keep memory walls fresh while preserving history.
 */

export interface MemoryArchiveRecord {
  archiveId: string;
  memoryId: string;
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  contentType: string;
  title: string;
  archivedAt: number;
  expiresAt: number;
  restoreable: boolean;
  archiveReason: 'auto-age' | 'manual-archive' | 'storage-limit' | 'user-requested';
  previousDisplayOrder: number;
}

export interface ArchiveSummary {
  totalArchived: number;
  archivedByEntity: Record<string, number>;
  archivedByReason: Record<string, number>;
  expiredArchives: number;
  restorableArchives: number;
}

// In-memory archive registry
const memoryArchive = new Map<string, MemoryArchiveRecord>();
let archiveCounter = 0;

/**
 * Archives a memory (moves to cold storage).
 */
export function archiveMemory(input: {
  memoryId: string;
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  contentType: string;
  title: string;
  archiveReason: 'auto-age' | 'manual-archive' | 'storage-limit' | 'user-requested';
  displayOrder: number;
  retentionDaysBeforeExpiry?: number;
}): string {
  const archiveId = `archive-${archiveCounter++}-${Date.now()}`;

  const record: MemoryArchiveRecord = {
    archiveId,
    memoryId: input.memoryId,
    entityId: input.entityId,
    entityType: input.entityType,
    contentType: input.contentType,
    title: input.title,
    archivedAt: Date.now(),
    expiresAt: Date.now() + (input.retentionDaysBeforeExpiry ?? 2555) * 24 * 60 * 60 * 1000, // 7 years default
    restoreable: true,
    archiveReason: input.archiveReason,
    previousDisplayOrder: input.displayOrder,
  };

  memoryArchive.set(archiveId, record);
  return archiveId;
}

/**
 * Lists all archived memories (non-mutating).
 */
export function listArchivedMemories(): MemoryArchiveRecord[] {
  return Array.from(memoryArchive.values());
}

/**
 * Lists archived memories by entity (non-mutating).
 */
export function listArchivedByEntity(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue'
): MemoryArchiveRecord[] {
  return Array.from(memoryArchive.values()).filter(
    (a) => a.entityId === entityId && a.entityType === entityType
  );
}

/**
 * Lists restorable archives (not yet expired).
 */
export function listRestorableArchives(): MemoryArchiveRecord[] {
  const now = Date.now();
  return Array.from(memoryArchive.values()).filter((a) => a.restoreable && a.expiresAt > now);
}

/**
 * Marks archive as expired (non-restorable).
 */
export function markArchiveExpired(archiveId: string): void {
  const record = memoryArchive.get(archiveId);
  if (record) {
    record.restoreable = false;
  }
}

/**
 * Gets archive summary (non-mutating).
 */
export function getArchiveSummary(): ArchiveSummary {
  const all = Array.from(memoryArchive.values());

  const archivedByEntity: Record<string, number> = {};
  const archivedByReason: Record<string, number> = {};

  all.forEach((archive) => {
    const entityKey = `${archive.entityType}-${archive.entityId}`;
    archivedByEntity[entityKey] = (archivedByEntity[entityKey] ?? 0) + 1;
    archivedByReason[archive.archiveReason] = (archivedByReason[archive.archiveReason] ?? 0) + 1;
  });

  const now = Date.now();
  const expiredArchives = all.filter((a) => !a.restoreable || a.expiresAt < now).length;
  const restorableArchives = all.filter((a) => a.restoreable && a.expiresAt > now).length;

  return {
    totalArchived: all.length,
    archivedByEntity,
    archivedByReason,
    expiredArchives,
    restorableArchives,
  };
}

/**
 * Gets oldest archived memory (for cleanup decisions).
 */
export function getOldestArchive(): MemoryArchiveRecord | null {
  const all = Array.from(memoryArchive.values());
  if (all.length === 0) return null;

  return all.reduce((oldest, current) =>
    current.archivedAt < oldest.archivedAt ? current : oldest
  );
}

/**
 * Gets cleanup plan (archives ready to be permanently deleted).
 */
export function getCleanupPlan(): MemoryArchiveRecord[] {
  const now = Date.now();
  return Array.from(memoryArchive.values()).filter((a) => !a.restoreable || a.expiresAt < now);
}

/**
 * Gets archive report for admin.
 */
export function getArchiveReport(): {
  summary: ArchiveSummary;
  oldestArchive?: MemoryArchiveRecord;
  newestArchive?: MemoryArchiveRecord;
  cleanupReady: MemoryArchiveRecord[];
} {
  const all = Array.from(memoryArchive.values());

  return {
    summary: getArchiveSummary(),
    oldestArchive:
      all.length > 0 ? all.reduce((a, b) => (a.archivedAt < b.archivedAt ? a : b)) : undefined,
    newestArchive:
      all.length > 0 ? all.reduce((a, b) => (a.archivedAt > b.archivedAt ? a : b)) : undefined,
    cleanupReady: getCleanupPlan(),
  };
}
