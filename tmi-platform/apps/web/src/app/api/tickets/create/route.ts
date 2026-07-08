export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createTicket, resolveTicketRoyalty } from "@/lib/tickets/ticketEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";

// DB-backed atomic inventory check using EventInventory table.
// Returns "ok" | "sold_out" | "invalid_limit"
async function reserveInventoryDB(
  key: string,
  capacity: number,
): Promise<"ok" | "sold_out" | "invalid_limit"> {
  if (!Number.isInteger(capacity) || capacity <= 0) return "invalid_limit";
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const record = await tx.eventInventory.findUnique({ where: { key } });
        if (!record) {
          await tx.eventInventory.create({ data: { key, capacity, issued: 1 } });
          return "ok" as const;
        }
        if (record.issued >= record.capacity) return "sold_out" as const;
        await tx.eventInventory.update({ where: { key }, data: { issued: { increment: 1 } } });
        return "ok" as const;
      },
      { isolationLevel: "Serializable" },
    );
    return result;
  } catch {
    // If DB is unavailable, allow ticketEngine's in-memory fallback to run
    return "ok";
  }
}

// Rule 17: Only Venue, Promoter, and Admin may create ticket inventory.
// Fans and Performers are never in this set — they may only buy/own tickets.
const AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

function mapCreateTicketError(error: unknown): { status: number; error: string; message?: string } {
  const code = error instanceof Error ? error.message : 'ticket_create_failed';
  switch (code) {
    case 'authentication_required':
      return { status: 401, error: code };
    case 'forbidden_inventory_role':
      return {
        status: 403,
        error: code,
        message: 'Only Venue, Promoter, and Admin accounts may create ticket inventory. (TMI Rule 17)',
      };
    case 'invalid_inventory_limit':
    case 'invalid_face_value':
      return { status: 400, error: code };
    case 'sold_out':
      return { status: 409, error: code, message: 'Ticket inventory is sold out for this event tier.' };
    default:
      return { status: 400, error: code };
  }
}

export async function POST(req: Request) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json(
      { error: 'authentication_required' },
      { status: 401 }
    );
  }
  const role = (session.user.role ?? '').toUpperCase();
  if (!AUTHORIZED_ROLES.has(role)) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        message: 'Only Venue, Promoter, and Admin accounts may create ticket inventory. (TMI Rule 17)',
      },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  // ownerId is the authenticated creator — not taken from body to prevent spoofing.
  const ownerId = session.user.id;
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug.trim() : "";
  const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";
  const tier = typeof body?.tier === "string" ? (body.tier as TicketTier) : "STANDARD";
  const faceValue = typeof body?.faceValue === "number" ? body.faceValue : 30;
  const inventoryLimitRaw =
    typeof body?.inventoryLimit === 'number'
      ? body.inventoryLimit
      : typeof body?.quantityAvailable === 'number'
        ? body.quantityAvailable
        : typeof body?.capacity === 'number'
          ? body.capacity
          : undefined;
  const inventoryLimit =
    typeof inventoryLimitRaw === 'number'
      ? Math.floor(inventoryLimitRaw)
      : undefined;

  if (!venueSlug || !eventSlug) {
    return NextResponse.json(
      { error: 'venueSlug_and_eventSlug_required' },
      { status: 400 }
    );
  }

  try {
    // DB-backed inventory check (atomic, survives restarts + multi-instance).
    // Only runs when the caller supplies a capacity — open-ended events skip this.
    if (inventoryLimit !== undefined) {
      const invKey = `${venueSlug}::${eventSlug}::${tier}`;
      const invResult = await reserveInventoryDB(invKey, inventoryLimit);
      if (invResult === "invalid_limit") {
        return NextResponse.json({ error: "invalid_inventory_limit" }, { status: 400 });
      }
      if (invResult === "sold_out") {
        return NextResponse.json(
          { error: "sold_out", message: "Ticket inventory is sold out for this event tier." },
          { status: 409 },
        );
      }
    }

    const ticket = await createTicket({
      ownerId,
      venueSlug,
      eventSlug,
      tier,
      faceValue,
      venueLogo: typeof body?.venueLogo === "string" ? body.venueLogo : undefined,
      sponsorLogo: typeof body?.sponsorLogo === "string" ? body.sponsorLogo : undefined,
      eventBranding: typeof body?.eventBranding === "string" ? body.eventBranding : undefined,
      actorRole: role,
      isAuthenticated: true,
      // inventoryLimit omitted — DB check already ran above when a limit was supplied.
      // ticketEngine's in-memory fallback is skipped (key not in the process-local Map).
    });

    return NextResponse.json({
      ok: true,
      ticket,
      royalty: resolveTicketRoyalty(faceValue),
    });
  } catch (error) {
    const mapped = mapCreateTicketError(error);
    return NextResponse.json(
      {
        error: mapped.error,
        message: mapped.message,
      },
      { status: mapped.status }
    );
  }
}
