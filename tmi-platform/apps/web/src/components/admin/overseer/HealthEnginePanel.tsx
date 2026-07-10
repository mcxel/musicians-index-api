import React from 'react';

// NOT WIRED IN — reference layout only. Every metric below is hardcoded, not real
// telemetry. Do not register in WorkspaceWidgetRegistry until backed by a real
// health/observability source (Rule 20: No Fake Data).

const Metric = ({ label, value, status }: { label: string; value: string; status: 'ok' | 'warn' | 'fail' }) => {
  const statusColor = {
    ok: 'text-emerald-400',
    warn: 'text-amber-400',
    fail: 'text-red-400',
  };
  return (
    <div className="flex justify-between items-baseline bg-zinc-900/50 p-2 rounded-sm">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`text-sm font-bold font-mono ${statusColor[status]}`}>{value}</span>
    </div>
  );
};

export const HealthEnginePanel = () => {
  return (
    <div className="p-2 space-y-2">
      <Metric label="API Latency" value="42ms" status="ok" />
      <Metric label="DB Queries" value="112/s" status="ok" />
      <Metric label="Error Rate" value="0.02%" status="ok" />
      <Metric label="Cache Hit" value="98.7%" status="ok" />
      <Metric label="Auth Failures" value="3" status="warn" />
    </div>
  );
};