export type ShareTaskPayload = {
  room: string;
  route: string;
  prop?: string | null;
  emote?: string | null;
  latestTip?: string | null;
  health?: string | null;
  recapAvailable?: boolean;
};

export type OrchestratorResult = {
  ok: boolean;
  jobId?: string;
  validated?: boolean;
  errors?: string[];
  note?: string;
};

export async function sendShareTask(payload: ShareTaskPayload): Promise<OrchestratorResult> {
  // lightweight local-only validation
  const errors: string[] = [];
  if (!payload.room) errors.push('missing room');
  if (!payload.route) errors.push('missing route');

  // log the incoming task for local debugging
  try { console.info('[tool-orchestrator] received share task', payload); } catch (e) {}

  // simulate async validation/processing
  return new Promise((resolve) => {
    setTimeout(() => {
      if (errors.length) {
        resolve({ ok: false, validated: false, errors, note: 'validation failed (local mock)' });
      } else {
        const jobId = `mock-job-${Date.now()}`;
        // emit a local event so UI can react if desired
        try { window.dispatchEvent(new CustomEvent('bb:tool:share:result', { detail: { jobId, payload } })); } catch (e) {}
        resolve({ ok: true, jobId, validated: true, note: 'mock share task prepared' });
      }
    }, 300);
  });
}

export type RecapItem = {
  id: string;
  title?: string | null;
  body?: string | null;
  timestamp?: number;
};

export type RecapTaskPayload = {
  room: string;
  route: string;
  recaps: RecapItem[];
};

export async function sendRecapTask(payload: RecapTaskPayload): Promise<OrchestratorResult> {
  // lightweight local-only validation
  const errors: string[] = [];
  if (!payload.room) errors.push('missing room');
  if (!payload.route) errors.push('missing route');
  if (!payload.recaps || !Array.isArray(payload.recaps) || payload.recaps.length === 0) errors.push('no recaps');

  try { console.info('[tool-orchestrator] received recap task', payload); } catch (e) {}

  return new Promise((resolve) => {
    setTimeout(() => {
      if (errors.length) {
        resolve({ ok: false, validated: false, errors, note: 'validation failed (local mock)' });
      } else {
        const jobId = `mock-recap-job-${Date.now()}`;
        // emit a local event so UI can react if desired
        try { window.dispatchEvent(new CustomEvent('bb:tool:recap:result', { detail: { jobId, payload } })); } catch (e) {}
        resolve({ ok: true, jobId, validated: true, note: 'mock recap task queued' });
      }
    }, 400);
  });
}
