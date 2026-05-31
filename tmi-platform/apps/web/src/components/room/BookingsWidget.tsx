"use client";
import Link from "next/link";

export default function BookingsWidget() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10 }}>
        <h4 style={{ margin: '0 0 8px', color: '#FFD700', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Upcoming Bookings</h4>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '20px 0', textAlign: 'center' }}>
          No upcoming bookings scheduled.
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10 }}>
        <h4 style={{ margin: '0 0 8px', color: '#00FFFF', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pending Requests</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Club Velocity — Fri Night</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Promoter: Jason Smith</div>
          </div>
          <button style={{ padding: '6px 12px', background: '#00FFFF', color: '#000', borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer', border: 'none' }}>Review</button>
        </div>
      </div>
    </div>
  );
}