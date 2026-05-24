// lib/mail/SupportMailer.ts — Support ticket flow with Michael Charlie approval chain

import { trigger } from "./MailTriggerEngine";
import { sendMail } from "./TMIMailEngine";

export type SupportTicketStatus = "open" | "pending_approval" | "approved" | "resolved" | "rejected";

export interface SupportTicket {
  id: string;
  userId: string;
  email: string;
  userName: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: number;
  resolvedAt?: number;
  approvedBy?: string;
  resolution?: string;
}

// In-memory ticket store — replace with DB in production
const tickets = new Map<string, SupportTicket>();

function generateTicketId(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

const OVERSEER_EMAIL = process.env.OVERSEER_EMAIL ?? "michael@themusiciansindex.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@themusiciansindex.com";

export async function openSupportTicket(params: {
  userId: string;
  email: string;
  userName: string;
  subject: string;
  message: string;
}): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: generateTicketId(),
    userId: params.userId,
    email: params.email,
    userName: params.userName,
    subject: params.subject,
    message: params.message,
    status: "open",
    createdAt: Date.now(),
  };

  tickets.set(ticket.id, ticket);

  // Send confirmation to user
  await trigger("SUPPORT_TICKET_OPENED", {
    userId: params.userId,
    email: params.email,
    vars: {
      userName: params.userName,
      ticketId: ticket.id,
      supportMessage: params.message,
      ctaUrl: "https://themusiciansindex.com/messages",
    },
    dedupKey: `support_open_${ticket.id}`,
  });

  // Notify overseer (Michael Charlie)
  await sendMail({
    to: OVERSEER_EMAIL,
    subject: `[TMI Support] New ticket from ${params.userName}: ${params.subject}`,
    html: `<div style="font-family:Arial;padding:24px;background:#0a0a0f;color:#e0e0e0;border-radius:8px;">
      <h3 style="color:#00e5ff;">New Support Ticket — ${ticket.id}</h3>
      <p><strong>From:</strong> ${params.userName} (${params.email})</p>
      <p><strong>Subject:</strong> ${params.subject}</p>
      <blockquote style="background:#12121a;padding:12px;border-left:3px solid #9b59b6;">${params.message}</blockquote>
      <p style="margin-top:16px;">
        <a href="https://themusiciansindex.com/admin/inbox?ticket=${ticket.id}" style="background:#00e5ff;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">Review Ticket</a>
      </p>
    </div>`,
    text: `New support ticket ${ticket.id} from ${params.userName}. Message: ${params.message}`,
  });

  return ticket;
}

export async function approveTicket(ticketId: string, approvedBy: string, resolution: string): Promise<SupportTicket> {
  const ticket = tickets.get(ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

  const updated: SupportTicket = {
    ...ticket,
    status: "resolved",
    resolvedAt: Date.now(),
    approvedBy,
    resolution,
  };
  tickets.set(ticketId, updated);

  // Notify user of resolution
  await sendMail({
    to: ticket.email,
    subject: `Your support ticket has been resolved (#${ticketId})`,
    html: `<div style="font-family:Arial;padding:24px;background:#0a0a0f;color:#e0e0e0;border-radius:8px;">
      <h3 style="color:#00e5ff;">Ticket Resolved — ${ticketId}</h3>
      <p>Hi ${ticket.userName}, your support request has been reviewed and resolved.</p>
      <p><strong>Resolution:</strong> ${resolution}</p>
      <p>Reviewed by: ${approvedBy}</p>
      <p style="margin-top:16px;">
        <a href="https://themusiciansindex.com/messages" style="background:#00e5ff;color:#000;padding:10px 20px;border-radius:4px;text-decoration:none;">View Inbox</a>
      </p>
    </div>`,
    text: `Ticket ${ticketId} resolved. Resolution: ${resolution}`,
  });

  return updated;
}

export async function rejectTicket(ticketId: string, rejectedBy: string, reason: string): Promise<SupportTicket> {
  const ticket = tickets.get(ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

  const updated: SupportTicket = {
    ...ticket,
    status: "rejected",
    resolvedAt: Date.now(),
    approvedBy: rejectedBy,
    resolution: `Rejected: ${reason}`,
  };
  tickets.set(ticketId, updated);

  await sendMail({
    to: ticket.email,
    subject: `Support update for your ticket #${ticketId}`,
    html: `<div style="font-family:Arial;padding:24px;background:#0a0a0f;color:#e0e0e0;border-radius:8px;">
      <h3 style="color:#ff4444;">Ticket Update — ${ticketId}</h3>
      <p>Hi ${ticket.userName}, we reviewed your request.</p>
      <p>${reason}</p>
      <p>If you need further assistance, please open a new support ticket.</p>
    </div>`,
    text: `Ticket ${ticketId} update: ${reason}`,
  });

  return updated;
}

export function getTickets(status?: SupportTicketStatus): SupportTicket[] {
  const all = Array.from(tickets.values());
  return status ? all.filter(t => t.status === status) : all;
}

export function getTicket(ticketId: string): SupportTicket | undefined {
  return tickets.get(ticketId);
}

export function getTicketStats(): Record<SupportTicketStatus, number> {
  const all = Array.from(tickets.values());
  return {
    open: all.filter(t => t.status === "open").length,
    pending_approval: all.filter(t => t.status === "pending_approval").length,
    approved: all.filter(t => t.status === "approved").length,
    resolved: all.filter(t => t.status === "resolved").length,
    rejected: all.filter(t => t.status === "rejected").length,
  };
}
