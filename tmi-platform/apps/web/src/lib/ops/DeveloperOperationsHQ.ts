import { generateDevAuditReport, getLatestAuditReport } from '@/lib/bots/developerBotBridge';

export type DevTaskType =
  | 'broken-button'
  | 'missing-image'
  | 'dead-route'
  | 'failed-upload'
  | 'slow-page'
  | 'bad-mobile-layout'
  | 'fake-data'
  | 'missing-profile-field'
  | 'broken-media-panel'
  | 'audio-video-issue'
  | 'payment-issue'
  | 'database-issue'
  | 'security-issue';

export type DevBotSpecialization =
  | 'visual-ui-bot'
  | 'routing-bot'
  | 'media-pipeline-bot'
  | 'webrtc-bot'
  | 'stripe-revenue-bot'
  | 'database-bot'
  | 'security-bot'
  | 'mobile-performance-bot'
  | 'qa-bot'
  | 'coder-bot';

export type DevTaskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DevTaskStatus = 'queued' | 'assigned' | 'in-progress' | 'blocked' | 'verified' | 'closed';

export type DeveloperTask = {
  id: string;
  title: string;
  issueType: DevTaskType;
  severity: DevTaskSeverity;
  sourceRoute?: string;
  sourceFile?: string;
  reportedBy: 'mc-command-desk' | 'operations-hq' | 'manual';
  assignedTo: DevBotSpecialization;
  assignmentReason: string;
  status: DevTaskStatus;
  createdAt: number;
  updatedAt: number;
  requiresHumanApproval: boolean;
};

export type FixLedgerEntry = {
  id: string;
  taskId: string;
  issueFound: string;
  filePath: string;
  routeAffected: string;
  fixAppliedOrRecommended: string;
  testResult: 'pass' | 'fail' | 'pending';
  remainingRisk: 'none' | 'low' | 'medium' | 'high';
  createdAt: number;
};

export type McDeskSignals = {
  revenueHealth: 'healthy' | 'warning' | 'critical';
  engagementHealth: 'healthy' | 'warning' | 'critical';
  boredomAlerts: number;
  brokenFlowAlerts: number;
  recommendations: string[];
};

let taskCounter = 1;
let ledgerCounter = 1;

const tasks: DeveloperTask[] = [];
const fixLedger: FixLedgerEntry[] = [];

const ASSIGNMENT_MAP: Record<DevTaskType, { bot: DevBotSpecialization; reason: string }> = {
  'broken-button': { bot: 'visual-ui-bot', reason: 'UI interaction defect' },
  'missing-image': { bot: 'media-pipeline-bot', reason: 'Media resolution or propagation failure' },
  'dead-route': { bot: 'routing-bot', reason: 'Route integrity violation' },
  'failed-upload': { bot: 'media-pipeline-bot', reason: 'Upload pipeline failure' },
  'slow-page': { bot: 'mobile-performance-bot', reason: 'Rendering/performance degradation' },
  'bad-mobile-layout': { bot: 'mobile-performance-bot', reason: 'Mobile responsive layout issue' },
  'fake-data': { bot: 'qa-bot', reason: 'Data authenticity / launch truth violation' },
  'missing-profile-field': { bot: 'database-bot', reason: 'Identity/data contract mismatch' },
  'broken-media-panel': { bot: 'webrtc-bot', reason: 'Playback/live media panel issue' },
  'audio-video-issue': { bot: 'webrtc-bot', reason: 'Audio/video subsystem issue' },
  'payment-issue': { bot: 'stripe-revenue-bot', reason: 'Revenue path or subscription defect' },
  'database-issue': { bot: 'database-bot', reason: 'Query/data integrity issue' },
  'security-issue': { bot: 'security-bot', reason: 'Security and abuse-risk issue' },
};

function now(): number {
  return Date.now();
}

function nextTaskId(): string {
  return `DEVHQ-TASK-${String(taskCounter++).padStart(4, '0')}`;
}

function nextLedgerId(): string {
  return `DEVHQ-LEDGER-${String(ledgerCounter++).padStart(4, '0')}`;
}

function needsHumanApproval(issueType: DevTaskType, severity: DevTaskSeverity): boolean {
  if (severity === 'critical') return true;
  return issueType === 'payment-issue' || issueType === 'security-issue' || issueType === 'fake-data';
}

function generateMcRecommendations(): string[] {
  const open = tasks.filter((t) => t.status !== 'closed');
  const byType = open.reduce<Record<string, number>>((acc, task) => {
    acc[task.issueType] = (acc[task.issueType] ?? 0) + 1;
    return acc;
  }, {});

  const recommendations: string[] = [];
  if ((byType['bad-mobile-layout'] ?? 0) > 2) recommendations.push('Run Mobile Orbit Stabilization Sprint');
  if ((byType['dead-route'] ?? 0) > 0) recommendations.push('Execute Route/Button Certification Sweep');
  if ((byType['failed-upload'] ?? 0) > 0 || (byType['missing-image'] ?? 0) > 0) recommendations.push('Prioritize Media Propagation Certification');
  if ((byType['payment-issue'] ?? 0) > 0) recommendations.push('Escalate Stripe/Revenue Bot + Human approval gate');

  return recommendations;
}

export function intakeDeveloperTask(input: {
  title: string;
  issueType: DevTaskType;
  severity: DevTaskSeverity;
  reportedBy: DeveloperTask['reportedBy'];
  sourceRoute?: string;
  sourceFile?: string;
}): DeveloperTask {
  const assignment = ASSIGNMENT_MAP[input.issueType];
  const task: DeveloperTask = {
    id: nextTaskId(),
    title: input.title,
    issueType: input.issueType,
    severity: input.severity,
    sourceRoute: input.sourceRoute,
    sourceFile: input.sourceFile,
    reportedBy: input.reportedBy,
    assignedTo: assignment.bot,
    assignmentReason: assignment.reason,
    status: 'assigned',
    createdAt: now(),
    updatedAt: now(),
    requiresHumanApproval: needsHumanApproval(input.issueType, input.severity),
  };

  tasks.unshift(task);
  return task;
}

export function updateDeveloperTaskStatus(taskId: string, status: DevTaskStatus): DeveloperTask | null {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.status = status;
  task.updatedAt = now();
  return task;
}

export function appendFixLedgerEntry(input: Omit<FixLedgerEntry, 'id' | 'createdAt'>): FixLedgerEntry {
  const entry: FixLedgerEntry = {
    id: nextLedgerId(),
    createdAt: now(),
    ...input,
  };
  fixLedger.unshift(entry);
  return entry;
}

export function getDeveloperHqSnapshot(): {
  mcDesk: McDeskSignals;
  tasks: DeveloperTask[];
  ledger: FixLedgerEntry[];
  latestAudit: ReturnType<typeof getLatestAuditReport>;
} {
  const open = tasks.filter((t) => t.status !== 'closed');
  const criticalOpen = open.filter((t) => t.severity === 'critical').length;
  const recommendations = generateMcRecommendations();

  const mcDesk: McDeskSignals = {
    revenueHealth: open.some((t) => t.issueType === 'payment-issue') ? 'warning' : 'healthy',
    engagementHealth: open.some((t) => t.issueType === 'slow-page' || t.issueType === 'bad-mobile-layout') ? 'warning' : 'healthy',
    boredomAlerts: open.filter((t) => t.issueType === 'slow-page').length,
    brokenFlowAlerts: open.filter((t) => t.issueType === 'broken-button' || t.issueType === 'dead-route').length,
    recommendations,
  };

  return {
    mcDesk,
    tasks,
    ledger: fixLedger,
    latestAudit: getLatestAuditReport(),
  };
}

// Seed launch-critical backlog once per runtime to avoid blank HQ.
if (tasks.length === 0) {
  intakeDeveloperTask({
    title: 'Home 1 orbit mobile stability verification',
    issueType: 'bad-mobile-layout',
    severity: 'high',
    reportedBy: 'mc-command-desk',
    sourceRoute: '/home/1',
    sourceFile: 'apps/web/src/components/home/Home1CoverPage.tsx',
  });
  intakeDeveloperTask({
    title: 'Route and button certification sweep',
    issueType: 'dead-route',
    severity: 'high',
    reportedBy: 'mc-command-desk',
    sourceRoute: '/home/1-2',
    sourceFile: 'apps/web/src/app/home/1-2/page.tsx',
  });
  intakeDeveloperTask({
    title: 'Signup tier integrity protection check',
    issueType: 'payment-issue',
    severity: 'critical',
    reportedBy: 'mc-command-desk',
    sourceRoute: '/api/auth/register',
    sourceFile: 'apps/web/src/app/api/auth/register/route.ts',
  });
  appendFixLedgerEntry({
    taskId: tasks[0]!.id,
    issueFound: 'Initial launch-critical queue initialized',
    filePath: 'apps/web/src/lib/ops/DeveloperOperationsHQ.ts',
    routeAffected: '/admin/observatory/developer-hq',
    fixAppliedOrRecommended: 'Seeded internal task intake and assignment engine',
    testResult: 'pending',
    remainingRisk: 'low',
  });

  // Keep legacy audit bridge active so existing admin tooling sees signals.
  generateDevAuditReport();
}
