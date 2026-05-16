import VenueTicketBuilderShell from "@/components/tickets/VenueTicketBuilderShell";

export default async function VenueTicketsCreatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#090712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <VenueTicketBuilderShell slug={slug} />
      </div>
    </main>
  );
}
