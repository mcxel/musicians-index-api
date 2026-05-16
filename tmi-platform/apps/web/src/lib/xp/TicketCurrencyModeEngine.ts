/**
 * TicketCurrencyModeEngine.ts
 *
 * Manages ticket payment modes: cash-only, XP-only, hybrid (cash + XP mix).
 * Purpose: Flexible ticketing to support various fan purchasing behaviors.
 */

export interface TicketCurrencyMode {
  modeId: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  cashPrice: number;
  xpPrice: number;
  mode: 'cash-only' | 'xp-only' | 'hybrid';
  hybridRatio?: number; // percentage of XP allowed in hybrid, e.g., 0.5 = 50% XP
  totalTicketsAvailable: number;
  ticketsSoldCash: number;
  ticketsSoldXP: number;
  ticketsSoldHybrid: number;
  createdAt: number;
  eventDate: number;
}

// In-memory registry
const ticketCurrencyModes = new Map<string, TicketCurrencyMode>();
let modeCounter = 0;

/**
 * Creates ticket currency mode for event.
 */
export function createTicketCurrencyMode(input: {
  eventId: string;
  eventName: string;
  ticketType: string;
  cashPrice: number;
  xpPrice: number;
  mode: 'cash-only' | 'xp-only' | 'hybrid';
  hybridRatio?: number; // 0.0 - 1.0
  totalTicketsAvailable: number;
  eventDate: number;
}): string {
  const modeId = `mode-${modeCounter++}`;

  const currencyMode: TicketCurrencyMode = {
    modeId,
    eventId: input.eventId,
    eventName: input.eventName,
    ticketType: input.ticketType,
    cashPrice: input.cashPrice,
    xpPrice: input.xpPrice,
    mode: input.mode,
    hybridRatio: input.hybridRatio ?? 0.5,
    totalTicketsAvailable: input.totalTicketsAvailable,
    ticketsSoldCash: 0,
    ticketsSoldXP: 0,
    ticketsSoldHybrid: 0,
    createdAt: Date.now(),
    eventDate: input.eventDate,
  };

  ticketCurrencyModes.set(modeId, currencyMode);
  return modeId;
}

/**
 * Records ticket sale.
 */
export function recordTicketSale(modeId: string, paymentType: 'cash' | 'xp' | 'hybrid'): void {
  const mode = ticketCurrencyModes.get(modeId);
  if (!mode) return;

  if (paymentType === 'cash' && mode.mode !== 'xp-only') {
    mode.ticketsSoldCash += 1;
  } else if (paymentType === 'xp' && mode.mode !== 'cash-only') {
    mode.ticketsSoldXP += 1;
  } else if (paymentType === 'hybrid' && mode.mode === 'hybrid') {
    mode.ticketsSoldHybrid += 1;
  }
}

/**
 * Gets currency mode.
 */
export function getTicketCurrencyMode(modeId: string): TicketCurrencyMode | null {
  return ticketCurrencyModes.get(modeId) ?? null;
}

/**
 * Lists modes for event.
 */
export function listTicketCurrencyModesForEvent(eventId: string): TicketCurrencyMode[] {
  return Array.from(ticketCurrencyModes.values()).filter((m) => m.eventId === eventId);
}

/**
 * Gets ticket availability.
 */
export function getTicketAvailability(modeId: string): {
  totalAvailable: number;
  totalSold: number;
  remainingCapacity: number;
  capacityPercentage: number;
} | null {
  const mode = ticketCurrencyModes.get(modeId);
  if (!mode) return null;

  const totalSold = mode.ticketsSoldCash + mode.ticketsSoldXP + mode.ticketsSoldHybrid;
  const remaining = mode.totalTicketsAvailable - totalSold;
  const percentage = (totalSold / mode.totalTicketsAvailable) * 100;

  return {
    totalAvailable: mode.totalTicketsAvailable,
    totalSold,
    remainingCapacity: remaining,
    capacityPercentage: Math.round(percentage),
  };
}

/**
 * Gets sales breakdown for mode.
 */
export function getSalesBreakdown(modeId: string): {
  cashRevenue: number;
  xpEquivalent: number;
  hybridMix: number;
  totalTickets: number;
} | null {
  const mode = ticketCurrencyModes.get(modeId);
  if (!mode) return null;

  return {
    cashRevenue: mode.ticketsSoldCash * mode.cashPrice,
    xpEquivalent: mode.ticketsSoldXP * mode.xpPrice,
    hybridMix: mode.ticketsSoldHybrid,
    totalTickets: mode.ticketsSoldCash + mode.ticketsSoldXP + mode.ticketsSoldHybrid,
  };
}

/**
 * Gets report on all modes.
 */
export function getTicketCurrencyReport(): {
  totalModes: number;
  cashOnlyModes: number;
  xpOnlyModes: number;
  hybridModes: number;
  totalTicketsSold: number;
} {
  const all = Array.from(ticketCurrencyModes.values());

  return {
    totalModes: all.length,
    cashOnlyModes: all.filter((m) => m.mode === 'cash-only').length,
    xpOnlyModes: all.filter((m) => m.mode === 'xp-only').length,
    hybridModes: all.filter((m) => m.mode === 'hybrid').length,
    totalTicketsSold: all.reduce(
      (sum, m) => sum + m.ticketsSoldCash + m.ticketsSoldXP + m.ticketsSoldHybrid,
      0
    ),
  };
}
