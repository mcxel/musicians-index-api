"use client";
import MediaMonitor from '@/components/video/MediaMonitor';
import TrustKillerFeed from '@/components/admin/TrustKillerFeed';

const SYSTEM_HEALTH = [
  { id: 'auth', label: 'AUTH', status: 'GREEN', color: '#00FF88' },
  { id: 'db', label: 'DATABASE', status: 'GREEN', color: '#00FF88' },
  { id: 'stripe', label: 'STRIPE', status: 'GREEN', color: '#00FF88' },
  { id: 'webrtc', label: 'WEBRTC', status: 'WARN', color: '#FFD700' },
  { id: 'presence', label: 'PRESENCE', status: 'GREEN', color: '#00FF88' },
];

export default function OverseerDeckPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020205', color: '#fff', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header - Mission Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>🛰️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mission Control</h1>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>OVERSEER DECK V1.0</div>
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#FF4444', border: '1px solid #FF4444', padding: '6px 12px', borderRadius: 4 }}>
          RESTRICTED ACCESS
        </div>
      </div>

      {/* Top Rail - Health Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {SYSTEM_HEALTH.map(sys => (
          <div key={sys.id} style={{ 
            background: 'rgba(255,255,255,0.02)', border: `1px solid ${sys.color}40`, 
            borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: `inset 0 0 10px ${sys.color}10`
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>{sys.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sys.color, boxShadow: `0 0 8px ${sys.color}` }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: sys.color }}>{sys.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 180px)' }}>
        
        {/* Left Rail: Trust Killer Feed */}
        <div style={{ height: '100%' }}>
          <TrustKillerFeed />
        </div>

        {/* Right Area: Monitor Wall */}
        <div style={{ 
          background: 'rgba(5,5,16,0.6)', border: '1px solid rgba(0,255,255,0.2)', 
          borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' 
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.15em', marginBottom: 16 }}>LIVE ROOM MONITORS</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
            {/* Monitor 1 */}
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, color: '#fff', fontWeight: 800 }}>ROOM 1: CYPHER ARENA</div>
              <MediaMonitor mode="standby" isActive={false} />
            </div>
            {/* Monitor 2 */}
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, color: '#fff', fontWeight: 800 }}>ROOM 2: NOVA CIPHER (LIVE)</div>
              <MediaMonitor mode="remote-view" isActive={true} />
            </div>
            {/* Monitor 3 */}
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, color: '#fff', fontWeight: 800 }}>ROOM 3: FAN THEATER</div>
              <MediaMonitor mode="standby" isActive={false} />
            </div>
            {/* Monitor 4 */}
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, color: '#fff', fontWeight: 800 }}>ROOM 4: MONDAY STAGE</div>
              <MediaMonitor mode="standby" isActive={false} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}