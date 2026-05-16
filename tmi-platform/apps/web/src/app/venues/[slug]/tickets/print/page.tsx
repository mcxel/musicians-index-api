import VenueTicketPrintLoader from "@/components/tickets/VenueTicketPrintLoader";

export default async function VenueTicketsPrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#090712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <VenueTicketPrintLoader slug={slug} />
      </div>
    </main>
  );
}
