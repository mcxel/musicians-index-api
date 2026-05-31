import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { SubmissionEngine } from '@/lib/db/schema/submission';
import { SystemSecurityBot } from '@/lib/bots/SystemSecurityBot';

const securityBot = new SystemSecurityBot();

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
  
  // Protect the ingest pipeline from spam bots
  const { allowed } = checkRateLimit(`submit:content:${clientIp}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a moment.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { type, title, mediaUrl, description, userId = 'anonymous_user' } = body;

    if (!type || !title || !mediaUrl) {
      return NextResponse.json({ error: 'Missing required submission fields (type, title, mediaUrl)' }, { status: 400 });
    }

    if (!securityBot.scanComms(title) || (description && !securityBot.scanComms(description))) {
      return NextResponse.json({ error: 'Malicious payload detected by Security Bot.' }, { status: 403 });
    }

    const submission = await SubmissionEngine.createSubmission({ type, title, mediaUrl, description, userId });
    
    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Submission pipeline failed.' }, { status: 500 });
  }
}