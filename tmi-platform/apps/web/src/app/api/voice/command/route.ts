import { NextRequest, NextResponse } from 'next/server';

// System prompt that teaches Claude about the TMI platform commands
const SYSTEM_PROMPT = `You are the TMI Platform Voice Director AI for BerntoutGlobal / The Musician's Index.
You receive spoken commands from platform operators and administrators and convert them into structured platform actions.

Available platform actions:
- navigate: Go to a specific page/route (e.g. "go to overseer", "open broadcast studio")
- go_live: Start a broadcast
- end_broadcast: End the current broadcast
- open_curtains: Open the digital stage curtains
- trigger_giveaway: Trigger a sponsor giveaway
- panic_cut: Emergency cut all streams
- summon_big_ace: Open a video call with Big Ace
- start_meeting: Start a team meeting
- lock_platform: Lock the platform (soft lockdown)
- unlock_platform: Unlock the platform
- approve_queue: Approve the pending submission queue
- zoom_feed: Zoom into the active live feed
- mute_all: Mute all audio
- pull_analytics: Show analytics dashboard
- send_alert: Send a system alert to staff

Respond ONLY with valid JSON in this format:
{
  "action": "action_name",
  "target": "optional target/route/person",
  "confirmation": "A short spoken confirmation in plain English (1 sentence)",
  "urgency": "low|medium|high"
}

If the command is unclear or not a valid platform action, respond with:
{
  "action": "unknown",
  "target": null,
  "confirmation": "I didn't catch that. Please try again.",
  "urgency": "low"
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  let body: { transcript?: string; role?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const { transcript, role = 'admin' } = body;
  if (!transcript?.trim()) {
    return NextResponse.json({ ok: false, error: 'transcript required' }, { status: 422 });
  }

  // Gate non-admins to read-only actions
  const userPrompt = role === 'admin' || role === 'superadmin'
    ? `Platform operator command: "${transcript}"`
    : `Non-admin user command (read-only actions only): "${transcript}"`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[VoiceDirector] Claude API error:', err);
      return NextResponse.json({ ok: false, error: 'ai_error' }, { status: 502 });
    }

    const claude = await response.json();
    const text = claude.content?.[0]?.text ?? '{}';

    let parsed: { action: string; target: string | null; confirmation: string; urgency: string };
    try { parsed = JSON.parse(text); } catch {
      parsed = { action: 'unknown', target: null, confirmation: 'Command processed but response was unclear.', urgency: 'low' };
    }

    return NextResponse.json({ ok: true, ...parsed, transcript });
  } catch (err) {
    console.error('[VoiceDirector] fetch error:', err);
    return NextResponse.json({ ok: false, error: 'network_error' }, { status: 503 });
  }
}
