"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FanMemoriesPage() {
  const router = useRouter();

  useEffect(() => {
    const slug = document.cookie
      .split('; ')
      .find(r => r.startsWith('tmi_user_email='))
      ?.split('=')[1]
      ?.split('@')[0]
      ?.toLowerCase()
      ?? 'me';
    router.replace(`/fan/${slug}/memory`);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#050815', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00E5FF', fontFamily: 'monospace', fontSize: 14 }}>Loading Memory Wall…</div>
    </div>
  );
}
