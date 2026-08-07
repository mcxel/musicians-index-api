export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getAvatarPersistenceSnapshot,
  saveAvatarLoadout,
  saveAvatarProfile,
  type AvatarSlot,
} from "@/lib/avatar/avatarPersistence";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

type SaveBody = {
  profile?: {
    displayName?: string;
    skinTone?: string;
    hairStyle?: string;
    eyeStyle?: string;
  };
  loadout?: Partial<Record<AvatarSlot, string | null>>;
};

export async function POST(req: NextRequest) {
  const auth = requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as SaveBody;
  const userId = auth.user.id;

  if (body.profile) {
    saveAvatarProfile(userId, body.profile);
  }
  if (body.loadout) {
    saveAvatarLoadout(userId, body.loadout);
  }

  return NextResponse.json({
    ok: true,
    userId,
    ...(await getAvatarPersistenceSnapshot(userId)),
  });
}