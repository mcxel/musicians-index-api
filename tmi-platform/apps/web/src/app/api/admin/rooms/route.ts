export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";

const ROOMS = [
  { id: "fan-theater",       name: "Fan Theater",         type: "THEATER",  href: "/fan/theater",            capacity: 8000  },
  { id: "broadcast-studio",  name: "Broadcast Studio",    type: "STUDIO",   href: "/performer/studio",        capacity: 1     },
  { id: "world-concert",     name: "World Concert",       type: "ARENA",    href: "/rooms/world-concert",     capacity: 18500 },
  { id: "world-dance-party", name: "Dance Party",         type: "CLUB",     href: "/rooms/world-dance-party", capacity: 2400  },
  { id: "monday-stage",      name: "Monday Night Stage",  type: "STAGE",    href: "/rooms/monday-stage",      capacity: 4000  },
  { id: "cypher",            name: "Nova Cipher",         type: "CYPHER",   href: "/rooms/cypher",            capacity: 600   },
  { id: "battle",            name: "Battle Arena",        type: "BATTLE",   href: "/rooms/battle/battle4",    capacity: 800   },
  { id: "dirty-dozens",      name: "Dirty Dozens",        type: "GAME",     href: "/rooms/dirty-dozens",      capacity: 200   },
];

export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Real live sessions from GlobalLiveSessionRegistry
  const activeSessions = getActiveSessions();
  const sessionByRoom = new Map(activeSessions.map((s) => [s.roomId, s]));

  const rooms = ROOMS.map((r) => {
    const session = sessionByRoom.get(r.id);
    return {
      ...r,
      status: session ? "live" : "idle",
      watchers: session?.viewerCount ?? 0,
      isLive: !!session,
      streamerId: session?.userId ?? null,
      streamerName: session?.displayName ?? null,
    };
  });

  return NextResponse.json({ rooms, ts: Date.now() });
}
