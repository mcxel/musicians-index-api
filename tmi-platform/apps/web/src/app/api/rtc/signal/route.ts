import { NextRequest, NextResponse } from "next/server";

// ── In-memory signal store ────────────────────────────────────────────────────
// Keyed by roomId → array of signal messages with timestamp

interface SignalMessage {
  roomId: string;
  peerId: string;
  payload: Record<string, unknown>;
  ts: number;
}

const signalStore = new Map<string, SignalMessage[]>();
const EXPIRY_MS = 60_000;

function cleanExpired(): void {
  const cutoff = Date.now() - EXPIRY_MS;
  for (const [key, msgs] of signalStore.entries()) {
    const fresh = msgs.filter((m) => m.ts > cutoff);
    if (fresh.length === 0) {
      signalStore.delete(key);
    } else {
      signalStore.set(key, fresh);
    }
  }
}

function storeKey(roomId: string): string {
  return roomId;
}

// ── GET — fetch pending signals for a peer ────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const peerId = searchParams.get("peerId");

  if (!roomId || !peerId) {
    return NextResponse.json({ error: "roomId and peerId required" }, { status: 400 });
  }

  cleanExpired();

  const key = storeKey(roomId);
  const all = signalStore.get(key) ?? [];

  // Return messages NOT from this peer (so peers receive messages from others)
  const messages = all
    .filter((m) => m.peerId !== peerId)
    .map((m) => m.payload);

  return NextResponse.json({ messages });
}

// ── POST — store a new signal message ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { roomId?: string; peerId?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { roomId, peerId, payload } = body;

  if (!roomId || !peerId || !payload) {
    return NextResponse.json({ error: "roomId, peerId, and payload required" }, { status: 400 });
  }

  cleanExpired();

  const key = storeKey(roomId);
  const existing = signalStore.get(key) ?? [];

  const entry: SignalMessage = {
    roomId,
    peerId,
    payload,
    ts: Date.now(),
  };

  signalStore.set(key, [...existing, entry]);

  return NextResponse.json({ ok: true });
}
