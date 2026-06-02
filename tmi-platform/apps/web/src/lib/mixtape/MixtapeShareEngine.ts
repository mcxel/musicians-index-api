/**
 * MixtapeShareEngine — packages media assets into shareable mixtape objects.
 *
 * Three send modes:
 *   "for-someone"  — personal gift, recipient sees a message
 *   "for-the-crowd" — public share, broadcast to followers/room
 *   "for-myself"   — private collection / saved playlist
 */

export type MixtapeSendMode = "for-someone" | "for-the-crowd" | "for-myself";

export interface MixtapeTrack {
  id: string;
  title: string;
  artist: string;
  type: string;
  durationSecs?: number;
  url: string;
  accentColor?: string;
}

export interface Mixtape {
  id: string;
  title: string;
  curatorId: string;
  curatorName: string;
  sendMode: MixtapeSendMode;
  message?: string;
  recipientName?: string;
  tracks: MixtapeTrack[];
  coverColor: string;
  createdAt: string;
  shareUrl: string;
  plays: number;
  saves: number;
}

export interface CreateMixtapeRequest {
  curatorId: string;
  curatorName: string;
  title: string;
  sendMode: MixtapeSendMode;
  tracks: MixtapeTrack[];
  message?: string;
  recipientName?: string;
  coverColor?: string;
}

// ── In-memory store (replace with DB post-launch) ────────────────────────────
const MIXTAPES = new Map<string, Mixtape>();

function generateId(): string {
  return `mix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const MODE_COLORS: Record<MixtapeSendMode, string> = {
  "for-someone":    "#FF2DAA",
  "for-the-crowd":  "#00FFFF",
  "for-myself":     "#AA2DFF",
};

export const MixtapeShareEngine = {
  create(req: CreateMixtapeRequest): Mixtape {
    const id = generateId();
    const mixtape: Mixtape = {
      id,
      title:         req.title,
      curatorId:     req.curatorId,
      curatorName:   req.curatorName,
      sendMode:      req.sendMode,
      message:       req.message,
      recipientName: req.recipientName,
      tracks:        req.tracks,
      coverColor:    req.coverColor ?? MODE_COLORS[req.sendMode],
      createdAt:     new Date().toISOString(),
      shareUrl:      `/mixtape/${id}`,
      plays:         0,
      saves:         0,
    };
    MIXTAPES.set(id, mixtape);
    return mixtape;
  },

  get(id: string): Mixtape | null {
    return MIXTAPES.get(id) ?? null;
  },

  getByCurator(curatorId: string): Mixtape[] {
    return [...MIXTAPES.values()].filter(m => m.curatorId === curatorId);
  },

  recordPlay(id: string): void {
    const m = MIXTAPES.get(id);
    if (m) MIXTAPES.set(id, { ...m, plays: m.plays + 1 });
  },

  recordSave(id: string): void {
    const m = MIXTAPES.get(id);
    if (m) MIXTAPES.set(id, { ...m, saves: m.saves + 1 });
  },

  getAll(): Mixtape[] {
    return [...MIXTAPES.values()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
