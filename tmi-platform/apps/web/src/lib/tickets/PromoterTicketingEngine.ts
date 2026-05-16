/**
 * PromoterTicketingEngine
 * Promoter and producer enrollment for universal event ticket ownership.
 */

export type PromoterAccountType =
  | "promoter"
  | "event-producer"
  | "tournament-host"
  | "organization"
  | "artist"
  | "performer";

export type PromoterAccount = {
  promoterId: string;
  accountType: PromoterAccountType;
  displayName: string;
  promoterSlug: string;
  email: string;
  phone?: string;
  website?: string;
  verified: boolean;
  createdAtMs: number;
};

export type PromoterEventOwnership = {
  ownershipId: string;
  promoterId: string;
  eventId: string;
  role: "owner" | "co-promoter" | "producer";
  assignedAtMs: number;
};

const promoterAccounts: PromoterAccount[] = [];
const promoterOwnerships: PromoterEventOwnership[] = [];
let promoterCounter = 0;
let ownershipCounter = 0;

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createPromoterAccount(input: {
  accountType: PromoterAccountType;
  displayName: string;
  email: string;
  phone?: string;
  website?: string;
}): PromoterAccount {
  const account: PromoterAccount = {
    promoterId: `promoter-${++promoterCounter}`,
    accountType: input.accountType,
    displayName: input.displayName,
    promoterSlug: toSlug(input.displayName),
    email: input.email,
    phone: input.phone,
    website: input.website,
    verified: false,
    createdAtMs: Date.now(),
  };
  promoterAccounts.unshift(account);
  return account;
}

export function verifyPromoter(promoterId: string): PromoterAccount {
  const promoter = promoterAccounts.find((account) => account.promoterId === promoterId);
  if (!promoter) throw new Error(`Promoter ${promoterId} not found`);
  promoter.verified = true;
  return promoter;
}

export function assignPromoterToEvent(input: {
  promoterId: string;
  eventId: string;
  role: "owner" | "co-promoter" | "producer";
}): PromoterEventOwnership {
  const promoter = promoterAccounts.find((account) => account.promoterId === input.promoterId);
  if (!promoter) throw new Error(`Promoter ${input.promoterId} not found`);

  const ownership: PromoterEventOwnership = {
    ownershipId: `ownership-${++ownershipCounter}`,
    promoterId: input.promoterId,
    eventId: input.eventId,
    role: input.role,
    assignedAtMs: Date.now(),
  };
  promoterOwnerships.unshift(ownership);
  return ownership;
}

export function listPromoters(): PromoterAccount[] {
  return [...promoterAccounts];
}

export function listPromoterEvents(promoterId: string): PromoterEventOwnership[] {
  return promoterOwnerships.filter((ownership) => ownership.promoterId === promoterId);
}
