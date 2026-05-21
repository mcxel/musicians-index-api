import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function logAuthEvent(data: {
  userId?: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'LOGOUT' | 'SUSPICIOUS_ACTIVITY';
  ip?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  success: boolean;
  sessionType: string;
  sessionId: string;
}) {
  await prisma.authEvent.create({
    data
  });

  if (data.eventType === 'LOGIN_FAIL') {
    await checkFailedLogins(data.ip, data.userId);
  }
}

async function checkFailedLogins(ip?: string, userId?: string) {
  // Window: Last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const failures = await prisma.authEvent.count({
    where: {
      eventType: 'LOGIN_FAIL',
      OR: [{ ip }, { userId }],
      createdAt: { gte: tenMinutesAgo }
    }
  });

  if (failures >= 5) {
    await prisma.authEvent.create({
      data: { userId, ip, eventType: 'SUSPICIOUS_ACTIVITY' }
    });
    console.warn(`[SECURITY] Anomaly triggered: 5 failed logins within 10 minutes from IP ${ip}`);
  }
}