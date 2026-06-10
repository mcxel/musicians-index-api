import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalAccounts = await prisma.user.count();
    return NextResponse.json({ totalAccounts, status: 'active' });
  } catch {
    return NextResponse.json({ totalAccounts: 0, status: 'active' });
  }
}