import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const totalAccounts = await prisma.user.count();
    await prisma.$disconnect();
    return NextResponse.json({ totalAccounts, status: 'active' });
  } catch {
    return NextResponse.json({ totalAccounts: 0, status: 'active' });
  }
}