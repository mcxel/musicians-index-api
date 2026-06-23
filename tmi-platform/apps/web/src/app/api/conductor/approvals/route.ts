export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const approvals: Array<{ id: string; type: string; description: string; amount: number; requestedBy: string; status: string; createdAt: string }> = [];

export async function GET() {
  return NextResponse.json({ approvals, pending: approvals.filter(a => a.status === 'PENDING').length });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { id?: string; action?: string };
  const { id, action } = body;
  const idx = approvals.findIndex(a => a.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (action === 'approve') approvals[idx]!.status = 'APPROVED';
  else if (action === 'deny') approvals[idx]!.status = 'DENIED';
  else return NextResponse.json({ error: 'action must be approve or deny' }, { status: 400 });
  return NextResponse.json({ ok: true, approval: approvals[idx] });
}
