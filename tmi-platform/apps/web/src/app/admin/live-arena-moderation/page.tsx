import Link from 'next/link';
import RealTimeEventFeed from '@/components/admin/RealTimeEventFeed';

export default function AdminLiveArenaModerationPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '30px 20px 80px' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <Link href="/admin/live" style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 12 }}>
          ← Back to Admin Live
        </Link>

        <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900 }}>
          Arena Moderation Control
        </h1>
        <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.58)', fontSize: 13 }}>
          Track slow-mode updates, mute actions, and blocked chat events in real time while rooms are live.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) 1fr', gap: 14, alignItems: 'start' }}>
          <RealTimeEventFeed />

          <section style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, background: 'rgba(255,255,255,0.03)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, color: '#FF8A00', letterSpacing: '0.08em' }}>Live Operation Shortcuts</h2>

            <div style={{ display: 'grid', gap: 8 }}>
              <Link href="/live/arena/main-stage?mode=performer" style={{ color: '#00FFFF', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                Open Main Stage Arena (Performer)
              </Link>
              <Link href="/live/arena/main-stage?mode=audience" style={{ color: '#00FF88', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                Open Main Stage Arena (Audience)
              </Link>
              <Link href="/admin/overseer" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                Open Overseer Deck
              </Link>
            </div>

            <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.66)' }}>
              Moderator policy:
              <div>1. Use slow mode during spikes.</div>
              <div>2. Mute abusive users first, escalate only if repeated.</div>
              <div>3. Watch for repeated blocked-message alerts.</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
