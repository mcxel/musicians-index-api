export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";
import { prisma } from "@/lib/prisma";

const SEAT_TTL_MS = 5 * 60 * 1000; // 5-minute hold

async function cleanupExpiredSeatReservations(tx: any, roomId: string) {
  const now = new Date();
  const expired = await tx.seatReservation.findMany({
    where: {
      roomId,
      expiresAt: { lt: now }
    }
  });
  for (const row of expired) {
    await tx.seatReservation.delete({ where: { id: row.id } }).catch(() => null);
    await tx.roomSeatState.updateMany({
      where: { roomId, seatId: row.seatId, currentUser: row.userId },
      data: { occupied: false, currentUser: null }
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const fanId: string = sessionId.substring(0, 8);
  const rawConcertId: string = typeof body.concertId === "string" ? body.concertId : "world-concert";
  const concertId = getCanonicalRoomSlug(rawConcertId);
  const seatId: string = body.seatId;

  if (!seatId || seatId.length > 64 || !/^[a-zA-Z0-9:_-]+$/.test(seatId)) {
    return NextResponse.json({ ok: false, error: "Invalid seatId" }, { status: 400 });
  }
  if (concertId.length > 64 || !/^[a-zA-Z0-9:_-]+$/.test(concertId)) {
    return NextResponse.json({ ok: false, error: "Invalid concertId" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      await cleanupExpiredSeatReservations(tx, concertId);
      
      // Release any prior seat held by this fan to prevent multi-booking
      const userPriorReservations = await tx.seatReservation.findMany({
        where: { roomId: concertId, userId: fanId }
      });
      
      for (const prior of userPriorReservations) {
        if (prior.seatId !== seatId) {
          await tx.seatReservation.delete({ where: { id: prior.id } }).catch(() => null);
          await tx.roomSeatState.updateMany({
            where: { roomId: concertId, seatId: prior.seatId, currentUser: fanId },
            data: { occupied: false, currentUser: null }
          });
        }
      }
      
      // Check seat occupancy state
      const existing = await tx.roomSeatState.findUnique({
        where: { roomId_seatId: { roomId: concertId, seatId } }
      });
      
      if (existing?.occupied && existing.currentUser !== fanId) {
        throw new Error("seat_taken");
      }
      
      // Check reservation ownership (prevents overwrite races on upsert update path)
      const reservation = await tx.seatReservation.findUnique({
        where: { roomId_seatId: { roomId: concertId, seatId } }
      });
      
      if (reservation && reservation.userId !== fanId && reservation.expiresAt > new Date()) {
        throw new Error("seat_taken");
      }
      
      // Create/Update Occupancy
      const state = await tx.roomSeatState.upsert({
        where: { roomId_seatId: { roomId: concertId, seatId } },
        create: { roomId: concertId, seatId, occupied: true, currentUser: fanId },
        update: { occupied: true, currentUser: fanId }
      });

      // Create/Update Reservation
      const expiresAt = new Date(Date.now() + SEAT_TTL_MS);
      const res = await tx.seatReservation.upsert({
        where: { roomId_seatId: { roomId: concertId, seatId } },
        create: { roomId: concertId, seatId, userId: fanId, expiresAt },
        update: { userId: fanId, expiresAt }
      });

      return { state, reservation: res };
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    if (err.message === "seat_taken") {
      return NextResponse.json({ ok: false, error: "Conflict: Seat is already taken" }, { status: 409 });
    }
    console.error("Seat reservation error:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const fanId: string = sessionId.substring(0, 8);
  const rawConcertId: string = typeof body.concertId === "string" ? body.concertId : "world-concert";
  const concertId = getCanonicalRoomSlug(rawConcertId);

  if (concertId.length > 64 || !/^[a-zA-Z0-9:_-]+$/.test(concertId)) {
    return NextResponse.json({ ok: false, error: "Invalid concertId" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      await cleanupExpiredSeatReservations(tx, concertId);
      const userReservations = await tx.seatReservation.findMany({
        where: { roomId: concertId, userId: fanId }
      });
      for (const res of userReservations) {
        await tx.seatReservation.delete({ where: { id: res.id } }).catch(() => null);
        await tx.roomSeatState.updateMany({
          where: { roomId: concertId, seatId: res.seatId, currentUser: fanId },
          data: { occupied: false, currentUser: null }
        });
      }
    });
    return NextResponse.json({ ok: true, message: "Released" });
  } catch (err) {
    console.error("Seat release error:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}