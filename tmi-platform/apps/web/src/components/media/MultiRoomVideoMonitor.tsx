'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import LiveStreamShell from './LiveStreamShell';
import MediaOrchestrator from '@/lib/media/MediaOrchestrator';
import Link from 'next/link';

interface MonitorRoom {
  roomId: string;
  label:  string;
  href?:  string;
  energy?: number;
  participantCount?: number;
}

const DEFAULT_ROOMS: MonitorRoom[] = [
  { roomId: 'R-101',       label: 'World Dance Party',  href: '/live/rooms/R-101',  energy: 88, participantCount: 42 },
  { roomId: 'R-214',       label: 'Cypher Room',        href: '/live/rooms/R-214',  energy: 74, participantCount: 18 },
  { roomId: 'R-307',       label: 'Battle Arena',        href: '/battles/live',      energy: 95, participantCount: 67 },
  { roomId: 'live-stage',  label: 'Live Stage',          href: '/live/stages',       energy: 82, participantCount: 120 },
  { roomId: 'venue-main',  label: 'Venue Main Stage',    href: '/live/stages',       energy: 60, participantCount: 55 },
  { roomId: 'billboard-live', label: 'Billboard Live',  href: '/live/billboards',   energy: 50, participantCount: 89 },
];

interface MultiRoomVideoMonitorProps {
  rooms?:      MonitorRoom[];
  title?:      string;
  accentColor?: string;
}

export default function MultiRoomVideoMonitor({
  rooms       = DEFAULT_ROOMS,
  title       = 'COMMAND CENTER',
  accentColor = '#00FFFF',
}: MultiRoomVideoMonitorProps) {
  const [mainRoomId, setMainRoomId] = useState(rooms[0]?.roomId ?? 'R-101');

  const mainRoom = rooms.find(r => r.roomId === mainRoomId) ?? rooms[0];
  const railRooms = rooms.filter(r => r.roomId !== mainRoomId);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            {rooms.length} Active Rooms · {rooms.reduce((s, r) => s + (r.participantCount ?? 0), 0)} Online
          </div>
        </div>
        {mainRoom?.href && (
          <Link href={mainRoom.href} style={{ padding: '7px 14px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#050510', background: accentColor, borderRadius: 6, textDecoration: 'none' }}>
            OPEN ROOM →
          </Link>
        )}
      </div>

      {/* Main monitor */}
      <div style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden', border: `1.5px solid ${accentColor}44`, boxShadow: `0 0 30px ${accentColor}12` }}>
        <div style={{ padding: '8px 12px', background: `${accentColor}12`, borderBottom: `1px solid ${accentColor}22`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF2DAA', boxShadow: '0 0 8px #FF2DAA' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>{mainRoom?.label}</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
            {mainRoom?.participantCount ?? 0} viewers · Energy {mainRoom?.energy ?? 0}%
          </span>
        </div>
        <LiveStreamShell
          mode="admin-monitor"
          roomId={mainRoomId}
          title={mainRoom?.label ?? 'Room'}
          fallbackAvatar="🎤"
          accentColor={accentColor}
        />
      </div>

      {/* Sub-monitor rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {railRooms.map((room) => (
          <motion.div
            key={room.roomId}
            whileHover={{ scale: 1.02 }}
            onClick={() => setMainRoomId(room.roomId)}
            style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.08)` }}
          >
            <div style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: (room.energy ?? 0) > 50 ? '#00FF88' : '#888' }} />
              <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.label}</span>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{room.participantCount ?? 0}</span>
            </div>
            <LiveStreamShell compact mode="admin-monitor" roomId={room.roomId} title={room.label} fallbackAvatar="🎤" accentColor={accentColor} />
            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); setMainRoomId(room.roomId); }}
                style={{ flex: 1, padding: '5px 0', fontSize: 7, fontWeight: 700, background: 'rgba(0,255,255,0.06)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: accentColor, cursor: 'pointer', letterSpacing: '0.05em' }}>
                EXPAND
              </button>
              {room.href && (
                <a href={room.href} onClick={e => e.stopPropagation()}
                  style={{ flex: 1, padding: '5px 0', fontSize: 7, fontWeight: 700, background: 'rgba(255,45,170,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#FF2DAA', cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  OPEN
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
