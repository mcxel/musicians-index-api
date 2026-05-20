import { NextResponse } from "next/server";

interface AvatarState {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  skinTone?: string;
  hairStyle?: string;
  outfit?: string;
  accessories?: string[];
  background?: string;
  lighting?: string;
  tier?: "FREE" | "MEMBER" | "DIAMOND";
  isNFT?: boolean;
  lastUpdated: string;
}

const avatarStore = new Map<string, AvatarState>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const state = avatarStore.get(userId);
  if (!state) return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  return NextResponse.json({ avatar: state });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AvatarState> & { userId: string };
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const existing = avatarStore.get(userId) ?? { userId, lastUpdated: new Date().toISOString() };

    const updated: AvatarState = {
      ...existing,
      ...body,
      userId,
      lastUpdated: new Date().toISOString(),
    };

    avatarStore.set(userId, updated);

    return NextResponse.json({ success: true, avatar: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
