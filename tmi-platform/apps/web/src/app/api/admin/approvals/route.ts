export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

type ApprovalStatus = 'pending' | 'review' | 'approved' | 'rejected';
type Approval = { id: string; type: string; name: string; submitted: string; status: ApprovalStatus };

const QUEUE: Approval[] = [
  { id: "ap1", type: "Artist Registration", name: "FlowState.J", submitted: "May 18, 2026", status: "pending" },
  { id: "ap2", type: "Sponsor Application", name: "NeonBrand LLC", submitted: "May 17, 2026", status: "pending" },
  { id: "ap3", type: "Venue Onboard", name: "The Warehouse", submitted: "May 16, 2026", status: "review" },
  { id: "ap4", type: "Beat Upload", name: "Yung Mako - Beat #14", submitted: "May 15, 2026", status: "approved" },
];

export async function GET() {
  return NextResponse.json(QUEUE);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { id?: string; action?: string };
  if (!body.id || !body.action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });
  const item = QUEUE.find(a => a.id === body.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  item.status = body.action === 'approve' ? 'approved' : 'rejected';
  return NextResponse.json({ ok: true, item });
}
