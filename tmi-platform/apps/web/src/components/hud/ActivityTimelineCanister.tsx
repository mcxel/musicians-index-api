"use client";

import React, { useState, useEffect } from 'react';

export interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  points: number;
  timestamp: Date;
}

export const ActivityTimelineCanister: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Mock incoming activity from ActivityLogRegistry
    const interval = setInterval(() => {
      const mockEvent: ActivityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        user: `User_${Math.floor(Math.random() * 1000)}`,
        action: ['voted', 'tipped', 'reacted', 'joined'][Math.floor(Math.random() * 4)],
        points: Math.floor(Math.random() * 50) + 10,
        timestamp: new Date()
      };
      
      setEvents(prev => [mockEvent, ...prev].slice(0, 5));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64 bg-black/60 backdrop-blur-md border border-[#00FFFF]/30 rounded-lg p-4 flex flex-col gap-2 pointer-events-auto">
      <h3 className="text-[#00FFFF] text-xs font-bold tracking-widest uppercase mb-2">Live Activity</h3>
      <div className="flex flex-col gap-2 overflow-hidden">
        {events.map(ev => (
          <div key={ev.id} className="text-xs text-gray-300 animate-fade-in-down">
            <span className="text-white font-semibold">{ev.user}</span> {ev.action}{' '}
            <span className="text-[#FFD700]">+{ev.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};