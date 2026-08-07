/**
 * RevenueBusinessEngine / protocol suite API.
 * GET  — dashboard (directives, checkpoints, deals, prospects)
 * POST — tick / protocol / write / deal open|close
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessmanDashboard,
  protocolObserve,
  protocolRead,
  protocolSearch,
  protocolWrite,
  protocolOpenDeal,
  protocolCloseDeal,
  protocolAdvanceDeal,
  runProtocol,
  setRevenueBusinessDryRun,
  type ProtocolName,
} from "@/lib/commerce/RevenueBusinessProtocols";

export const runtime = "nodejs";

export async function GET() {
  try {
    const dashboard = await getBusinessmanDashboard();
    return NextResponse.json({ ok: true, ...dashboard });
  } catch (err) {
    const message = err instanceof Error ? err.message : "dashboard_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "observe");

    if (action === "dry_run") {
      setRevenueBusinessDryRun(Boolean(body.enabled));
      return NextResponse.json({ ok: true, dryRun: Boolean(body.enabled) });
    }

    if (action === "observe" || action === "tick") {
      const result = await protocolObserve({
        roomId: typeof body.roomId === "string" ? body.roomId : undefined,
        botId: typeof body.botId === "string" ? body.botId : "revenue-business-bot-001",
      });
      return NextResponse.json({ ok: true, result });
    }

    if (action === "read") {
      return NextResponse.json({ ok: true, data: await protocolRead() });
    }

    if (action === "search") {
      return NextResponse.json({ ok: true, hits: await protocolSearch() });
    }

    if (action === "protocol") {
      const name = String(body.protocol ?? "OBSERVE") as ProtocolName;
      const out = await runProtocol(name, {
        roomId: typeof body.roomId === "string" ? body.roomId : undefined,
        botId: typeof body.botId === "string" ? body.botId : undefined,
        dealId: typeof body.dealId === "string" ? body.dealId : undefined,
        zone: typeof body.zone === "string" ? body.zone : undefined,
        actor: typeof body.actor === "string" ? body.actor : "admin",
        paymentOrContractSignal: Boolean(body.paymentOrContractSignal),
      });
      return NextResponse.json({ ok: true, ...out });
    }

    if (action === "write") {
      const type = String(body.type ?? "") as
        | "create_proposal"
        | "approve"
        | "reject"
        | "apply"
        | "approve_and_apply";
      const result = protocolWrite({
        type,
        proposalId: typeof body.proposalId === "string" ? body.proposalId : undefined,
        actor: typeof body.actor === "string" ? body.actor : "admin",
        reason: typeof body.reason === "string" ? body.reason : undefined,
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (action === "open_deal") {
      const deal = protocolOpenDeal({
        title: String(body.title ?? "Sponsor opportunity"),
        kind: (body.kind as "sponsor" | "ad_package" | "house_campaign" | "prize") ?? "sponsor",
        zone: String(body.zone ?? "home-1-homepageBanner"),
        valueBandUsd: {
          min: Number((body.valueBandUsd as { min?: number })?.min ?? 25),
          max: Number((body.valueBandUsd as { max?: number })?.max ?? 500),
        },
        actor: typeof body.actor === "string" ? body.actor : "admin",
      });
      return NextResponse.json({ ok: true, deal }, { status: 201 });
    }

    if (action === "advance_deal") {
      const result = protocolAdvanceDeal(
        String(body.dealId ?? ""),
        (body.to as "NEGOTIATING" | "READY_TO_CLOSE") ?? "NEGOTIATING",
        typeof body.actor === "string" ? body.actor : "admin",
      );
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (action === "close_deal") {
      const result = protocolCloseDeal({
        dealId: String(body.dealId ?? ""),
        outcome: (body.outcome as "won" | "rejected" | "expired") ?? "rejected",
        actor: typeof body.actor === "string" ? body.actor : "admin",
        paymentOrContractSignal: Boolean(body.paymentOrContractSignal),
        note: typeof body.note === "string" ? body.note : undefined,
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "request_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
