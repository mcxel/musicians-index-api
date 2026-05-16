export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

type RedeemBody = {
  action?: string;
  rewardType?: string;
  contextId?: string;
  metadata?: Record<string, unknown>;
};

const REWARD_TO_ACTION: Record<string, string> = {
  beat: "BEAT_PURCHASE",
  nft: "NFT_PURCHASE",
  ticket: "TICKET_PURCHASE",
  store: "STORE_PURCHASE",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RedeemBody;
    const rewardKey = body.rewardType?.toLowerCase();
    const resolvedAction = body.action ?? (rewardKey ? REWARD_TO_ACTION[rewardKey] : undefined) ?? "STORE_PURCHASE";

    const forwardReq = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({
        action: resolvedAction,
        contextId: body.contextId,
        metadata: {
          ...(body.metadata ?? {}),
          rewardType: body.rewardType ?? "store",
          source: "web-redeem-route",
        },
      }),
    });

    return proxyToApi(forwardReq, "/api/julius/me/points/action");
  } catch {
    return NextResponse.json({ error: "invalid redeem payload" }, { status: 400 });
  }
}
