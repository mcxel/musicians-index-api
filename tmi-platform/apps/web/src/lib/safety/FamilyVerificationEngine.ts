export type FamilyVerificationStatus = "pending" | "approved" | "rejected";

export type FamilyVerificationRecord = {
  id: string;
  teenUserId: string;
  adultUserId: string;
  guardianEmail: string;
  status: FamilyVerificationStatus;
  requestedAt: number;
  resolvedAt?: number;
};

let verificationCounter = 0;
const verificationStore = new Map<string, FamilyVerificationRecord>();

function createVerificationId(): string {
  verificationCounter += 1;
  return `family-verification-${verificationCounter}`;
}

export function requestFamilyVerification(teenUserId: string, adultUserId: string, guardianEmail: string): FamilyVerificationRecord {
  const record: FamilyVerificationRecord = {
    id: createVerificationId(),
    teenUserId,
    adultUserId,
    guardianEmail,
    status: "pending",
    requestedAt: Date.now(),
  };

  verificationStore.set(record.id, record);
  return record;
}

export function approveFamilyVerification(requestId: string): FamilyVerificationRecord | null {
  const record = verificationStore.get(requestId);
  if (!record) return null;
  record.status = "approved";
  record.resolvedAt = Date.now();
  return record;
}

export function rejectFamilyVerification(requestId: string): FamilyVerificationRecord | null {
  const record = verificationStore.get(requestId);
  if (!record) return null;
  record.status = "rejected";
  record.resolvedAt = Date.now();
  return record;
}

export function isFamilyVerificationApproved(teenUserId: string, adultUserId: string): boolean {
  for (const record of verificationStore.values()) {
    if (record.teenUserId === teenUserId && record.adultUserId === adultUserId && record.status === "approved") {
      return true;
    }
  }
  return false;
}

export function listFamilyVerificationsForTeen(teenUserId: string): FamilyVerificationRecord[] {
  return Array.from(verificationStore.values()).filter((record) => record.teenUserId === teenUserId);
}
