import { redirect } from "next/navigation";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import VenueTicketBuilderShell from "@/components/tickets/VenueTicketBuilderShell";

// Rule 17: Only Venue, Promoter, and Admin accounts may access this page.
const AUTHORIZED_ROLES = new Set(['VENUE', 'PROMOTER', 'ADMIN', 'SUPERADMIN', 'OWNER']);

export default async function VenueTicketsCreatePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, getTmiAuth()]);

  if (!session) {
    redirect(`/auth?next=/venues/${slug}/tickets/create`);
  }
  const role = (session.user.role ?? '').toUpperCase();
  if (!AUTHORIZED_ROLES.has(role)) {
    redirect(`/venues/${slug}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#090712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <VenueTicketBuilderShell slug={slug} />
      </div>
    </main>
  );
}
