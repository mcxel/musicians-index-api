import { NextRequest, NextResponse } from "next/server";
import {
  getRoomShard,
  tickShard,
  reportAudienceCount,
  type ChannelId,
} from "@/lib/live/LivingRoomEngine";
import { UnifiedEmailAutomationEngine } from "@/lib/email/UnifiedEmailAutomationEngine";

export const runtime = "nodejs";
export const revalidate = 0;

const SHARD_LETTERS = ["A", "B", "C", "D"] as const;
type ShardLetter = (typeof SHARD_LETTERS)[number];

/**
 * GET /api/live/living-room/[shardId]
 * Returns the current state of a living room shard and advances its phase
 * if the timer has expired.
 *
 * shardId format: "battle-channel-A" | "cypher-channel-B" etc.
 *
 * Also fires email notifications when a new round is starting in ≤ 3 minutes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shardId: string }> }
) {
  const { shardId } = await params;

  // Parse shardId: last character is the letter, rest is the channelId
  const parts = shardId.split("-");
  const letter = parts[parts.length - 1]?.toUpperCase() as ShardLetter;
  const channelId = parts.slice(0, -1).join("-") as ChannelId;

  if (!SHARD_LETTERS.includes(letter) || !channelId) {
    return NextResponse.json({ error: "Invalid shardId" }, { status: 400 });
  }

  // Tick the shard (advances phase if timer expired)
  const shard = tickShard(shardId) ?? getRoomShard(channelId, letter);

  // Fire a "room_went_live" email when a new round is starting in ≤ 3 minutes
  // (between-rounds phase, < 180 s remaining)
  const now = Date.now();
  if (
    shard.phase === "between-rounds" &&
    shard.nextRoundStartsAt - now <= 180_000 &&
    shard.nextRoundStartsAt - now > 120_000 // only trigger once in the 3→2 min window
  ) {
    const eventLabel = shard.nextCompetition?.label ?? "Mystery Event";
    const channelLabel = shard.label;
    // Fire async — do not await (non-blocking)
    fireRoomStartingEmail(channelLabel, eventLabel).catch(() => {});
  }

  return NextResponse.json(
    { shard },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/**
 * POST /api/live/living-room/[shardId]
 * Update audience count and trigger expansion if needed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shardId: string }> }
) {
  const { shardId } = await params;
  const parts = shardId.split("-");
  const letter = parts[parts.length - 1]?.toUpperCase() as ShardLetter;
  const channelId = parts.slice(0, -1).join("-") as ChannelId;

  if (!SHARD_LETTERS.includes(letter) || !channelId) {
    return NextResponse.json({ error: "Invalid shardId" }, { status: 400 });
  }

  let body: { audienceCount?: number } = {};
  try { body = await req.json(); } catch {}

  if (typeof body.audienceCount === "number") {
    const result = reportAudienceCount(channelId, letter, body.audienceCount);
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "audienceCount required" }, { status: 400 });
}

// ─── Email helper ─────────────────────────────────────────────────────────────

/**
 * Fire a "room_went_live" email to the platform notification list.
 * In production, the recipient list would come from a subscriber registry.
 * For now it fires to a platform notification address to confirm the loop works.
 */
async function fireRoomStartingEmail(channelLabel: string, eventLabel: string): Promise<void> {
  const notifyEmail = process.env.PLATFORM_NOTIFICATION_EMAIL;
  if (!notifyEmail) return;

  await UnifiedEmailAutomationEngine.dispatchAutomaticEmail(
    notifyEmail,
    "TMI Subscriber",
    "room_went_live",
    {
      channelLabel,
      eventLabel,
      message: `Starting in 3 minutes: ${eventLabel} in ${channelLabel}`,
    }
  );
}
