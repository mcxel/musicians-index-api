import VenueEntryChainPanel from "@/components/tickets/VenueEntryChainPanel";

export default async function VenueTicketsValidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#090712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <VenueEntryChainPanel slug={slug} />
      </div>
    </main>
  );
}
