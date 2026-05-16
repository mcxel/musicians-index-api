'use client';

import { useState } from 'react';
import SocketRecoveryEngine from '@/lib/routing/SocketRecoveryEngine';

type Props = {
  userId: string;
};

export default function ReconnectButton({ userId }: Props) {
  const [lastSocket, setLastSocket] = useState('');

  function reconnect(): void {
    const socketId = `sock_${Date.now().toString(36)}`;
    SocketRecoveryEngine.recover(userId, socketId);
    setLastSocket(socketId);
  }

  return (
    <button onClick={reconnect} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.5)', background: 'rgba(0,255,255,0.16)', color: '#fff', cursor: 'pointer' }}>
      Reconnect {lastSocket ? `(${lastSocket.slice(-5)})` : ''}
    </button>
  );
}
