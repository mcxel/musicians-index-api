import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId');
  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
  const res = await fetch(`${apiBase}/stripe/customer/${customerId}`, {
    headers: { Authorization: req.headers.get('authorization') ?? '' },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
    const res = await fetch(`${apiBase}/stripe/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: req.headers.get('authorization') ?? '' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[stripe/customer]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
