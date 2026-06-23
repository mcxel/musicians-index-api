import { NextRequest, NextResponse } from 'next/server';
import {
  intakeDeveloperTask,
  getDeveloperHqSnapshot,
  type DevTaskSeverity,
  type DevTaskType,
} from '@/lib/ops/DeveloperOperationsHQ';
import { getSystemResilienceSnapshot } from '@/lib/ops/SystemResilienceHQ';
import { TMI_DOMAIN_REGISTRY } from '@/lib/ops/TMIDomainRegistry';

export const dynamic = 'force-dynamic';

function parseTaskType(raw: string): DevTaskType | null {
  const valid: DevTaskType[] = [
    'broken-button',
    'missing-image',
    'dead-route',
    'failed-upload',
    'slow-page',
    'bad-mobile-layout',
    'fake-data',
    'missing-profile-field',
    'broken-media-panel',
    'audio-video-issue',
    'payment-issue',
    'database-issue',
    'security-issue',
  ];
  return valid.includes(raw as DevTaskType) ? (raw as DevTaskType) : null;
}

function parseSeverity(raw: string): DevTaskSeverity {
  if (raw === 'critical' || raw === 'high' || raw === 'medium' || raw === 'low') return raw;
  return 'medium';
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    developerHq: getDeveloperHqSnapshot(),
    resilience: getSystemResilienceSnapshot(),
    domainRegistry: TMI_DOMAIN_REGISTRY,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    issueType?: string;
    severity?: string;
    sourceRoute?: string;
    sourceFile?: string;
  };

  const title = (body.title ?? '').trim();
  const issueType = parseTaskType((body.issueType ?? '').trim());
  const severity = parseSeverity((body.severity ?? '').trim());

  if (!title || !issueType) {
    return NextResponse.json({ ok: false, error: 'title and valid issueType are required' }, { status: 400 });
  }

  const task = intakeDeveloperTask({
    title,
    issueType,
    severity,
    reportedBy: 'manual',
    sourceRoute: body.sourceRoute,
    sourceFile: body.sourceFile,
  });

  return NextResponse.json({ ok: true, task }, { status: 201 });
}
