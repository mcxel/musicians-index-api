import { NextRequest, NextResponse } from 'next/server';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, genre, bio, city } = body as {
      name?: string;
      genre?: string;
      bio?: string;
      city?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Band name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    // Forward to backend API if available
    const apiBase = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      const upstream = await fetch(`${apiBase}/api/bands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') ?? '' },
        body: JSON.stringify({ name: name.trim(), genre, bio, city, slug }),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }
    }

    // Fallback: return constructed slug so the client can redirect
    return NextResponse.json({ slug, name: name.trim() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ bands: [] });
}
