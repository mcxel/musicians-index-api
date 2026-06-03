import { getUserCount, getAllUsers } from '@/lib/auth/UserStore';
import { getRecentEvents } from '@/lib/stripe/stripe-telemetry-store';

export interface TMIAdminStats {
  users: {
    total: number;
    online: number;
    newToday: number;
    churned: number;
    byRole: Record<string, number>;
    byTier: Record<string, number>;
  };
  rooms: {
    total: number;
    active: number;
    topRoom: string;
  };
  stream: {
    activeListeners: number;
    totalMinutesToday: number;
    xpPerMinute: number;
  };
  business: {
    totalMembers: number;
    paidMembers: number;
    revenueToday: number;
    revenueMonth: number;
    subscriptionsActive: number;
  };
}

function startOfDayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonthMs(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getAdminStats(): Promise<TMIAdminStats> {
  const total = getUserCount();
  const allUsers = getAllUsers(1000);
  const dayStart = startOfDayMs();
  const monthStart = startOfMonthMs();

  const newToday = allUsers.filter(u => u.createdAt >= dayStart).length;

  const byRole: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  for (const u of allUsers) {
    byRole[u.role] = (byRole[u.role] ?? 0) + 1;
    byTier[u.tier] = (byTier[u.tier] ?? 0) + 1;
  }

  const paidMembers = allUsers.filter(u => u.tier !== 'FREE').length;

  // Revenue from Stripe telemetry store
  let revenueToday = 0;
  let revenueMonth = 0;
  let subscriptionsActive = 0;
  try {
    const events = getRecentEvents(500);
    for (const ev of events) {
      const ts = ev.ts ?? 0;
      const amountCents = Number(ev.meta?.amountCents ?? 0);
      const amount = Number.isFinite(amountCents) ? amountCents / 100 : 0;
      if (ts >= dayStart) revenueToday += amount;
      if (ts >= monthStart) revenueMonth += amount;

      const eventType = String(ev.meta?.type ?? ev.kind ?? '');
      if (eventType === 'subscription.created' || eventType === 'checkout.session.completed') {
        subscriptionsActive += 1;
      }
    }
  } catch {
    // Stripe telemetry unavailable — show zeros
  }

  const ROOMS = [
    'World Dance Party', 'Fan Theater', 'Nova Cipher', 'Battle Arena',
    'Monday Stage', 'World Concert', 'World Premiere Lobby',
    'Dirty Dozens', 'World Music Hall', 'Broadcast Studio',
  ];

  return {
    users: {
      total,
      online: Math.max(0, Math.floor(total * 0.07)), // ~7% online estimate
      newToday,
      churned: 0,
      byRole,
      byTier,
    },
    rooms: {
      total: ROOMS.length,
      active: 4,
      topRoom: 'World Dance Party',
    },
    stream: {
      activeListeners: Math.max(0, Math.floor(total * 0.05)),
      totalMinutesToday: 0,
      xpPerMinute: 0,
    },
    business: {
      totalMembers: total,
      paidMembers,
      revenueToday,
      revenueMonth,
      subscriptionsActive,
    },
  };
}
