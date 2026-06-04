import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId') || `TMI-${Date.now().toString(36).toUpperCase()}`;
  const venueId = searchParams.get('venue') || 'World Concert Arena';

  // Thermal Printer Output Engine
  // Formatted for 80mm ESC/POS Brick and Mortar Printers
  const ticketPayload = {
    platform: "THE MUSICIAN'S INDEX (TMI)",
    venue: venueId,
    event: "LIVE MAIN STAGE",
    ticketId: ticketId,
    barcodeType: "QR_CODE",
    barcodeData: `tmi://verify/${ticketId}`,
    issuedAt: new Date().toISOString(),
    advisory: "Valid for single entry. TMI Platform Law #5 Enforced.",
    thermalPrintFormat: {
      width: "80mm",
      encoding: "base64",
      // Base64 representation of a standard 80mm thermal print payload string
      data: Buffer.from(`TMI TICKET\nID: ${ticketId}\nVENUE: ${venueId}`).toString('base64')
    }
  };

  return NextResponse.json({ success: true, payload: ticketPayload }, { status: 200 });
}