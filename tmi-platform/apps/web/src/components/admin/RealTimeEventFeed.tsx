'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PlatformEvent = {
  id: string;
  timestamp: number;
  type: 'join' | 'payment' | 'engagement' | 'alert';
  message: string;
};

export default function RealTimeEventFeed() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);

  useEffect(() => {
    // In production, this connects via WebSocket or Server-Sent Events (SSE) for real-time streaming.
    // For now, we simulate the live signals heartbeat.
    const interval = setInterval(() => {
      const newEvent: PlatformEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        type: ['join', 'payment', 'engagement', 'alert'][Math.floor(Math.random() * 4)] as any,
        message: 'Platform event logged',
      };

      if (newEvent.type === 'join') newEvent.message = `[${new Date().toLocaleTimeString()}] User joined World Dance Party`;
      if (newEvent.type === 'payment') newEvent.message = `[${new Date().toLocaleTimeString()}] $9.99 subscription completed`;
      if (newEvent.type === 'engagement') newEvent.message = `[${new Date().toLocaleTimeString()}] Song received 12 likes`;
      if (newEvent.type === 'alert') newEvent.message = `[${new Date().toLocaleTimeString()}] ⚠️ Empty Room Detected`;

      setEvents((prev) => [newEvent, ...prev].slice(0, 10)); // Keep the latest 10 events
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'join': return '#00FFFF'; // Neon Cyan
      case 'payment': return '#00FF88'; // Neon Green
      case 'engagement': return '#FFD700'; // Gold
      case 'alert': return '#FF2020'; // Red
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="bg-[#050510] border border-white/10 rounded-xl p-4 w-full max-w-md shadow-2xl">
      <h3 className="text-[#00FFFF] text-xs font-black uppercase tracking-widest mb-4">Live Platform Signals</h3>
      <div className="flex flex-col gap-2 overflow-hidden">
        <AnimatePresence>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono py-1 border-l-2 pl-3"
              style={{ borderColor: getEventColor(evt.type), color: 'rgba(255,255,255,0.8)' }}
            >
              <span style={{ color: getEventColor(evt.type), fontWeight: 'bold' }}>{evt.type.toUpperCase()}</span> - {evt.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}