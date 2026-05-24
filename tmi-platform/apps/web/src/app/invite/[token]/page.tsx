import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';
import { redirect } from 'next/navigation';
import InviteWelcomeClient from '@/components/onboarding/InviteWelcomeClient';

export default async function InviteRedemptionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Preview only — do NOT redeem here. Token is consumed after account creation.
  const preview = DiamondInviteEngine.getInvite(token);

  if (!preview || preview.status === 'revoked') {
    redirect('/signup');
  }

  const inviteeName = preview.email
    ? preview.email.split('@')[0]!.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Founder';
  const role = preview.assignedRole ?? 'fan';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.1) 0%, transparent 60%)' }} />
      <InviteWelcomeClient inviteeName={inviteeName} role={role} token={token} />
    </main>
  );
}