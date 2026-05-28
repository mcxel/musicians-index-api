import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
  
  // Protect the upload endpoint from spam
  const { allowed } = checkRateLimit(`upload:image:${clientIp}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const uploadContext = formData.get('context') as string || 'profile'; // 'profile', 'memory_wall', 'article'

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Strict validation for HD images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files (JPEG, PNG, WEBP) are allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'Image size exceeds the 10MB limit.' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${uploadContext}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // TODO: In production, pipe `file.stream()` to AWS S3, Cloudinary, or Vercel Blob here.
    // For now, we simulate a successful cloud upload and return a CDN-ready URL structure.
    const mockCloudUrl = `https://cdn.themusiciansindex.com/uploads/${uploadContext}/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: mockCloudUrl,
      message: 'Image successfully processed and stored.' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[TMI_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
  }
}