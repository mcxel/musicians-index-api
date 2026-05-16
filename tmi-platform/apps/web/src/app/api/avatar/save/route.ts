import { NextRequest, NextResponse } from "next/server";
import {
  getAvatarPersistenceSnapshot,
  saveAvatarLoadout,
  saveAvatarProfile,
  type AvatarSlot,
} from "@/lib/avatar/avatarPersistence";

type SaveBody = {
  userId?: string;
  profile?: {
    displayName?: string;
    skinTone?: string;
    hairStyle?: string;
    eyeStyle?: string;
  };
  loadout?: Partial<Record<AvatarSlot, string | null>>;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as SaveBody;
  const userId = body.userId ?? "demo-user";

  if (body.profile) {
    saveAvatarProfile(userId, body.profile);
  }
  if (body.loadout) {
    saveAvatarLoadout(userId, body.loadout);
  }

  return NextResponse.json({
    ok: true,
    userId,
    ...getAvatarPersistenceSnapshot(userId),
  });
}
