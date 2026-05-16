'use client';

import { useState } from 'react';
import { registerDeadFunction } from '@/lib/routing/DeadFunctionRecoveryEngine';

type Props = {
  filePath: string;
  functionName: string;
};

export default function DeadActionFallback({ filePath, functionName }: Props) {
  const [message, setMessage] = useState('');

  function report(): void {
    const rec = registerDeadFunction(
      filePath,
      functionName,
      'stub-function',
      'Action failed at runtime and needs fallback path',
      'Add retry flow and return path',
      'high'
    );
    setMessage(`Reported: ${rec.functionId}`);
  }

  return (
    <div style={{ border: '1px solid rgba(239,68,68,0.5)', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 10, color: '#f87171', fontWeight: 700, marginBottom: 6 }}>DEAD ACTION FALLBACK</div>
      <button onClick={report} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.15)', color: '#fff', cursor: 'pointer' }}>
        Report + Recover
      </button>
      {message && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{message}</div>}
    </div>
  );
}
