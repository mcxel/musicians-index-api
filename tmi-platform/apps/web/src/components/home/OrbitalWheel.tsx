'use client';

import React, { useEffect, useState } from 'react';
import MediaFallbackResolver from '@/components/media/MediaFallbackResolver';
import Link from 'next/link';

// Mock interface for Crown Governor Data
interface OrbitalNode {
  id: string;
  rank: number;
  name: string;
  genre: string;
  imageUrl: string;
  isLive: boolean;
  color: string;
}

export default function OrbitalWheel() {
  const [nodes, setNodes] = useState<OrbitalNode[]>([]);
  const [crownLeader, setCrownLeader] = useState<OrbitalNode | null>(null);

  useEffect(() => {
    // Simulated fetch from CrownGovernor API
    const mockNodes = Array.from({ length: 10 }).map((_, i) => ({
      id: `artist-${i}`,
      rank: i + 1,
      name: ['Astra Nova', 'Prism Vex', 'Zion Freq', 'Flex King', 'Bar God', 'DJ Kraze', 'Nova Cipher', 'Lagos Burst', 'Wavetek', 'Neon Bass'][i],
      genre: ['R&B', 'EDM', 'Gospel', 'Dance', 'Rap', 'DJ', 'Cypher', 'Afrobeat', 'Hip-Hop', 'Electronic'][i],
      imageUrl: `https://i.pravatar.cc/200?u=orbit${i}`,
      isLive: i % 3 === 0,
      color: ['#FF2DAA', '#FFD700', '#00FF88', '#00E5FF', '#9B59B6', '#FF8C00', '#E63000', '#FFD700', '#00E5FF', '#FF2DAA'][i]
    }));
    
    setCrownLeader(mockNodes[0]);
    setNodes(mockNodes);
  }, []);

  if (!nodes.length || !crownLeader) return null;

  // Dimensions
  const WHEEL_SIZE = 450; // Per final recommendation
  const CENTER_SIZE = 110; // Per final recommendation
  const RADIUS = 170; 

  return (
    <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ position: 'absolute', top: -30, left: 0, right: 0, textAlign: 'center', zIndex: 15 }}>
        <div style={{ fontFamily: 'var(--font-orbitron, Impact)', fontSize: 14, fontWeight: 900, color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.6)' }}>WEEKLY CROWN ORBIT</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginTop: 4 }}>TOP RANKED · LIVE NOW · REAL TIME</div>
      </div>

      {/* SVG Rings */}
      <svg viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`} width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS + 30} fill="none" stroke="rgba(255,215,0,0.05)" strokeWidth="1" />
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS - 5} fill="none" stroke="rgba(255,45,170,0.2)" strokeWidth="1.5" strokeDasharray="4 9" style={{ transformOrigin: 'center', animation: 'orbit 13s linear infinite' }}/>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS - 65} fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="3 11" style={{ transformOrigin: 'center', animation: 'orbit 13s linear infinite reverse' }}/>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={CENTER_SIZE / 2 + 8} fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1"/>
      </svg>

      {/* Artist Nodes */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'orbit 13s linear infinite', transformOrigin: 'center' }}>
        {nodes.map((node, i) => {
          const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
          const x = (WHEEL_SIZE / 2) + RADIUS * Math.cos(angle);
          const y = (WHEEL_SIZE / 2) + RADIUS * Math.sin(angle);

          return (
            <div key={node.id} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', transformOrigin: 'center', animation: 'counterOrbit 13s linear infinite' }}>
              <Link href={`/profile/artist/${node.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(5,8,21,0.95)', border: `2px solid ${node.color}`, borderRadius: 12, padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 0 20px ${node.color}33`, width: 100, transition: 'all 0.2s ease-in-out' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 30px ${node.color}77`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 20px ${node.color}33`; }}
                >
                  {/* Scaled-up Profile Photo */}
                  <div style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${node.color}`, marginBottom: 6 }}>
                    <MediaFallbackResolver profileFallbackUrl={node.imageUrl} altText={node.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Rank Badge Overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, fontWeight: 900, padding: '2px 5px', borderBottomRightRadius: 8, borderTopLeftRadius: 8 }}>#{node.rank}</div>
                  </div>
                  
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{node.name}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{node.genre}</div>
                  
                  {node.isLive && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020', boxShadow: '0 0 6px #FF2020', animation: 'blink 1s infinite' }} />
                        <span style={{ fontSize: 8, color: '#FF2020', fontWeight: 900, letterSpacing: '0.1em' }}>LIVE</span>
                     </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Crown Center Hub */}
      <Link href={`/profile/artist/${crownLeader.id}`} style={{ textDecoration: 'none', position: 'relative', zIndex: 15 }}>
        <div style={{ width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: '50%', background: 'rgba(6,2,26,.98)', border: `2px solid #00E5FF`, boxShadow: `0 0 30px rgba(0,229,255,.6)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <MediaFallbackResolver profileFallbackUrl={crownLeader.imageUrl} altText={crownLeader.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.15em', marginBottom: 2, fontWeight: 700 }}>CROWN</div>
            <div style={{ fontFamily: 'var(--font-orbitron, Impact)', fontSize: 13, fontWeight: 900, color: '#FF2DAA', textShadow: '0 0 10px #000', lineHeight: 1.1 }}>
              {crownLeader.name.split(' ')[0]}<br/>{crownLeader.name.split(' ')[1] || ''}
            </div>
            {crownLeader.isLive && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FF2020', animation: 'blink 1s infinite', marginTop: 4, boxShadow: '0 0 8px #FF2020' }} />}
          </div>
        </div>
      </Link>

    </div>
  );
}