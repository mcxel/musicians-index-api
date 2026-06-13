'use client';

import React, { useEffect, useState } from 'react';
import { ActivityTimelineEngine, TimelineEvent } from '@/lib/timeline/ActivityTimelineEngine';

export default function ActivityTimelineCanister({ userId = 'current-user' }: { userId?: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    setEvents(ActivityTimelineEngine.getEvents(userId));

    const handler = () => setEvents(ActivityTimelineEngine.getEvents(userId));
    window.addEventListener('TMI_TIMELINE_UPDATE', handler);
    return () => window.removeEventListener('TMI_TIMELINE_UPDATE', handler);
  }, [userId]);

  return (
    <div style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 12, padding: 24 }}>
      <h2 style={{ fontSize: 16, color: '#00E5FF', margin: '0 0 16px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Activity Timeline
      </h2>
      {events.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          No activity yet — join a cypher, battle, or concert to earn XP
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.slice(0, 20).map((ev) => (
            <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{ev.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {ev.xpEarned ? (
                <div style={{ color: '#00FF88', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}>+{ev.xpEarned} XP</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
