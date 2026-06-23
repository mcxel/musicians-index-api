import { getDeveloperHqSnapshot } from '@/lib/ops/DeveloperOperationsHQ';

export type SystemHealthScore = {
  key: string;
  label: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
};

function toStatus(score: number): 'healthy' | 'warning' | 'critical' {
  if (score >= 85) return 'healthy';
  if (score >= 60) return 'warning';
  return 'critical';
}

export function getSystemResilienceSnapshot(): {
  capturedAt: number;
  systems: SystemHealthScore[];
  summary: {
    healthy: number;
    warning: number;
    critical: number;
  };
} {
  const dev = getDeveloperHqSnapshot();
  const open = dev.tasks.filter((t) => t.status !== 'closed');

  const mobilePenalty = open.filter((t) => t.issueType === 'bad-mobile-layout').length * 8;
  const routePenalty = open.filter((t) => t.issueType === 'dead-route' || t.issueType === 'broken-button').length * 10;
  const mediaPenalty = open.filter((t) => t.issueType === 'failed-upload' || t.issueType === 'broken-media-panel').length * 10;
  const revenuePenalty = open.filter((t) => t.issueType === 'payment-issue').length * 15;
  const securityPenalty = open.filter((t) => t.issueType === 'security-issue').length * 15;

  const systems: SystemHealthScore[] = [
    { key: 'home-1', label: 'Home 1 Health', score: Math.max(0, 100 - mobilePenalty - routePenalty), status: 'healthy' },
    { key: 'home-1-2', label: 'Home 1-2 Health', score: Math.max(0, 100 - routePenalty - mobilePenalty), status: 'healthy' },
    { key: 'webrtc', label: 'WebRTC Health', score: Math.max(0, 100 - mediaPenalty), status: 'healthy' },
    { key: 'media', label: 'Media Pipeline Health', score: Math.max(0, 100 - mediaPenalty), status: 'healthy' },
    { key: 'ticketing', label: 'Ticket Center Health', score: Math.max(0, 100 - revenuePenalty), status: 'healthy' },
    { key: 'revenue', label: 'Revenue Governor Health', score: Math.max(0, 100 - revenuePenalty), status: 'healthy' },
    { key: 'identity', label: 'Identity/Profile Health', score: Math.max(0, 100 - securityPenalty), status: 'healthy' },
  ].map((row) => ({ ...row, status: toStatus(row.score) }));

  const summary = systems.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { healthy: 0, warning: 0, critical: 0 }
  );

  return {
    capturedAt: Date.now(),
    systems,
    summary,
  };
}
