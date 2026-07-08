'use client';

import { useEffect, useState } from 'react';

type LaunchStatusResponse = {
  status: {
    revenue: boolean;
    discovery: boolean;
    operations: boolean;
    experience: boolean;
    policy: boolean;
    mobile: boolean;
    overall: boolean;
  };
  lastCertification: string | null;
  currentBuild: string;
  currentVersion: string;
};

const STATUS_ROWS: Array<{ key: keyof LaunchStatusResponse['status']; label: string }> = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'operations', label: 'Operations' },
  { key: 'experience', label: 'Experience' },
  { key: 'policy', label: 'Policy' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'overall', label: 'Overall Status' },
];

function statusColor(ok: boolean): string {
  return ok ? '#00FF88' : '#FF2DAA';
}

function statusLabel(ok: boolean): string {
  return ok ? 'GREEN' : 'RED';
}

export default function LaunchStatusCard() {
  const [data, setData] = useState<LaunchStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/admin/launch-status', { cache: 'no-store' });
        if (!res.ok) return;
        const body = (await res.json()) as LaunchStatusResponse;
        if (!cancelled) setData(body);
      } catch {
        // Keep observatory stable on transient errors.
      }
    };

    void load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div style={{ border: '1px solid rgba(0,255,255,0.25)', borderRadius: 10, padding: 12, background: 'rgba(0,255,255,0.05)' }}>
      <div style={{ fontSize: 8, letterSpacing: '0.18em', color: '#00FFFF', fontWeight: 900, marginBottom: 10 }}>
        LAUNCH STATUS
      </div>

      {!data ? (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Loading launch certification state...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10 }}>
            {STATUS_ROWS.map((row) => {
              const ok = data.status[row.key];
              return (
                <span key={row.key} style={{ color: statusColor(ok), fontWeight: row.key === 'overall' ? 900 : 700 }}>
                  {row.label}: {statusLabel(ok)}
                </span>
              );
            })}
          </div>

          <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            <div>Last Certification: {data.lastCertification ? new Date(data.lastCertification).toLocaleString() : 'N/A'}</div>
            <div>Current Build: {data.currentBuild}</div>
            <div>Current Version: {data.currentVersion}</div>
          </div>
        </>
      )}
    </div>
  );
}
