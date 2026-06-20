import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Phase C: AvatarConfig — face scan + bobblehead 3D config
// Separate from avatar/save which handles cosmetic loadouts (slots/accessories)

async function getAuthedUser(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ config: null });

  try {
    const config = await prisma.avatarConfig.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ config });
  } catch (err) {
    console.error('[avatar/config GET]', err);
    return NextResponse.json({ config: null });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json() as {
      meshUrl?: string;
      textureUrl?: string;
      faceScanUrl?: string;
      bobbleheadConfig?: Record<string, unknown>;
      previewImageUrl?: string;
      isComplete?: boolean;
    };

    const updateData: Record<string, unknown> = {};
    if (body.meshUrl !== undefined) updateData.meshUrl = body.meshUrl;
    if (body.textureUrl !== undefined) updateData.textureUrl = body.textureUrl;
    if (body.faceScanUrl !== undefined) updateData.faceScanUrl = body.faceScanUrl;
    if (body.bobbleheadConfig !== undefined) updateData.bobbleheadConfig = body.bobbleheadConfig as object;
    if (body.previewImageUrl !== undefined) updateData.previewImageUrl = body.previewImageUrl;
    if (body.isComplete !== undefined) updateData.isComplete = body.isComplete;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await prisma.avatarConfig.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        meshUrl: body.meshUrl,
        textureUrl: body.textureUrl,
        faceScanUrl: body.faceScanUrl,
        bobbleheadConfig: (body.bobbleheadConfig ?? {}) as object,
        previewImageUrl: body.previewImageUrl,
        isComplete: body.isComplete ?? false,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: updateData as any,
      select: { id: true, isComplete: true, previewImageUrl: true, updatedAt: true },
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.error('[avatar/config POST]', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
