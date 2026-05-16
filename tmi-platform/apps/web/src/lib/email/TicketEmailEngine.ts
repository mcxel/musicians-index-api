import EmailQueueEngine, { type QueuedEmailJob } from '@/lib/email/EmailQueueEngine';

export interface TicketEmailPayload {
  userId: string;
  to: string;
  eventName: string;
  venueName: string;
  dateTime: string;
  ticketType: string;
  seatOrSection?: string;
  qrCodeValue: string;
  printLink: string;
  supportLink: string;
  walletLink?: string;
}

function ticketMessage(input: TicketEmailPayload): string {
  const seat = input.seatOrSection
    ? `Seat/Section: ${input.seatOrSection}`
    : 'Seat/Section: General Admission';
  const wallet = input.walletLink
    ? `Wallet: ${input.walletLink}`
    : 'Wallet: not available for this ticket type';
  return [
    `Event: ${input.eventName}`,
    `Venue: ${input.venueName}`,
    `Date/Time: ${input.dateTime}`,
    `Type: ${input.ticketType}`,
    seat,
    `QR: ${input.qrCodeValue}`,
    `Print: ${input.printLink}`,
    wallet,
    `Support: ${input.supportLink}`,
  ].join('\n');
}

export class TicketEmailEngine {
  static sendTicketDelivery(input: TicketEmailPayload): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'ticketing',
      templateKey: 'ticket.delivery',
      variables: {
        message: ticketMessage(input),
        eventName: input.eventName,
        venueName: input.venueName,
        dateTime: input.dateTime,
        ticketType: input.ticketType,
        seatOrSection: input.seatOrSection ?? 'General Admission',
        qrCodeValue: input.qrCodeValue,
        printLink: input.printLink,
        supportLink: input.supportLink,
        walletLink: input.walletLink ?? 'n/a',
      },
      required: true,
    });
  }

  static sendEventReminder(input: TicketEmailPayload): QueuedEmailJob {
    return EmailQueueEngine.enqueue({
      userId: input.userId,
      to: input.to,
      channel: 'ticketing',
      templateKey: 'ticket.event-reminder',
      variables: {
        message: `Reminder: ${input.eventName} starts at ${input.dateTime}.\n${ticketMessage(
          input
        )}`,
        eventName: input.eventName,
        dateTime: input.dateTime,
        venueName: input.venueName,
        ticketType: input.ticketType,
        seatOrSection: input.seatOrSection ?? 'General Admission',
        qrCodeValue: input.qrCodeValue,
        printLink: input.printLink,
        supportLink: input.supportLink,
      },
      required: true,
    });
  }
}

export default TicketEmailEngine;
