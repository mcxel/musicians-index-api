import { NextResponse } from "next/server";
import { revenueFirstRewardsGovernor } from '@/lib/economy/RevenueFirstRewardsGovernor';

interface SponsorCampaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  placements: string[];
  status: "active" | "paused" | "completed";
  createdAt: string;
}

const SEED_CAMPAIGNS: SponsorCampaign[] = [
  { id: "sc001", sponsorId: "sponsor_a", sponsorName: "BeatGear Co", budget: 5000, spent: 1200, impressions: 48000, clicks: 920, placements: ["rooms/world-dance-party", "magazine/cover"], status: "active", createdAt: "2026-05-01" },
  { id: "sc002", sponsorId: "sponsor_b", sponsorName: "FlowTech Audio", budget: 2500, spent: 800, impressions: 22000, clicks: 440, placements: ["rooms/cypher"], status: "active", createdAt: "2026-05-06" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sponsorId = searchParams.get("sponsorId");
  const campaigns = sponsorId ? SEED_CAMPAIGNS.filter(c => c.sponsorId === sponsorId) : SEED_CAMPAIGNS;
  return NextResponse.json({ campaigns, total: campaigns.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sponsorId: string;
      sponsorName: string;
      budget: number;
      placements: string[];
      expectedOperatingCostCents?: number;
      expectedInfrastructureCostCents?: number;
      expectedPrizePoolCents?: number;
    };
    const { sponsorId, sponsorName, budget, placements } = body;
    if (!sponsorId || !budget) {
      return NextResponse.json({ error: "sponsorId and budget required" }, { status: 400 });
    }

    const economics = revenueFirstRewardsGovernor.assessEventEconomics({
      expectedRevenueCents: Math.floor(Math.max(0, Number(budget)) * 100),
      expectedOperatingCostCents: Math.max(0, Number(body.expectedOperatingCostCents ?? 0)),
      expectedInfrastructureCostCents: Math.max(0, Number(body.expectedInfrastructureCostCents ?? 0)),
      expectedPrizePoolCents: Math.max(0, Number(body.expectedPrizePoolCents ?? 0)),
    });

    if (!economics.allowed) {
      return NextResponse.json({
        ok: false,
        error: 'Sponsor campaign rejected by revenue governor',
        code: 'EVENT_ECONOMICS_GATE_REJECTED',
        economics,
      }, { status: 409 });
    }

    const campaign: SponsorCampaign = {
      id: `sc_${Date.now()}`,
      sponsorId,
      sponsorName: sponsorName ?? sponsorId,
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      placements: placements ?? [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    SEED_CAMPAIGNS.push(campaign);
    return NextResponse.json({ success: true, campaign, economics }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
