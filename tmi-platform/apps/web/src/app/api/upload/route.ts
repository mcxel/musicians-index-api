import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { allowed } = checkRateLimit(`upload:image:${clientIp}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  try {
    const formData   = await req.formData();
    const file       = formData.get('file') as File | null;
    const context    = (formData.get('context') as string | null) ?? 'profile';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, or GIF allowed.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image size exceeds the 10 MB limit.' }, { status: 400 });
    }

    const ext      = file.name.split('.').pop() ?? 'jpg';
    const fileName = `uploads/${context}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Vercel Blob — used automatically when BLOB_READ_WRITE_TOKEN is present
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(fileName, file, { access: 'public' });
      return NextResponse.json({ success: true, url: blob.url }, { status: 201 });
    }

    // Dev fallback: base64 data URL so previews work locally without blob storage
    const bytes   = await file.arrayBuffer();
    const dataUrl = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
    return NextResponse.json({ success: true, url: dataUrl }, { status: 201 });

  } catch (error) {
    console.error('[TMI_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
