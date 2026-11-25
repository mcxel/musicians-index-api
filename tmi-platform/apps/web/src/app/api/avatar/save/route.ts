export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getAvatarPersistenceSnapshot,
  saveAvatarChanges,
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

const profileKeys = new Set(["displayName", "skinTone", "hairStyle", "eyeStyle"]);
const slotKeys = new Set([
  "skin", "hair", "eyes", "accessory", "outfit", "prop", "background",
  "lighting", "emote", "instrument", "aura", "entrance",
]);

function isValidBody(value: unknown): value is SaveBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "profile" && key !== "loadout")) return false;
  if (body.profile === undefined && body.loadout === undefined) return false;
  for (const [name, keys] of [["profile", profileKeys], ["loadout", slotKeys]] as const) {
    const part = body[name];
    if (part === undefined) continue;
    if (!part || typeof part !== "object" || Array.isArray(part)) return false;
    for (const [key, entry] of Object.entries(part)) {
      if (!keys.has(key) || !(typeof entry === "string" && entry.length <= 256 || name === "loadout" && entry === null)) return false;
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  const auth = await requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body: unknown = await req.json().catch(() => null);
  if (!isValidBody(body)) {
    return NextResponse.json({ ok: false, error: "invalid_avatar_payload" }, { status: 400 });
  }
  const userId = auth.user.id;

  try {
    await saveAvatarChanges(userId, body);

    return NextResponse.json({
      ok: true,
      durable: true,
      userId,
      ...(await getAvatarPersistenceSnapshot(userId)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/avatar/save] durable persistence failed:", message);
    // Never return ok:true when Prisma persistence failed (false-success ban).
    return NextResponse.json(
      {
        ok: false,
        durable: false,
        code: "AVATAR_PERSISTENCE_FAILED",
        error: "Avatar profile/loadout was not durably saved",
      },
      { status: 503 },
    );
  }
}
