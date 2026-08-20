import { NextResponse } from "next/server";
import { listActiveBoosts } from "@/lib/lobby/LobbyWallBoostEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  const boosts = listActiveBoosts();
  return NextResponse.json({
    ok: true,
    boosts: boosts.map((b) => ({
      roomId: b.roomId,
      performerId: b.performerId,
      category: b.category,
      kind: b.kind,
      wdpEntryId: b.wdpEntryId,
      expiresAtMs: b.expiresAtMs,
    })),
  });
}
