import React from 'react';

// NOT WIRED IN — reference layout only. Every deployment record below is hardcoded,
// not real state. Do not register in WorkspaceWidgetRegistry until backed by a real
// deployment/release source (Rule 20: No Fake Data).

const Deployment = ({ name, status, version }: { name: string; status: 'deployed' | 'pending' | 'failed'; version: string }) => {
  const statusIndicator = {
    deployed: 'bg-emerald-500',
    pending: 'bg-amber-500 animate-pulse',
    failed: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-sm">
      <div className={`w-2 h-2 rounded-full ${statusIndicator[status]}`} />
      <div className="flex-1">
        <div className="text-xs text-zinc-200">{name}</div>
        <div className="text-[10px] text-zinc-500 font-mono">{version}</div>
      </div>
    </div>
  );
};

export const DeploymentStatusPanel = () => (
  <div className="p-2 space-y-2">
    <Deployment name="WebApp" status="deployed" version="v2.1.4-a" />
    <Deployment name="APIService" status="deployed" version="v1.9.2" />
    <Deployment name="BotOrchestrator" status="pending" version="v3.0.1" />
  </div>
);