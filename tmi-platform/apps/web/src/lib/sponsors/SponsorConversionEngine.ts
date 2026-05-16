// SponsorConversionEngine
// Tracks per-sponsor: views, clicks, joins, watch time → CTR + join-rate reports.

export type ConversionRecord = {
  sponsorId: string;
  sponsorName: string;
  views: number;
  clicks: number;
  joins: number;
  watchTimeSeconds: number;
};

export type ConversionReport = ConversionRecord & {
  ctr: number;           // clicks/views * 100, percent
  joinRate: number;      // joins/clicks * 100, percent
  avgWatchSeconds: number;
};

const _records: Record<string, ConversionRecord> = {};
let _counter = 0;

function ensure(sponsorId: string, sponsorName: string): ConversionRecord {
  if (!_records[sponsorId]) {
    _records[sponsorId] = { sponsorId, sponsorName, views: 0, clicks: 0, joins: 0, watchTimeSeconds: 0 };
  }
  return _records[sponsorId]!;
}

export function recordView(sponsorId: string, sponsorName = "Unknown"): void {
  ensure(sponsorId, sponsorName).views++;
}

export function recordClick(sponsorId: string, sponsorName = "Unknown"): void {
  ensure(sponsorId, sponsorName).clicks++;
}

export function recordJoin(sponsorId: string, sponsorName = "Unknown"): void {
  ensure(sponsorId, sponsorName).joins++;
}

export function addWatchTime(sponsorId: string, seconds: number, sponsorName = "Unknown"): void {
  ensure(sponsorId, sponsorName).watchTimeSeconds += seconds;
}

function toReport(r: ConversionRecord): ConversionReport {
  return {
    ...r,
    ctr: r.views > 0 ? Math.round((r.clicks / r.views) * 10000) / 100 : 0,
    joinRate: r.clicks > 0 ? Math.round((r.joins / r.clicks) * 10000) / 100 : 0,
    avgWatchSeconds: r.joins > 0 ? Math.round(r.watchTimeSeconds / r.joins) : 0,
  };
}

export function getConversionReport(sponsorId: string): ConversionReport | null {
  const r = _records[sponsorId];
  return r ? toReport(r) : null;
}

export function getAllConversionReports(): ConversionReport[] {
  return Object.values(_records)
    .map(toReport)
    .sort((a, b) => b.ctr - a.ctr);
}

export function getTopPerformer(): ConversionReport | null {
  return getAllConversionReports()[0] ?? null;
}

// ── Seed mock data for display ────────────────────────────────────────────────

void (() => {
  const seed = (id: string, name: string, v: number, c: number, j: number, w: number) => {
    const r = ensure(id, name);
    r.views = v; r.clicks = c; r.joins = j; r.watchTimeSeconds = w;
    _counter++;
  };
  seed("soundwave-audio", "SoundWave Audio", 14820, 2340,  890, 142_000);
  seed("beatvault-pro",   "BeatVault Pro",   9200,  1180,  420,  78_000);
  seed("crown-energy",    "Crown Energy",    6540,   980,  310,  54_000);
  seed("tmi-merch",       "TMI Merch Hub",   4120,   630,  180,  29_000);
})();
