type ArchiveRow = {
  userId: string;
  overlayId: string;
  archivedAt: number;
  reason?: string;
};

const ARCHIVE: ArchiveRow[] = [];

export function archiveOverlay(userId: string, overlayId: string, reason?: string) {
  const exists = ARCHIVE.some((x) => x.userId === userId && x.overlayId === overlayId);
  if (exists) return { ok: true } as const;
  ARCHIVE.push({ userId, overlayId, archivedAt: Date.now(), reason });
  return { ok: true } as const;
}

export function restoreOverlay(userId: string, overlayId: string) {
  const i = ARCHIVE.findIndex((x) => x.userId === userId && x.overlayId === overlayId);
  if (i === -1) return { ok: false, reason: "NOT_ARCHIVED" } as const;
  ARCHIVE.splice(i, 1);
  return { ok: true } as const;
}

export function listArchived(userId: string) {
  return ARCHIVE.filter((x) => x.userId === userId);
}

export function permanentDelete(userId: string, overlayId: string) {
  const i = ARCHIVE.findIndex((x) => x.userId === userId && x.overlayId === overlayId);
  if (i !== -1) ARCHIVE.splice(i, 1);
  return { ok: true } as const;
}
