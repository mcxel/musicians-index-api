/**
 * Collectible ticket mint — thin hook for Memory & Collectibles Engine (Phase 7.3)
 *
 * Maps a real TicketRecord → CreateCollectibleInput for kind=TICKET.
 * Returns null when ticket data is incomplete — never fabricates tickets.
 * Persistence is optional and server-side only.
 */

import type { TicketRecord } from "@/lib/tickets/ticketCore";
import type { CreateCollectibleInput } from "./collectiblesContracts";
import { createCollectible } from "./collectiblesPersistence";
import type { CollectibleMemoryRecord } from "./collectiblesContracts";

/**
 * Build a TICKET collectible create payload from a real ticket.
 * Does not persist — caller decides. Null if owner/id missing.
 */
export function toCollectibleTicketMemory(
  ticket: TicketRecord,
  extras?: {
    artworkUrl?: string;
    rarity?: string;
    eventId?: string;
    venueId?: string;
  },
): CreateCollectibleInput | null {
  if (!ticket?.id?.trim() || !ticket.ownerId?.trim()) return null;

  const eventSlug = ticket.template?.eventSlug?.trim();
  const venueSlug = ticket.template?.venueSlug?.trim();
  const artwork =
    extras?.artworkUrl?.trim() ||
    ticket.branding?.eventBranding?.trim() ||
    ticket.branding?.venueLogo?.trim() ||
    undefined;

  return {
    ownerId: ticket.ownerId,
    kind: "TICKET",
    title: eventSlug ? `Ticket · ${eventSlug}` : `Ticket · ${ticket.id}`,
    subtitle: [ticket.template?.tier, venueSlug].filter(Boolean).join(" · ") || undefined,
    ticketId: ticket.id,
    eventId: extras?.eventId?.trim() || eventSlug || undefined,
    venueId: extras?.venueId?.trim() || venueSlug || undefined,
    artworkUrl: artwork,
    mediaUrl: artwork,
    rarity: extras?.rarity,
    attendedAt: ticket.redeemed ? new Date().toISOString() : undefined,
    visibility: "private",
    captureDestination: "MEMORY_WALL",
  };
}

/**
 * Persist a collectible ticket keepsake when real ticket data exists.
 * Safe to call fire-and-forget after redeem/own — catches DB errors.
 */
export async function mintCollectibleTicketIfPossible(
  ticket: TicketRecord,
  extras?: Parameters<typeof toCollectibleTicketMemory>[1],
): Promise<CollectibleMemoryRecord | null> {
  const input = toCollectibleTicketMemory(ticket, extras);
  if (!input) return null;
  return createCollectible(input);
}
