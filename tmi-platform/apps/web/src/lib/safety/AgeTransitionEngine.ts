export type TeenTransitionStatus = "not_required" | "pending_review" | "eligible_to_transition" | "transitioned";

export type TeenTransitionRecord = {
  userId: string;
  age: number;
  status: TeenTransitionStatus;
  updatedAt: number;
};

const transitionStore = new Map<string, TeenTransitionRecord>();

export function upsertTeenTransition(userId: string, age: number): TeenTransitionRecord {
  const current = transitionStore.get(userId);

  let status: TeenTransitionStatus = "not_required";
  if (age >= 18 && age < 19) status = "pending_review";
  if (age >= 19) status = "eligible_to_transition";

  const next: TeenTransitionRecord = {
    userId,
    age,
    status,
    updatedAt: Date.now(),
  };

  transitionStore.set(userId, next);
  return current?.status === "transitioned" ? current : next;
}

export function completeTeenTransition(userId: string): TeenTransitionRecord | null {
  const record = transitionStore.get(userId);
  if (!record) return null;
  record.status = "transitioned";
  record.updatedAt = Date.now();
  return record;
}

export function getTeenTransition(userId: string): TeenTransitionRecord | null {
  return transitionStore.get(userId) ?? null;
}
