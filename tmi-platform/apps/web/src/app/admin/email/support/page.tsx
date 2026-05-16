import SupportReplyEngine from '@/lib/support/SupportReplyEngine';
import SupportTicketEngine from '@/lib/support/SupportTicketEngine';
import Link from 'next/link';

export default function AdminEmailSupportPage() {
  if (SupportTicketEngine.listTickets().length === 0) {
    const ticket = SupportTicketEngine.createTicket({
      requesterEmail: 'support-smoke@example.com',
      requesterName: 'Support Smoke',
      subject: 'Ticket QR not loading',
      message: 'My ticket QR does not render in wallet and print page.',
    });

    const draft = SupportReplyEngine.createDraft({
      ticketId: ticket.id,
      to: ticket.requesterEmail,
      subject: `Support Update: ${ticket.id}`,
      body: 'We are reissuing your ticket QR and validating wallet delivery.',
      createdBy: 'admin-support',
      isTransactionalSafe: false,
    });
    SupportReplyEngine.approveDraft(draft.id, 'admin-support-lead');
  }

  const tickets = SupportTicketEngine.listTickets();
  const drafts = SupportReplyEngine.listDrafts();

  return (
    <main style={{ minHeight: '100vh', padding: 24, background: '#050510', color: '#fff' }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Support Email Lane</h1>
      <p>AI-assisted draft flow with required human approval for non-transactional replies.</p>

      <h2 style={{ marginTop: 16, fontSize: 18 }}>Tickets</h2>
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            marginTop: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{ticket.subject}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            {ticket.category} | {ticket.priority} | {ticket.status}
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 16, fontSize: 18 }}>Reply Drafts</h2>
      {drafts.map((draft) => (
        <div
          key={draft.id}
          style={{
            marginTop: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{draft.subject}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Approved: {draft.approvedAt ? 'yes' : 'no'} | Sent: {draft.sentAt ? 'yes' : 'no'}
          </div>
        </div>
      ))}
    </main>
  );
}
