/**
 * Resolve logged-in user id for campaign CRUD (AdCampaign owner).
 */
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function resolveCampaignOwnerId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value?.trim().toLowerCase();
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (user?.id) return user.id;
  }
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (sessionId) {
    const user = await prisma.user.findUnique({ where: { id: sessionId }, select: { id: true } }).catch(() => null);
    if (user?.id) return user.id;
  }
  return null;
}
