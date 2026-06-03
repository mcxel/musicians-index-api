import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
    const res = await fetch(`${apiBase}/stripe/products`, {
      headers: { Authorization: req.headers.get('authorization') ?? '' },
    });

    if (res.status === 404) {
      return NextResponse.json(
        { products: [], source: 'fallback', configured: false },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[stripe/products]', err);
    return NextResponse.json({ error: 'upstream_products_unavailable' }, { status: 502 });
  }
}
