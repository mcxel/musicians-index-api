"use client";
import { useState, useEffect } from 'react';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SEC';
interface TrustLog {
  id: string;
  time: string;
  level: LogLevel;
  msg: string;
  source: string;
}

const MOCK_LOGS: TrustLog[] = [
  { id: '1', time: '14:02:01', level: 'INFO', source: 'STRIPE', msg: 'Webhook checkout.session.completed [Nova Cipher]' },
  { id: '2', time: '14:01:55', level: 'SEC',  source: 'AUTH',   msg: 'Multiple failed logins detected (IP: 192.168.x)' },
  { id: '3', time: '14:01:42', level: 'WARN', source: 'WEBRTC', msg: 'High latency detected in Room [Cypher-A]' },
  { id: '4', time: '14:01:10', level: 'INFO', source: 'PRESENCE', msg: 'Room [Main-Stage] crossed 10k viewers' },
];

export default function TrustKillerFeed() {
  const [logs] = useState<TrustLog[]>(MOCK_LOGS);

  const getColor = (level: LogLevel) => {
    switch(level) {
      case 'INFO': return '#00FFFF';
      case 'WARN': return '#FFD700';
      case 'ERROR': return '#FF4444';
      case 'SEC': return '#AA2DFF';
      default: return '#fff';
    }
  };

  return (
    <div style={{ 
      background: 'rgba(5,5,16,0.95)', border: '1px solid rgba(255,45,170,0.3)', 
      borderRadius: 12, display: 'flex', flexDirection: 'column', height: '100%',
      boxShadow: '0 0 30px rgba(255,45,170,0.1)' 
    }}>
      <div style={{ 
        padding: '12px 16px', borderBottom: '1px solid rgba(255,45,170,0.2)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.15em' }}>TRUST KILLER FEED</span>
        <span style={{ fontSize: 9, color: '#00FF88', animation: 'tmiBlink 1s infinite' }}>● LIVE SEC-OPS</span>
      </div>
      
      <div style={{ padding: 12, flex: 1, overflowY: 'auto', fontFamily: 'monospace' }} className="tmi-scroll">
        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>[{log.time}]</span>
            <span style={{ color: getColor(log.level), fontWeight: 700, width: 40, flexShrink: 0 }}>{log.level}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', width: 60, flexShrink: 0 }}>{log.source}</span>
            <span style={{ color: '#fff' }}>{log.msg}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes tmiBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}