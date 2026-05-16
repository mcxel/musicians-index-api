export type MotionSlotStatus = "empty" | "queued" | "generating" | "approved" | "deployed" | "replaced";
export type MotionDuration = 2 | 4 | 5 | 6 | 7;

export type MotionSlotRecord = {
  slotId: string;
  route: string;
  component: string;
  owner: string;
  requiredDuration: MotionDuration;
  status: MotionSlotStatus;
  currentMotionId?: string;
  pendingMotionId?: string;
  replacementHistory: string[];
  updatedAt: number;
};

const motionSlots = new Map<string, MotionSlotRecord>();

export function registerMotionSlot(
  input: Omit<MotionSlotRecord, "replacementHistory" | "updatedAt"> & { replacementHistory?: string[] }
): MotionSlotRecord {
  const slot: MotionSlotRecord = {
    ...input,
    replacementHistory: input.replacementHistory ?? [],
    updatedAt: Date.now(),
  };
  motionSlots.set(slot.slotId, slot);
  return slot;
}

export function listMotionSlots(): MotionSlotRecord[] {
  return [...motionSlots.values()];
}

export function getMotionSlot(slotId: string): MotionSlotRecord | null {
  return motionSlots.get(slotId) ?? null;
}

export function updateMotionSlotStatus(slotId: string, status: MotionSlotStatus): MotionSlotRecord | null {
  const current = motionSlots.get(slotId);
  if (!current) return null;
  const next: MotionSlotRecord = { ...current, status, updatedAt: Date.now() };
  motionSlots.set(slotId, next);
  return next;
}
