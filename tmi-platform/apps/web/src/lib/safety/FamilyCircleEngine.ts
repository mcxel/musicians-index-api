import { isFamilyVerificationApproved } from "@/lib/safety/FamilyVerificationEngine";

export type FamilyCircleMember = {
  teenUserId: string;
  adultUserId: string;
  addedAt: number;
  active: boolean;
};

const familyCircleStore = new Map<string, FamilyCircleMember[]>();

function getTeenFamily(teenUserId: string): FamilyCircleMember[] {
  return familyCircleStore.get(teenUserId) ?? [];
}

export function addFamilyCircleMember(teenUserId: string, adultUserId: string): { ok: boolean; reason: string } {
  if (!isFamilyVerificationApproved(teenUserId, adultUserId)) {
    return { ok: false, reason: "family verification must be approved before adding family circle members" };
  }

  const members = getTeenFamily(teenUserId);
  if (members.some((member) => member.adultUserId === adultUserId && member.active)) {
    return { ok: true, reason: "already in family circle" };
  }

  members.push({
    teenUserId,
    adultUserId,
    addedAt: Date.now(),
    active: true,
  });
  familyCircleStore.set(teenUserId, members);
  return { ok: true, reason: "family member added" };
}

export function removeFamilyCircleMember(teenUserId: string, adultUserId: string): { ok: boolean; reason: string } {
  const members = getTeenFamily(teenUserId);
  const match = members.find((member) => member.adultUserId === adultUserId && member.active);
  if (!match) return { ok: false, reason: "member not found" };
  match.active = false;
  familyCircleStore.set(teenUserId, members);
  return { ok: true, reason: "family member removed" };
}

export function isFamilyCircleMember(teenUserId: string, adultUserId: string): boolean {
  return getTeenFamily(teenUserId).some((member) => member.adultUserId === adultUserId && member.active);
}

export function listFamilyCircleMembers(teenUserId: string): FamilyCircleMember[] {
  return getTeenFamily(teenUserId).filter((member) => member.active);
}
