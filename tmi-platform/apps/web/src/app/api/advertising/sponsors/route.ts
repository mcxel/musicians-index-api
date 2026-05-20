import { NextResponse } from "next/server";

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
    const body = (await request.json()) as { sponsorId: string; sponsorName: string; budget: number; placements: string[] };
    const { sponsorId, sponsorName, budget, placements } = body;
    if (!sponsorId || !budget) {
      return NextResponse.json({ error: "sponsorId and budget required" }, { status: 400 });
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
    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
