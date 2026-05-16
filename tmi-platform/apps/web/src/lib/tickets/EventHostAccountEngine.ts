/**
 * EventHostAccountEngine
 * Unified host account model for universal event ticketing.
 * Hosts can be venue, promoter, organization, tournament host,
 * sports host, private host, custom host, or event producer.
 */

export type EventHostType =
  | "venue"
  | "promoter"
  | "organization"
  | "tournament-host"
  | "sports-host"
  | "private-host"
  | "custom-host"
  | "event-producer";

export type EventHostAccount = {
  hostId: string;
  hostType: EventHostType;
  displayName: string;
  hostSlug: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  city?: string;
  verified: boolean;
  supportContactName?: string;
  createdAtMs: number;
  updatedAtMs: number;
};

const hostAccounts: EventHostAccount[] = [];
let hostCounter = 0;

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createEventHostAccount(input: {
  hostType: EventHostType;
  displayName: string;
  email: string;
  country: string;
  phone?: string;
  region?: string;
  city?: string;
  supportContactName?: string;
}): EventHostAccount {
  const now = Date.now();
  const host: EventHostAccount = {
    hostId: `host-${++hostCounter}`,
    hostType: input.hostType,
    displayName: input.displayName,
    hostSlug: toSlug(input.displayName),
    email: input.email,
    phone: input.phone,
    country: input.country,
    region: input.region,
    city: input.city,
    verified: false,
    supportContactName: input.supportContactName,
    createdAtMs: now,
    updatedAtMs: now,
  };

  hostAccounts.unshift(host);
  return host;
}

export function verifyEventHostAccount(hostId: string): EventHostAccount {
  const host = hostAccounts.find((item) => item.hostId === hostId);
  if (!host) throw new Error(`Host ${hostId} not found`);
  host.verified = true;
  host.updatedAtMs = Date.now();
  return host;
}

export function listEventHostAccounts(filters?: {
  hostType?: EventHostType;
  country?: string;
  verified?: boolean;
}): EventHostAccount[] {
  return hostAccounts.filter((host) => {
    if (filters?.hostType && host.hostType !== filters.hostType) return false;
    if (filters?.country && host.country.toLowerCase() !== filters.country.toLowerCase()) return false;
    if (filters?.verified !== undefined && host.verified !== filters.verified) return false;
    return true;
  });
}

export function getEventHostById(hostId: string): EventHostAccount | null {
  return hostAccounts.find((host) => host.hostId === hostId) ?? null;
}

export function getEventHostBySlug(hostSlug: string): EventHostAccount | null {
  return hostAccounts.find((host) => host.hostSlug === hostSlug) ?? null;
}
