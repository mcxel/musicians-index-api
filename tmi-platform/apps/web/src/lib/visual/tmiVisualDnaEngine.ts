export type TmiVisualDnaRecord = {
  issueId: string;
  winningShapes: string[];
  losingShapes: string[];
  votedColors: string[];
  votedTransitions: string[];
  votedLayouts: string[];
  updatedAt: number;
};

const VISUAL_DNA = new Map<string, TmiVisualDnaRecord>();

export function upsertVisualDna(record: Omit<TmiVisualDnaRecord, "updatedAt">): TmiVisualDnaRecord {
  const next: TmiVisualDnaRecord = {
    ...record,
    updatedAt: Date.now(),
  };
  VISUAL_DNA.set(record.issueId, next);
  return next;
}

export function listVisualDna(): TmiVisualDnaRecord[] {
  return [...VISUAL_DNA.values()];
}
