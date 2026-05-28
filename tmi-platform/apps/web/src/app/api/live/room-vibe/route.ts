import { NextRequest, NextResponse } from "next/server";
import { LiveRegistry } from "@/lib/broadcast/LiveRegistry";
import { billboardPortalEngine } from "@/lib/live/BillboardPortalEngine";
import {
  getRoomVibe,
  getRoomVibeHeat,
  setRoomVibe,
  type RoomVibeState,
} from "@/lib/live/RoomVibeEngine";
import { registerBillboardSlot, updateBillboardLiveStats } from "@/lib/live/BillboardPreviewHoverEngine";

function roleFromRequest(req: NextRequest): string {
  return (req.cookies.get("tmi_role")?.value ?? "").toLowerCase();
}

function canControlRole(role: string): boolean {
  return role === "performer" || role === "artist" || role === "admin" || role === "superadmin";
}

function syncDiscoveryVibe(roomId: string, next: RoomVibeState): void {
  const heat = getRoomVibeHeat(next);

  if (billboardPortalEngine.getPortal(roomId)) {
    billboardPortalEngine.updateBattleStatus(roomId, `VIBE · ${next.underlay.toUpperCase()}`);
    billboardPortalEngine.updateEnergy(roomId, heat, heat >= 75 ? "ON FIRE" : heat >= 50 ? "HOT" : "WARMING");
    billboardPortalEngine.updateActiveVibe(roomId, {
      underlay: next.underlay,
      overlay: next.overlay,
      strobeIntensity: next.strobeIntensity,
      spotlightMode: next.spotlightMode,
      shaderQuality: next.shaderQuality,
    });
  }

  registerBillboardSlot({
    slotId: `room-vibe-${roomId}`,
    type: "live_stats",
    title: "Stream & Win Live Room",
    subtitle: `${next.underlay} · ${next.overlay}`,
    href: `/live/rooms/stream-win`,
    badgeText: next.spotlightMode ? "SPOTLIGHT" : "LIVE VIBE",
    accentColor: "#00FFFF",
    liveStats: {
      viewers: Math.max(1, LiveRegistry.count()),
      heatLevel: heat,
    },
    roomVibe: {
      underlay: next.underlay,
      overlay: next.overlay,
      strobeIntensity: next.strobeIntensity,
      spotlightMode: next.spotlightMode,
      shaderQuality: next.shaderQuality,
    },
  });

  updateBillboardLiveStats(`room-vibe-${roomId}`, Math.max(1, LiveRegistry.count()), heat);
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId") ?? "stream-win-main";
  const role = roleFromRequest(req);
  const vibe = getRoomVibe(roomId);
  syncDiscoveryVibe(roomId, vibe);
  return NextResponse.json({
    ok: true,
    roomId,
    canControl: canControlRole(role),
    vibe,
  });
}

export async function POST(req: NextRequest) {
  const role = roleFromRequest(req);
  if (!canControlRole(role)) {
    return NextResponse.json({ error: "Only performers/artists can control room vibe" }, { status: 403 });
  }

  let body: { roomId?: string; vibe?: Partial<RoomVibeState> };
  try {
    body = (await req.json()) as { roomId?: string; vibe?: Partial<RoomVibeState> };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const roomId = body.roomId ?? "stream-win-main";
  const next = setRoomVibe(roomId, body.vibe ?? {}, req.cookies.get("tmi_user_email")?.value ?? "unknown");

  LiveRegistry.setRoomVibe(roomId, {
    underlay: next.underlay,
    overlay: next.overlay,
    strobeIntensity: next.strobeIntensity,
    spotlightMode: next.spotlightMode,
    shaderQuality: next.shaderQuality,
  });

  syncDiscoveryVibe(roomId, next);

  return NextResponse.json({ ok: true, roomId, vibe: next });
}
