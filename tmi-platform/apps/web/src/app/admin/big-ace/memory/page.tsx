// /admin/big-ace/memory: Memory management and archive control
'use client';
import { useState } from 'react';

interface MemoryEntry {
  id: string;
  type: 'bot' | 'system' | 'visual' | 'motion';
  name: string;
  size: number;
  created: string;
  accessed: string;
  status: 'active' | 'archived';
}

const memoryEntries: MemoryEntry[] = [
  { id: '1', type: 'bot', name: 'Battle Logic v2.1', size: 2.3, created: '2025-01-15', accessed: '2026-05-09', status: 'active' },
  { id: '2', type: 'system', name: 'Event Scheduler', size: 1.8, created: '2024-12-01', accessed: '2026-05-09', status: 'active' },
  { id: '3', type: 'visual', name: 'Theme Cache 2026', size: 5.6, created: '2026-01-01', accessed: '2026-05-08', status: 'active' },
  { id: '4', type: 'motion', name: 'Animation Sequences', size: 3.2, created: '2025-11-20', accessed: '2026-04-15', status: 'active' },
  { id: '5', type: 'bot', name: 'Battle Logic v1.9', size: 2.1, created: '2024-09-01', accessed: '2026-03-01', status: 'archived' },
];

export default function BigAceMemoryPage() {
  const [activeMemory, setActiveMemory] = useState<MemoryEntry>(memoryEntries[0]);
  const [filterType, setFilterType] = useState<'all' | 'bot' | 'system' | 'visual' | 'motion'>('all');

  const filteredMemory = filterType === 'all' ? memoryEntries : memoryEntries.filter(m => m.type === filterType);
  const totalSize = memoryEntries.reduce((sum, m) => sum + m.size, 0);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Memory Command</h1>
          <p className="text-gray-400 font-mono text-sm">Bot, system, visual, motion memory management</p>
        </div>

        {/* Memory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border-2 border-white rounded-lg p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">TOTAL MEMORY</div>
            <div className="text-2xl font-bold text-white">{totalSize.toFixed(1)} GB</div>
          </div>
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">ACTIVE ENTRIES</div>
            <div className="text-2xl font-bold text-green-400">{memoryEntries.filter(m => m.status === 'active').length}</div>
          </div>
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">ARCHIVED</div>
            <div className="text-2xl font-bold text-yellow-400">{memoryEntries.filter(m => m.status === 'archived').length}</div>
          </div>
          <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4">
            <div className="text-gray-400 text-xs font-mono mb-1">USAGE</div>
            <div className="text-2xl font-bold text-gray-300">62%</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'bot', 'system', 'visual', 'motion'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded font-mono text-xs font-bold transition ${
                filterType === type
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Memory List */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-white font-mono text-sm mb-4">MEMORY ENTRIES</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMemory.map(mem => (
              <button
                key={mem.id}
                onClick={() => setActiveMemory(mem)}
                className={`w-full text-left p-3 rounded border transition ${
                  activeMemory.id === mem.id
                    ? 'border-white bg-gray-800'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        mem.type === 'bot' ? 'bg-green-900 text-green-400' :
                        mem.type === 'system' ? 'bg-blue-900 text-blue-400' :
                        mem.type === 'visual' ? 'bg-purple-900 text-purple-400' : 'bg-pink-900 text-pink-400'
                      }`}>
                        {mem.type}
                      </span>
                      <span className="text-white font-bold">{mem.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {mem.created} | Accessed: {mem.accessed}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-white font-bold">{mem.size} GB</div>
                    <div className={`text-xs font-mono ${mem.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                      {mem.status}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Memory Control */}
        {activeMemory && (
          <div className="bg-gray-900 border-2 border-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{activeMemory.name}</h2>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">TYPE</div>
                <div className="text-lg font-bold text-white">{activeMemory.type}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">SIZE</div>
                <div className="text-lg font-bold text-white">{activeMemory.size} GB</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">CREATED</div>
                <div className="text-lg font-bold text-gray-300">{activeMemory.created}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">STATUS</div>
                <div className={`text-lg font-bold ${activeMemory.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {activeMemory.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Memory Actions */}
            <div className="mb-8">
              <h3 className="text-white font-mono text-sm mb-4">MEMORY ACTIONS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="px-4 py-2 bg-white hover:bg-gray-300 text-black rounded font-mono text-xs font-bold">Review</button>
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-mono text-xs font-bold">Restore</button>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-mono text-xs font-bold">Archive</button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs font-bold">Purge</button>
              </div>
            </div>

            {/* Integrity Check */}
            <div className="bg-gray-800 rounded p-4">
              <h3 className="text-white font-mono text-xs mb-3">INTEGRITY</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Checksum</span>
                  <span className="font-mono text-green-400">✓ Valid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Last verified</span>
                  <span className="text-gray-400">{activeMemory.accessed}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Button */}
        <a href="/admin/big-ace/overview" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-xs">← Back to Overview</a>
      </div>
    </div>
  );
}
