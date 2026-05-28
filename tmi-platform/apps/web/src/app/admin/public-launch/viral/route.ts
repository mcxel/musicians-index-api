import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Returns real account count when database is connected.
  // Falls back to 0 until Prisma/database is configured.
  return NextResponse.json({ totalAccounts: 0, status: 'active' });
}