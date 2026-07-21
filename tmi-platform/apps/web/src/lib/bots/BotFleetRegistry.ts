// ─── TMI Autonomous Bot Fleet Registry ──────────────────────────────────────
// Defines the canonical roles, capabilities, and responsibilities for all platform AI bots.
// Governed by the TMI Autonomous Enterprise Architecture.

export type BotRole =
  | 'COORDINATOR'      // Big Ace
  | 'BUSINESS_INTEL'   // Michael Charlie
  | 'AR_COMPANION'     // Julius (Amiibo AR Meerkat Companion)
  | 'HOST_PERFORMER'   // Dedicated show hosts
  | 'STAGE_MANAGER'    // Bebo
  | 'MUSIC_SELECTOR'   // Record Ralph
  | 'ENGINEERING_BOT'  // Code gen, tests, refactoring
  | 'SPONSOR_BOT'      // Ad campaigns, sponsorship inventory
  | 'QA_CERT_BOT';     // Regression testing, accessibility, certification

export interface BotInstance {
  id: string;
  name: string;
  role: BotRole;
  title: string;
  avatarUrl: string;
  accentColor: string;
  status: 'ACTIVE_ONLINE' | 'EXECUTING_TASK' | 'STANDBY';
  responsibilities: string[];
  currentTaskDescription?: string;
  completedTasksCount: number;
}

export const CANONICAL_BOT_FLEET: BotInstance[] = [
  {
    id: 'bot_big_ace',
    name: 'Big Ace',
    role: 'COORDINATOR',
    title: 'Chief Operational Coordinator & System Architect',
    avatarUrl: '/bot-images/Bot image 1.png',
    accentColor: '#00E5FF',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'System health monitoring & bottleneck identification',
      'Task routing & inter-agent synchronization',
      'Observatory telemetry aggregation',
    ],
    currentTaskDescription: 'Monitoring live broadcast buffer & room presence cluster',
    completedTasksCount: 1420,
  },
  {
    id: 'bot_michael_charlie',
    name: 'Michael Charlie',
    role: 'BUSINESS_INTEL',
    title: 'Business Intelligence & Creator Economy Director',
    avatarUrl: '/bot-images/Bot image 2.png',
    accentColor: '#FFD700',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'Flex Store pricing optimization ($0.99 - $4.99 tiers)',
      'Subscription revenue trend analysis & payout calculation',
      'Creator monetization & sponsorship ROI tracking',
    ],
    currentTaskDescription: 'Analyzing 7-day Flex Store rotation sales conversion',
    completedTasksCount: 980,
  },
  {
    id: 'bot_julius',
    name: 'Julius',
    role: 'AR_COMPANION',
    title: '360° Interactive Meerkat AR Companion (Amiibo-Style)',
    avatarUrl: '/bot-images/Bot image 3.png',
    accentColor: '#AA2DFF',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      '360° interactive AR companion & floating UI helper',
      'Chat command triggers (!julius dance, !julius magic, !julius spotlight, !julius confetti)',
      'Milestone celebrations & celebratory AR prop deployments',
      '3 Experience modes: Full Companion, Ambient (Default), Minimal',
    ],
    currentTaskDescription: 'Hanging around live stream stage, dancing & responding to chat commands',
    completedTasksCount: 750,
  },
  {
    id: 'bot_bebo',
    name: 'Bebo',
    role: 'STAGE_MANAGER',
    title: 'Comedy & Stage Exit Manager',
    avatarUrl: '/bot-images/Bot image 4.png',
    accentColor: '#FF2DAA',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'Humorous stage exits & Bebo Hook sequence',
      'Slapstick cartoon tomato response management',
      'Audience crowd energy pacing',
    ],
    currentTaskDescription: 'Readying mechanical stage hook for low-scoring acts',
    completedTasksCount: 1120,
  },
  {
    id: 'bot_record_ralph',
    name: 'Record Ralph',
    role: 'MUSIC_SELECTOR',
    title: 'Music Flow & DJ Experience Curator',
    avatarUrl: '/bot-images/Bot image 5.png',
    accentColor: '#00FF88',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'Beat battle transition & playlist sequencing',
      'World Dance Party track rotation',
      'Background music flow & audio level balancing',
    ],
    currentTaskDescription: 'Curating World Dance Party 90 BPM track queue',
    completedTasksCount: 1650,
  },
  {
    id: 'bot_engineering_fleet',
    name: 'Engineering Bot Fleet',
    role: 'ENGINEERING_BOT',
    title: 'Automated Code Generation & Test Suite Suite',
    avatarUrl: '/bot-images/Bot image 6.png',
    accentColor: '#00E5FF',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'TypeScript compilation & typecheck verification',
      'Automated prototype generation & regression testing',
      'Performance benchmarking & rollback plan generation',
    ],
    currentTaskDescription: 'Verifying monorepo clean compilation exit code 0',
    completedTasksCount: 3200,
  },
  {
    id: 'bot_sponsor_fleet',
    name: 'Sponsor Bot Fleet',
    role: 'SPONSOR_BOT',
    title: 'Campaign Monitoring & Sponsorship Inventory Manager',
    avatarUrl: '/bot-images/Bot image 7.png',
    accentColor: '#FF9500',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'Ad campaign impression monitoring & inventory allocation',
      'Frequency capping & sponsor compliance checking',
      'Performance report generation for advertisers',
    ],
    currentTaskDescription: 'Tracking stadium billboard impressions across live rooms',
    completedTasksCount: 890,
  },
  {
    id: 'bot_qa_cert_fleet',
    name: 'QA Certification Fleet',
    role: 'QA_CERT_BOT',
    title: 'Accessibility, Responsiveness & Release Certification Bot',
    avatarUrl: '/bot-images/Bot image 8.png',
    accentColor: '#00FF88',
    status: 'ACTIVE_ONLINE',
    responsibilities: [
      'Automated accessibility & touch gesture certification',
      'Reduced motion & responsive screen safe-zone auditing',
      'Final release gate certification',
    ],
    currentTaskDescription: 'Certifying 3D Flex Store touch interaction gestures',
    completedTasksCount: 2100,
  },
];

export function getBotFleet(): BotInstance[] {
  return CANONICAL_BOT_FLEET;
}

export function getBotById(id: string): BotInstance | undefined {
  return CANONICAL_BOT_FLEET.find((b) => b.id === id);
}
