export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

const ROOMS = [
  { id: "fan-theater",      name: "Fan Theater",      type: "THEATER",  href: "/fan/theater",                 capacity: 8000  },
  { id: "broadcast-studio", name: "Broadcast Studio", type: "STUDIO",   href: "/performer/studio",             capacity: 1     },
  { id: "world-concert",    name: "World Concert",    type: "ARENA",    href: "/rooms/world-concert",          capacity: 18500 },
  { id: "world-dance-party",name: "Dance Party",      type: "CLUB",     href: "/rooms/world-dance-party",      capacity: 2400  },
  { id: "monday-stage",     name: "Monday Night Stage",type: "STAGE",  href: "/rooms/monday-stage",           capacity: 4000  },
  { id: "cypher",           name: "Nova Cipher",      type: "CYPHER",   href: "/rooms/cypher",                 capacity: 600   },
  { id: "battle",           name: "Battle Arena",     type: "BATTLE",   href: "/rooms/battle/battle4",         capacity: 800   },
  { id: "dirty-dozens",     name: "Dirty Dozens",     type: "GAME",     href: "/rooms/dirty-dozens",           capacity: 200   },
];

function roomStatus(roomId: string): "live" | "preshow" | "idle" {
  // Seed deterministic status from room id until real room state is wired
  const h = Array.from(roomId).reduce((a, c) => a + c.charCodeAt(0), 0);
  if (h % 3 === 0) return "live";
  if (h % 3 === 1) return "preshow";
  return "idle";
}

function seededWatchers(roomId: string, capacity: number): number {
  const h = Array.from(roomId).reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = ((h * 37) % 100) / 100; // 0–1
  return Math.floor(capacity * pct * 0.45);
}

export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rooms = ROOMS.map((r) => ({
    ...r,
    status: roomStatus(r.id),
    watchers: seededWatchers(r.id, r.capacity),
    isLive: roomStatus(r.id) === "live",
  }));

  return NextResponse.json({ rooms, ts: Date.now() });
}
