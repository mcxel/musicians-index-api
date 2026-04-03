"use client";
import { useRouter } from 'next/navigation';
import FaceLogin from '@/components/face/FaceLogin';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';

export default function FaceLoginPage() {
  const router = useRouter();

  return (
    <PageShell>
      <HUDFrame>
        <FaceLogin
          onSuccess={(userId, sessionToken) => {
            // In production: store session token in secure cookie via server action
            // Here we just redirect to the lobby
            router.push('/rooms/lobby');
          }}
          onFallback={() => router.push('/login')}
          onCancel={() => router.push('/')}
        />
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
