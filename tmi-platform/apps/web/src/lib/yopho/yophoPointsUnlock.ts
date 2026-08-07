/**
 * Durable YoPho points unlock — ledger-backed (no separate ownership table yet).
 * Client may also mirror into localStorage via unlockSkinById for canvas UI.
 */

import { prisma } from "@/lib/prisma";
import { YOPHO_SKIN_CATALOG } from "@/lib/yopho/YoPhoSkinRegistry";
import { YOPHO_SCENE_PACKS } from "@/lib/yopho/YoPhoScenePack";

export function isKnownYophoSkin(skinId: string): boolean {
  return YOPHO_SKIN_CATALOG.some((s) => s.id === skinId);
}

export function isKnownYophoScene(sceneId: string): boolean {
  return YOPHO_SCENE_PACKS.some((s) => s.id === sceneId);
}

export async function hasYophoUnlock(
  userId: string,
  kind: "skin" | "scene",
  assetId: string,
): Promise<boolean> {
  const relatedId = `yopho_${kind}_${assetId}`;
  const row = await prisma.ledgerEntry.findFirst({
    where: { userId, relatedId, type: "DEBIT" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function listYophoUnlocks(userId: string): Promise<{
  skins: string[];
  scenes: string[];
}> {
  const rows = await prisma.ledgerEntry.findMany({
    where: {
      userId,
      type: "DEBIT",
      OR: [
        { relatedId: { startsWith: "yopho_skin_" } },
        { relatedId: { startsWith: "yopho_scene_" } },
      ],
    },
    select: { relatedId: true },
  });
  const skins = new Set<string>(["urban-loft-starter"]);
  const scenes = new Set<string>();
  for (const r of rows) {
    const id = r.relatedId ?? "";
    if (id.startsWith("yopho_skin_")) skins.add(id.replace("yopho_skin_", ""));
    if (id.startsWith("yopho_scene_")) scenes.add(id.replace("yopho_scene_", ""));
  }
  return { skins: Array.from(skins), scenes: Array.from(scenes) };
}
