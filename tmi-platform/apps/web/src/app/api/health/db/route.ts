export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Can we connect to the database?
    await prisma.$queryRaw`SELECT 1`;

    // Test 2: Can we query the User table?
    const userCount = await prisma.user.count();

    // Test 3: Can we inspect the schema?
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    const userTableExists = tables.some(t => t.tablename === 'users');

    return NextResponse.json({
      ok: true,
      database: {
        connected: true,
        userTableExists,
        userCount,
        tablesCount: tables.length,
        tables: tables.map(t => t.tablename).sort(),
      },
      diagnostics: {
        hasEnv_DATABASE_URL: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 });
  } catch (err) {
    const anyErr = err as any;
    return NextResponse.json({
      ok: false,
      error: anyErr?.message ?? String(err),
      errorName: anyErr?.constructor?.name ?? typeof err,
      errorCode: anyErr?.code ?? null,
      diagnostics: {
        hasEnv_DATABASE_URL: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      nextSteps: [
        'Run: npx prisma migrate status (locally)',
        'Run: npx prisma migrate deploy (on production database)',
        'Check: DATABASE_URL environment variable is set correctly',
        'Verify: Database is reachable from production server',
      ],
    }, { status: 503 });
  }
}
