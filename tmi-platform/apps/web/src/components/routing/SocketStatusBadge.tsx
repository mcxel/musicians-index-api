'use client';

import SocketRecoveryEngine from '@/lib/routing/SocketRecoveryEngine';

type Props = {
  userId: string;
};

export default function SocketStatusBadge({ userId }: Props) {
  const session = SocketRecoveryEngine.getSession(userId);
  const health = session?.health ?? 'disconnected';
  const color = health === 'healthy' ? '#00FF88' : health === 'recovering' ? '#FFD700' : '#FF2DAA';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${color}55`, borderRadius: 999, padding: '4px 8px', fontSize: 10, color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      socket: {health}
    </span>
  );
}
