/**
 * GET /api/campaigns — list persisted AdCampaign rows for the logged-in owner.
 * POST /api/campaigns — create campaign (+ draft creative if needed).
 * PATCH /api/campaigns — update status (start / pause / draft).
 */
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCampaignOwnerId } from "@/lib/auth/resolveCampaignOwnerId";

const PLACEMENT_TO_SLOT: Record<string, string> = {
  homepage: "billboard",
  magazine: "sidebar",
  "live-rooms": "overlay",
  feed: "sponsored-post",
  search: "search",
  billboard: "billboard",
  banner: "banner",
  "pre-roll": "pre-roll",
  "sponsored-post": "sponsored-post",
  "venue-wrap": "venue-wrap",
};

function mapStatusForClient(status: string): string {
  if (status === "live") return "active";
  if (status === "draft" || status === "pending_review" || status === "approved") return status;
  if (status === "paused") return "paused";
  if (status === "completed" || status === "rejected") return "completed";
  return status;
}

async function ensureDraftCreative(ownerId: string, creativeUrl?: string, creativeType?: string) {
  const existing = await prisma.adCreative.findFirst({
    where: { advertiserId: ownerId },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (creativeUrl && !existing.fileUrl) {
      return prisma.adCreative.update({
        where: { id: existing.id },
        data: { fileUrl: creativeUrl, type: (creativeType ?? existing.type).toUpperCase() },
      });
    }
    return existing;
  }
  return prisma.adCreative.create({
    data: {
      advertiserId: ownerId,
      name: "Campaign Creative",
      type: (creativeType ?? "BANNER").toUpperCase(),
      fileUrl: creativeUrl ?? "",
      clickUrl: "/sponsors/advertise",
      altText: "Campaign creative",
      status: "pending",
    },
  });
}

export async function GET(req: NextRequest) {
  const ownerId = await resolveCampaignOwnerId(req);
  if (!ownerId) {
    return NextResponse.json({ campaigns: [], authenticated: false });
  }

  const rows = await prisma.adCampaign.findMany({
    where: { advertiserId: ownerId },
    include: {
      creative: { select: { name: true, type: true, fileUrl: true } },
      _count: { select: { impressions: true, clicks: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const campaigns = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slot: c.slot,
    placement: c.slot,
    budgetCents: c.budgetCents,
    budget: c.budgetCents / 100,
    spentCents: c.spentCents,
    spent: c.spentCents / 100,
    startDate: c.startDate,
    endDate: c.endDate,
    status: mapStatusForClient(c.status),
    impressions: c._count.impressions,
    clicks: c._count.clicks,
    targeting: c.targeting,
    creativeUrl: c.creative.fileUrl,
    creativeType: c.creative.type,
    createdAt: c.createdAt.toISOString(),
  }));

  return NextResponse.json({ campaigns, authenticated: true });
}

export async function POST(req: NextRequest) {
  const ownerId = await resolveCampaignOwnerId(req);
  if (!ownerId) {
    return NextResponse.json({ error: "Authentication required", ok: false }, { status: 401 });
  }

  let body: {
    name?: string;
    slot?: string;
    placement?: string;
    budget?: number;
    budgetCents?: number;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    targeting?: Record<string, unknown>;
    creativeUrl?: string;
    creativeType?: string;
    description?: string;
    objective?: string;
    launch?: boolean;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", ok: false }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Campaign name is required", ok: false }, { status: 400 });
  }

  const slotKey = body.placement ?? body.slot ?? "billboard";
  const slot = PLACEMENT_TO_SLOT[slotKey] ?? slotKey;
  const budgetCents =
    body.budgetCents ??
    Math.round(Math.max(0, Number(body.budget) || 0) * 100);

  const startDate = body.startDate ?? new Date().toISOString().slice(0, 10);
  let endDate = body.endDate ?? "";
  if (!endDate && body.durationDays) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + Number(body.durationDays));
    endDate = end.toISOString().slice(0, 10);
  }
  if (!endDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 30);
    endDate = end.toISOString().slice(0, 10);
  }

  const targeting = {
    ...(body.targeting ?? {}),
    ...(body.description ? { description: body.description } : {}),
    ...(body.objective ? { objective: body.objective } : {}),
  };

  try {
    const creative = await ensureDraftCreative(ownerId, body.creativeUrl, body.creativeType);
    const status = body.launch === false ? "draft" : "pending_review";

    const campaign = await prisma.adCampaign.create({
      data: {
        advertiserId: ownerId,
        name,
        creativeId: creative.id,
        slot,
        budgetCents,
        spentCents: 0,
        startDate,
        endDate,
        targeting,
        status,
      },
      include: {
        creative: { select: { fileUrl: true, type: true } },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slot: campaign.slot,
          budgetCents: campaign.budgetCents,
          budget: campaign.budgetCents / 100,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          status: mapStatusForClient(campaign.status),
          targeting: campaign.targeting,
          creativeUrl: campaign.creative.fileUrl,
        },
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ownerId = await resolveCampaignOwnerId(req);
  if (!ownerId) {
    return NextResponse.json({ error: "Authentication required", ok: false }, { status: 401 });
  }

  let body: { id?: string; status?: string; action?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", ok: false }, { status: 400 });
  }

  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "Campaign id is required", ok: false }, { status: 400 });
  }

  const existing = await prisma.adCampaign.findFirst({
    where: { id, advertiserId: ownerId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Campaign not found", ok: false }, { status: 404 });
  }

  let nextStatus = existing.status;
  const action = body.action ?? body.status;
  if (action === "start" || action === "active" || action === "launch") {
    nextStatus = "pending_review";
  } else if (action === "pause" || action === "paused") {
    nextStatus = "paused";
  } else if (action === "resume") {
    nextStatus = "live";
  } else if (action === "draft") {
    nextStatus = "draft";
  } else if (typeof body.status === "string") {
    nextStatus = body.status;
  }

  const updated = await prisma.adCampaign.update({
    where: { id },
    data: { status: nextStatus },
  });

  return NextResponse.json({
    ok: true,
    campaign: {
      id: updated.id,
      status: mapStatusForClient(updated.status),
    },
  });
}
