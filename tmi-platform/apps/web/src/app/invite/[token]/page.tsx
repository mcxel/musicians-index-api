import DiamondWelcomeProtocol from '@/components/onboarding/DiamondWelcomeProtocol';
import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';
import { redirect } from 'next/navigation';

export default async function InviteRedemptionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const preview = DiamondInviteEngine.getInvite(token);
  const inviteeName = preview?.email
    ? preview.email.split('@')[0]!.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Founder';
  const role = preview?.assignedRole ?? 'fan';

  const masterAccountId = 'master-founder-001';
  const isValid = await DiamondInviteEngine.validateAndRedeem(token, masterAccountId);

  if (!isValid) {
    redirect('/home/1');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050510', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.1) 0%, transparent 60%)',
        }}
      />
      <DiamondWelcomeProtocol inviteeName={inviteeName} role={role} />
    </main>
  );
}