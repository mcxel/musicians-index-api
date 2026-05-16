import { getSafetyViolationLog } from "./safetyViolationLogger";

export function getAdultAccessBlockLogEntries() {
  return getSafetyViolationLog().filter((v) =>
    v.blocked && (v.actorAgeClass === "adult" || v.actorAgeClass === "test_adult" || v.actorAgeClass === "unknown")
  );
}
