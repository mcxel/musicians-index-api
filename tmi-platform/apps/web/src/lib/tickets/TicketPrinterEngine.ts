import type { TicketRecord } from "@/lib/tickets/ticketCore";

export function TicketPrinterEngine(ticket: TicketRecord) {
  const basePayload = {
    ticketId: ticket.id,
    ownerId: ticket.ownerId,
    eventSlug: ticket.template.eventSlug,
    venueSlug: ticket.template.venueSlug,
    tier: ticket.template.tier,
    seat: ticket.seat,
    branding: ticket.branding,
    barcode: ticket.barcode,
  };

  return {
    pdf: {
      mimeType: "application/pdf",
      fileName: `${ticket.id}.pdf`,
      payload: Buffer.from(JSON.stringify(basePayload)).toString("base64"),
    },
    image: {
      mimeType: "image/png",
      fileName: `${ticket.id}.png`,
      payload: Buffer.from(JSON.stringify({ ...basePayload, render: "image" })).toString("base64"),
    },
    nft: {
      mimeType: "application/json",
      tokenName: `TicketNFT-${ticket.id}`,
      metadata: {
        ...basePayload,
        hologramNftOverlay: ticket.branding.hologramNftOverlay,
      },
    },
    mobileWallet: {
      passType: "TMI_WALLET_PASS",
      payload: {
        id: ticket.id,
        barcode: ticket.barcode.barcodeValue,
        qr: ticket.barcode.qrValue,
        tier: ticket.template.tier,
      },
    },
  };
}
