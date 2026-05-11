/**
 * /admin/recovery-center/page.tsx
 *
 * Manual recovery control center:
 * - Blocked visual recovery triggers
 * - Conductor restart and election controls
 * - Authority domain reset
 * - Recovery action history and logs
 * - One-click recovery for common issues
 * - Room-specific recovery controls
 */

'use client';

import React, { useState } from 'react';

interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  requiresRoomId: boolean;
  severity: 'info' | 'warning' | 'critical';
}

interface RecoveryLog {
  timestamp: number;
  action: string;
  roomId?: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
}

const RECOVERY_ACTIONS: RecoveryAction[] = [
  {
    id: 'visual-recovery-cycle',
    name: 'Run Visual Recovery Cycle',
    description: 'Immediately retry all blocked visuals in a room',
    endpoint: '/api/admin/recovery',
    method: 'POST',
    requiresRoomId: true,
    severity: 'info',
  },
  {
    id: 'conductor-reset',
    name: 'Reset Conductor',
    description: 'Force release conductor authority and trigger election',
    endpoint: '/api/admin/recovery',
    method: 'POST',
    requiresRoomId: true,
    severity: 'warning',
  },
  {
    id: 'authority-reset',
    name: 'Reset Authority Domain',
    description: 'Force release all claims on a specific domain',
    endpoint: '/api/admin/recovery',
    method: 'POST',
    requiresRoomId: true,
    severity: 'warning',
  },
  {
    id: 'overlay-flush',
    name: 'Flush Overlays',
    description: 'Clear stuck overlay state and re-render',
    endpoint: '/api/admin/recovery',
    method: 'POST',
    requiresRoomId: true,
    severity: 'info',
  },
  {
    id: 'full-room-recovery',
    name: 'Full Room Recovery',
    description: 'Comprehensive room reset (all authority, all visuals, streams)',
    endpoint: '/api/admin/recovery',
    method: 'POST',
    requiresRoomId: true,
    severity: 'critical',
  },
];

export default function RecoveryCenterPage() {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [logs, setLogs] = useState<RecoveryLog[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExecuteAction = async (action: RecoveryAction) => {
    if (action.requiresRoomId && !selectedRoom) {
      setMessage({ type: 'error', text: 'Please select a room first' });
      return;
    }

    setExecuting(action.id);
    setMessage(null);

    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.id,
          roomId: action.requiresRoomId ? selectedRoom : undefined,
        }),
      });

      const data = await response.json();
      const logEntry: RecoveryLog = {
        timestamp: Date.now(),
        action: action.name,
        roomId: selectedRoom || undefined,
        status: response.ok ? 'success' : 'failed',
        message: data.message || data.error || 'No message',
      };

      setLogs((prev) => [logEntry, ...prev]);
      setMessage({
        type: response.ok ? 'success' : 'error',
        text: `${action.name}: ${logEntry.message}`,
      });
    } catch (error) {
      const logEntry: RecoveryLog = {
        timestamp: Date.now(),
        action: action.name,
        roomId: selectedRoom || undefined,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      setLogs((prev) => [logEntry, ...prev]);
      setMessage({ type: 'error', text: `${action.name} failed: ${logEntry.message}` });
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Recovery Center</h1>
        <p className="text-gray-400 mt-2">Manual recovery controls and diagnostics</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded border ${
            message.type === 'error'
              ? 'bg-red-900/30 border-red-700 text-red-200'
              : 'bg-green-900/30 border-green-700 text-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Room Selector */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">Select Room</h3>
        <input
          type="text"
          placeholder="Enter room ID (e.g., room_123)"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
        />
        <p className="text-xs text-gray-400 mt-2">Some recovery actions require a specific room context.</p>
      </div>

      {/* Quick Recovery Actions */}
      <div className="space-y-4">
        {RECOVERY_ACTIONS.map((action) => (
          <div key={action.id} className="p-6 bg-gray-800 border border-gray-700 rounded">
            <div className="mb-4">
              <h4 className="text-base font-bold">{action.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{action.description}</p>
            </div>
            <button
              onClick={() => handleExecuteAction(action)}
              disabled={executing === action.id || (action.requiresRoomId && !selectedRoom)}
              className={`w-full px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                action.severity === 'critical'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-cyan-700 hover:bg-cyan-600 text-white'
              }`}
            >
              {executing === action.id ? 'Executing...' : `Execute: ${action.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Recovery Logs */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">Recovery Action History</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No recovery actions executed yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border text-sm ${
                  log.status === 'success'
                    ? 'bg-green-900/20 border-green-700'
                    : log.status === 'failed'
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-yellow-900/20 border-yellow-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {log.roomId && <div className="text-xs text-gray-400 mb-1">Room: {log.roomId}</div>}
                <div className="text-xs text-gray-300">{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warnings */}
      <div className="p-4 bg-red-900/30 border border-red-700 rounded">
        <p className="text-sm text-red-200">
          Recovery actions are powerful. Use with caution. Full room recovery will reset all state. Most actions
          require a valid room ID.
        </p>
      </div>
    </div>
  );
}
