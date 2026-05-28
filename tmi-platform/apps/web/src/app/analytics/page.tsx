import RoleAnalyticsDashboard from '@/components/analytics/RoleAnalyticsDashboard';
import TieredAnalyticsDashboard from '@/components/analytics/TieredAnalyticsDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | TMI',
  description: 'Platform stats, personal analytics, and activity breakdown for every role on The Musician\'s Index.',
};

export default function AnalyticsPage() {
  return (
    <main style={{ minHeight: '100vh', color: '#fff', fontFamily: 'inherit', padding: '32px 24px', background: 'radial-gradient(ellipse at top, #0d0025 0%, #050510 55%, #000 100%)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#00FFFF', marginBottom: 6, textTransform: 'uppercase' }}>
            Analytics Hub
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 2, margin: 0 }}>Your Dashboard</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
            Live platform data · Role-aware · Everyone gets their own view
          </p>
        </div>

        {/* Role-based analytics (all roles) */}
        <RoleAnalyticsDashboard />

        {/* Membership tier analytics (fans / subscribers) */}
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#FFD700', marginBottom: 16, textTransform: 'uppercase' }}>
            Membership Tier Analytics
          </div>
          <TieredAnalyticsDashboard initialTier="fan" />
        </div>

      </div>
    </main>
  );
}
