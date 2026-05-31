"use client";

export default function RevenueWidget() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Main Display Box */}
      <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.3)', padding: 16, borderRadius: 10, boxShadow: '0 0 20px rgba(255,215,0,0.1)' }}>
        <h4 style={{ margin: '0 0 12px', color: '#FFD700', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900 }}>
          Live Revenue
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Tips</span>
            <span style={{ fontWeight: 700, color: '#00FF88' }}>$865.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Subs</span>
            <span style={{ fontWeight: 700, color: '#00FF88' }}>$192.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Ads</span>
            <span style={{ fontWeight: 700, color: '#00FF88' }}>$74.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Merch</span>
            <span style={{ fontWeight: 700, color: '#00FF88' }}>$22.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Bookings</span>
            <span style={{ fontWeight: 700, color: '#00FFFF' }}>4 Pending</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,215,0,0.2)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 800, letterSpacing: '0.1em' }}>TODAY TOTAL</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#FFD700', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>$1,153.00</span>
        </div>
      </div>

      {/* Future Wallet Actions (Reserved Space) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {['Withdraw', 'Transfer', 'Reinvest'].map(action => (
          <button key={action} style={{ padding: '10px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'not-allowed' }}>
            {action}
          </button>
        ))}
      </div>

      {/* Real-time Telemetry Feed (To be wired to Socket) */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 16, borderRadius: 10 }}>
        <h4 style={{ margin: '0 0 12px', color: '#fff', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>Recent Transactions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 1, amount: '+$50.00', desc: 'Tip from Nova Fan', time: '2m ago' },
            { id: 2, amount: '+$14.99', desc: 'Sub (Gold) from CityBeat', time: '15m ago' },
            { id: 3, amount: '+$29.00', desc: 'Pizza Guys (Ad Slot)', time: '1h ago' },
          ].map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
              <div>
                <span style={{ color: '#00FF88', fontWeight: 700 }}>{tx.amount}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>{tx.desc}</span>
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{tx.time}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}