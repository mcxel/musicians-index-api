"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';

type Zone = {
  id: string;
  name: string;
  type: string;
  color: string;
  x: number; // percent
  y: number;
  w: number;
  h: number;
  rooms: { name: string; href: string; online: number }[];
  icon: string;
};

const ZONES: Zone[] = [
  {
    id: 'club-district',
    name: 'Club District',
    type: 'NIGHTLIFE',
    color: '#AA2DFF',
    x: 8, y: 12, w: 28, h: 30,
    icon: '🎧',
    rooms: [
      { name: 'Neon Underground', href: '/rooms/neon-underground', online: 112 },
      { name: 'Beat Lab', href: '/rooms/beat-lab', online: 48 },
      { name: 'Cypher Alley', href: '/rooms/cypher-room', online: 67 },
    ],
  },
  {
    id: 'battle-arenas',
    name: 'Battle Arenas',
    type: 'COMPETITION',
    color: '#FF2200',
    x: 42, y: 8, w: 26, h: 28,
    icon: '⚔️',
    rooms: [
      { name: '1v1 Battle Stage', href: '/games/battle', online: 204 },
      { name: 'Dirty Dozens', href: '/rooms/dirty-dozens', online: 89 },
      { name: 'Idol Challenge', href: '/rooms/idol-challenge', online: 55 },
    ],
  },
  {
    id: 'concert-hall',
    name: 'Concert Hall',
    type: 'PERFORMANCES',
    color: '#FFD700',
    x: 62, y: 44, w: 30, h: 32,
    icon: '🎤',
    rooms: [
      { name: 'Main Concert Hall', href: '/world/concert', online: 892 },
      { name: 'World Premiere', href: '/world/premiere', online: 217 },
      { name: 'VIP Lounge', href: '/rooms/vip-lounge', online: 31 },
    ],
  },
  {
    id: 'beach-stage',
    name: 'Beach Stage',
    type: 'OPEN AIR',
    color: '#FF9500',
    x: 10, y: 58, w: 30, h: 28,
    icon: '🏖️',
    rooms: [
      { name: 'World Dance Party', href: '/world/dance-party', online: 384 },
      { name: 'Beach Cypher', href: '/rooms/beach-stage', online: 72 },
    ],
  },
  {
    id: 'tv-studio',
    name: 'TV Studio',
    type: 'BROADCAST',
    color: '#00FFFF',
    x: 38, y: 50, w: 22, h: 22,
    icon: '📺',
    rooms: [
      { name: 'Live Broadcast', href: '/rooms/tv-studio-live', online: 145 },
      { name: 'Interview Stage', href: '/rooms/interview-stage', online: 28 },
    ],
  },
];

export default function WorldMapPage() {
  const router = useRouter();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const totalOnline = ZONES.flatMap(z => z.rooms).reduce((n, r) => n + r.online, 0);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4, color: '#00FFFF', margin: 0 }}
            >
              WORLD MAP
            </motion.h1>
            <p style={{ color: '#444', fontSize: 12, marginTop: 4 }}>
              <span style={{ color: '#00FF88' }}>●</span> {totalOnline.toLocaleString()} online across all zones
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
            {/* Map */}
            <div style={{
              flex: '1 1 400px', minWidth: 300, position: 'relative',
              height: 440, background: 'rgba(255,255,255,0.015)',
              border: '1px solid #1a1a1a', borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Grid lines */}
              {[25, 50, 75].map(p => (
                <div key={`h${p}`} style={{
                  position: 'absolute', left: 0, right: 0, top: `${p}%`,
                  height: 1, background: 'rgba(255,255,255,0.03)',
                }} />
              ))}
              {[25, 50, 75].map(p => (
                <div key={`v${p}`} style={{
                  position: 'absolute', top: 0, bottom: 0, left: `${p}%`,
                  width: 1, background: 'rgba(255,255,255,0.03)',
                }} />
              ))}

              {ZONES.map(zone => {
                const isHovered = hoveredZone === zone.id;
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <motion.div
                    key={zone.id}
                    animate={{
                      borderColor: isSelected ? zone.color : isHovered ? `${zone.color}aa` : `${zone.color}44`,
                      backgroundColor: isSelected ? `${zone.color}22` : isHovered ? `${zone.color}14` : `${zone.color}0a`,
                    }}
                    onHoverStart={() => setHoveredZone(zone.id)}
                    onHoverEnd={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(zone.id === selectedZone?.id ? null : zone)}
                    style={{
                      position: 'absolute',
                      left: `${zone.x}%`, top: `${zone.y}%`,
                      width: `${zone.w}%`, height: `${zone.h}%`,
                      border: `1px solid ${zone.color}44`,
                      borderRadius: 8, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{zone.icon}</div>
                    <div style={{ color: zone.color, fontSize: 9, fontWeight: 700, letterSpacing: 1, textAlign: 'center' }}>
                      {zone.name.toUpperCase()}
                    </div>
                    <div style={{ color: '#333', fontSize: 8 }}>
                      {zone.rooms.reduce((n, r) => n + r.online, 0)} online
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Zone detail */}
            <div style={{ flex: '0 0 260px', minWidth: 220 }}>
              {!selectedZone && (
                <div style={{ color: '#333', fontSize: 13, marginTop: 20, textAlign: 'center' }}>
                  Tap a zone to see rooms
                </div>
              )}
              {selectedZone && (
                <motion.div
                  key={selectedZone.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div style={{
                    background: `${selectedZone.color}12`,
                    border: `1px solid ${selectedZone.color}44`,
                    borderRadius: 12, padding: 18, marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{selectedZone.icon}</div>
                    <h3 style={{ color: selectedZone.color, fontSize: 15, fontWeight: 800, letterSpacing: 3, margin: '0 0 4px' }}>
                      {selectedZone.name.toUpperCase()}
                    </h3>
                    <div style={{ color: '#444', fontSize: 11, letterSpacing: 2 }}>{selectedZone.type}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedZone.rooms.map(room => (
                      <motion.div
                        key={room.href}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(room.href)}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid #1a1a1a', borderRadius: 8,
                          padding: '11px 14px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <span style={{ color: '#ccc', fontSize: 13 }}>{room.name}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#00FF88', fontSize: 10 }}>● {room.online}</div>
                          <div style={{ color: selectedZone.color, fontSize: 10, letterSpacing: 1 }}>ENTER →</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Zone legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            {ZONES.map(zone => (
              <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: zone.color }} />
                <span style={{ color: '#444', fontSize: 11 }}>{zone.name}</span>
              </div>
            ))}
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
