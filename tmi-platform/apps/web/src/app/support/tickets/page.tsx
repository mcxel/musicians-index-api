import AiSupportDraftReplyEngine from '@/lib/support/AiSupportDraftReplyEngine';
import SupportReplyEngine from '@/lib/support/SupportReplyEngine';
import SupportRoutingEngine from '@/lib/support/SupportRoutingEngine';
import SupportTicketEngine from '@/lib/support/SupportTicketEngine';
import Link from 'next/link';

export default function SupportTicketsPage() {
  if (SupportTicketEngine.listTickets().length === 0) {
    const created = SupportTicketEngine.createTicket({
      requesterEmail: 'fan-smoke@example.com',
      requesterName: 'Fan Smoke',
      subject: 'Payment failed but pass should remain active',
      message: 'Billing failed and I want to confirm my account is not downgraded.',
      hasPaymentFailure: true,
    });

    const draft = AiSupportDraftReplyEngine.draft({
      category: created.category,
      priority: created.priority,
      customerName: created.requesterName,
      ticketId: created.id,
    });

    const replyDraft = SupportReplyEngine.createDraft({
      ticketId: created.id,
      to: created.requesterEmail,
      subject: draft.subject,
      body: draft.body,
      createdBy: 'ai-support-assistant',
      isTransactionalSafe: false,
    });
    SupportReplyEngine.approveDraft(replyDraft.id, 'support-admin');
  }

  const tickets = SupportTicketEngine.listTickets();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1>Support Tickets</h1>
      <p>Ticket workflow with AI draft assistance and human approval guardrails.</p>

      {tickets.map((ticket) => {
        const route = SupportRoutingEngine.routeTicket(ticket);
        return (
          <div
            key={ticket.id}
            style={{
              marginTop: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: 10,
            }}
          >
            <div>{ticket.subject}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              {ticket.category} | {ticket.priority} | team {route.team}
            </div>
            <div style={{ fontSize: 12, color: route.escalationRequired ? '#FF6B6B' : '#00FF88' }}>
              {route.nextAction}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 16 }}>
        <Link href="/support" style={{ color: '#00FFFF', textDecoration: 'none' }}>
          ← Back to Support Home
        </Link>
      </div>
    </main>
  );
}
