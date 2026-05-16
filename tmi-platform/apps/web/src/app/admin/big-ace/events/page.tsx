// /admin/big-ace/events: Event command center
'use client';
import { useState } from 'react';

interface Event {
  id: string;
  name: string;
  time: string;
  status: 'today' | 'live' | 'upcoming' | 'ended';
  attendees: number;
  revenue: number;
}

const events: Event[] = [
  { id: '1', name: 'Summer Live Beat Battle', time: '12:00 PM', status: 'live', attendees: 234, revenue: 1200 },
  { id: '2', name: 'Artist Showcase', time: '2:00 PM', status: 'today', attendees: 156, revenue: 850 },
  { id: '3', name: 'Diamond VIP Lounge', time: '4:00 PM', status: 'upcoming', attendees: 0, revenue: 0 },
  { id: '4', name: 'Midnight DJ Set', time: '11:00 PM', status: 'upcoming', attendees: 0, revenue: 0 },
  { id: '5', name: 'Classic Battle Archive', time: 'Yesterday', status: 'ended', attendees: 512, revenue: 2560 },
];

export default function BigAceEventsPage() {
  const [activeEvent, setActiveEvent] = useState<Event>(events[0]);

  const eventsByStatus = {
    live: events.filter(e => e.status === 'live'),
    today: events.filter(e => e.status === 'today'),
    upcoming: events.filter(e => e.status === 'upcoming'),
    ended: events.filter(e => e.status === 'ended'),
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Events Command</h1>
          <p className="text-cyan-400 font-mono text-sm">Today, live, upcoming, ended</p>
        </div>

        {/* Events by Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Live */}
          {eventsByStatus.live.length > 0 && (
            <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-4">
              <h3 className="text-red-400 font-mono text-xs mb-3">LIVE NOW</h3>
              {eventsByStatus.live.map(evt => (
                <button
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className={`w-full text-left p-3 rounded mb-2 transition ${
                    activeEvent.id === evt.id ? 'bg-red-900 border border-red-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-white text-sm font-bold">{evt.name}</div>
                  <div className="text-red-400 text-xs mt-1">{evt.attendees} attending</div>
                </button>
              ))}
            </div>
          )}

          {/* Today */}
          {eventsByStatus.today.length > 0 && (
            <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-4">
              <h3 className="text-green-400 font-mono text-xs mb-3">TODAY</h3>
              {eventsByStatus.today.map(evt => (
                <button
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className={`w-full text-left p-3 rounded mb-2 transition ${
                    activeEvent.id === evt.id ? 'bg-green-900 border border-green-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-white text-sm font-bold">{evt.name}</div>
                  <div className="text-gray-400 text-xs mt-1">{evt.time}</div>
                </button>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {eventsByStatus.upcoming.length > 0 && (
            <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="text-yellow-400 font-mono text-xs mb-3">UPCOMING</h3>
              {eventsByStatus.upcoming.map(evt => (
                <button
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className={`w-full text-left p-3 rounded mb-2 transition ${
                    activeEvent.id === evt.id ? 'bg-yellow-900 border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-white text-sm font-bold">{evt.name}</div>
                  <div className="text-gray-400 text-xs mt-1">{evt.time}</div>
                </button>
              ))}
            </div>
          )}

          {/* Ended */}
          {eventsByStatus.ended.length > 0 && (
            <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4">
              <h3 className="text-gray-400 font-mono text-xs mb-3">ENDED</h3>
              {eventsByStatus.ended.map(evt => (
                <button
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className={`w-full text-left p-3 rounded mb-2 transition ${
                    activeEvent.id === evt.id ? 'bg-gray-800 border border-gray-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-gray-300 text-sm font-bold">{evt.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{evt.attendees} attended</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Event Control */}
        {activeEvent && (
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">{activeEvent.name}</h2>
                <p className="text-gray-400 text-sm mt-2">Status: <span className={`font-mono font-bold ${
                  activeEvent.status === 'live' ? 'text-red-400' :
                  activeEvent.status === 'today' ? 'text-green-400' :
                  activeEvent.status === 'upcoming' ? 'text-yellow-400' : 'text-gray-400'
                }`}>{activeEvent.status.toUpperCase()}</span></p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">{activeEvent.attendees}</div>
                <div className="text-gray-400 text-xs">attending</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">TIME</div>
                <div className="text-lg font-bold text-white">{activeEvent.time}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">REVENUE</div>
                <div className="text-lg font-bold text-yellow-400">${activeEvent.revenue.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">STATUS</div>
                <div className={`text-lg font-bold ${
                  activeEvent.status === 'live' ? 'text-red-400 animate-pulse' :
                  activeEvent.status === 'today' ? 'text-green-400' :
                  activeEvent.status === 'upcoming' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {activeEvent.status === 'live' ? '🔴 LIVE' : activeEvent.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Event Actions */}
            <div className="mb-8">
              <h3 className="text-cyan-400 font-mono text-sm mb-4">EVENT ACTIONS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Boost</button>
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-mono text-xs font-bold">Pin</button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs font-bold">Cancel</button>
                <button className="px-4 py-2 bg-white hover:bg-gray-300 text-black rounded font-mono text-xs font-bold">Feature</button>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-gray-800 rounded p-4">
              <h3 className="text-white font-mono text-xs mb-3">LIVE ANALYTICS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Audience engagement</span>
                  <span className="text-cyan-400">87%</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Chat activity</span>
                  <span className="text-cyan-400">234 msg/min</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Ticket revenue</span>
                  <span className="text-yellow-400">${activeEvent.revenue}</span>
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
