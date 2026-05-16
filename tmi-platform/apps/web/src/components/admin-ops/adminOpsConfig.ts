import type { AdminOpsAction, AdminOpsLink } from './AdminOpsConsole';

export const adminOpsLinks: AdminOpsLink[] = [
  { href: '/admin/operations', label: 'Operations' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/revenue', label: 'Revenue' },
  { href: '/admin/tickets', label: 'Tickets' },
  { href: '/admin/bots', label: 'Bots' },
  { href: '/admin/visuals', label: 'Visuals' },
  { href: '/admin/motion', label: 'Motion' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/support', label: 'Support' },
  { href: '/admin/errors', label: 'Errors' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/diagnostics/payments', label: 'Diag: Payments' },
  { href: '/admin/diagnostics/recovery-log', label: 'Diag: Recovery' },
  { href: '/admin/diagnostics/video', label: 'Diag: Video' },
  { href: '/admin/diagnostics/avatars', label: 'Diag: Avatars' },
  { href: '/admin/diagnostics/routes', label: 'Diag: Routes' },
  { href: '/admin/diagnostics/email', label: 'Diag: Email' },
  { href: '/admin/diagnostics/tickets', label: 'Diag: Tickets' },
  { href: '/admin/diagnostics/bots', label: 'Diag: Bots' },
  { href: '/admin/diagnostics/testers', label: 'Diag: Testers' },
  { href: '/admin/diagnostics/governance', label: 'Diag: Governance' },
  { href: '/admin/diagnostics/persona-analytics', label: 'Diag: Persona Analytics' },
  { href: '/admin/diagnostics/survivability', label: 'Diag: Survivability' },
];

export const commonAdminActions: AdminOpsAction[] = [
  { id: 'approve', label: 'Approve', tone: 'green' },
  { id: 'suspend', label: 'Suspend', tone: 'red' },
  { id: 'promote', label: 'Promote', tone: 'yellow' },
  { id: 'demote', label: 'Demote', tone: 'white' },
  { id: 'upgrade', label: 'Upgrade', tone: 'green' },
];
