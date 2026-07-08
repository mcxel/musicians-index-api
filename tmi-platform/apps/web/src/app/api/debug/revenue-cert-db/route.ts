export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function isDevAllowed(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  return req.headers.get('x-certification-local') === 'true';
}

export async function POST(req: NextRequest) {
  if (!isDevAllowed(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      eventId?: string;
      orderId?: string;
      ticketId?: string;
    };

    const eventId = typeof body.eventId === 'string' ? body.eventId : '';
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const ticketId = typeof body.ticketId === 'string' ? body.ticketId : '';

    const orderByEvent = eventId
      ? await prisma.order.findFirst({
          where: { providerPaymentId: eventId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            provider: true,
            providerPaymentId: true,
            amountCents: true,
            currency: true,
            status: true,
            buyerUserId: true,
            createdAt: true,
          },
        })
      : null;

    const orderById = !orderByEvent && orderId
      ? await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            provider: true,
            providerPaymentId: true,
            amountCents: true,
            currency: true,
            status: true,
            buyerUserId: true,
            createdAt: true,
          },
        })
      : null;

    const resolvedOrder = orderByEvent ?? orderById;

    const ticketByOrder = resolvedOrder
      ? await prisma.ticket.findFirst({
          where: { orderId: resolvedOrder.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderId: true,
            ownerUserId: true,
            tokenHash: true,
            ticketTypeId: true,
            eventId: true,
            status: true,
            createdAt: true,
          },
        })
      : null;

    const ticketById = !ticketByOrder && ticketId
      ? await prisma.ticket.findUnique({
          where: { id: ticketId },
          select: {
            id: true,
            orderId: true,
            ownerUserId: true,
            tokenHash: true,
            ticketTypeId: true,
            eventId: true,
            status: true,
            createdAt: true,
          },
        })
      : null;

    return NextResponse.json({
      ok: true,
      source: 'app-prisma',
      eventId: eventId || null,
      order: resolvedOrder,
      ticket: ticketByOrder ?? ticketById,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'debug_query_failed',
        message: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 }
    );
  }
}
