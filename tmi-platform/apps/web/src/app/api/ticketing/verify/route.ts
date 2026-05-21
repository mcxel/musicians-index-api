import { NextRequest, NextResponse } from "next/server";
import { checkIn } from "@/lib/ticketing/TicketCheckInEngine";
import { TicketQRValidationEngine } from "@/lib/ticketing/TicketQRValidationEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      qrCode?: string;
      ticketId?: string;
      userId?: string;
      venueId?: string;
      gateId?: string;
    };

    const { qrCode, ticketId, userId, venueId, gateId } = body;

    // QR scan path — used by physical scanners
    if (qrCode && venueId) {
      const result = await TicketQRValidationEngine.validateQRAtEntry(
        qrCode,
        venueId,
        gateId ?? "gate-default",
        userId ?? "scanner",
      );
      const granted = result.validationStatus === "valid";
      return NextResponse.json(
        { verified: granted, status: result.validationStatus, reason: result.reason, ticketId: result.ticketId },
        { status: granted ? 200 : 403 },
      );
    }

    // Direct check-in path — used by the web app
    if (ticketId && userId) {
      const record = checkIn(ticketId, userId, "qr", { gateId });
      const granted = record.status === "checked-in";
      return NextResponse.json(
        { verified: granted, status: record.status, checkInId: record.checkInId, eventId: record.eventId },
        { status: granted ? 200 : record.status === "already-used" ? 409 : 403 },
      );
    }

    return NextResponse.json({ error: "Provide qrCode+venueId or ticketId+userId" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gate scanner fault" }, { status: 500 });
  }
}
