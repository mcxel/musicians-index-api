'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PlatformEventType =
  | 'join'
  | 'payment'
  | 'engagement'
  | 'alert'
  | 'arena_moderation'
  | 'submission_received'
  | 'submission_approved'
  | 'viral';

export type PlatformEvent = {
  id: string;
  timestamp: number;
  type: PlatformEventType;
  message: string;
};

export default function RealTimeEventFeed() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function pullEvents() {
      try {
        const res = await fetch('/api/admin/live-events?limit=12', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { events?: PlatformEvent[] };
        if (!isMounted || !Array.isArray(data.events)) return;
        setEvents(data.events);
      } catch {
        // keep current events if polling fails
      }
    }

    void pullEvents();
    const interval = setInterval(() => {
      void pullEvents();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getEventColor = (type: PlatformEventType): string => {
    switch (type) {
      case 'join':       return '#00FFFF';
      case 'payment':    return '#00FF88';
      case 'engagement': return '#FFD700';
      case 'alert':      return '#FF2020';
      case 'arena_moderation': return '#FF8A00';
      case 'submission_received': return '#FF2DAA';
      case 'submission_approved': return '#00FFFF';
      case 'viral':      return '#AA2DFF';
    }
  };

  return (
    <div className="bg-[#050510] border border-white/10 rounded-xl p-4 w-full max-w-md shadow-2xl">
      <h3 className="text-[#00FFFF] text-xs font-black uppercase tracking-widest mb-4">Live Platform Signals</h3>
      <div className="flex flex-col gap-2 overflow-hidden">
        {events.length === 0 && (
          <div className="text-xs font-mono py-2 text-white/50">Awaiting live submission and growth events...</div>
        )}
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