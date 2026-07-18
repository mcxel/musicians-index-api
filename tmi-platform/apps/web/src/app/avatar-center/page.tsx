import AvatarForgeShell from '@/components/avatar/AvatarForgeShell';
import RoleGate from '@/components/auth/RoleGate';

export const metadata = {
  title: 'Avatar Creation Center',
  description: 'Build your TMI identity — customize skin tone, body shape, hair, outfit, and accessories.',
};

const fallback = (
  <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <div style={{ fontSize: 52 }}>🎭</div>
    <div style={{ color: '#FF2DAA', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase' }}>Fan Accounts Only</div>
    <p style={{ color: '#aaa', fontSize: 15, textAlign: 'center', maxWidth: 420, margin: 0 }}>Avatar customization is exclusive to Fan accounts.</p>
    <a href="/hub" style={{ padding: '10px 28px', background: 'rgba(255,45,170,0.12)', border: '1px solid #FF2DAA', borderRadius: 8, color: '#FF2DAA', fontSize: 13, textDecoration: 'none' }}>← Back to Hub</a>
  </div>
);

export default function AvatarCenterPage() {
  return (
    <RoleGate allow={['FAN', 'ADMIN', 'STAFF']} fallback={fallback}>
      <AvatarForgeShell />
    </RoleGate>
  );
}
