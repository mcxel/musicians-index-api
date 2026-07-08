export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/TMIEmailSystem';

// All hardcoded Diamond VIP members
const DIAMOND_MEMBERS = [
  { email: 't.muse82@icloud.com',              name: 'T. Muse'         },
  { email: 'facethebully916@gmail.com',         name: 'Face The Bully'  },
  { email: 'kevenfobbsgrip@gmail.com',          name: 'Keven Fobbs'     },
  { email: 'parisdcooper91@gmail.com',          name: 'Paris Cooper'    },
  { email: 'mystictrinity@yahoo.com',           name: 'Mystic Trinity'  },
  { email: 'sharingmyblessing1978@gmail.com',   name: 'Sharing My Blessing' },
  { email: 'blackstargoldpr@gmail.com',         name: 'Black Star Gold' },
];

function authCheck(req: NextRequest): boolean {
  const key = req.headers.get('authorization') ?? req.headers.get('x-admin-key') ?? '';
  return (
    key === `Bearer ${process.env.ADMIN_API_KEY}` ||
    key === `Bearer ${process.env.ADMIN_API_SECRET}` ||
    key === process.env.ADMIN_API_KEY
  );
}

// POST /api/admin/send-diamond-invites
// Blasts welcome_diamond email to every hardcoded Diamond member
export async function POST(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { email: string; name: string; success: boolean; error?: string }[] = [];

  for (const member of DIAMOND_MEMBERS) {
    const result = await sendEmail({
      to:   member.email,
      type: 'welcome_diamond',
      data: { name: member.name },
    });
    results.push({ email: member.email, name: member.name, ...result });
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  const sent    = results.filter(r => r.success).length;
  const failed  = results.filter(r => !r.success).length;

  console.info(`[send-diamond-invites] Sent ${sent}/${DIAMOND_MEMBERS.length} Diamond invite emails`);

  return NextResponse.json({ ok: true, sent, failed, results }, { status: 200 });
}

// GET — preview the list without sending
export async function GET(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ members: DIAMOND_MEMBERS, count: DIAMOND_MEMBERS.length });
}
