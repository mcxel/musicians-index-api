export interface TicketOwnership {
  ticketId: string;
  eventId: string;
  venueId?: string;
  ownerId: string;
  originalOwnerId: string;
  tier: string;
  seatId?: string;
  acquiredAt: string;
  transferHistory: Array<{ from: string; to: string; at: string }>;
  isNFTBacked: boolean;
  nftTokenId?: string;
  burned: boolean;
}

const ownership = new Map<string, TicketOwnership>();

function gen(): string {
  return `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function issueTicket(
  ownerId: string,
  eventId: string,
  tier: string,
  opts: { venueId?: string; seatId?: string; isNFTBacked?: boolean; nftTokenId?: string } = {},
): TicketOwnership {
  const ticketId = gen();
  const record: TicketOwnership = {
    ticketId,
    eventId,
    venueId: opts.venueId,
    ownerId,
    originalOwnerId: ownerId,
    tier,
    seatId: opts.seatId,
    acquiredAt: new Date().toISOString(),
    transferHistory: [],
    isNFTBacked: opts.isNFTBacked ?? false,
    nftTokenId: opts.nftTokenId,
    burned: false,
  };
  ownership.set(ticketId, record);
  return record;
}

export function getTicket(ticketId: string): TicketOwnership | null {
  return ownership.get(ticketId) ?? null;
}

export function getTicketsByOwner(ownerId: string): TicketOwnership[] {
  return [...ownership.values()].filter((t) => t.ownerId === ownerId && !t.burned);
}

export function getTicketsByEvent(eventId: string): TicketOwnership[] {
  return [...ownership.values()].filter((t) => t.eventId === eventId && !t.burned);
}

export function transferOwnership(ticketId: string, toUserId: string): TicketOwnership | null {
  const ticket = ownership.get(ticketId);
  if (!ticket || ticket.burned) return null;
  const updated: TicketOwnership = {
    ...ticket,
    ownerId: toUserId,
    transferHistory: [...ticket.transferHistory, { from: ticket.ownerId, to: toUserId, at: new Date().toISOString() }],
  };
  ownership.set(ticketId, updated);
  return updated;
}

export function burnTicket(ticketId: string): boolean {
  const ticket = ownership.get(ticketId);
  if (!ticket) return false;
  ownership.set(ticketId, { ...ticket, burned: true });
  return true;
}

export function verifyOwnership(ticketId: string, userId: string): boolean {
  const ticket = ownership.get(ticketId);
  return !!(ticket && ticket.ownerId === userId && !ticket.burned);
}

export function getTransferCount(ticketId: string): number {
  return (ownership.get(ticketId)?.transferHistory.length) ?? 0;
}
