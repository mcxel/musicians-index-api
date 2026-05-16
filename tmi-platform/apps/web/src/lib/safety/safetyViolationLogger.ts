export type SafetyViolation = {
  id: string;
  source: string;
  actorId: string;
  actorAgeClass: "minor" | "adult" | "unknown" | "test_minor" | "test_adult";
  action: string;
  target: string;
  reason: string;
  blocked: boolean;
  privateDataExposed: false;
  timestamp: number;
};

const violationLog: SafetyViolation[] = [];
let violationCounter = 1;

export function logSafetyViolation(
  input: Omit<SafetyViolation, "id" | "timestamp" | "privateDataExposed">
): SafetyViolation {
  const record: SafetyViolation = {
    ...input,
    privateDataExposed: false,
    id: `SAFE-VIOL-${String(violationCounter++).padStart(6, "0")}`,
    timestamp: Date.now(),
  };
  violationLog.push(record);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:safety-violation", { detail: record }));
  }

  return record;
}

export function getSafetyViolationLog(): SafetyViolation[] {
  return [...violationLog];
}

export function getAdultAccessBlockLog(): SafetyViolation[] {
  return violationLog.filter((v) => v.blocked && (v.actorAgeClass === "adult" || v.actorAgeClass === "test_adult"));
}
