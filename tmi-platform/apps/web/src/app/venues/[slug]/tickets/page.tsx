import VenueWorldShell from "@/components/venues/VenueWorldShell";
import { TicketWalletPanel } from "@/components/tickets/TicketWalletPanel";
import VenueTicketBrandingPanel from "@/components/tickets/VenueTicketBrandingPanel";

export default function VenueTicketsPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
        <VenueWorldShell slug={params.slug} focus="tickets" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
          <TicketWalletPanel tickets={[]} onTransfer={() => {}} onRefund={() => {}} />
          <VenueTicketBrandingPanel venueId={params.slug} />
        </div>
      </div>
    </main>
  );
}
