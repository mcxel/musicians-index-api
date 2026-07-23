import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedAvatarIdentity } from "@/lib/avatars/seedAvatarIdentity";

export const dynamic = "force-dynamic";

// Rule 26 Identity Policy: Avatar & Inventory is Fan-only. A Performer/Band
// account must never get an avatar identity auto-seeded. Derives the caller
// from the session cookie (not a client-supplied userId) to avoid an IDOR
// on another user's avatar data.
async function requireFanSession(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return { error: NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 }) };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (!user) return { error: NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 }) };
  if (user.role !== "FAN") {
    return { error: NextResponse.json({ ok: false, error: "avatar_is_fan_only" }, { status: 403 }) };
  }
  return { userId: user.id };
}

export async function GET(req: NextRequest) {
  const session = await requireFanSession(req);
  if ("error" in session) return session.error;
  const { userId } = session;

  try {
    let identity = await prisma.avatarIdentity.findUnique({
      where: { userId },
      include: {
        dna: true,
        progress: true,
        preferences: true,
        unlocks: true,
        memory: true,
        behaviorWeights: true,
        experienceJournal: true,
      },
    });

    // Auto-seed canonical avatar identity if it doesn't exist yet (covers
    // accounts that signed up before the provisioning hook was wired in)
    if (!identity) {
      identity = await seedAvatarIdentity(userId);
    }

    // Convert Prisma models to clean UI-consumable shape
    const profile = {
      userId: identity.userId,
      danceStyle: identity.dna?.danceStyle || "pop_shaker",
      reactionSpeed: identity.dna?.reactionSpeed || 0,
      confidence: identity.dna?.confidence || 0.7,
      xp: identity.progress?.xp || 0,
      concertsAttended: identity.progress?.concertsAttended || 0,
      streakDays: identity.progress?.streakDays || 0,
      glowEnabled: identity.preferences?.glowEnabled ?? true,
      primaryColor: identity.preferences?.primaryColor || "#FF2DAA",
      unlockedKeys: (identity.unlocks || []).map((u) => u.unlockKey),
      frequentReactions: identity.memory?.frequentReactions || [],
      milestones: (identity.experienceJournal || []).map((m) => ({
        key: m.milestoneKey,
        desc: m.description,
      })),
    };

    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    console.error("[AvatarProfileAPI] GET error:", e);
    return NextResponse.json({ ok: false, error: e.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireFanSession(req);
  if ("error" in session) return session.error;
  const { userId } = session;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { action } = body;

  try {
    if (action === "batch_sync") {
      const { xp, reactions } = body;

      // Batch sync the caller's own progression updates only — no cross-user
      // writes, this is the client flushing its own local event buffer.
      await prisma.$transaction([
        ...(typeof xp === "number"
          ? [
              prisma.avatarProgress.updateMany({
                where: { avatar: { userId } },
                data: { xp: { increment: xp } },
              }),
            ]
          : []),
        ...(Array.isArray(reactions)
          ? [
              prisma.avatarMemory.updateMany({
                where: { avatar: { userId } },
                data: { frequentReactions: { set: reactions } },
              }),
            ]
          : []),
      ]);

      return NextResponse.json({ ok: true });
    }

    if (action === "add_milestone") {
      const { milestoneKey, description } = body;
      if (!milestoneKey || !description) {
        return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
      }

      // Add experience journal entry and grant +250 XP bonus
      const identity = await prisma.avatarIdentity.findUnique({
        where: { userId },
      });

      if (!identity) {
        return NextResponse.json({ ok: false, error: "Avatar profile not found" }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.experienceJournal.upsert({
          where: {
            avatarId_milestoneKey: {
              avatarId: identity.id,
              milestoneKey,
            },
          },
          update: { description },
          create: {
            avatarId: identity.id,
            milestoneKey,
            description,
          },
        }),
        prisma.avatarProgress.updateMany({
          where: { avatarId: identity.id },
          data: { xp: { increment: 250 } },
        }),
      ]);

      return NextResponse.json({ ok: true, bonusXp: 250 });
    }

    if (action === "unlock_emote") {
      const { unlockKey } = body;
      if (!unlockKey) {
        return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
      }

      const identity = await prisma.avatarIdentity.findUnique({
        where: { userId },
      });

      if (!identity) {
        return NextResponse.json({ ok: false, error: "Avatar profile not found" }, { status: 404 });
      }

      await prisma.avatarUnlocks.upsert({
        where: {
          avatarId_unlockKey: {
            avatarId: identity.id,
            unlockKey,
          },
        },
        update: {},
        create: {
          avatarId: identity.id,
          unlockKey,
        },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (e: any) {
    console.error("[AvatarProfileAPI] POST error:", e);
    return NextResponse.json({ ok: false, error: e.message || "Internal server error" }, { status: 500 });
  }
}
