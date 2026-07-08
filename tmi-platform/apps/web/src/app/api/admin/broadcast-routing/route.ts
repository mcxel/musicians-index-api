export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  applyBroadcastPreset,
  executeBroadcastRoutingOperation,
  listBroadcastPresets,
  listBroadcastRoutingOperations,
  moveFeed,
  playNextQueuedFeed,
} from '@/lib/broadcast/BroadcastRoutingEngine';
import { listBroadcastPanelStates } from '@/lib/broadcast/PanelRegistry';

export function GET() {
  return NextResponse.json({
    updatedAtMs: Date.now(),
    operations: listBroadcastRoutingOperations(),
    presets: listBroadcastPresets(),
    panels: listBroadcastPanelStates(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = String(body.command ?? '');

    if (command === 'assign' || command === 'swap' || command === 'queue' || command === 'clear' || command === 'clone' || command === 'idle') {
      const result = executeBroadcastRoutingOperation({
        operation: command,
        panelId: body.panelId,
        panelA: body.panelA,
        panelB: body.panelB,
        fromPanel: body.fromPanel,
        toPanel: body.toPanel,
        feed: body.feed,
      });
      return NextResponse.json({ ok: true, result, panels: listBroadcastPanelStates() });
    }

    // Legacy compatibility path; canonical operations are normalized above.
    if (command === 'next') {
      const result = playNextQueuedFeed(body.panelId);
      return NextResponse.json({ ok: true, result, panels: listBroadcastPanelStates() });
    }

    // Legacy compatibility path; canonical operations are normalized above.
    if (command === 'move') {
      const result = moveFeed(body.fromPanel, body.toPanel);
      return NextResponse.json({ ok: true, result, panels: listBroadcastPanelStates() });
    }

    if (command === 'preset') {
      const panels = applyBroadcastPreset(body.preset);
      return NextResponse.json({ ok: true, panels });
    }

    return NextResponse.json({ ok: false, error: 'unknown_command' }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}