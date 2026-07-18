import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "Missing ownerId" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        tier: true,
        userProfile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
            location: true,
            socialLinks: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      tier: user.tier,
      profile: user.userProfile,
    });
  } catch (err) {
    console.error("[api/profile/get] failed:", err);
    return NextResponse.json({ error: "Failed to query profile" }, { status: 500 });
  }
}
