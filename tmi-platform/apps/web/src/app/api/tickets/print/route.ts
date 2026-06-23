import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId') || `TMI-${Date.now().toString(36).toUpperCase()}`;
  const venueId = searchParams.get('venue') || 'World Concert Arena';

  // QR code points to the real verify page so venue staff can scan at the door.
  const verifyUrl = `${req.nextUrl.origin}/ticket/verify/${encodeURIComponent(ticketId)}`;

  // Thermal Printer Output Engine
  // Formatted for 80mm ESC/POS Brick and Mortar Printers
  const ticketPayload = {
    platform: "THE MUSICIAN'S INDEX (TMI)",
    venue: venueId,
    event: "LIVE MAIN STAGE",
    ticketId: ticketId,
    barcodeType: "QR_CODE",
    barcodeData: verifyUrl,
    issuedAt: new Date().toISOString(),
    advisory: "Valid for single entry. TMI Platform Rule 17 Enforced.",
    thermalPrintFormat: {
      width: "80mm",
      encoding: "base64",
      data: Buffer.from(`TMI TICKET\nID: ${ticketId}\nVENUE: ${venueId}\nVERIFY: ${verifyUrl}`).toString('base64')
    }
  };

  return NextResponse.json({ success: true, payload: ticketPayload }, { status: 200 });
}