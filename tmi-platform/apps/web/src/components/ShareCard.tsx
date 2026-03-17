"use client";

import React, { useEffect, useState } from "react";
import { getLoadout } from "../lib/inventoryState";
import { createSharePayload, encodePayload, lastSharePayload } from "../lib/sharePayload";
import { sendShareTask } from "../lib/toolOrchestrator";

export function ShareCard({ room = 'Bar Stage', route = '/room/bar-stage' }: { room?: string; route?: string }) {
  const [loadout, setLoadout] = useState<any>(getLoadout());
  const [latestTip, setLatestTip] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | 'link' | 'summary'>(null);
  const [hasRecaps, setHasRecaps] = useState(false);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    try { const lt = sessionStorage.getItem('bb_latest_tip'); if (lt) setLatestTip(lt); } catch (e) {}
    try { const h = sessionStorage.getItem('bb_room_health_bar-stage'); if (h) setHealth(h); } catch (e) {}
    try { const r = sessionStorage.getItem('bb_recaps_v1'); setHasRecaps(Boolean(r && r.length > 2)); } catch (e) {}

    function onLoadout(e: any) { setLoadout(e.detail || getLoadout()); }
    function onTip(e: any) { setLatestTip(String(e?.detail?.amount || '')); }
    function onHealth(e: any) { setHealth(e?.detail?.health || null); }
    function onRecapSaved() { try { const r = sessionStorage.getItem('bb_recaps_v1'); setHasRecaps(Boolean(r && r.length > 2)); } catch (e) {} }

    window.addEventListener('bb:loadout:changed', onLoadout as EventListener);
    window.addEventListener('bb:tip', onTip as EventListener);
    window.addEventListener('bb:room:health:changed', onHealth as EventListener);
    window.addEventListener('bb:recap:saved', onRecapSaved as EventListener);
    return () => {
      window.removeEventListener('bb:loadout:changed', onLoadout as EventListener);
      window.removeEventListener('bb:tip', onTip as EventListener);
      window.removeEventListener('bb:room:health:changed', onHealth as EventListener);
      window.removeEventListener('bb:recap:saved', onRecapSaved as EventListener);
    };
  }, []);

  function buildPayload() {
    const payload = createSharePayload({
      room,
      route,
      prop: loadout?.prop || null,
      emote: loadout?.emote || null,
      latestTip: latestTip || null,
      health: health || null,
    });
    return payload;
  }

  async function copyLink() {
    const p = buildPayload();
    const encoded = encodePayload(p as any);
    const url = `${window.location.origin}${route}?share=${encoded}`;
    try { await navigator.clipboard.writeText(url); setCopied('link'); setTimeout(() => setCopied(null), 1500); } catch (e) { alert('Copy failed'); }
  }

  async function copySummary() {
    const p = buildPayload();
    const summary = `Join me in ${p.room} — prop:${p.prop||'none'} emote:${p.emote||'none'} tip:${p.latestTip||'none'}`;
    try { await navigator.clipboard.writeText(summary); setCopied('summary'); setTimeout(() => setCopied(null), 1500); } catch (e) { alert('Copy failed'); }
  }

  async function prepareShareJob() {
    setJobStatus('preparing');
    const p = buildPayload();
    const result = await sendShareTask({
      room: p.room,
      route: p.route,
      prop: p.prop,
      emote: p.emote,
      latestTip: p.latestTip,
      health: p.health,
      recapAvailable: hasRecaps,
    });
    if (result.ok) {
      setJobStatus('prepared');
      setJobId(result.jobId || null);
    } else {
      setJobStatus('failed: ' + (result.errors?.join(', ') || result.note || 'unknown'));
      setJobId(null);
    }
    // clear status after a short time
    setTimeout(() => setJobStatus(null), 3000);
  }

  const last = lastSharePayload();

  return (
    <div className="bg-gray-900 p-3 rounded space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Share / Invite</div>
          <div className="text-xs text-gray-400">Generate a simple invite link for this room (placeholder)</div>
        </div>
        <div className="text-xs text-gray-300">{room}</div>
      </div>

      <div className="text-sm text-gray-300">
        <div>Prop: <span className="font-medium">{loadout?.prop || 'None'}</span></div>
        <div>Emote: <span className="font-medium">{loadout?.emote || 'None'}</span></div>
        <div>Tip: <span className="font-medium">{latestTip || 'None'}</span></div>
        <div>Health: <span className="font-medium">{health || 'healthy'}</span></div>
      </div>

      <div className="flex gap-2">
        <button onClick={copyLink} className="px-3 py-1 bg-blue-600 rounded">Copy Invite Link</button>
        <button onClick={copySummary} className="px-3 py-1 bg-gray-700 rounded">Copy Share Summary</button>
        <button onClick={prepareShareJob} className="px-3 py-1 bg-indigo-600 rounded">Prepare Share Job</button>
        {hasRecaps && <a href="/recaps" className="px-3 py-1 bg-green-600 rounded">Open Recaps</a>}
      </div>

      {jobStatus && (
        <div className="text-xs text-gray-300 mt-2">Tool Orchestrator: {jobStatus}{jobId ? ' (jobId: '+jobId+')' : ''}</div>
      )}

      {last && (
        <div className="text-xs text-gray-400 pt-2">Last share: {new Date(last.ts||0).toLocaleString()}</div>
      )}

      {copied === 'link' && <div className="text-xs text-green-400">Invite link copied</div>}
      {copied === 'summary' && <div className="text-xs text-green-400">Share summary copied</div>}
    </div>
  );
}
