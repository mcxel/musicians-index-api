// /admin/big-ace/emergency: Emergency fail-safe control center
'use client';
import { useState } from 'react';

interface SystemControl {
  id: string;
  name: string;
  status: 'running' | 'paused';
  impact: 'critical' | 'high' | 'medium' | 'low';
}

const systemControls: SystemControl[] = [
  { id: 'bots', name: 'Bot System', status: 'running', impact: 'critical' },
  { id: 'queues', name: 'Event Queues', status: 'running', impact: 'critical' },
  { id: 'promotions', name: 'Promotions Engine', status: 'running', impact: 'high' },
  { id: 'events', name: 'Event System', status: 'running', impact: 'critical' },
  { id: 'rooms', name: 'Room Manager', status: 'running', impact: 'critical' },
];

export default function BigAceEmergencyPage() {
  const [controls, setControls] = useState<SystemControl[]>(systemControls);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const toggleControl = (id: string) => {
    setControls(controls.map(c => 
      c.id === id ? { ...c, status: c.status === 'running' ? 'paused' : 'running' } : c
    ));
  };

  const pauseAll = () => {
    setControls(controls.map(c => ({ ...c, status: 'paused' })));
  };

  const resumeAll = () => {
    setControls(controls.map(c => ({ ...c, status: 'running' })));
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Emergency Control</h1>
          <p className="text-red-400 font-mono text-sm">⚠ FAIL-SAFE CONTROL CENTER - USE WITH CAUTION</p>
        </div>

        {/* Emergency Mode Warning */}
        {emergencyMode && (
          <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🚨</div>
              <div>
                <h2 className="text-red-400 font-bold text-lg">EMERGENCY MODE ACTIVE</h2>
                <p className="text-red-300 text-sm mt-1">System controls are restricted. All pause actions require confirmation.</p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {controls.map(control => (
            <div
              key={control.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                control.status === 'running'
                  ? 'border-green-500 bg-gray-900'
                  : 'border-yellow-500 bg-gray-900'
              }`}
              onClick={() => toggleControl(control.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-sm">{control.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  control.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></div>
              </div>
              <div className={`text-xs font-mono ${
                control.status === 'running' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {control.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Impact: <span className={`font-bold ${
                  control.impact === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`}>{control.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Master Controls */}
        <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-8 mb-8">
          <h2 className="text-red-400 font-mono text-lg mb-6">MASTER CONTROLS</h2>

          {/* Pause All Section */}
          <div className="mb-8">
            <h3 className="text-white font-mono text-sm mb-4">PAUSE ALL SYSTEMS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={pauseAll}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-mono font-bold text-sm"
              >
                PAUSE ALL
              </button>
              <button
                onClick={resumeAll}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded font-mono font-bold text-sm"
              >
                RESUME ALL
              </button>
              <button
                onClick={() => setEmergencyMode(!emergencyMode)}
                className={`px-6 py-3 rounded font-mono font-bold text-sm ${
                  emergencyMode
                    ? 'bg-red-900 hover:bg-red-800 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {emergencyMode ? 'EXIT EMERGENCY' : 'EMERGENCY MODE'}
              </button>
            </div>
          </div>

          {/* Individual Controls */}
          <div className="mb-8">
            <h3 className="text-white font-mono text-sm mb-4">INDIVIDUAL SYSTEM CONTROL</h3>
            <div className="space-y-3">
              {controls.map(control => (
                <div key={control.id} className="flex items-center justify-between bg-gray-800 rounded p-4">
                  <div>
                    <div className="text-white font-bold">{control.name}</div>
                    <div className={`text-xs mt-1 ${
                      control.status === 'running' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {control.status.toUpperCase()} • Impact: {control.impact}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleControl(control.id)}
                    className={`px-4 py-2 rounded font-mono text-xs font-bold ${
                      control.status === 'running'
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {control.status === 'running' ? 'PAUSE' : 'RESUME'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gray-800 rounded p-4">
            <h3 className="text-white font-mono text-xs mb-3">SYSTEM HEALTH</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-300 w-32 text-xs">Overall Health</span>
                <div className="flex-1 bg-gray-700 rounded h-2 mx-3">
                  <div className="bg-green-500 h-2 rounded" style={{ width: '94%' }}></div>
                </div>
                <span className="text-green-400 text-xs font-bold">94%</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-300 w-32 text-xs">Error Rate</span>
                <div className="flex-1 bg-gray-700 rounded h-2 mx-3">
                  <div className="bg-red-500 h-2 rounded" style={{ width: '2%' }}></div>
                </div>
                <span className="text-red-400 text-xs font-bold">0.2%</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-300 w-32 text-xs">Queue Depth</span>
                <div className="flex-1 bg-gray-700 rounded h-2 mx-3">
                  <div className="bg-yellow-500 h-2 rounded" style={{ width: '35%' }}></div>
                </div>
                <span className="text-yellow-400 text-xs font-bold">2,156 items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Notice */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-white font-mono text-sm mb-3">⚠ CRITICAL NOTICE</h3>
          <ul className="text-gray-300 text-xs space-y-1 font-mono">
            <li>• Pausing Bots will stop all active performances</li>
            <li>• Pausing Event Queues will stop event processing</li>
            <li>• Pausing Rooms will disconnect active users</li>
            <li>• Changes are logged and auditable</li>
            <li>• All actions require 2-factor confirmation in production</li>
          </ul>
        </div>

        {/* Return Button */}
        <a href="/admin/big-ace/overview" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-xs">← Back to Overview</a>
      </div>
    </div>
  );
}
