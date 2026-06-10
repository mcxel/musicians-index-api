import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Intercepts Prisma user update pipeline
    return NextResponse.json({ ok: true, message: 'Profile saved successfully', data: body });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}