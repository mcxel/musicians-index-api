import BroadcasterStudioDesk from '@/components/broadcast/BroadcasterStudioDesk';
import Link from 'next/link';

export const metadata = { title: 'Broadcast Studio | TMI' };

export default function BroadcastStudioPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Link href="/admin/overseer" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              ← OVERSEER
            </Link>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.32em', color: '#FF2DAA', marginBottom: 4 }}>BROADCAST CONTROL</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, margin: 0 }}>STUDIO DESK</h1>
            </div>
          </div>
          <Link
            href="/live/rooms/main-stage"
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)', color: '#fff', fontWeight: 900, fontSize: 11, letterSpacing: '0.12em', textDecoration: 'none', borderRadius: 8 }}
          >
            VIEW MAIN STAGE →
          </Link>
        </div>

        <div style={{ height: '70vh' }}>
          <BroadcasterStudioDesk />
        </div>
      </div>
    </main>
  );
}
